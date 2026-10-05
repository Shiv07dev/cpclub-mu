import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { CODER_OF_MONTH } from "@/lib/content";
import { Container, PageHero, SectionHead } from "@/components/site/kit";

export const Route = createFileRoute("/coder-of-the-month")({
  head: () => ({
    meta: [
      { title: "Coder of the Month — CP Club, Marwadi University" },
      { name: "description", content: CODER_OF_MONTH.about },
      { property: "og:title", content: "Coder of the Month — CP Club" },
      { property: "og:description", content: "Hall of Fame of the CP Club's Coder of the Month initiative." },
    ],
  }),
  component: Coder,
});

function Coder() {
  return (
    <>
      <PageHero eyebrow="#CPCLUB · Initiative" title={<>Coder of the <span className="text-brand">Month</span>.</>} sub={CODER_OF_MONTH.about}>
        <div className="mt-8 inline-flex items-end gap-3 rounded-2xl border border-border bg-card px-6 py-4 shadow-soft">
          <span className="font-display text-5xl font-extrabold text-brand">{CODER_OF_MONTH.metric.value}</span>
          <span className="pb-2 text-sm text-muted-foreground">{CODER_OF_MONTH.metric.label}</span>
        </div>
      </PageHero>
      <Container className="py-14">
        <SectionHead eyebrow="Hall of Fame" title="Past winners" sub={CODER_OF_MONTH.period} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CODER_OF_MONTH.winners.map((w) => (
            <div key={w} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <Trophy className="h-5 w-5 text-primary" />
              <p className="mt-3 font-bold text-navy">{w}</p>
              <p className="text-xs text-muted-foreground">Coder of the Month</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          The current Coder of the Month will be announced by the core committee.
        </div>
        <div className="mt-16">
          <SectionHead eyebrow="Criteria" title="What we look for" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {CODER_OF_MONTH.criteria.map((c, i) => (
              <div key={c} className="rounded-2xl bg-cyan-soft p-5">
                <span className="font-mono text-xs text-primary">0{i + 1}</span>
                <p className="mt-1 font-display text-lg font-bold text-navy">{c}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}
