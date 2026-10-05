import { createFileRoute, Link } from "@tanstack/react-router";
import { SEED_EVENTS, academicYear } from "@/lib/api/seed-events";
import { CODER_OF_MONTH, TENX } from "@/lib/content";
import { Container, PageHero, Stat } from "@/components/site/kit";

const reported = SEED_EVENTS.filter((e) => e.reportBacked && e.date).sort((a, b) => a.date!.localeCompare(b.date!));
const total = reported.reduce((s, e) => s + (e.participants ?? 0), 0);
const byAY = reported.reduce<Record<string, typeof reported>>((m, e) => {
  const k = academicYear(e.date)!;
  (m[k] ??= []).push(e);
  return m;
}, {});

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History & Milestones — CP Club, Marwadi University" },
      { name: "description", content: "A timeline of Competitive Programming Club events and milestones, from the official event reports." },
      { property: "og:title", content: "CP Club History & Milestones" },
      { property: "og:description", content: "Timeline of CP Club events and milestones at Marwadi University." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: History,
});

function History() {
  return (
    <>
      <PageHero eyebrow="Club History" title="Milestones, edition by edition." sub="Every entry below comes from the club's official event reports.">
        <div className="mt-10 grid max-w-2xl grid-cols-3 gap-6">
          <Stat value={String(reported.length)} label="Reported events" />
          <Stat value={`${total}+`} label="Recorded attendance" />
          <Stat value={String(Object.keys(byAY).length)} label="Academic years" />
        </div>
      </PageHero>
      <Container className="py-16">
        <div className="mb-14 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <span className="font-mono text-xs uppercase tracking-widest text-primary">{CODER_OF_MONTH.period}</span>
            <h3 className="mt-2 text-xl font-bold text-navy">Coder of the Month launched</h3>
            <p className="mt-2 text-sm text-muted-foreground">{CODER_OF_MONTH.about}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <span className="font-mono text-xs uppercase tracking-widest text-primary">Collaboration</span>
            <h3 className="mt-2 text-xl font-bold text-navy">10X Club – Marwadi University Chapter</h3>
            <p className="mt-2 text-sm text-muted-foreground">{TENX.body}</p>
          </div>
        </div>
        {Object.entries(byAY).map(([ay, evs]) => (
          <section key={ay} className="relative mb-12 border-l-2 border-primary/30 pl-6 sm:pl-10">
            <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-brand ring-4 ring-background" />
            <h2 className="font-display text-3xl font-extrabold text-brand">AY {ay}</h2>
            <ol className="mt-6 space-y-4">
              {evs.map((e) => (
                <li key={e.id}>
                  <Link to="/events/$slug" params={{ slug: e.slug }} className="group grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:shadow-lift sm:grid-cols-[120px_1fr] sm:items-center">
                    {e.photos?.[0] ? (
                      <img src={e.photos[0]} alt={e.title} loading="lazy" className="aspect-[4/3] w-full rounded-xl object-cover sm:w-[120px]" />
                    ) : (
                      <div className="hidden aspect-[4/3] place-items-center rounded-xl bg-cyan-soft font-mono text-navy/40 sm:grid">{"</>"}</div>
                    )}
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-muted-foreground">{new Date(e.date!).toLocaleDateString("en-IN", { dateStyle: "medium" })} · {e.venue ?? e.mode}</p>
                      <p className="mt-1 font-bold text-navy group-hover:text-primary">{e.title}</p>
                      {e.participants && <p className="mt-1 text-xs text-muted-foreground">{e.participants} participants</p>}
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </Container>
    </>
  );
}
