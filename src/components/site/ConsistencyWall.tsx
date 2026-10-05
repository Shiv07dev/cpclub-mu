import { Flame } from "lucide-react";
import { CONSISTENCY, CONSISTENCY_ABOUT } from "@/lib/community";
import { SectionHead } from "@/components/site/kit";

export function ConsistencyWall({ limit }: { limit?: number }) {
  const list = limit ? CONSISTENCY.filter((m) => m.photo).slice(0, limit) : CONSISTENCY;
  return (
    <div>
      <SectionHead eyebrow="Community showcase" title="Consistency in Competitive Programming" sub={CONSISTENCY_ABOUT} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {list.map((m) => (
          <figure key={m.name} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
            <div className="relative aspect-square overflow-hidden bg-cyan-soft">
              {m.photo ? (
                <img src={m.photo} alt={m.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="grid h-full place-items-center font-display text-3xl font-bold text-navy/60">{m.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
              )}
              {m.streak && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-card/95 px-2 py-0.5 text-[11px] font-bold text-navy shadow-soft">
                  <Flame className="h-3 w-3 text-primary" />{m.streak} days
                </span>
              )}
            </div>
            <figcaption className="p-3">
              <p className="truncate text-sm font-semibold text-navy">{m.name}</p>
              <p className="text-[11px] text-muted-foreground">LeetCode streak badge</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
