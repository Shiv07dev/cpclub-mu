import { z } from "zod";

// ─── Auth validators ──────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(1, "Password is required").max(128),
});

// ─── Registration validator ───────────────────────────────────────────────────

const urlOrEmpty = z.string().trim().url("Enter a full URL").max(200).optional().or(z.literal(""));

export const registrationSchema = z.object({
  eventId: z.string().optional(),
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  enrollmentNumber: z.string().trim().min(4, "Enter your enrollment number").max(30),
  universityEmail: z.string().trim().email("Enter a valid university email").max(255),
  personalEmail: z.string().trim().email().max(255).optional().or(z.literal("")),
  phone: z.string().trim().regex(/^[+]?[0-9 ]{10,15}$/, "Enter a valid phone number"),
  semester: z.string().min(1, "Select your semester"),
  program: z.string().max(100).optional(),
  department: z.string().min(1, "Select your department").max(100),
  github: urlOrEmpty,
  linkedin: urlOrEmpty,
  leetcode: urlOrEmpty,
  hackerrank: urlOrEmpty,
  codeforces: urlOrEmpty,
  interest: z.string().min(1, "Select your primary interest").max(100),
  reason: z.string().trim().min(20, "Tell us more (20+ characters)").max(2000).optional(),
  teamName: z.string().max(100).optional(),
  teamMembers: z.array(z.string().max(100)).max(10).optional(),
  experience: z.string().max(500).optional(),
  customResponses: z.record(z.unknown()).optional(),
});

// ─── Event validators ─────────────────────────────────────────────────────────

export const createEventSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(200),
  shortDescription: z.string().max(300).optional(),
  description: z.string().trim().min(10, "Description is required").max(5000),
  // Accept both frontend display strings and backend enum values
  category: z.enum([
    "Competition", "Workshop",
    "Technical Talk", "TechnicalTalk",
    "Hands-on Lab", "HandsOnLab",
    "Fun & Creative", "FunAndCreative",
  ]),
  mode: z.enum(["Offline", "Online", "Hybrid"]).optional(),
  status: z.enum(["DRAFT", "UPCOMING", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "COMPLETED", "CANCELLED"]).optional(),
  // Accept ISO datetime, plain YYYY-MM-DD, or empty string
  eventDate: z.string().max(50).optional(),
  // Frontend field alias: date -> eventDate (handled in eventService)
  date: z.string().max(50).optional(),
  startTime: z.string().max(10).optional(),
  endTime: z.string().max(10).optional(),
  year: z.number().int().min(2020).max(2100),
  venue: z.string().max(200).optional(),
  speaker: z.string().max(300).optional(),
  organizer: z.string().max(300).optional(),
  registrationDeadline: z.string().optional(),
  maxParticipants: z.number().int().positive().optional(),
  bannerImage: z.string().url().optional().or(z.literal("")),
  eligibility: z.string().max(500).optional(),
  rules: z.array(z.string().max(500)).optional(),
  takeaways: z.array(z.string().max(500)).optional(),
  overview: z.array(z.string().max(500)).optional(),
  outcomes: z.array(z.string().max(500)).optional(),
  agenda: z.array(z.string().max(500)).optional(),
  prerequisites: z.array(z.string().max(500)).optional(),
  audience: z.string().max(300).optional(),
  isPublished: z.boolean().optional(),
  upcoming: z.boolean().optional(),
  registrationOpen: z.boolean().optional(),
  reportBacked: z.boolean().optional(),
  /** Custom registration form fields defined per event by admin */
  customFields: z.array(
    z.object({
      id: z.string().min(1).max(100),
      label: z.string().min(1, "Field label is required").max(120),
      type: z.enum(["text", "textarea", "select", "number", "checkbox"]),
      required: z.boolean(),
      placeholder: z.string().max(120).optional(),
      options: z.array(z.string().max(200)).max(50).optional(),
    })
  ).optional(),
});

export const updateEventSchema = createEventSchema.partial();

// ─── Achievement validators ───────────────────────────────────────────────────

export const achievementSchema = z.object({
  title: z.string().trim().min(3).max(300),
  description: z.string().trim().min(10).max(2000),
  studentName: z.string().trim().min(2).max(200),
  studentId: z.string().max(50).optional(),
  eventName: z.string().max(300).optional(),
  organization: z.string().max(300).optional(),
  year: z.string().max(20).optional(),
  result: z.string().max(200).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().max(100).optional(),
  tag: z.string().max(200).optional(),
  isPublished: z.boolean().optional(),
});

// ─── Contest validators ───────────────────────────────────────────────────────

export const contestSchema = z.object({
  name: z.string().trim().min(3).max(200),
  description: z.string().max(3000).optional(),
  contestNumber: z.number().int().positive().optional(),
  date: z.string().optional(),
  startTime: z.string().max(10).optional(),
  duration: z.string().max(50).optional(),
  platform: z.string().max(100).optional(),
  registrationDeadline: z.string().optional(),
  registrationLink: z.string().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "ANNOUNCED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "LIVE", "COMPLETED", "CANCELLED"]).optional(),
  rules: z.array(z.string().max(500)).optional(),
  prizes: z.array(z.string().max(500)).optional(),
  maxParticipants: z.number().int().positive().optional(),
});

export const contestRegistrationSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  enrollmentNumber: z.string().trim().min(4).max(30),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().regex(/^[+]?[0-9 ]{10,15}$/).optional(),
  codeforcesHandle: z.string().max(50).optional(),
});

// ─── Gallery validator ────────────────────────────────────────────────────────

export const galleryImageSchema = z.object({
  caption: z.string().max(500).optional(),
  altText: z.string().max(300).optional(),
  displayOrder: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
});

// ─── Site content validator ───────────────────────────────────────────────────

export const siteContentSchema = z.object({
  announcement: z.string().max(500).optional(),
  heroTagline: z.string().max(300).optional(),
  clubName: z.string().max(200).optional(),
  tagline: z.string().max(500).optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().max(20).optional(),
});

// ─── Pagination validator ─────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(20),
});

// ─── Validate helper ──────────────────────────────────────────────────────────

import { ValidationError } from "../middleware/error";

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    throw new ValidationError("Validation failed", details);
  }
  return result.data;
}
