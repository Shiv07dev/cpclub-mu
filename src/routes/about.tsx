import { createFileRoute } from "@tanstack/react-router";
import { Quote } from "lucide-react";
import { CLUB, COLLAB_IMG, MENTOR, TENX } from "@/lib/content";
import { Card, Container, PageHero, SectionHead } from "@/components/site/kit";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Competitive Programming Club, Marwadi University" },
      { name: "description", content: "Vision, mission and mentorship of the Competitive Programming Club, ICT Department, Marwadi University." },
      { property: "og:title", content: "About the CP Club" },
      { property: "og:description", content: "Vision, mission and core pillars of the Competitive Programming Club." },
    ],
  }),
  component: About,
});

const PILLARS = ["Learn", "Practice", "Compete", "Excel"];

function About() {
  return (
    <>
      <PageHero eyebrow="About Us" title={<>The coding community of the <span className="text-brand">ICT Department</span>.</>} sub={`${CLUB.name} · ${CLUB.department}, ${CLUB.university}.`} />
      <Container className="grid gap-10 py-16 lg:grid-cols-2">
        <div className="space-y-6">
          <p className="text-lg leading-relaxed text-muted-foreground">
            The Competitive Programming Club is the official coding and algorithmic community of the Department of Information and Communication Technology at Marwadi University. Backed by the department and guided by a faculty mentor, the club runs workshops, competitions, expert talks and daily problem practice to help students grow as problem solvers.
          </p>
          <blockquote className="relative rounded-3xl bg-brand p-8 text-primary-foreground">
            <Quote className="h-8 w-8 opacity-50" />
            <p className="mt-2 font-display text-3xl font-bold italic">{CLUB.slogan}</p>
          </blockquote>
          <Card className="flex items-center gap-5">
            <img src={MENTOR.photo} alt={MENTOR.name} className="h-28 w-24 shrink-0 rounded-2xl bg-cyan-soft object-cover object-top" />
            <div className="min-w-0">
              <span className="font-mono text-[11px] uppercase tracking-wider text-primary">Faculty Mentor Spotlight</span>
              <h3 className="mt-1 text-xl font-bold text-navy">{MENTOR.name}</h3>
              <p className="text-sm text-muted-foreground">{MENTOR.role}, {MENTOR.dept}</p>
              <p className="mt-2 text-sm text-muted-foreground">Guides the club's direction, events and student core committee.</p>
            </div>
          </Card>
        </div>
        <div className="space-y-5">
          <div className="rounded-3xl border-l-4 border-cyan bg-card p-7 shadow-soft">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Club's Vision</h3>
            <p className="mt-3 text-lg text-navy">{CLUB.vision}</p>
          </div>
          <div className="rounded-3xl border-l-4 border-primary bg-card p-7 shadow-soft">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Club's Mission</h3>
            <ul className="mt-3 space-y-3">
              {CLUB.mission.map((m) => <li key={m} className="flex gap-2 text-navy"><span className="text-primary">▹</span>{m}</li>)}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PILLARS.map((p, i) => (
              <div key={p} className="rounded-2xl border border-border bg-card p-4 text-center">
                <span className="font-mono text-xs text-primary">0{i + 1}</span>
                <p className="mt-1 font-display text-lg font-bold text-navy">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
      <Container className="py-8">
        <SectionHead eyebrow="Collaboration" title="10X Club — Marwadi University Chapter" sub={TENX.body} />
        <div className="grid items-start gap-8 md:grid-cols-[1fr_1.3fr]">
          <img src={COLLAB_IMG} alt="10X Club team" className="rounded-3xl border border-border object-cover shadow-soft" loading="lazy" />
          <div className="grid gap-3 sm:grid-cols-2">
            {TENX.team.map((t) => (
              <Card key={t.name} className="p-5">
                <p className="font-bold text-navy">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}
