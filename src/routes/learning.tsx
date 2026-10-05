import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PLATFORMS, SKILLS } from "@/lib/content";
import { Container, PageHero, SectionHead } from "@/components/site/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learning")({
  head: () => ({
    meta: [
      { title: "Skills & Learning — CP Club, Marwadi University" },
      { name: "description", content: "Skills to master: C, C++, Java, Data Structures, Algorithms, Algorithmic Optimization, Git and GitHub." },
      { property: "og:title", content: "Skills to Master — CP Club" },
      { property: "og:description", content: "The learning paths and platforms the CP Club trains students on." },
    ],
  }),
  component: Learning,
});

function Learning() {
  const [open, setOpen] = useState(0);
  return (
    <>
      <PageHero eyebrow="Skills to master" title={<>Build. Practice. <span className="text-brand">Excel.</span></>} sub="Six foundations every CP Club member works on." />
      <Container className="py-14">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SKILLS.map((s, i) => (
            <button key={s.name} onClick={() => setOpen(i)} className={cn("group rounded-3xl border bg-card p-6 text-left transition-all", open === i ? "border-primary shadow-lift" : "border-border shadow-soft hover:-translate-y-1")}>
              <div className="flex items-center justify-between">
                <span className="grid h-12 min-w-12 place-items-center rounded-xl bg-cyan-soft px-2 font-mono text-lg font-bold text-primary">{s.code}</span>
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-5 text-xl font-bold text-navy">{s.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.why}</p>
              <div className="mt-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Proficiency path</p>
                <ol className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  {s.path.map((p, j) => (
                    <li key={p} className="flex items-center gap-1.5">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-navy">{p}</span>
                      {j < s.path.length - 1 && <span className="text-muted-foreground">→</span>}
                    </li>
                  ))}
                </ol>
              </div>
            </button>
          ))}
        </div>
        <p className="mt-10 text-center font-mono text-sm tracking-[0.4em] text-muted-foreground">BUILD | PRACTICE | EXCEL</p>

        <div className="mt-20">
          <SectionHead eyebrow="Collaborations & platforms" title="Where we practice and compete." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLATFORMS.map((p) => (
              <div key={p.name} className="rounded-2xl border border-border bg-card p-5">
                <p className="font-display text-lg font-bold text-navy">{p.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.use}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/monthly-contest" className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground">Monthly Contest</Link>
            <Link to="/coder-of-the-month" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-navy">Coder of the Month</Link>
          </div>
        </div>
      </Container>
    </>
  );
}
