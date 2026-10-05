import prisma from "../config/prisma";
import { ConflictError, NotFoundError } from "../middleware/error";
import { slugify } from "./eventService";
import { auditService } from "./auditService";
import { toJson, deserializeContest, deserializeCommitteeMember } from "../utils/mysql";

export const contestService = {
  async current() {
    const contest = await prisma.contest.findFirst({
      where: {
        status: {
          in: ["ANNOUNCED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "LIVE"],
        },
      },
      orderBy: { date: "desc" },
    });

    if (!contest) return null; // Frontend shows COMING SOON

    const d = deserializeContest(contest as unknown as Record<string, unknown>);
    return {
      id: contest.id,
      name: contest.name,
      number: contest.contestNumber,
      date: contest.date?.toISOString(),
      startTime: contest.startTime,
      duration: contest.duration,
      platform: contest.platform,
      registrationOpen: contest.status === "REGISTRATION_OPEN",
      registrationDeadline: contest.registrationDeadline?.toISOString(),
      registrationLink: contest.registrationLink,
      rules: d["rules"],
      prizes: d["prizes"],
    };
  },

  async list(params: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = params;
    const [contests, total] = await Promise.all([
      prisma.contest.findMany({
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contest.count(),
    ]);
    return {
      data: contests.map((c) => deserializeContest(c as unknown as Record<string, unknown>)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async create(
    input: {
      name: string;
      description?: string;
      contestNumber?: number;
      date?: string;
      startTime?: string;
      duration?: string;
      platform?: string;
      registrationDeadline?: string;
      registrationLink?: string;
      status?: string;
      rules?: string[];
      prizes?: string[];
      maxParticipants?: number;
    },
    adminId: string
  ) {
    let slug = slugify(input.name);
    const existing = await prisma.contest.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const contest = await prisma.contest.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        contestNumber: input.contestNumber,
        date: input.date ? new Date(input.date) : null,
        startTime: input.startTime,
        duration: input.duration,
        platform: input.platform,
        registrationDeadline: input.registrationDeadline
          ? new Date(input.registrationDeadline)
          : null,
        registrationLink: input.registrationLink,
        status: (input.status ?? "DRAFT") as never,
        rulesJson: toJson(input.rules),
        prizesJson: toJson(input.prizes),
        maxParticipants: input.maxParticipants,
      },
    });

    await auditService.log(adminId, "CONTEST_CREATED", "Contest", contest.id, {
      name: contest.name,
    });
    return deserializeContest(contest as unknown as Record<string, unknown>);
  },

  async update(
    id: string,
    input: Partial<{
      name: string;
      description: string;
      date: string;
      status: string;
      rules: string[];
      prizes: string[];
      registrationLink: string;
      registrationDeadline: string;
    }>,
    adminId: string
  ) {
    const existing = await prisma.contest.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Contest");

    const contest = await prisma.contest.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.date !== undefined && { date: input.date ? new Date(input.date) : null }),
        ...(input.status && { status: input.status as never }),
        ...(input.rules !== undefined && { rulesJson: toJson(input.rules) }),
        ...(input.prizes !== undefined && { prizesJson: toJson(input.prizes) }),
        ...(input.registrationLink !== undefined && {
          registrationLink: input.registrationLink,
        }),
        ...(input.registrationDeadline !== undefined && {
          registrationDeadline: input.registrationDeadline
            ? new Date(input.registrationDeadline)
            : null,
        }),
      },
    });

    await auditService.log(adminId, "CONTEST_UPDATED", "Contest", id);
    return deserializeContest(contest as unknown as Record<string, unknown>);
  },

  async remove(id: string, adminId: string) {
    const existing = await prisma.contest.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Contest");
    await prisma.contest.delete({ where: { id } });
    await auditService.log(adminId, "CONTEST_DELETED", "Contest", id, {
      name: existing.name,
    });
  },

  async register(
    contestId: string,
    input: {
      fullName: string;
      enrollmentNumber: string;
      email: string;
      phone?: string;
      codeforcesHandle?: string;
    }
  ) {
    const contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) throw new NotFoundError("Contest");
    if (contest.status !== "REGISTRATION_OPEN") {
      throw new ConflictError("Registration is not currently open for this contest");
    }

    const existing = await prisma.contestRegistration.findFirst({
      where: {
        contestId,
        OR: [
          { enrollmentNumber: input.enrollmentNumber },
          { email: input.email.toLowerCase() },
        ],
      },
    });
    if (existing) throw new ConflictError("You are already registered for this contest.");

    return prisma.contestRegistration.create({
      data: {
        contestId,
        fullName: input.fullName,
        enrollmentNumber: input.enrollmentNumber,
        email: input.email.toLowerCase(),
        phone: input.phone,
        codeforcesHandle: input.codeforcesHandle,
      },
    });
  },
};

// ─── Committee ────────────────────────────────────────────────────────────────

export const committeeService = {
  async list() {
    const members = await prisma.committeeMember.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });
    return members.map((m) =>
      deserializeCommitteeMember(m as unknown as Record<string, unknown>)
    );
  },
};
