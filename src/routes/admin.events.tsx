import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Trash2, Download, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { eventsApi } from "@/lib/api/services";
import { API_BASE } from "@/lib/api/http";
import type { ClubEvent, CustomField, EventCategory, EventMode } from "@/lib/api/types";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/events")({ component: AdminEvents });

const CATS: EventCategory[] = ["Competition", "Workshop", "Technical Talk", "Hands-on Lab", "Fun & Creative"];
const FIELD_TYPES: CustomField["type"][] = ["text", "textarea", "select", "number", "checkbox"];

type Draft = Omit<ClubEvent, "id" | "slug">;

const blank = (): Draft => ({
  title: "",
  year: new Date().getFullYear(),
  category: "Workshop",
  mode: "Offline",
  description: "",
  takeaways: [],
  upcoming: true,
  registrationOpen: true,
  date: "",
  speaker: "Competitive Programming Club, ICT Department",
  customFields: [],
});

function blankField(): CustomField {
  return {
    id: `cf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label: "",
    type: "text",
    required: false,
  };
}

function toBackendPayload(d: Draft) {
  return {
    title: d.title.trim(),
    description: d.description.trim(),
    year: d.year,
    category: d.category,
    mode: d.mode ?? "Offline",
    eventDate: d.date || undefined,
    date: d.date || undefined,
    speaker: d.speaker,
    venue: d.venue,
    upcoming: Boolean(d.upcoming),
    registrationOpen: Boolean(d.registrationOpen),
    takeaways: Array.isArray(d.takeaways) ? d.takeaways : [],
    agenda: Array.isArray(d.agenda) ? d.agenda : [],
    prerequisites: Array.isArray(d.prerequisites) ? d.prerequisites : [],
    overview: Array.isArray(d.overview) ? d.overview : [],
    outcomes: Array.isArray(d.outcomes) ? d.outcomes : [],
    isPublished: Boolean(d.registrationOpen || d.upcoming),
    customFields: Array.isArray(d.customFields) ? d.customFields.filter((f) => f.label.trim()) : [],
  };
}

function AdminEvents() {
  const qc = useQueryClient();
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => eventsApi.adminList(),
  });
  const [editing, setEditing] = useState<{ id?: string; d: Draft } | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-events"] });

  const save = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      if (!editing.d.title.trim()) throw new Error("Title is required");
      if (editing.d.description.trim().length < 10) throw new Error("Description must be at least 10 characters");
      const payload = toBackendPayload(editing.d);
      return editing.id
        ? eventsApi.update(editing.id, payload as Partial<ClubEvent>)
        : eventsApi.create(payload as Omit<ClubEvent, "id" | "slug">);
    },
    onSuccess: () => { toast.success("Event saved"); setEditing(null); refresh(); },
    onError: (err: Error) => { toast.error(err.message || "Failed to save event"); },
  });

  const toggle = async (e: ClubEvent, v: boolean) => {
    try {
      await eventsApi.update(e.id, { registrationOpen: v });
      refresh();
      toast.success(v ? "Registrations opened" : "Registrations closed");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Update failed");
    }
  };

  const remove = async (e: ClubEvent) => {
    if (!confirm(`Delete "${e.title}"?\n\nNote: Events with active registrations cannot be deleted.`)) return;
    try {
      await eventsApi.remove(e.id);
      refresh();
      toast.success("Event deleted");
    } catch (err: unknown) {
      const msg = (err as Error).message || "Delete failed";
      toast.error(msg);
    }
  };

  const exportData = (format: "csv" | "xlsx") => {
    const token = window.localStorage.getItem("cp_admin_token");
    const url = `${API_BASE}/admin/registrations/export?format=${format}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `registrations.${format}`;
        a.click();
        toast.success(`Exported as ${format.toUpperCase()}`);
      })
      .catch(() => toast.error("Export failed"));
  };

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setEditing((s) => (s ? { ...s, d: { ...s.d, [k]: v } } : s));

  if (isLoading) return <p className="p-6 text-muted-foreground">Loading events...</p>;
  if (error) return <p className="p-6 text-destructive">Failed to load events: {(error as Error).message}</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-navy">Events</h1>
        <div className="flex gap-2">
          <button onClick={() => exportData("csv")} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-navy hover:bg-muted">
            <Download className="h-4 w-4" /> CSV
          </button>
          <button onClick={() => exportData("xlsx")} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-navy hover:bg-muted">
            <Download className="h-4 w-4" /> XLSX
          </button>
          <button onClick={() => setEditing({ d: blank() })} className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> Add event
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Year</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
              <th className="p-3">Registration</th>
              <th className="p-3">Custom Fields</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 && (
              <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No events yet. Click "Add event" to create one.</td></tr>
            )}
            {data.map((e) => (
              <tr key={e.id}>
                <td className="p-3 font-medium text-navy">{e.title}</td>
                <td className="p-3">{e.year}</td>
                <td className="p-3">{e.category}</td>
                <td className="p-3">
                  <span className={e.upcoming ? "rounded-full bg-cyan-soft px-2 py-0.5 text-xs text-navy" : "text-xs text-muted-foreground"}>
                    {e.upcoming ? "Upcoming" : "Past"}
                  </span>
                </td>
                <td className="p-3"><Switch checked={Boolean(e.registrationOpen)} onCheckedChange={(v) => toggle(e, v)} /></td>
                <td className="p-3">
                  {(e.customFields ?? []).length > 0 ? (
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                      {e.customFields!.length} field{e.customFields!.length !== 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">none</span>
                  )}
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => setEditing({
                      id: e.id,
                      d: {
                        title: e.title,
                        year: e.year,
                        category: e.category,
                        mode: e.mode ?? "Offline",
                        description: e.description,
                        takeaways: e.takeaways ?? [],
                        agenda: e.agenda ?? [],
                        prerequisites: e.prerequisites ?? [],
                        overview: e.overview ?? [],
                        outcomes: e.outcomes ?? [],
                        speaker: e.speaker ?? "",
                        upcoming: e.upcoming,
                        registrationOpen: e.registrationOpen,
                        date: e.date ?? "",
                        venue: e.venue,
                        customFields: e.customFields ?? [],
                      },
                    })}
                    className="p-1.5 text-muted-foreground hover:text-navy"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(e)} className="p-1.5 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit event" : "Add event"}</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid gap-3">
              <L t="Title *"><input className={inp} value={editing.d.title} onChange={(e) => set("title", e.target.value)} maxLength={120} required /></L>
              <div className="grid grid-cols-2 gap-3">
                <L t="Year *"><input type="number" className={inp} value={editing.d.year} onChange={(e) => set("year", Number(e.target.value))} min={2020} max={2100} required /></L>
                <L t="Date"><input type="date" className={inp} value={editing.d.date ?? ""} onChange={(e) => set("date", e.target.value)} /></L>
                <L t="Category *"><select className={inp} value={editing.d.category} onChange={(e) => set("category", e.target.value as EventCategory)}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></L>
                <L t="Mode"><select className={inp} value={editing.d.mode ?? "Offline"} onChange={(e) => set("mode", e.target.value as EventMode)}>{["Offline", "Online", "Hybrid"].map((c) => <option key={c}>{c}</option>)}</select></L>
              </div>
              <L t="Description * (min 10 chars)"><textarea rows={3} className={inp} value={editing.d.description} onChange={(e) => set("description", e.target.value)} maxLength={600} required /></L>
              <L t="Key takeaways (one per line)"><textarea rows={3} className={inp} value={(editing.d.takeaways ?? []).join("\n")} onChange={(e) => set("takeaways", e.target.value.split("\n").filter(Boolean))} /></L>
              <L t="Agenda (one per line)"><textarea rows={3} className={inp} value={(editing.d.agenda ?? []).join("\n")} onChange={(e) => set("agenda", e.target.value.split("\n").filter(Boolean))} /></L>
              <L t="Prerequisites (one per line)"><textarea rows={2} className={inp} value={(editing.d.prerequisites ?? []).join("\n")} onChange={(e) => set("prerequisites", e.target.value.split("\n").filter(Boolean))} /></L>
              <L t="Speaker / mentor"><input className={inp} value={editing.d.speaker ?? ""} onChange={(e) => set("speaker", e.target.value)} /></L>
              <L t="Venue"><input className={inp} value={editing.d.venue ?? ""} onChange={(e) => set("venue", e.target.value)} /></L>
              <div className="flex gap-6 text-sm">
                <label className="flex items-center gap-2"><Switch checked={Boolean(editing.d.upcoming)} onCheckedChange={(v) => set("upcoming", v)} /> Upcoming</label>
                <label className="flex items-center gap-2"><Switch checked={Boolean(editing.d.registrationOpen)} onCheckedChange={(v) => set("registrationOpen", v)} /> Registration open</label>
              </div>

              {/* Custom Registration Fields */}
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Custom Registration Fields</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/70">Extra questions shown only on this event's registration form.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set("customFields", [...(editing.d.customFields ?? []), blankField()])}
                    className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand hover:bg-brand/20 transition-colors"
                  >
                    <Plus className="h-3 w-3" /> Add field
                  </button>
                </div>
                {(editing.d.customFields ?? []).length === 0 && (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    No custom fields yet. Click "Add field" to collect event-specific info (e.g. team name, T-shirt size).
                  </p>
                )}
                <div className="grid gap-3">
                  {(editing.d.customFields ?? []).map((cf, idx) => (
                    <CustomFieldEditor
                      key={cf.id}
                      field={cf}
                      index={idx}
                      total={(editing.d.customFields ?? []).length}
                      onChange={(updated) => {
                        const fields = [...(editing.d.customFields ?? [])];
                        fields[idx] = updated;
                        set("customFields", fields);
                      }}
                      onRemove={() => {
                        const fields = (editing.d.customFields ?? []).filter((_, i) => i !== idx);
                        set("customFields", fields);
                      }}
                      onMove={(dir) => {
                        const fields = [...(editing.d.customFields ?? [])];
                        const target = idx + dir;
                        if (target < 0 || target >= fields.length) return;
                        [fields[idx], fields[target]] = [fields[target]!, fields[idx]!];
                        set("customFields", fields);
                      }}
                    />
                  ))}
                </div>
              </div>

              {save.error && <p className="text-sm text-destructive">{(save.error as Error).message}</p>}
              <button type="submit" disabled={save.isPending} className="mt-2 rounded-full bg-brand py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                {save.isPending ? "Saving..." : "Save event"}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const inp = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary";
function L({ t, children }: { t: string; children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-muted-foreground"><span className="mb-1 block">{t}</span>{children}</label>;
}

// Custom Field Editor component
function CustomFieldEditor({
  field, index, total, onChange, onRemove, onMove,
}: {
  field: CustomField;
  index: number;
  total: number;
  onChange: (f: CustomField) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const setF = <K extends keyof CustomField>(k: K, v: CustomField[K]) => onChange({ ...field, [k]: v });

  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-sm">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex flex-col items-center gap-0.5">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} title="Move up" className="rounded p-0.5 text-muted-foreground hover:text-navy disabled:opacity-30 transition-colors">
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <GripVertical className="h-4 w-4 text-muted-foreground/30" />
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} title="Move down" className="rounded p-0.5 text-muted-foreground hover:text-navy disabled:opacity-30 transition-colors">
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Label *</p>
              <input
                className={inp}
                placeholder="e.g. T-shirt size, Team name..."
                value={field.label}
                onChange={(e) => setF("label", e.target.value)}
                maxLength={120}
              />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Type</p>
              <select className={inp} value={field.type} onChange={(e) => setF("type", e.target.value as CustomField["type"])}>
                <option value="text">Short text</option>
                <option value="textarea">Long text</option>
                <option value="select">Dropdown</option>
                <option value="number">Number</option>
                <option value="checkbox">Checkbox (yes/no)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Placeholder</p>
              <input
                className={inp}
                placeholder="Hint text shown inside field..."
                value={field.placeholder ?? ""}
                onChange={(e) => setF("placeholder", e.target.value || undefined)}
                maxLength={120}
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex cursor-pointer select-none items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => setF("required", e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-border accent-primary"
                />
                Required field
              </label>
            </div>
          </div>

          {field.type === "select" && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Dropdown options (one per line)</p>
              <textarea
                rows={3}
                className={inp}
                placeholder={"Option A\nOption B\nOption C"}
                value={(field.options ?? []).join("\n")}
                onChange={(e) => setF("options", e.target.value.split("\n").filter(Boolean))}
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          title="Remove field"
          className="mt-0.5 rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
