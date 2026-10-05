import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ACHIEVEMENTS, GATE, PLACEMENTS } from "@/lib/content";
import { achievementsApi, gateApi, placementsApi, type BackendAchievement } from "@/lib/api/services";
import { useMock } from "@/lib/api/http";
import { Container, PageHero, SectionHead, Stat } from "@/components/site/kit";
import { useState } from "react";
import { Lightbox } from "@/components/site/Lightbox";
import { ConsistencyWall } from "@/components/site/ConsistencyWall";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — CP Club, Marwadi University" },
      { name: "description", content: "Hackathon wins, contest rankings, placements and GATE qualifications of CP Club members." },
      { property: "og:title", content: "CP Club Achiever's Wall" },
      { property: "og:description", content: "Hackathon wins, placements and GATE qualifications of CP Club members." },
    ],
  }),
  component: Achievements,
});

function Achievements() {
  const [idx, setIdx] = useState<number | null>(null);

  // Try backend first; fall back to static content.ts data if in mock mode
  const { data: backendAchievements = [] } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => achievementsApi.list(),
    enabled: !useMock,
  });
  const { data: backendPlacements = [] } = useQuery({
    queryKey: ["placements"],
    queryFn: () => placementsApi.list(),
    enabled: !useMock,
  });
  const { data: backendGate = [] } = useQuery({
    queryKey: ["gate"],
    queryFn: () => gateApi.list(),
    enabled: !useMock,
  });

  // Use backend data when connected, static data as fallback
  const achievements: BackendAchievement[] = !useMock && backendAchievements.length > 0
    ? backendAchievements
    : ACHIEVEMENTS.map((a, i) => ({
        id: String(i),
        title: a.title,
        description: a.body,
        studentName: "",
        year: a.year as string | undefined,
        tag: a.tag as string | undefined,
        imageUrl: a.photo as string | undefined,
      }));

  const placementsCount = !useMock ? backendPlacements.length : PLACEMENTS.length;
  const gateCount = !useMock ? backendGate.length : GATE.length;

  const photos = achievements.map((a) => ({
    src: a.imageUrl ?? "",
    event: a.title,
    year: a.year,
    caption: a.description,
  })).filter((p) => p.src);

  return (
    <>
      <PageHero eyebrow="Achiever's Wall" title={<>"Coding without recognition is <span className="text-brand">not</span> our thing!"</>} sub="Recognition is a crucial part of the development journey — only a rewarding journey makes it to the destination.">
        <div className="mt-10 grid max-w-2xl grid-cols-3 gap-6">
          <Stat value={String(achievements.length)} label="Recognitions featured" />
          <Stat value={String(placementsCount)} label="Placement records" />
          <Stat value={String(gateCount)} label="GATE qualifications" />
        </div>
      </PageHero>
      <Container className="py-16">
        <SectionHead eyebrow="Hackathons & contests" title="Wins worth celebrating." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a, i) => (
            <article key={a.id ?? a.title} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
              {a.imageUrl && (
                <button onClick={() => setIdx(i)} className="block w-full overflow-hidden" aria-label={`View photo: ${a.title}`}>
                  <img src={a.imageUrl} alt={a.title} loading="lazy" className="aspect-[16/10] w-full bg-muted object-cover transition-transform duration-500 hover:scale-105" />
                </button>
              )}
              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  {a.tag && <span className="rounded-full bg-cyan-soft px-2.5 py-0.5 text-[11px] font-semibold text-navy">{a.tag}</span>}
                  {a.year && <span className="font-mono text-xs text-muted-foreground">{a.year}</span>}
                </div>
                <h3 className="mt-3 font-bold text-navy">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
              </div>
            </article>
          ))}
        </div>
        <Lightbox photos={photos} index={idx} onClose={() => setIdx(null)} onIndex={setIdx} />
        <div className="mt-20"><ConsistencyWall /></div>
        <div className="mt-16 grid gap-5 md:grid-cols-2">
          <Link to="/placements" className="rounded-3xl border border-border bg-card p-8 transition-all hover:shadow-lift">
            <span className="font-mono text-xs uppercase tracking-widest text-primary">Placement Records</span>
            <p className="mt-2 text-2xl font-bold text-navy">rtCamp, Astound Digital, Fintech Global Center & more →</p>
          </Link>
          <Link to="/gate" className="rounded-3xl border border-border bg-card p-8 transition-all hover:shadow-lift">
            <span className="font-mono text-xs uppercase tracking-widest text-primary">GATE Qualifications</span>
            <p className="mt-2 text-2xl font-bold text-navy">Members qualifying GATE 2024 & 2025 →</p>
          </Link>
        </div>
      </Container>
    </>
  );
}
