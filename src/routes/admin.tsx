import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, FileText, LayoutDashboard, LogOut, Users } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api/services";
import { useMock } from "@/lib/api/http";
import { LOGO_URL } from "@/lib/content";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Core Portal — CP Club" },
      { name: "description", content: "Core committee portal for managing CP Club events and registrations." },
      { property: "og:title", content: "CP Club Core Portal" },
      { property: "og:description", content: "Core committee portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/registrations", label: "Registrations", icon: Users },
  { to: "/admin/content", label: "Site Content", icon: FileText },
] as const;

function AdminLayout() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => setAuthed(authApi.isAuthed()), []);
  if (authed === null) return null;
  if (!authed) return <Login onDone={() => setAuthed(true)} />;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card p-4 md:flex">
        <Link to="/"><img src={LOGO_URL} alt="CP Club" className="h-9 w-auto" /></Link>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-primary">Core Portal</p>
        <nav className="mt-8 grid gap-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: "exact" in n }} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted data-[status=active]:bg-cyan-soft data-[status=active]:font-semibold data-[status=active]:text-navy">
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <button onClick={() => { authApi.logout(); setAuthed(false); }} className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: "exact" in n }} className="shrink-0 rounded-full px-3 py-1.5 text-xs text-muted-foreground data-[status=active]:bg-cyan-soft data-[status=active]:text-navy">{n.label}</Link>
          ))}
        </div>
        {useMock && <div className="border-b border-border bg-cyan-soft px-6 py-2 text-xs text-navy">Demo mode — data is saved in this browser until the backend is connected.</div>}
        <main className="p-6 lg:p-10"><Outlet /></main>
      </div>
    </div>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (await authApi.login(email, pw)) { toast.success("Welcome back"); onDone(); }
      else toast.error("Invalid credentials");
    } catch { toast.error("Login failed"); } finally { setBusy(false); }
  };
  return (
    <div className="grid min-h-screen place-items-center bg-hero px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-lift">
        <img src={LOGO_URL} alt="CP Club" className="h-10 w-auto" />
        <h1 className="mt-6 text-2xl font-bold text-navy">Core Login</h1>
        <p className="mt-1 text-sm text-muted-foreground">Core committee members only.</p>
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-6 w-full rounded-xl border border-input px-4 py-2.5 text-sm outline-none focus:border-primary" />
        <input type="password" required placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-3 w-full rounded-xl border border-input px-4 py-2.5 text-sm outline-none focus:border-primary" />
        <button disabled={busy} className="mt-5 w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
        <Link to="/" className="mt-4 block text-center text-xs text-muted-foreground hover:text-navy">← Back to website</Link>
      </form>
    </div>
  );
}
