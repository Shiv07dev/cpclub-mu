import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { eventsApi, registrationsApi } from "@/lib/api/services";
import { http } from "@/lib/api/http";
import { useMock } from "@/lib/api/http";
import { CODER_OF_MONTH } from "@/lib/content";
import { Card } from "@/components/site/kit";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

type DashboardStats = {
  totalEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  pendingRegistrations: number;
  activeContests: number;
  galleryCount: number;
  achievementCount: number;
};

function Dashboard() {
  // Real backend dashboard stats
  const { data: dashStats } = useQuery<DashboardStats>({
    queryKey: ["admin-dashboard"],
    queryFn: () => http<DashboardStats>("/admin/dashboard"),
    enabled: !useMock,
    staleTime: 30_000,
  });

  // Fallback: derive from individual list queries in mock mode
  const { data: regs = [] } = useQuery({
    queryKey: ["regs"],
    queryFn: () => registrationsApi.list(),
    enabled: useMock,
  });
  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventsApi.list(),
    enabled: useMock,
  });

  // Latest registrations (shown in the table below) — use a different query key to avoid collision
  const { data: latestRegs = [] } = useQuery({
    queryKey: ["regs-latest"],
    queryFn: () => registrationsApi.list(),
    enabled: !useMock,
  });

  // Mock mode: use separate regs query
  const { data: mockRegs = [] } = useQuery({
    queryKey: ["regs"],
    queryFn: () => registrationsApi.list(),
    enabled: useMock,
  });

  const displayRegs = useMock ? mockRegs : latestRegs;

  const stats = useMock
    ? [
        { l: "Total Registrations", v: regs.length },
        { l: "Pending review", v: regs.filter((r) => r.status === "pending").length },
        { l: "Active Events", v: events.filter((e) => e.upcoming).length },
        { l: "Coder of the Month entries", v: CODER_OF_MONTH.winners.length },
      ]
    : [
        { l: "Total Events", v: dashStats?.totalEvents ?? "—" },
        { l: "Total Registrations", v: dashStats?.totalRegistrations ?? "—" },
        { l: "Pending Review", v: dashStats?.pendingRegistrations ?? "—" },
        { l: "Active Contests", v: dashStats?.activeContests ?? "—" },
      ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.l} className="p-5">
            <p className="text-xs text-muted-foreground">{s.l}</p>
            <p className="mt-2 font-display text-3xl font-bold text-navy">{s.v}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-navy">Latest registrations</h2>
          <Link to="/admin/registrations" className="text-sm font-semibold text-primary">View all</Link>
        </div>
        {displayRegs.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No registrations yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {displayRegs.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3 text-sm">
                <Link to="/admin/registrations/$id" params={{ id: r.id }} className="font-medium text-navy hover:text-primary">{r.name}</Link>
                <span className="text-muted-foreground">{r.interest}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
