import { Router, Request, Response } from "express";
import { asyncHandler, authenticate, authorize } from "../middleware/auth";
import { eventService } from "../services/eventService";
import { registrationService } from "../services/registrationService";
import { galleryService } from "../services/galleryService";
import { achievementService } from "../services/contentService";
import { contestService } from "../services/contestService";
import { auditService } from "../services/auditService";
import {
  validate,
  createEventSchema,
  updateEventSchema,
  achievementSchema,
  contestSchema,
  galleryImageSchema,
  siteContentSchema,
  paginationSchema,
} from "../validators";
import prisma from "../config/prisma";
import { NotFoundError } from "../middleware/error";
import * as XLSX from "xlsx";

/** Cast route param to string safely (Express types params as string | string[]) */
const p = (req: Request, key: string): string => String(req.params[key] ?? "");

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// ─── Dashboard ────────────────────────────────────────────────────────────────

// GET /api/admin/dashboard
router.get(
  "/dashboard",
  asyncHandler(async (_req: Request, res: Response) => {
    const [
      totalEvents,
      upcomingEvents,
      completedEvents,
      totalRegistrations,
      pendingRegistrations,
      activeContests,
      galleryCount,
      achievementCount,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.event.count({ where: { upcoming: true } }),
      prisma.event.count({ where: { upcoming: false } }),
      prisma.registration.count(),
      prisma.registration.count({ where: { status: { in: ["REGISTERED", "PENDING"] } } }),
      prisma.contest.count({ where: { status: { in: ["ANNOUNCED", "REGISTRATION_OPEN", "LIVE"] } } }),
      prisma.galleryImage.count(),
      prisma.achievement.count({ where: { isPublished: true } }),
    ]);

    res.json({
      success: true,
      data: {
        totalEvents,
        upcomingEvents,
        completedEvents,
        totalRegistrations,
        pendingRegistrations,
        activeContests,
        galleryCount,
        achievementCount,
      },
    });
  })
);

// ─── Events ───────────────────────────────────────────────────────────────────

// GET /api/admin/events
router.get(
  "/events",
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = validate(paginationSchema, req.query);
    const result = await eventService.list({
      page,
      limit,
      category: req.query["category"] as string,
      year: req.query["year"] ? Number(req.query["year"]) : undefined,
      status: req.query["status"] as string,
      search: req.query["search"] as string,
      // Admin sees all events (published and unpublished)
    });
    res.json({ success: true, ...result });
  })
);

// POST /api/admin/events
router.post(
  "/events",
  authorize("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const input = validate(createEventSchema, req.body);
    const event = await eventService.create(input, req.admin!.adminId);
    res.status(201).json({ success: true, data: event });
  })
);

// PUT /api/admin/events/:id
router.put(
  "/events/:id",
  authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
  asyncHandler(async (req: Request, res: Response) => {
    const input = validate(updateEventSchema, req.body);
    const event = await eventService.update(p(req, "id"), input, req.admin!.adminId);
    res.json({ success: true, data: event });
  })
);

// PATCH /api/admin/events/:id  (same as PUT, frontend uses PATCH for partial updates)
router.patch(
  "/events/:id",
  authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
  asyncHandler(async (req: Request, res: Response) => {
    const input = validate(updateEventSchema, req.body);
    const event = await eventService.update(p(req, "id"), input, req.admin!.adminId);
    res.json({ success: true, data: event });
  })
);

// DELETE /api/admin/events/:id
router.delete(
  "/events/:id",
  authorize("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    await eventService.remove(p(req, "id"), req.admin!.adminId);
    res.status(204).send();
  })
);

// ─── Registrations ────────────────────────────────────────────────────────────

// GET /api/admin/registrations
router.get(
  "/registrations",
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = validate(paginationSchema, req.query);
    const result = await registrationService.list({
      page,
      limit,
      eventId: req.query["eventId"] as string,
      status: req.query["status"] as string,
      interest: req.query["interest"] as string,
      search: req.query["search"] as string,
    });
    res.json({ success: true, ...result });
  })
);

// GET /api/admin/registrations/export — must be BEFORE /:id so Express doesn't match "export" as :id
router.get(
  "/registrations/export",
  authorize("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const rows = await registrationService.exportCsv({ status: req.query["status"] as string });
    const format = (req.query["format"] as string) ?? "csv";
    if (format === "xlsx") {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "Registrations");
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="all-registrations.xlsx"`);
      res.send(buf);
    } else {
      const headers = rows.length ? Object.keys(rows[0]!) : [];
      const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h as keyof typeof r])).join(","))].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="all-registrations.csv"`);
      res.send(csv);
    }
  })
);

// GET /api/admin/registrations/:id
router.get(
  "/registrations/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const reg = await registrationService.getById(p(req, "id"));
    res.json({ success: true, data: reg });
  })
);

// PATCH /api/admin/registrations/:id/status
router.patch(
  "/registrations/:id/status",
  authorize("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body as { status: string };
    if (!status) {
      res.status(400).json({ success: false, error: { code: "MISSING_FIELD", message: "status is required" } });
      return;
    }
    await registrationService.setStatus(p(req, "id"), status, req.admin!.adminId);
    res.json({ success: true, data: { message: "Status updated" } });
  })
);

// GET /api/admin/events/:eventId/registrations
router.get(
  "/events/:eventId/registrations",
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = validate(paginationSchema, req.query);
    const result = await registrationService.list({
      page,
      limit,
      eventId: p(req, "eventId"),
      status: req.query["status"] as string,
      search: req.query["search"] as string,
    });
    res.json({ success: true, ...result });
  })
);

// GET /api/admin/events/:eventId/registrations/export
router.get(
  "/events/:eventId/registrations/export",
  authorize("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const rows = await registrationService.exportCsv({
      eventId: p(req, "eventId"),
      status: req.query["status"] as string,
    });

    const format = (req.query["format"] as string) ?? "csv";

    if (format === "xlsx") {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "Registrations");
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="registrations-${p(req, "eventId")}.xlsx"`);
      res.send(buf);
    } else {
      // CSV
      if (!rows.length) {
        res.json({ success: true, data: "" });
        return;
      }
      const headers = Object.keys(rows[0]!);
      const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h as keyof typeof r])).join(","))].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="registrations-${p(req, "eventId")}.csv"`);
      res.send(csv);
    }
  })
);

// (registrations/export moved above — appears before /registrations/:id)

// ─── Gallery ──────────────────────────────────────────────────────────────────

// POST /api/admin/events/:eventId/gallery
router.post(
  "/events/:eventId/gallery",
  authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
  asyncHandler(async (req: Request, res: Response) => {
    const { url, thumbnailUrl, caption, altText, isFeatured } = req.body as {
      url: string; thumbnailUrl?: string; caption?: string; altText?: string; isFeatured?: boolean;
    };
    if (!url) {
      res.status(400).json({ success: false, error: { code: "MISSING_FIELD", message: "url is required" } });
      return;
    }
    const image = await galleryService.add(
      p(req, "eventId"),
      { url, thumbnailUrl, caption, altText, isFeatured },
      req.admin!.adminId
    );
    res.status(201).json({ success: true, data: image });
  })
);

// PATCH /api/admin/gallery/:id
router.patch(
  "/gallery/:id",
  authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
  asyncHandler(async (req: Request, res: Response) => {
    const input = validate(galleryImageSchema, req.body);
    const image = await galleryService.update(p(req, "id"), input);
    res.json({ success: true, data: image });
  })
);

// DELETE /api/admin/gallery/:id
router.delete(
  "/gallery/:id",
  authorize("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    await galleryService.remove(p(req, "id"), req.admin!.adminId);
    res.status(204).send();
  })
);

// PATCH /api/admin/events/:eventId/gallery/reorder
router.patch(
  "/events/:eventId/gallery/reorder",
  authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
  asyncHandler(async (req: Request, res: Response) => {
    const { orderedIds } = req.body as { orderedIds: string[] };
    if (!Array.isArray(orderedIds)) {
      res.status(400).json({ success: false, error: { code: "MISSING_FIELD", message: "orderedIds array required" } });
      return;
    }
    await galleryService.reorder(p(req, "eventId"), orderedIds);
    res.json({ success: true, data: { message: "Reordered" } });
  })
);

// ─── Event Reports ────────────────────────────────────────────────────────────

// POST /api/admin/events/:eventId/report
router.post(
  "/events/:eventId/report",
  authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
  asyncHandler(async (req: Request, res: Response) => {
    const event = await prisma.event.findUnique({ where: { id: p(req, "eventId") } });
    if (!event) throw new NotFoundError("Event");

    const { title, content, documentUrl, published } = req.body as {
      title: string; content?: string; documentUrl?: string; published?: boolean;
    };

    const report = await prisma.eventReport.upsert({
      where: { eventId: p(req, "eventId") },
      create: { eventId: p(req, "eventId"), title, content, documentUrl, published: published ?? false },
      update: { title, content, documentUrl, published: published ?? false },
    });

    res.status(201).json({ success: true, data: report });
  })
);

// PUT /api/admin/events/:eventId/report
router.put(
  "/events/:eventId/report",
  authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
  asyncHandler(async (req: Request, res: Response) => {
    const report = await prisma.eventReport.upsert({
      where: { eventId: p(req, "eventId") },
      create: {
        eventId: p(req, "eventId"),
        title: req.body.title ?? "Report",
        content: req.body.content,
        documentUrl: req.body.documentUrl,
        published: req.body.published ?? false,
      },
      update: {
        title: req.body.title,
        content: req.body.content,
        documentUrl: req.body.documentUrl,
        published: req.body.published,
      },
    });
    res.json({ success: true, data: report });
  })
);

// DELETE /api/admin/events/:eventId/report
router.delete(
  "/events/:eventId/report",
  authorize("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.eventReport.deleteMany({ where: { eventId: p(req, "eventId") } });
    res.status(204).send();
  })
);

// ─── Achievements ─────────────────────────────────────────────────────────────

// POST /api/admin/achievements
router.post(
  "/achievements",
  authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
  asyncHandler(async (req: Request, res: Response) => {
    const input = validate(achievementSchema, req.body);
    const achievement = await achievementService.create(input, req.admin!.adminId);
    res.status(201).json({ success: true, data: achievement });
  })
);

// PUT /api/admin/achievements/:id
router.put(
  "/achievements/:id",
  authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
  asyncHandler(async (req: Request, res: Response) => {
    const input = validate(achievementSchema.partial(), req.body);
    const achievement = await achievementService.update(p(req, "id"), input, req.admin!.adminId);
    res.json({ success: true, data: achievement });
  })
);

// DELETE /api/admin/achievements/:id
router.delete(
  "/achievements/:id",
  authorize("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    await achievementService.remove(p(req, "id"), req.admin!.adminId);
    res.status(204).send();
  })
);

// ─── Contests ─────────────────────────────────────────────────────────────────

// POST /api/admin/contests
router.post(
  "/contests",
  authorize("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const input = validate(contestSchema, req.body);
    const contest = await contestService.create(input, req.admin!.adminId);
    res.status(201).json({ success: true, data: contest });
  })
);

// PUT /api/admin/contests/:id
router.put(
  "/contests/:id",
  authorize("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const input = validate(contestSchema.partial(), req.body);
    const contest = await contestService.update(p(req, "id"), input, req.admin!.adminId);
    res.json({ success: true, data: contest });
  })
);

// DELETE /api/admin/contests/:id
router.delete(
  "/contests/:id",
  authorize("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    await contestService.remove(p(req, "id"), req.admin!.adminId);
    res.status(204).send();
  })
);

// ─── Site Content ─────────────────────────────────────────────────────────────

// GET /api/admin/content
router.get(
  "/content",
  asyncHandler(async (_req: Request, res: Response) => {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    res.json({ success: true, data: settings });
  })
);

// PUT /api/admin/content
router.put(
  "/content",
  authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
  asyncHandler(async (req: Request, res: Response) => {
    const input = validate(siteContentSchema, req.body);
    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", ...input },
      update: input,
    });
    res.json({ success: true, data: settings });
  })
);

// ─── Audit logs ───────────────────────────────────────────────────────────────

// GET /api/admin/audit-logs
router.get(
  "/audit-logs",
  authorize("SUPER_ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = validate(paginationSchema, req.query);
    const result = await auditService.list({
      page,
      limit,
      adminId: req.query["adminId"] as string,
      entity: req.query["entity"] as string,
    });
    res.json({ success: true, ...result });
  })
);

export default router;
