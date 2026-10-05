import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { registrationsApi } from "@/lib/api/services";
import { API_BASE } from "@/lib/api/http";

export const Route = createFileRoute("/admin/registrations/")({ component: Regs });

function Regs() {
  const { data = [] } = useQuery({ queryKey: ["regs"], queryFn: () => registrationsApi.list() });
  const [q, setQ] = useState("");
  const [interest, setInterest] = useState("All");
  const [status, setStatus] = useState("All");
  const rows = useMemo(
    () =>
      data.filter((r) =>
        (interest === "All" || r.interest === interest) &&
        (status === "All" || r.status === status) &&
        [r.name, r.email, r.enrollment, r.department].join(" ").toLowerCase().includes(q.toLowerCase()),
      ),
    [data, q, interest, status],
  );
  const exportData = (format: "csv" | "xlsx") => {
    const token = window.localStorage.getItem("cp_admin_token");
    const url = `${API_BASE}/admin/registrations/export?format=${format}`;
    if (token) {
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => {
          if (!r.ok) throw new Error(`Export failed (${r.status})`);
          return r.blob();
        })
        .then((blob) => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `cp-club-registrations-${new Date().toISOString().slice(0, 10)}.${format}`;
          a.click();
          toast.success(`Exported as ${format.toUpperCase()}`);
        })
        .catch((err: Error) => toast.error(err.message || "Export failed"));
    } else {
      toast.error("Not authenticated — please log in first");
    }
  };
  const sel = "rounded-full border border-border bg-card px-3 py-2 text-sm";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-navy">Registrations</h1>
        <div className="flex gap-2">
          <button onClick={() => exportData("csv")} className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={() => exportData("xlsx")} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-navy hover:bg-muted">
            <Download className="h-4 w-4" /> Export XLSX
          </button>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, enrollment…" className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-4 text-sm outline-none focus:border-primary" />
        </div>
        <select value={interest} onChange={(e) => setInterest(e.target.value)} className={sel}>
          {["All", "Competitive Programming", "Web Dev", "Game Dev / Unity", "Git / Open Source"].map((i) => <option key={i}>{i}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={sel}>
          {["All", "pending", "approved", "rejected"].map((i) => <option key={i}>{i}</option>)}
        </select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Name</th><th className="p-3">Enrollment</th><th className="p-3">Dept / Sem</th><th className="p-3">Interest</th><th className="p-3">Status</th><th className="p-3">Date</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="p-3"><Link to="/admin/registrations/$id" params={{ id: r.id }} className="font-medium text-navy hover:text-primary">{r.name}</Link><div className="text-xs text-muted-foreground">{r.email}</div></td>
                <td className="p-3 font-mono text-xs">{r.enrollment}</td>
                <td className="p-3">{r.department} · {r.semester}</td>
                <td className="p-3">{r.interest}</td>
                <td className="p-3 capitalize">{r.status}</td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No registrations found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
