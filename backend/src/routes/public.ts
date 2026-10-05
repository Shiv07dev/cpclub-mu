import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../middleware/auth";
import { eventService } from "../services/eventService";
import { registrationService } from "../services/registrationService";
import { galleryService } from "../services/galleryService";
import { achievementService, committeeService, placementService, gateService } from "../services/contentService";
import { contestService } from "../services/contestService";
import { validate, registrationSchema, paginationSchema, contestRegistrationSchema } from "../validators";
import { config } from "../config";
import prisma from "../config/prisma";

/** Cast route param to string safely */
const p = (req: Request, key: string): string => String(req.params[key] ?? "");

const router = Router();

const regLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.registrationMax,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many registration attempts. Try again later." } },
});

// ─── Events ───────────────────────────────────────────────────────────────────

// GET /api/events
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
      isPublished: true, // Only return published events publicly
    });
    res.json({ success: true, ...result });
  })
);

// GET /api/events/:slug
router.get(
  "/events/:slug",
  asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.getBySlug(p(req, "slug"));
    res.json({ success: true, data: event });
  })
);

// GET /api/events/:slug/gallery
router.get(
  "/events/:slug/gallery",
  asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.getBySlug(p(req, "slug"));
    const gallery = await galleryService.getForEvent((event as Record<string, string>)["id"]);
    res.json({ success: true, data: gallery });
  })
);

// GET /api/events/:slug/report
router.get(
  "/events/:slug/report",
  asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.getBySlug(p(req, "slug"));
    const report = await prisma.eventReport.findUnique({
      where: { eventId: (event as Record<string, string>)["id"] },
    });
    if (!report || !report.published) {
      res.json({ success: true, data: null });
      return;
    }
    res.json({ success: true, data: { title: report.title, content: report.content, documentUrl: report.documentUrl } });
  })
);

// POST /api/events/:eventId/register
router.post(
  "/events/:eventId/register",
  regLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const input = validate(registrationSchema, { ...req.body, eventId: p(req, "eventId") });
    const result = await registrationService.submit(input);
    res.status(201).json({ success: true, data: result });
  })
);

// POST /api/registrations  — general club membership registration (no specific event)
router.post(
  "/registrations",
  regLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    // eventId omitted → general club registration
    const input = validate(registrationSchema, { ...req.body });
    const result = await registrationService.submit(input);
    res.status(201).json({ success: true, data: result });
  })
);

// GET /api/events/:eventId/registration-status
router.get(
  "/events/:eventId/registration-status",
  asyncHandler(async (req: Request, res: Response) => {
    const { enrollmentNumber } = req.query as { enrollmentNumber?: string };
    if (!enrollmentNumber) {
      res.status(400).json({ success: false, error: { code: "MISSING_PARAM", message: "enrollmentNumber query required" } });
      return;
    }
    const status = await registrationService.getRegistrationStatus(p(req, "eventId"), enrollmentNumber);
    res.json({ success: true, data: status });
  })
);

// ─── Achievements ─────────────────────────────────────────────────────────────

// GET /api/achievements
router.get(
  "/achievements",
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = validate(paginationSchema, req.query);
    const result = await achievementService.list({
      page,
      limit,
      year: req.query["year"] as string,
      category: req.query["category"] as string,
      search: req.query["search"] as string,
      isPublished: true,
    });
    res.json({ success: true, ...result });
  })
);

// ─── Committee ────────────────────────────────────────────────────────────────

// GET /api/committee
router.get(
  "/committee",
  asyncHandler(async (_req: Request, res: Response) => {
    const members = await committeeService.list();
    res.json({ success: true, data: members });
  })
);

// ─── Placements ───────────────────────────────────────────────────────────────

// GET /api/placements
router.get(
  "/placements",
  asyncHandler(async (_req: Request, res: Response) => {
    const records = await placementService.list();
    res.json({ success: true, data: records });
  })
);

// ─── GATE ─────────────────────────────────────────────────────────────────────

// GET /api/gate
router.get(
  "/gate",
  asyncHandler(async (_req: Request, res: Response) => {
    const records = await gateService.list();
    res.json({ success: true, data: records });
  })
);

// ─── Contests ─────────────────────────────────────────────────────────────────

// GET /api/contests/current
router.get(
  "/contests/current",
  asyncHandler(async (_req: Request, res: Response) => {
    const contest = await contestService.current();
    res.json({ success: true, data: contest }); // null if none active — frontend shows COMING SOON
  })
);

// POST /api/contests/:contestId/register
router.post(
  "/contests/:contestId/register",
  regLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const input = validate(contestRegistrationSchema, req.body);
    const result = await contestService.register(p(req, "contestId"), input);
    res.status(201).json({ success: true, data: result });
  })
);

// ─── Site settings ────────────────────────────────────────────────────────────

// GET /api/site-settings
router.get(
  "/site-settings",
  asyncHandler(async (_req: Request, res: Response) => {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    res.json({ success: true, data: settings });
  })
);

// GET /api/content  (frontend compatibility — same as site-settings but shaped like SiteContent)
router.get(
  "/content",
  asyncHandler(async (_req: Request, res: Response) => {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    res.json({
      success: true,
      data: {
        announcement: settings?.announcement ?? "Follow @CPCLUB_MU on Instagram for the next event announcement.",
        heroTagline: settings?.heroTagline ?? "",
      },
    });
  })
);

export default router;
