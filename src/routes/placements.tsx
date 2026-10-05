import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PLACEMENTS } from "@/lib/content";
import { placementsApi } from "@/lib/api/services";
import { useMock } from "@/lib/api/http";
import { Container, PageHero } from "@/components/site/kit";

export const Route = createFileRoute("/placements")({
  head: () => ({
    meta: [
      { title: "Placement Records — CP Club, Marwadi University" },
      { name: "description", content: "CP Club members placed at rtCamp, Astound Digital, Fintech Global Center, Cresen Solutions, Indexnine and Ace Analytics." },
      { property: "og:title", content: "CP Club Placement Records" },
      { property: "og:description", content: "Where CP Club members got placed, and at what packages." },
    ],
  }),
  component: Placements,
});

function Placements() {
  const { data: backendPlacements = [] } = useQuery({
    queryKey: ["placements"],
    queryFn: () => placementsApi.list(),
    enabled: !useMock,
  });

  const useBackend = !useMock && backendPlacements.length > 0;

  // Normalise to common shape {name, company, pkg}
  const placements = useBackend
    ? backendPlacements.map((p) => ({ name: p.studentName, company: p.company ?? "—", pkg: p.package }))
    : PLACEMENTS;

  const companies = [...new Set(placements.map((p) => p.company))];

  return (
    <>
      <PageHero eyebrow="Placement Records" title="Problem solving that gets you hired." sub="Club members who cracked technical interviews.">
        <div className="mt-8 flex flex-wrap gap-2">
          {companies.map((c) => <span key={c} className="rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-navy">{c}</span>)}
        </div>
      </PageHero>
      <Container className="py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {placements.map((p) => (
            <div key={p.name} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="min-w-0">
                <p className="truncate font-bold text-navy">{p.name}</p>
                <p className="truncate text-sm text-muted-foreground">{p.company}</p>
              </div>
              <span className="shrink-0 rounded-full bg-cyan-soft px-3 py-1 font-mono text-sm font-semibold text-navy">{p.pkg}</span>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
