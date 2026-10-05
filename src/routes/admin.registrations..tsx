import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { eventsApi, registrationsApi } from "@/lib/api/services";
import type { Registration } from "@/lib/api/types";
import { Card } from "@/components/site/kit";

export const Route = createFileRoute("/admin/registrations/")({ component: RegDetail });

function RegDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data: r, isLoading } = useQuery({ queryKey: ["reg", id], queryFn: () => registrationsApi.get(id) });
  const { data: events = [] } = useQuery({ queryKey: ["events"], queryFn: () => eventsApi.list() });
  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!r) return <p>Registration not found. <Link to="/admin/registrations" className="text-primary">Back</Link></p>;

  const setStatus = async (s: string) => {
    await registrationsApi.setStatus(r.id, s);
    qc.invalidateQueries({ queryKey: ["reg", id] });
    qc.invalidateQueries({ queryKey: ["regs"] });
    toast.success(`Marked as ${s}`);
  };

  // Backend returns status as uppercase enum (REGISTERED, APPROVED, REJECTED, PENDING)
  const currentStatus = (r.status as string)?.toUpperCase();

  // Find the event to get its custom field definitions
  const linkedEvent = events.find((e) => e.id === r.eventId);
  const customFields = linkedEvent?.customFields ?? [];

  const rows: [string, string | undefined][] = [
    ["Enrollment", r.enrollment], ["Department", r.department], ["Semester", r.semester], ["Email", r.email], ["Phone", r.phone],
    ["Interest", r.interest], ["Event", linkedEvent?.title ?? "Club membership"],
    ["LeetCode", r.leetcode], ["HackerRank", r.hackerrank], ["GitHub", r.github], ["Codeforces", r.codeforces],
    ["Submitted", new Date(r.createdAt).toLocaleString("en-IN")],
  ];

  // Custom responses from the registration
  const customResponses = (r as Registration & { customResponses?: Record<string, string | boolean | number> }).customResponses ?? {};

  return (
    <div className="max-w-3xl">
      <Link to="/admin/registrations" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Registrations</Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-navy">{r.name}</h1>
        <div className="flex flex-wrap gap-2">
          {(["APPROVED", "PENDING", "REJECTED", "REGISTERED", "ATTENDED", "WAITLISTED"] as const).map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
              currentStatus === s ? "border-primary bg-cyan-soft text-navy" : "border-border text-muted-foreground"
            }`}>{s.charAt(0) + s.slice(1).toLowerCase()}</button>
          ))}
        </div>
      </div>

      <Card className="mt-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="break-words text-sm font-medium text-navy">{v || "�"}</dd></div>
          ))}
        </dl>
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-navy">Why do you want to join?</h2>
        <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{r.reason || "�"}</p>
      </Card>

      {/* Custom field answers � only shown if the event has custom fields */}
      {customFields.length > 0 && (
        <Card className="mt-4">
          <h2 className="mb-4 text-sm font-semibold text-navy">Event-specific answers</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            {customFields.map((cf) => {
              const val = customResponses[cf.id];
              let display = "�";
              if (val === true) display = "Yes";
              else if (val === false) display = "No";
              else if (val !== undefined && val !== "") display = String(val);
              return (
                <div key={cf.id}>
                  <dt className="text-xs text-muted-foreground">{cf.label}</dt>
                  <dd className="break-words text-sm font-medium text-navy">{display}</dd>
                </div>
              );
            })}
          </dl>
        </Card>
      )}

      {/* Fallback: show raw custom responses if no event definition available */}
      {customFields.length === 0 && Object.keys(customResponses).length > 0 && (
        <Card className="mt-4">
          <h2 className="mb-4 text-sm font-semibold text-navy">Custom answers</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            {Object.entries(customResponses).map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground font-mono">{k}</dt>
                <dd className="break-words text-sm font-medium text-navy">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}
    </div>
  );
}
