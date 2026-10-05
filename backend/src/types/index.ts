// Shared TypeScript types used across the backend.
// These mirror the frontend API types (src/lib/api/types.ts) for contract alignment.

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

export interface JwtPayload {
  adminId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Express.Request {
  admin?: {
    adminId: string;
    email: string;
    role: string;
  };
}

// ─── Event DTOs ───────────────────────────────────────────────────────────────

export interface CreateEventInput {
  title: string;
  shortDescription?: string;
  description: string;
  category: string;
  mode?: string;
  status?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  year: number;
  venue?: string;
  speaker?: string;
  organizer?: string;
  registrationDeadline?: string;
  maxParticipants?: number;
  bannerImage?: string;
  eligibility?: string;
  rules?: string[];
  takeaways?: string[];
  overview?: string[];
  outcomes?: string[];
  agenda?: string[];
  prerequisites?: string[];
  audience?: string;
  isPublished?: boolean;
  upcoming?: boolean;
  registrationOpen?: boolean;
  /** Custom registration form fields defined by admin per event */
  customFields?: {
    id: string;
    label: string;
    type: "text" | "textarea" | "select" | "number" | "checkbox";
    required: boolean;
    placeholder?: string;
    options?: string[];
  }[];
}

// ─── Registration DTOs ────────────────────────────────────────────────────────

export interface CreateRegistrationInput {
  eventId?: string;
  fullName: string;
  enrollmentNumber: string;
  universityEmail: string;
  personalEmail?: string;
  phone: string;
  semester: string;
  program?: string;
  department: string;
  github?: string;
  linkedin?: string;
  leetcode?: string;
  hackerrank?: string;
  codeforces?: string;
  interest: string;
  reason?: string;
  teamName?: string;
  teamMembers?: string[];
  experience?: string;
  customResponses?: Record<string, unknown>;
}

// ─── Achievement DTOs ─────────────────────────────────────────────────────────

export interface CreateAchievementInput {
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
}

// ─── Contest DTOs ─────────────────────────────────────────────────────────────

export interface CreateContestInput {
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
}
