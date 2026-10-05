import type { Member } from "@/lib/content";
import { cn } from "@/lib/utils";

type CardMember = Pick<Member, "name" | "role" | "photo"> & { badge?: string; lead?: boolean };

/** Clean profile card: fixed-ratio photo on top (matches source photo ratio, so no face cropping), name + role below. */
export function MemberCard({ m, className }: { m: CardMember; className?: string }) {
  return (
    <article className={cn("group flex h-full flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-soft transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lift", className)}>
      <div className="aspect-[22/25] w-full overflow-hidden bg-cyan-soft">
        <img src={m.photo} alt={m.name} loading="lazy" className="h-full w-full object-cover object-top" />
      </div>
      <div className="flex flex-1 flex-col justify-center border-t border-primary/15 px-5 py-4">
        <h3 className="truncate font-display text-base font-bold uppercase tracking-wide text-navy sm:text-lg">{m.name}</h3>
        <p className="mt-0.5 text-sm font-semibold text-primary">{m.role}</p>
      </div>
    </article>
  );
}

/** Horizontal faculty mentor card — visually separate from the student grid. */
export function MentorCard({ m }: { m: { name: string; role: string; photo: string; dept: string } }) {
  return (
    <article className="grid overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-soft sm:grid-cols-[220px_1fr]">
      <div className="mx-auto aspect-[22/25] w-full max-w-[280px] overflow-hidden bg-cyan-soft sm:max-w-none">
        <img src={m.photo} alt={m.name} loading="lazy" className="h-full w-full object-cover object-top" />
      </div>
      <div className="flex flex-col justify-center gap-1 border-t border-primary/15 p-6 sm:border-l sm:border-t-0 sm:p-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">Faculty Mentor</span>
        <h3 className="font-display text-2xl font-extrabold uppercase text-navy sm:text-3xl">{m.name}</h3>
        <p className="text-sm text-muted-foreground">{m.dept}, Marwadi University</p>
      </div>
    </article>
  );
}
