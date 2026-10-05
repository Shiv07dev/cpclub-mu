import prisma from "../config/prisma";
import { ConflictError, NotFoundError } from "../middleware/error";
import { CreateRegistrationInput } from "../types";
import { auditService } from "./auditService";
import { toJson, deserializeRegistration } from "../utils/mysql";

// ─── Human-readable Registration ID: CP-YYYY-NNNNNN ─────────────────────────

async function nextRegistrationId(): Promise<string> {
  const year = new Date().getFullYear();

  // MySQL-compatible atomic increment
  const counter = await prisma.registrationCounter.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", current: 1 },
    update: { current: { increment: 1 } },
  });

  const seq = String(counter.current).padStart(6, "0");
  return `CP-${year}-${seq}`;
}

export const registrationService = {
  async submit(input: CreateRegistrationInput) {
    // 1. Verify event exists and is open
    if (input.eventId) {
      const event = await prisma.event.findUnique({ where: { id: input.eventId } });
      if (!event) throw new NotFoundError("Event");
      if (!event.registrationOpen) {
        throw new ConflictError("Registration is not currently open for this event");
      }
    }

    // 2. Duplicate check
    if (input.eventId) {
      // Event-specific: check enrollment AND email for this event
      const [byEnrollment, byEmail] = await Promise.all([
        prisma.registration.findFirst({
          where: { eventId: input.eventId, enrollmentNumber: input.enrollmentNumber },
        }),
        prisma.registration.findFirst({
          where: {
            eventId: input.eventId,
            universityEmail: input.universityEmail.toLowerCase(),
          },
        }),
      ]);
      if (byEnrollment || byEmail) {
        throw new ConflictError("You are already registered for this event.");
      }
    } else {
      // General club membership: only one membership per enrollment number
      const existing = await prisma.registration.findFirst({
        where: {
          eventId: null,
          enrollmentNumber: input.enrollmentNumber,
        },
      });
      if (existing) {
        throw new ConflictError("You have already submitted a club membership registration.");
      }
    }

    // 3. Capacity check → determine status
    let status: "REGISTERED" | "WAITLISTED" = "REGISTERED";
    if (input.eventId) {
      const event = await prisma.event.findUnique({ where: { id: input.eventId } });
      if (event?.maxParticipants) {
        const confirmed = await prisma.registration.count({
          where: {
            eventId: input.eventId,
            status: { notIn: ["CANCELLED", "NO_SHOW", "REJECTED", "WAITLISTED"] as never[] },
          },
        });
        if (confirmed >= event.maxParticipants) status = "WAITLISTED";
      }
    }

    // 4. Generate human-readable ID
    const registrationId = await nextRegistrationId();

    const reg = await prisma.registration.create({
      data: {
        registrationId,
        eventId: input.eventId ?? null,
        fullName: input.fullName,
        enrollmentNumber: input.enrollmentNumber,
        universityEmail: input.universityEmail.toLowerCase(),
        personalEmail: input.personalEmail || null,
        phone: input.phone,
        semester: input.semester,
        program: input.program || null,
        department: input.department,
        github: input.github || null,
        linkedin: input.linkedin || null,
        leetcode: input.leetcode || null,
        hackerrank: input.hackerrank || null,
        codeforces: input.codeforces || null,
        interest: input.interest,
        reason: input.reason || null,
        teamName: input.teamName || null,
        teamMembersJson: toJson(input.teamMembers),
        experience: input.experience || null,
        customResponsesJson: input.customResponses
          ? JSON.stringify(input.customResponses)
          : null,
        status: status as never,
      },
      include: {
        event: { select: { title: true, slug: true, eventDate: true, venue: true } },
      },
    });

    return {
      registrationId: reg.registrationId,
      status: reg.status,
      event: reg.event
        ? {
            title: reg.event.title,
            slug: reg.event.slug,
            date: reg.event.eventDate,
            venue: reg.event.venue,
          }
        : null,
      participant: {
        fullName: reg.fullName,
        enrollmentNumber: reg.enrollmentNumber,
        email: reg.universityEmail,
        semester: reg.semester,
        department: reg.department,
      },
      registeredAt: reg.registeredAt,
    };
  },

  async getRegistrationStatus(eventId: string, enrollmentNumber: string) {
    const reg = await prisma.registration.findFirst({
      where: { eventId, enrollmentNumber },
      select: { registrationId: true, status: true, registeredAt: true },
    });
    return reg;
  },

  // ─── Admin functions ───────────────────────────────────────────────────────

  async list(params: {
    page?: number;
    limit?: number;
    eventId?: string;
    status?: string;
    search?: string;
    interest?: string;
  }) {
    const { page = 1, limit = 20 } = params;
    const where: Record<string, unknown> = {};

    if (params.eventId) where["eventId"] = params.eventId;
    if (params.status) where["status"] = params.status;
    if (params.interest) where["interest"] = params.interest;
    if (params.search) {
      where["OR"] = [
        { fullName: { contains: params.search } },
        { universityEmail: { contains: params.search } },
        { enrollmentNumber: { contains: params.search } },
        { department: { contains: params.search } },
      ];
    }

    const [regs, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        orderBy: { registeredAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { event: { select: { id: true, title: true, slug: true } } },
      }),
      prisma.registration.count({ where }),
    ]);

    // Map to frontend-compatible shape (matching the original mock data shape)
    const mapped = regs.map((r) => {
      const deserialized = deserializeRegistration(r as unknown as Record<string, unknown>);
      return {
        id: r.id,
        registrationId: r.registrationId,
        eventId: r.eventId,
        name: r.fullName,
        enrollment: r.enrollmentNumber,
        email: r.universityEmail,
        phone: r.phone,
        department: r.department,
        semester: r.semester,
        interest: r.interest,
        leetcode: r.leetcode,
        hackerrank: r.hackerrank,
        github: r.github,
        codeforces: r.codeforces,
        reason: r.reason,
        teamMembers: deserialized["teamMembers"],
        customResponses: deserialized["customResponses"],
        status: r.status,
        createdAt: r.registeredAt.toISOString(),
        event: (r as unknown as Record<string, unknown>)["event"],
      };
    });

    return { data: mapped, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(id: string) {
    const r = await prisma.registration.findUnique({
      where: { id },
      include: { event: { select: { id: true, title: true, slug: true, eventDate: true } } },
    });
    if (!r) throw new NotFoundError("Registration");
    const deserialized = deserializeRegistration(r as unknown as Record<string, unknown>);
    return {
      id: r.id,
      registrationId: r.registrationId,
      eventId: r.eventId,
      name: r.fullName,
      enrollment: r.enrollmentNumber,
      email: r.universityEmail,
      phone: r.phone,
      department: r.department,
      semester: r.semester,
      interest: r.interest,
      reason: r.reason,
      leetcode: r.leetcode,
      hackerrank: r.hackerrank,
      github: r.github,
      codeforces: r.codeforces,
      teamMembers: deserialized["teamMembers"],
      customResponses: deserialized["customResponses"],
      status: r.status,
      createdAt: r.registeredAt.toISOString(),
      event: (r as unknown as Record<string, unknown>)["event"],
    };
  },

  async setStatus(id: string, status: string, adminId: string) {
    const reg = await prisma.registration.findUnique({ where: { id } });
    if (!reg) throw new NotFoundError("Registration");
    await prisma.registration.update({ where: { id }, data: { status: status as never } });
    await auditService.log(adminId, "REGISTRATION_STATUS_CHANGED", "Registration", id, {
      from: reg.status,
      to: status,
    });
  },

  async exportCsv(params: { eventId?: string; status?: string }) {
    const where: Record<string, unknown> = {};
    if (params.eventId) where["eventId"] = params.eventId;
    if (params.status) where["status"] = params.status;

    const regs = await prisma.registration.findMany({
      where,
      orderBy: { registeredAt: "asc" },
      include: { event: { select: { title: true } } },
    });

    return regs.map((r) => ({
      "Registration ID": r.registrationId,
      Event: (r as unknown as Record<string, unknown>)["event"]
        ? ((r as unknown as Record<string, unknown>)["event"] as Record<string, string>)["title"]
        : "Club Membership",
      Name: r.fullName,
      "Enrollment Number": r.enrollmentNumber,
      Email: r.universityEmail,
      Phone: r.phone,
      Department: r.department,
      Semester: r.semester,
      Interest: r.interest,
      Status: r.status,
      "Registered At": r.registeredAt.toISOString(),
      GitHub: r.github ?? "",
      LeetCode: r.leetcode ?? "",
      HackerRank: r.hackerrank ?? "",
      Codeforces: r.codeforces ?? "",
      Reason: r.reason ?? "",
    }));
  },
};
