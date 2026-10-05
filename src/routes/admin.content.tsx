import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { contentApi } from "@/lib/api/services";
import type { SiteContent } from "@/lib/api/types";
import { Card } from "@/components/site/kit";

export const Route = createFileRoute("/admin/content")({ component: AdminContent });

function AdminContent() {
  const { data } = useQuery({ queryKey: ["content"], queryFn: () => contentApi.get() });
  const [c, setC] = useState<SiteContent>({ announcement: "", heroTagline: "" });
  useEffect(() => { if (data) setC(data); }, [data]);
  const inp = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary";
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-navy">Site Content</h1>
      <p className="mt-1 text-sm text-muted-foreground">Editable website copy. More sections (committee, achievements, placements) will plug in here once the backend is connected.</p>
      <Card className="mt-6">
        <form onSubmit={async (e) => { e.preventDefault(); await contentApi.save(c); toast.success("Content saved"); }} className="grid gap-4">
          <label className="text-sm font-medium text-navy">Announcement banner
            <input className={`${inp} mt-1`} value={c.announcement} onChange={(e) => setC({ ...c, announcement: e.target.value })} maxLength={200} />
          </label>
          <label className="text-sm font-medium text-navy">Hero tagline override (leave empty to use default)
            <textarea rows={3} className={`${inp} mt-1`} value={c.heroTagline} onChange={(e) => setC({ ...c, heroTagline: e.target.value })} maxLength={300} />
          </label>
          <button className="rounded-full bg-brand py-2.5 text-sm font-semibold text-primary-foreground">Save</button>
        </form>
      </Card>
    </div>
  );
}
