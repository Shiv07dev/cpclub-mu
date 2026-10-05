import prisma from "../config/prisma";
import { NotFoundError } from "../middleware/error";
import { auditService } from "./auditService";

// ─── Achievements ─────────────────────────────────────────────────────────────

export const achievementService = {
  async list(params: {
    page?: number;
    limit?: number;
    year?: string;
    category?: string;
    search?: string;
    isPublished?: boolean;
  }) {
    const { page = 1, limit = 20 } = params;
    const where: Record<string, unknown> = {};

    if (params.isPublished !== undefined) where["isPublished"] = params.isPublished;
    if (params.year) where["year"] = params.year;
    if (params.category) where["category"] = { contains: params.category };
    if (params.search) {
      where["OR"] = [
        { title: { contains: params.search } },
        { studentName: { contains: params.search } },
        { description: { contains: params.search } },
      ];
    }

    const [achievements, total] = await Promise.all([
      prisma.achievement.findMany({
        where,
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.achievement.count({ where }),
    ]);

    return {
      data: achievements,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async create(
    input: {
      title: string;
      description: string;
      studentName: string;
      studentId?: string;
      eventName?: string;
      organization?: string;
      year?: string;
      result?: string;
      imageUrl?: string;
      category?: string;
      tag?: string;
      isPublished?: boolean;
    },
    adminId: string
  ) {
    const achievement = await prisma.achievement.create({ data: input });
    await auditService.log(adminId, "ACHIEVEMENT_CREATED", "Achievement", achievement.id, {
      title: achievement.title,
    });
    return achievement;
  },

  async update(
    id: string,
    input: Partial<{
      title: string;
      description: string;
      studentName: string;
      year: string;
      result: string;
      imageUrl: string;
      category: string;
      tag: string;
      isPublished: boolean;
    }>,
    adminId: string
  ) {
    const existing = await prisma.achievement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Achievement");

    const achievement = await prisma.achievement.update({ where: { id }, data: input });
    await auditService.log(adminId, "ACHIEVEMENT_UPDATED", "Achievement", id);
    return achievement;
  },

  async remove(id: string, adminId: string) {
    const existing = await prisma.achievement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Achievement");

    await prisma.achievement.delete({ where: { id } });
    await auditService.log(adminId, "ACHIEVEMENT_DELETED", "Achievement", id, {
      title: existing.title,
    });
  },
};

// ─── Placements ───────────────────────────────────────────────────────────────

export const placementService = {
  async list() {
    return prisma.placementRecord.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "asc" },
    });
  },
};

// ─── GATE ─────────────────────────────────────────────────────────────────────

export const gateService = {
  async list() {
    return prisma.gateQualification.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "asc" },
    });
  },
};

// ─── Committee (re-exported for public route) ─────────────────────────────────

export { committeeService } from "./contestService";
