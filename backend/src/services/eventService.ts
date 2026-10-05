import prisma from "../config/prisma";
import { ConflictError, NotFoundError } from "../middleware/error";
import { CreateEventInput } from "../types";
import { auditService } from "./auditService";
import { toJson, deserializeEvent } from "../utils/mysql";

// Slugify title to URL-safe string
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Map frontend category strings to Prisma enum values
function mapCategory(cat: string) {
  const map: Record<string, string> = {
    Competition: "Competition",
    Workshop: "Workshop",
    "Technical Talk": "TechnicalTalk",
    TechnicalTalk: "TechnicalTalk",
    "Hands-on Lab": "HandsOnLab",
    HandsOnLab: "HandsOnLab",
    "Fun & Creative": "FunAndCreative",
    FunAndCreative: "FunAndCreative",
  };
  return map[cat] ?? "Workshop";
}

// Map Prisma enum values back to frontend display strings
function unmapCategory(cat: string): string {
  const map: Record<string, string> = {
    Competition: "Competition",
    Workshop: "Workshop",
    TechnicalTalk: "Technical Talk",
    HandsOnLab: "Hands-on Lab",
    FunAndCreative: "Fun & Creative",
  };
  return map[cat] ?? cat;
}

// Convert raw DB event → clean public-facing event object
function toPublicEvent(e: Record<string, unknown>): Record<string, unknown> {
  const deserialized = deserializeEvent(e);
  // Provide 'date' as a frontend-compatible alias for 'eventDate'
  const eventDate = deserialized["eventDate"];
  const dateStr = eventDate ? (eventDate instanceof Date ? eventDate.toISOString() : String(eventDate)).slice(0, 10) : undefined;
  return {
    ...deserialized,
    category: unmapCategory(deserialized["category"] as string),
    date: dateStr, // Frontend ClubEvent.date field alias
  };
}

export const eventService = {
  async generateSlug(title: string, year: number, excludeId?: string): Promise<string> {
    const base = `${slugify(title)}-${year}`;
    let slug = base;
    let counter = 1;
    while (true) {
      const existing = await prisma.event.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) break;
      slug = `${base}-${counter++}`;
    }
    return slug;
  },

  async list(params: {
    page?: number;
    limit?: number;
    category?: string;
    year?: number;
    status?: string;
    search?: string;
    upcoming?: boolean;
    isPublished?: boolean;
  }) {
    const { page = 1, limit = 20 } = params;
    const where: Record<string, unknown> = {};

    if (params.isPublished !== undefined) where["isPublished"] = params.isPublished;
    if (params.upcoming !== undefined) where["upcoming"] = params.upcoming;
    if (params.category) where["category"] = mapCategory(params.category);
    if (params.year) where["year"] = params.year;
    if (params.status) where["status"] = params.status;
    if (params.search) {
      where["OR"] = [
        { title: { contains: params.search } },
        { description: { contains: params.search } },
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { registrations: true, gallery: true } } },
      }),
      prisma.event.count({ where }),
    ]);

    return {
      data: events.map((e) => toPublicEvent(e as unknown as Record<string, unknown>)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getBySlug(slug: string) {
    const e = await prisma.event.findUnique({
      where: { slug },
      include: {
        gallery: { orderBy: { displayOrder: "asc" } },
        report: { select: { title: true, content: true, published: true } },
        _count: { select: { registrations: true } },
      },
    });
    if (!e) throw new NotFoundError("Event");
    return toPublicEvent(e as unknown as Record<string, unknown>);
  },

  async getById(id: string) {
    const e = await prisma.event.findUnique({ where: { id } });
    if (!e) throw new NotFoundError("Event");
    return toPublicEvent(e as unknown as Record<string, unknown>);
  },

  async create(input: CreateEventInput & { date?: string }, adminId: string) {
    const slug = await this.generateSlug(input.title, input.year);

    // Accept 'date' as alias for 'eventDate' (frontend field name)
    const resolvedDate = input.eventDate || input.date;

    // Auto-derive status from upcoming/registrationOpen flags if not explicitly set
    let resolvedStatus = input.status;
    if (!resolvedStatus) {
      if (input.registrationOpen) resolvedStatus = "REGISTRATION_OPEN";
      else if (input.upcoming) resolvedStatus = "UPCOMING";
      else resolvedStatus = "DRAFT";
    }

    const event = await prisma.event.create({
      data: {
        slug,
        title: input.title,
        shortDescription: input.shortDescription,
        description: input.description,
        category: mapCategory(input.category) as never,
        mode: (input.mode ?? "Offline") as never,
        status: resolvedStatus as never,
        eventDate: resolvedDate ? new Date(resolvedDate) : undefined,
        startTime: input.startTime,
        endTime: input.endTime,
        year: input.year,
        venue: input.venue,
        speaker: input.speaker,
        organizer: input.organizer ?? "Competitive Programming Club, ICT Department",
        registrationDeadline: input.registrationDeadline
          ? new Date(input.registrationDeadline)
          : undefined,
        maxParticipants: input.maxParticipants,
        bannerImage: input.bannerImage,
        eligibility: input.eligibility,
        rulesJson: toJson(input.rules),
        takeawaysJson: toJson(input.takeaways),
        overviewJson: toJson(input.overview),
        outcomesJson: toJson(input.outcomes),
        agendaJson: toJson(input.agenda),
        prerequisitesJson: toJson(input.prerequisites),
        customFieldsJson: input.customFields ? JSON.stringify(input.customFields) : "[]",
        audience: input.audience,
        isPublished: input.isPublished ?? false,
        upcoming: input.upcoming ?? false,
        registrationOpen: input.registrationOpen ?? false,
      },
    });

    await auditService.log(adminId, "EVENT_CREATED", "Event", event.id, { title: event.title });
    return toPublicEvent(event as unknown as Record<string, unknown>);
  },

  async update(id: string, input: Partial<CreateEventInput> & { date?: string }, adminId: string) {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Event");

    const slug =
      input.title && input.title !== existing.title
        ? await this.generateSlug(input.title, input.year ?? existing.year, id)
        : existing.slug;

    // Accept 'date' as alias for 'eventDate'
    const resolvedDate = input.eventDate !== undefined ? input.eventDate : input.date;

    // Auto-derive status from upcoming/registrationOpen flags if explicitly provided
    let resolvedStatus = input.status;
    if (!resolvedStatus && (input.registrationOpen !== undefined || input.upcoming !== undefined)) {
      const isRegOpen = input.registrationOpen ?? existing.registrationOpen;
      const isUpcoming = input.upcoming ?? existing.upcoming;
      if (isRegOpen) resolvedStatus = "REGISTRATION_OPEN";
      else if (isUpcoming) resolvedStatus = "UPCOMING";
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(slug !== existing.slug && { slug }),
        ...(input.title && { title: input.title }),
        ...(input.shortDescription !== undefined && { shortDescription: input.shortDescription }),
        ...(input.description && { description: input.description }),
        ...(input.category && { category: mapCategory(input.category) as never }),
        ...(input.mode !== undefined && { mode: input.mode as never }),
        ...(resolvedStatus && { status: resolvedStatus as never }),
        ...(resolvedDate !== undefined && {
          eventDate: resolvedDate ? new Date(resolvedDate) : null,
        }),
        ...(input.startTime !== undefined && { startTime: input.startTime }),
        ...(input.endTime !== undefined && { endTime: input.endTime }),
        ...(input.year && { year: input.year }),
        ...(input.venue !== undefined && { venue: input.venue }),
        ...(input.speaker !== undefined && { speaker: input.speaker }),
        ...(input.organizer !== undefined && { organizer: input.organizer }),
        ...(input.maxParticipants !== undefined && { maxParticipants: input.maxParticipants }),
        ...(input.bannerImage !== undefined && { bannerImage: input.bannerImage }),
        ...(input.eligibility !== undefined && { eligibility: input.eligibility }),
        ...(input.rules !== undefined && { rulesJson: toJson(input.rules) }),
        ...(input.takeaways !== undefined && { takeawaysJson: toJson(input.takeaways) }),
        ...(input.overview !== undefined && { overviewJson: toJson(input.overview) }),
        ...(input.outcomes !== undefined && { outcomesJson: toJson(input.outcomes) }),
        ...(input.agenda !== undefined && { agendaJson: toJson(input.agenda) }),
        ...(input.prerequisites !== undefined && { prerequisitesJson: toJson(input.prerequisites) }),
        ...(input.customFields !== undefined && {
          customFieldsJson: JSON.stringify(input.customFields),
        }),
        ...(input.audience !== undefined && { audience: input.audience }),
        ...(input.isPublished !== undefined && { isPublished: input.isPublished }),
        ...(input.upcoming !== undefined && { upcoming: input.upcoming }),
        ...(input.registrationOpen !== undefined && {
          registrationOpen: input.registrationOpen,
        }),
      },
    });

    await auditService.log(adminId, "EVENT_UPDATED", "Event", id, { title: event.title });
    return toPublicEvent(event as unknown as Record<string, unknown>);
  },

  async remove(id: string, adminId: string) {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Event");

    const regCount = await prisma.registration.count({
      where: { eventId: id, status: { notIn: ["CANCELLED" as never] } },
    });
    if (regCount > 0) {
      throw new ConflictError(
        `Event has ${regCount} active registrations. Cancel them first or archive the event instead.`
      );
    }

    await prisma.event.delete({ where: { id } });
    await auditService.log(adminId, "EVENT_DELETED", "Event", id, { title: existing.title });
  },
};
