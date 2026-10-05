// Service layer — UI talks only to these functions. Each has a mock (localStorage) branch
// and a real HTTP branch, chosen by VITE_API_BASE_URL. Endpoint paths are the backend contract.
import { delay, http, readStore, uid, useMock, writeStore } from "./http";
import { SEED_EVENTS } from "./seed-events";
import type { ClubEvent, MonthlyContest, Registration, RegistrationInput, SiteContent } from "./types";

const K = { events: "cp_events_v2", regs: "cp_regs_v1", content: "cp_content_v1" };

const SEED_CONTENT: SiteContent = {
  announcement: "Follow @CPCLUB_MU on Instagram for the next event announcement.",
  heroTagline: "",
};

// ─── Events ───────────────────────────────────────────────────────────────────

export const eventsApi = {
  /** Public list — only published events. Used by public pages. */
  async list(): Promise<ClubEvent[]> {
    if (!useMock) {
      const res = await fetch(`${(await import("./http")).API_BASE}/events?limit=200`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) return [];
      const json = await res.json() as { data: ClubEvent[] };
      return json.data ?? [];
    }
    await delay(120);
    return readStore(K.events, SEED_EVENTS);
  },
  /** Admin list — ALL events (published + unpublished). Used by admin panel. */
  async adminList(): Promise<ClubEvent[]> {
    if (!useMock) {
      // http() unwraps { success, data: [...] } envelope and returns data directly
      // Backend /admin/events returns { success, data: ClubEvent[], pagination }
      // So http<ClubEvent[]> returns the events array
      return http<ClubEvent[]>("/admin/events?limit=200");
    }
    await delay(120);
    return readStore(K.events, SEED_EVENTS);
  },
  async get(slug: string): Promise<ClubEvent | undefined> {
    if (!useMock) {
      try { return await http<ClubEvent>(`/events/${slug}`); } catch { return undefined; }
    }
    return (await this.list()).find((e) => e.slug === slug);
  },
  async create(input: Omit<ClubEvent, "id" | "slug">): Promise<ClubEvent> {
    if (!useMock) return http("/admin/events", { method: "POST", body: JSON.stringify(input) });
    const all = await this.list();
    const ev: ClubEvent = {
      ...input,
      id: uid(),
      slug: `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${input.year}-${uid().slice(0, 4)}`,
    };
    writeStore(K.events, [ev, ...all]);
    return ev;
  },
  async update(id: string, patch: Partial<ClubEvent>): Promise<ClubEvent> {
    if (!useMock) return http(`/admin/events/${id}`, { method: "PUT", body: JSON.stringify(patch) });
    const all = await this.list();
    const next = all.map((e) => (e.id === id ? { ...e, ...patch } : e));
    writeStore(K.events, next);
    return next.find((e) => e.id === id)!;
  },
  async remove(id: string): Promise<void> {
    if (!useMock) return http(`/admin/events/${id}`, { method: "DELETE" });
    writeStore(K.events, (await this.list()).filter((e) => e.id !== id));
  },
};

// ─── Registrations ────────────────────────────────────────────────────────────

export const registrationsApi = {
  async list(): Promise<Registration[]> {
    if (!useMock) {
      const res = await fetch(`${(await import("./http")).API_BASE}/admin/registrations?limit=200`, {
        headers: {
          "Content-Type": "application/json",
          ...(window.localStorage.getItem("cp_admin_token")
            ? { Authorization: `Bearer ${window.localStorage.getItem("cp_admin_token")}` }
            : {}),
        },
      });
      if (!res.ok) return [];
      const json = await res.json() as { data: Registration[] };
      return json.data ?? [];
    }
    await delay(120);
    return readStore<Registration[]>(K.regs, []);
  },
  async get(id: string) {
    if (!useMock) {
      try { return await http<Registration>(`/admin/registrations/${id}`); } catch { return undefined; }
    }
    return (await this.list()).find((r) => r.id === id);
  },
  async submit(input: RegistrationInput): Promise<Registration> {
    if (!useMock) {
      // Map frontend field names → backend field names
      const backendPayload = {
        fullName: input.name,
        enrollmentNumber: input.enrollment,
        universityEmail: input.email,
        phone: input.phone,
        department: input.department,
        semester: input.semester,
        interest: input.interest,
        reason: input.reason,
        ...(input.leetcode && { leetcode: input.leetcode }),
        ...(input.hackerrank && { hackerrank: input.hackerrank }),
        ...(input.github && { github: input.github }),
        ...(input.codeforces && { codeforces: input.codeforces }),
        ...(input.customResponses && Object.keys(input.customResponses).length > 0 && { customResponses: input.customResponses }),
      };

      if (input.eventId) {
        // Event-specific registration
        const result = await http<{ registrationId: string; status: string; participant: { fullName: string; email: string } }>(
          `/events/${input.eventId}/register`,
          { method: "POST", body: JSON.stringify(backendPayload) }
        );
        // Normalise to the Registration shape the frontend expects
        return {
          ...input,
          id: result.registrationId,
          createdAt: new Date().toISOString(),
          status: "pending",
        } as Registration;
      } else {
        // General club membership registration — no event
        // Backend doesn't have a /registrations POST without eventId; post to a dummy event or
        // post to a general endpoint. For now use the same event register without eventId
        // so we just save it as a club membership (eventId = null handled by backend).
        const result = await http<{ registrationId: string; status: string }>(
          `/events/club/register`,
          { method: "POST", body: JSON.stringify(backendPayload) }
        ).catch(async () => {
          // Fallback: POST directly to /registrations (future endpoint)
          return http<{ registrationId: string; status: string }>(
            `/registrations`,
            { method: "POST", body: JSON.stringify(backendPayload) }
          );
        });
        return {
          ...input,
          id: result.registrationId ?? uid(),
          createdAt: new Date().toISOString(),
          status: "pending",
        } as Registration;
      }
    }
    await delay(500);
    const reg: Registration = { ...input, id: uid(), createdAt: new Date().toISOString(), status: "pending" };
    writeStore(K.regs, [reg, ...readStore<Registration[]>(K.regs, [])]);
    return reg;
  },
  async setStatus(id: string, status: string): Promise<void> {
    if (!useMock) return http(`/admin/registrations/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    writeStore(K.regs, (await this.list()).map((r) => (r.id === id ? { ...r, status: status as Registration["status"] } : r)));
  },
};

// ─── Contest ──────────────────────────────────────────────────────────────────

export const contestApi = {
  /** Current/next monthly contest. Returns null until the backend announces one. */
  async current(): Promise<MonthlyContest | null> {
    if (!useMock) return http("/contests/current");
    return null;
  },
};

// ─── Site content ─────────────────────────────────────────────────────────────

export const contentApi = {
  async get(): Promise<SiteContent> {
    if (!useMock) return http("/content");
    return readStore(K.content, SEED_CONTENT);
  },
  async save(c: SiteContent): Promise<void> {
    if (!useMock) return http("/admin/content", { method: "PUT", body: JSON.stringify(c) });
    writeStore(K.content, c);
  },
};

// ─── Achievements (public) ────────────────────────────────────────────────────

export type BackendAchievement = {
  id: string;
  title: string;
  description: string;
  studentName: string;
  organization?: string | undefined;
  year?: string | undefined;
  result?: string | undefined;
  imageUrl?: string | undefined;
  category?: string | undefined;
  tag?: string | undefined;
};

export const achievementsApi = {
  async list(): Promise<BackendAchievement[]> {
    if (!useMock) {
      const res = await fetch(`${(await import("./http")).API_BASE}/achievements?limit=100`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) return [];
      const json = await res.json() as { data: BackendAchievement[] };
      return json.data ?? [];
    }
    return [];
  },
};

// ─── Committee (public) ───────────────────────────────────────────────────────

export type BackendMember = {
  id: string;
  name: string;
  role: string;
  badge?: string;
  photoUrl?: string;
  isMentor: boolean;
  isPseudoCore: boolean;
  displayOrder: number;
};

export const committeeApi = {
  async list(): Promise<BackendMember[]> {
    if (!useMock) {
      try { return await http<BackendMember[]>("/committee"); } catch { return []; }
    }
    return [];
  },
};

// ─── Placements (public) ──────────────────────────────────────────────────────

export type BackendPlacement = {
  id: string;
  studentName: string;
  company?: string;
  package: string;
  year?: number;
};

export const placementsApi = {
  async list(): Promise<BackendPlacement[]> {
    if (!useMock) {
      try { return await http<BackendPlacement[]>("/placements"); } catch { return []; }
    }
    return [];
  },
};

// ─── GATE (public) ────────────────────────────────────────────────────────────

export type BackendGate = {
  id: string;
  studentName: string;
  exam: string;
  paper: string;
  year?: number;
  achievement?: string;
};

export const gateApi = {
  async list(): Promise<BackendGate[]> {
    if (!useMock) {
      try { return await http<BackendGate[]>("/gate"); } catch { return []; }
    }
    return [];
  },
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  async login(email: string, password: string): Promise<boolean> {
    if (!useMock) {
      const data = await http<{ token: string; refreshToken?: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      window.localStorage.setItem("cp_admin_token", data.token);
      // Store refresh token under consistent key used by http.ts auto-refresh
      if (data.refreshToken) window.localStorage.setItem("cp_admin_refresh_token", data.refreshToken);
      return true;
    }
    await delay(300);
    const ok = email.trim().length > 3 && password === "cpclub@admin";
    if (ok) window.localStorage.setItem("cp_admin_token", "mock");
    return ok;
  },
  logout() {
    window.localStorage.removeItem("cp_admin_token");
    window.localStorage.removeItem("cp_admin_refresh_token");
  },
  isAuthed() {
    return typeof window !== "undefined" && !!window.localStorage.getItem("cp_admin_token");
  },
};

// ─── CSV export helper (client-side) ─────────────────────────────────────────

export function toCSV(rows: Registration[]): string {
  const cols: (keyof Registration)[] = ["createdAt", "name", "enrollment", "department", "semester", "email", "phone", "interest", "leetcode", "hackerrank", "github", "codeforces", "reason", "status", "eventId"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}
