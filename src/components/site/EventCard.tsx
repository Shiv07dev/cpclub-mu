import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Calendar, MapPin, Users, Images } from "lucide-react";
import type { ClubEvent } from "@/lib/api/types";
import { academicYear } from "@/lib/api/seed-events";

export function EventCard({ e }: { e: ClubEvent }) {
  const cover = e.photos?.[0];
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
      <Link to="/events/$slug" params={{ slug: e.slug }} className="relative block aspect-[16/10] overflow-hidden bg-cyan-soft">
        {cover ? (
          <img src={cover} alt={e.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center bg-grid">
            <span className="font-mono text-3xl font-bold text-navy/30">{"</>"}</span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-semibold text-navy shadow-soft">{e.category}</span>
        {e.photos && e.photos.length > 1 && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-navy/80 px-2 py-1 text-[11px] font-semibold text-primary-foreground"><Images className="h-3 w-3" />{e.photos.length}</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <span className="font-mono text-xs text-muted-foreground">{e.upcoming ? "UPCOMING" : e.date ? `AY ${academicYear(e.date)}` : e.year}</span>
        <h3 className="mt-1 text-lg font-bold leading-snug text-navy">{e.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{e.description}</p>
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {e.date && <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
          {(e.venue || e.mode) && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{e.venue ?? e.mode}</span>}
          {e.participants && <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{e.participants} participants</span>}
        </div>
        <div className="mt-auto flex items-center gap-2 pt-5">
          <Link to="/events/$slug" params={{ slug: e.slug }} className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            {e.reportBacked ? "Read Report & Gallery" : "View Details"} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          {e.upcoming && e.registrationOpen && (
            <Link to="/join" search={{ event: e.id }} className="ml-auto rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-primary-foreground">Register</Link>
          )}
        </div>
      </div>
    </article>
  );
}
