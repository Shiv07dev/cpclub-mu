// Thin HTTP + mock switch. Set VITE_API_BASE_URL to route every service to the real backend.
export const API_BASE = (import.meta.env['VITE_API_BASE_URL'] as string | undefined) ?? "";
export const useMock = !API_BASE;

/** Shape of every backend response envelope */
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

/** Attempt to refresh the access token. Returns new token or null. */
async function tryRefresh(): Promise<string | null> {
  // Check both new key and old key (backward compat for existing sessions)
  const refreshToken = typeof window !== "undefined"
    ? (window.localStorage.getItem("cp_admin_refresh_token") ?? window.localStorage.getItem("cp_refresh_token"))
    : null;
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    // Backend returns { data: { token: "..." } }
    const json = await res.json() as { data?: { token?: string } };
    const newToken = json?.data?.token;
    if (newToken && typeof window !== "undefined") {
      window.localStorage.setItem("cp_admin_token", newToken);
    }
    return newToken ?? null;
  } catch {
    return null;
  }
}

/** Make a request and return the unwrapped .data value */
export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const doFetch = (token: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });

  let token = typeof window !== "undefined" ? window.localStorage.getItem("cp_admin_token") : null;
  let res = await doFetch(token);

  // Auto-refresh on 401 (expired token) and retry once
  if (res.status === 401) {
    const newToken = await tryRefresh();
    if (newToken) {
      token = newToken;
      res = await doFetch(token);
    } else {
      // Refresh failed — clear auth and redirect to login
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("cp_admin_token");
        window.localStorage.removeItem("cp_admin_refresh_token");
        window.location.href = "/admin/login";
      }
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json() as { error?: { message?: string }; message?: string };
      msg = body?.error?.message ?? body?.message ?? msg;
    } catch { /* ignore parse failures */ }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  const json = await res.json() as ApiEnvelope<T>;
  return (json?.data !== undefined ? json.data : json) as T;
}

/** Make a request and return full envelope (data + pagination) — used by list endpoints */
export async function httpList<T>(path: string): Promise<{ data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("cp_admin_token") : null;
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { const b = await res.json() as { error?: { message?: string } }; msg = b?.error?.message ?? msg; } catch { /* */ }
    throw new Error(msg);
  }
  return res.json() as Promise<{ data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>;
}

// localStorage-backed mock store (browser only)
export function readStore<T>(key: string, seed: T): T {
  if (typeof window === "undefined") return seed;
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return seed;
  }
}
export function writeStore<T>(key: string, value: T) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}
export const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
export const uid = () => Math.random().toString(36).slice(2, 10);
