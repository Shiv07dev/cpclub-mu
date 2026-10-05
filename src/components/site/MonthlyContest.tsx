import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Clock, Instagram, MonitorSmartphone, Timer } from "lucide-react";
import { contestApi } from "@/lib/api/services";
import type { MonthlyContest as Contest } from "@/lib/api/types";
import { INSTAGRAM, MONTHLY_CONTEST } from "@/lib/content";
import { Container } from "./kit";

/** Monthly Coding Contest — shows "Coming Soon" until the backend announces a contest. */
export function MonthlyContestSection({ showPageLink = true }: { showPageLink?: boolean }) {
  const { data: contest } = useQuery({ queryKey: ["contest-current"], queryFn: () => contestApi.current() });

  return (
    <section className={`relative overflow-hidden bg-cyan-soft/40 py-14 sm:py-20 lg:py-24 ${showPageLink ? "" : "-mb-24 flex min-h-[calc(100vh-68px)] items-center"}`}>
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      <Container className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-navy px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground">New</span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Club initiative</span>
          </div>
          <h2 className="mt-5 font-display font-extrabold uppercase leading-[0.9] text-navy" style={{ fontSize: "clamp(2.5rem, 7vw, 5.25rem)" }}>
            <span className="block text-brand">Monthly</span>
            <span className="block">Coding</span>
            <span className="block">Contest</span>
          </h2>
          <p className="mt-5 font-mono text-sm font-semibold uppercase tracking-[0.25em] text-primary">{MONTHLY_CONTEST.slogan}</p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{MONTHLY_CONTEST.about}</p>

          {contest ? <ActiveDetails c={contest} /> : (
            <div className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-primary/30 bg-card px-5 py-3 shadow-soft">
              <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan" /></span>
              <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-navy">Launching Soon</span>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {contest?.registrationOpen && contest.registrationLink ? (
              <a href={contest.registrationLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5">
                Register for the contest <ArrowRight className="h-4 w-4" />
              </a>
            ) : (
              <a href={INSTAGRAM.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5">
                <Instagram className="h-4 w-4" /> Follow for updates
              </a>
            )}
            {showPageLink ? (
              <Link to="/monthly-contest" className="inline-flex items-center justify-center gap-2 rounded-full border border-navy/15 bg-card px-7 py-3.5 text-sm font-semibold text-navy hover:border-primary">
                Learn more
              </Link>
            ) : (
              <Link to="/join" className="inline-flex items-center justify-center gap-2 rounded-full border border-navy/15 bg-card px-7 py-3.5 text-sm font-semibold text-navy hover:border-primary">
                Join the club
              </Link>
            )}
          </div>
        </div>

        <ContestVisual />
      </Container>
    </section>
  );
}

function ActiveDetails({ c }: { c: Contest }) {
  const rows = [
    { i: CalendarDays, l: "Date", v: c.date ? new Date(c.date).toLocaleDateString("en-IN", { dateStyle: "medium" }) : undefined },
    { i: Clock, l: "Starts", v: c.startTime },
    { i: Timer, l: "Duration", v: c.duration },
    { i: MonitorSmartphone, l: "Platform", v: c.platform },
  ].filter((r) => r.v);
  return (
    <div className="mt-7 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <p className="font-display text-lg font-bold text-navy">{c.name}{c.number ? ` · #${c.number}` : ""}</p>
      {rows.length > 0 && (
        <dl className="mt-4 grid grid-cols-2 gap-4">
          {rows.map(({ i: I, l, v }) => (
            <div key={l}>
              <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground"><I className="h-3.5 w-3.5 text-primary" />{l}</dt>
              <dd className="mt-1 text-sm font-semibold text-navy">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-4 text-xs font-semibold text-primary">{c.registrationOpen ? "Registration open" : "Registration closed"}{c.registrationDeadline ? ` · Deadline ${c.registrationDeadline}` : ""}</p>
    </div>
  );
}

/** Decorative calendar + code composition. Purely visual, no data. */
function ContestVisual() {
  const cells = Array.from({ length: 35 }, (_, i) => i);
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-md">
      <div className="glass rounded-3xl border border-border p-5 shadow-lift sm:p-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-navy">{"< Contest />"}</span>
          <span className="flex gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-cyan" /><i className="h-2.5 w-2.5 rounded-full bg-primary" /><i className="h-2.5 w-2.5 rounded-full bg-navy" /></span>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-1.5 text-center font-mono text-[10px] text-muted-foreground">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}
          {cells.map((i) => (
            <span key={i} className={i === 24 ? "grid aspect-square place-items-center rounded-lg bg-brand text-sm font-bold text-primary-foreground shadow-lift" : "aspect-square rounded-lg bg-muted/70"}>
              {i === 24 ? "{ }" : ""}
            </span>
          ))}
        </div>
        <pre className="mt-5 overflow-hidden rounded-xl border border-border bg-background/80 p-4 font-mono text-[11px] leading-relaxed text-navy">{`while (month++) {
  solve(problems);
  rank.improve();
}`}</pre>
      </div>
    </div>
  );
}
