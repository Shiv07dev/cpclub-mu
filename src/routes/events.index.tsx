import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { eventsApi } from "@/lib/api/services";
import type { EventCategory } from "@/lib/api/types";
import { Container, PageHero } from "@/components/site/kit";
import { EventCard } from "@/components/site/EventCard";
import { cn } from "@/lib/utils";

const YEARS = ["All", "2025", "2024", "2023", "2022", "Upcoming"] as const;
const CATS: { label: string; v: "All" | EventCategory }[] = [{ label: "All", v: "All" }, { label: "Workshops", v: "Workshop" }, { label: "Contests", v: "Competition" }, { label: "Seminars & Talks", v: "Technical Talk" }, { label: "Hands-on Labs", v: "Hands-on Lab" }, { label: "STEM & Creative", v: "Fun & Creative" }];

export const Route = createFileRoute("/events/")({
  validateSearch: z.object({ year: z.enum(YEARS).optional() }),
  head: () => ({
    meta: [
      { title: "Events — CP Club, Marwadi University" },
      { name: "description", content: "Workshops, competitions and technical talks by the Competitive Programming Club from 2022 to 2025." },
      { property: "og:title", content: "CP Club Events" },
      { property: "og:description", content: "Workshops, competitions and technical talks by the CP Club, ICT Department." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { year = "All" } = Route.useSearch();
  const [cat, setCat] = useState<"All" | EventCategory>("All");
  const { data = [], isLoading } = useQuery({ queryKey: ["events"], queryFn: () => eventsApi.list() });

  const list = useMemo(
    () =>
      data.filter((e) => (year === "All" ? true : year === "Upcoming" ? e.upcoming : String(e.year) === year && !e.upcoming)).filter((e) => cat === "All" || e.category === cat),
    [data, year, cat],
  );
  const grouped = useMemo(() => {
    const m = new Map<string, typeof list>();
    list.forEach((e) => {
      const k = e.upcoming ? "Upcoming" : String(e.year);
      m.set(k, [...(m.get(k) ?? []), e]);
    });
    return [...m.entries()].sort((a, b) => (a[0] === "Upcoming" ? -1 : b[0] === "Upcoming" ? 1 : Number(b[0]) - Number(a[0])));
  }, [list]);

  return (
    <>
      <PageHero eyebrow="Club Events" title="Every session, every contest." sub="Organised by year, with attendance, venues and photos taken from the club's official event reports." />
      <Container className="py-12">
        <div className="sticky top-14 z-10 -mx-5 mb-8 flex flex-col gap-3 bg-background/90 px-5 py-3 backdrop-blur">
          <div className="flex flex-wrap gap-2">
            {YEARS.map((y) => (
              <Link key={y} to="/events" search={{ year: y === "All" ? undefined : y }} className={cn("rounded-full border px-4 py-1.5 text-sm font-medium", year === y ? "border-navy bg-navy text-primary-foreground" : "border-border bg-card text-navy hover:border-primary")}>
                {y}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {CATS.map(({ label, v }) => (
              <button key={v} onClick={() => setCat(v)} className={cn("rounded-full px-3 py-1 text-xs font-semibold", cat === v ? "bg-cyan-soft text-navy ring-1 ring-primary/30" : "text-muted-foreground hover:text-navy")}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {isLoading && <p className="text-muted-foreground">Loading events…</p>}
        {!isLoading && grouped.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            {year === "Upcoming" ? "No upcoming events announced yet. Follow @CPCLUB_MU for updates." : "No events match this filter."}
          </div>
        )}
        {grouped.map(([k, evs]) => (
          <section key={k} className="mb-14">
            <div className="mb-5 flex items-baseline gap-4">
              <h2 className="font-display text-4xl font-extrabold text-brand">{k}</h2>
              <span className="font-mono text-xs text-muted-foreground">{evs.length} events</span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {evs.map((e) => <EventCard key={e.id} e={e} />)}
            </div>
          </section>
        ))}
      </Container>
    </>
  );
}
