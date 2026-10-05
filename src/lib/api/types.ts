export type EventCategory = "Competition" | "Workshop" | "Technical Talk" | "Hands-on Lab" | "Fun & Creative";
export type EventMode = "Offline" | "Online" | "Hybrid";

/** A single custom form field defined by the admin for a specific event */
export interface CustomField {
  id: string;          // unique within the event
  label: string;       // question text shown to user
  type: "text" | "textarea" | "select" | "number" | "checkbox";
  required: boolean;
  placeholder?: string;
  options?: string[];  // for type="select" — dropdown choices
}

export interface ClubEvent {
  id: string;
  slug: string;
  title: string;
  year: number;
  date?: string | undefined; // ISO date, only when known
  category: EventCategory;
  mode?: EventMode | undefined;
  description: string;
  takeaways: string[];
  prerequisites?: string[] | undefined;
  agenda?: string[] | undefined;
  speaker?: string | undefined;
  upcoming: boolean;
  registrationOpen: boolean;
  /** Fields below come from the club's formal event reports. */
  venue?: string | undefined;
  participants?: number | undefined;
  audience?: string | undefined;
  overview?: string[] | undefined;
  outcomes?: string[] | undefined;
  photos?: string[] | undefined;
  reportBacked?: boolean | undefined;
  /** Custom form fields defined by admin — rendered on the event registration form */
  customFields?: CustomField[] | undefined;
}

export type Interest = "Competitive Programming" | "Web Dev" | "Game Dev / Unity" | "Git / Open Source";

export interface RegistrationInput {
  name: string;
  enrollment: string;
  department: string;
  semester: string;
  email: string;
  phone: string;
  leetcode?: string | undefined;
  hackerrank?: string | undefined;
  github?: string | undefined;
  codeforces?: string | undefined;
  interest: Interest;
  reason: string;
  eventId?: string | undefined;
  /** Answers to custom fields defined on the event — key is CustomField.id */
  customResponses?: Record<string, string | boolean | number> | undefined;
}

export interface Registration extends RegistrationInput {
  id: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

/** Monthly Coding Contest — supplied by the backend once a contest is announced. */
export interface MonthlyContest {
  id: string;
  name: string;
  number?: number | undefined;
  date?: string | undefined; // ISO date
  startTime?: string | undefined;
  duration?: string | undefined;
  platform?: string | undefined;
  registrationOpen: boolean;
  registrationDeadline?: string | undefined;
  registrationLink?: string | undefined;
  rules?: string[] | undefined;
  prizes?: string[] | undefined;
  leaderboard?: { rank: number; name: string; score?: string | undefined }[] | undefined;
}

export interface SiteContent {
  announcement: string;
  heroTagline: string;
}
