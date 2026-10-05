import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Award, Trophy } from "lucide-react";
import { eventsApi } from "@/lib/api/services";
import { ACHIEVEMENTS, CLUB, CODER_OF_MONTH, COMMITTEE, INTRO_STEPS, MENTOR, PLATFORMS, SKILLS } from "@/lib/content";
import { CodeChip, Container, Eyebrow, SectionHead } from "@/components/site/kit";
import { EventCard } from "@/components/site/EventCard";
import { MemberCard, MentorCard } from "@/components/site/MemberCard";
import { MonthlyContestSection } from "@/components/site/MonthlyContest";
import { PhotoGrid } from "@/components/site/Lightbox";
import { ConsistencyWall } from "@/components/site/ConsistencyWall";
import { SEED_EVENTS } from "@/lib/api/seed-events";
import { CONSISTENCY } from "@/lib/community";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Competitive Programming Club — ICT, Marwadi University" },
      { name: "description", content: CLUB.tagline },
      { property: "og:title", content: "Competitive Programming Club — Marwadi University" },
      { property: "og:description", content: CLUB.tagline },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <IntroSlider />
      <MonthlyContestSection />
      <Pillars />
      <SkillsStrip />
      <Highlights />
      <RecentEvents />
      <AchievementsPreview />
      <CommunityCount />
      <Initiatives />
      <Platforms />
      <section className="py-14 sm:py-20"><Container><ConsistencyWall limit={12} /><div className="mt-8 text-center"><Link to="/achievements" className="text-sm font-semibold text-primary">See all {CONSISTENCY.length} members →</Link></div></Container></section>
      <CommitteePreview />
      <JoinCta />
    </>
  );
}

function Hero() {
  const { data: events } = useQuery({ queryKey: ["events"], queryFn: () => eventsApi.list() });
  const upcoming = events?.find((e) => e.upcoming);
  return (
    <section className="relative -mt-[68px] overflow-hidden bg-hero pt-[68px]">
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <Container className="relative grid items-center gap-10 pb-14 pt-10 sm:pb-20 lg:grid-cols-[1.25fr_1fr] lg:gap-14 lg:pt-20">
        <div className="min-w-0">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-navy shadow-soft">
            <Award className="h-3.5 w-3.5 shrink-0 text-primary" /> <span className="truncate">NAAC A+ Accredited University Ecosystem</span>
          </div>
          <p className="mt-6 text-sm font-semibold text-muted-foreground">{CLUB.department}</p>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{CLUB.university}</p>
          <h1 className="mt-5 font-extrabold leading-[0.95] text-navy" style={{ fontSize: "clamp(2.6rem, 8vw, 4.75rem)" }}>
            Competitive
            <br />
            <span className="text-brand">Programming</span>
            <br />
            Club
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{CLUB.tagline}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/events" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5">
              Explore Events <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/join" className="inline-flex justify-center rounded-full border border-navy/15 bg-card px-6 py-3 text-sm font-semibold text-navy hover:border-primary">Join the Club</Link>
            <Link to="/committee" className="inline-flex justify-center rounded-full px-4 py-3 text-sm font-semibold text-navy underline-offset-4 hover:underline">View Committee</Link>
          </div>
        </div>

        <div className="min-w-0">
          <HeroPhotos />
          <div className="mb-4 hidden flex-wrap gap-2 sm:flex">
            <CodeChip>{"<C / C++ />"}</CodeChip>
            <CodeChip>{"{ Java }"}</CodeChip>
            <CodeChip className="hidden md:inline-flex">[ Data Structures ]</CodeChip>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-lift sm:p-7">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Upcoming Event</span>
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" /></span>
            </div>
            {upcoming ? (
              <>
                <h3 className="mt-3 text-xl font-bold text-navy">{upcoming.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {upcoming.date ? new Date(upcoming.date).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "Date to be announced"} · {upcoming.mode ?? "Mode TBA"}
                </p>
                <Link to="/join" search={{ event: upcoming.id }} className="mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground">Register Now</Link>
              </>
            ) : (
              <>
                <h3 className="mt-3 text-xl font-bold text-navy">Next event announcing soon</h3>
                <p className="mt-1 text-sm text-muted-foreground">Follow @CPCLUB_MU on Instagram or join the club to hear first.</p>
                <Link to="/join" className="mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground">Join the Club</Link>
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

function IntroSlider() {
  const [i, setI] = useState(0);
  const s = INTRO_STEPS[i]!;
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <SectionHead eyebrow="Club Introduction" title="One community, seven reasons to code." />
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <ol className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {INTRO_STEPS.map((st, idx) => (
              <li key={st.k} className="shrink-0">
                <button
                  onClick={() => setI(idx)}
                  className={cn("flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-all", idx === i ? "bg-card font-semibold text-navy shadow-soft ring-1 ring-border" : "text-muted-foreground hover:text-navy")}
                >
                  <span className={cn("font-mono text-xs", idx === i ? "text-primary" : "")}>{String(idx + 1).padStart(2, "0")}</span>
                  {st.k}
                </button>
              </li>
            ))}
          </ol>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-soft sm:p-12">
            <div className="absolute inset-x-0 top-0 h-1 bg-muted">
              <div className="h-full bg-brand transition-all duration-500" style={{ width: `${((i + 1) / INTRO_STEPS.length) * 100}%` }} />
            </div>
            <span className="font-mono text-6xl font-bold text-cyan-soft">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-2 text-3xl font-bold uppercase text-navy">{s.k}</h3>
            {s.body && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{s.body}</p>}
            {s.list && (
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {s.list.map((l) => (
                  <li key={l} className="rounded-xl border border-border bg-muted/50 p-4 text-sm text-navy">{l}</li>
                ))}
              </ul>
            )}
            <div className="mt-8 flex gap-2">
              <button disabled={i === 0} onClick={() => setI(i - 1)} className="rounded-full border border-border px-4 py-2 text-sm font-medium disabled:opacity-40">Previous</button>
              <button disabled={i === INTRO_STEPS.length - 1} onClick={() => setI(i + 1)} className="rounded-full bg-navy px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function SkillsStrip() {
  return (
    <section className="border-y border-border bg-card py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead eyebrow="Skills to master" title="The CP Club stack." />
          <Link to="/learning" className="mb-10 text-sm font-semibold text-primary">Explore learning paths →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {SKILLS.map((s) => (
            <div key={s.name} className="rounded-2xl border border-border bg-background p-4 transition-all hover:-translate-y-1 hover:border-primary/40">
              <span className="font-mono text-lg font-bold text-primary">{s.code}</span>
              <p className="mt-3 text-sm font-semibold text-navy">{s.name}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center font-mono text-xs tracking-[0.35em] text-muted-foreground">BUILD | PRACTICE | EXCEL</p>
      </Container>
    </section>
  );
}

function RecentEvents() {
  const { data } = useQuery({ queryKey: ["events"], queryFn: () => eventsApi.list() });
  const list = (data ?? []).filter((e) => e.upcoming || e.reportBacked).slice(0, 3);
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead eyebrow="Events" title="Latest from the club." />
          <Link to="/events" className="mb-10 text-sm font-semibold text-primary">All events →</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {list.map((e) => <EventCard key={e.id} e={e} />)}
        </div>
      </Container>
    </section>
  );
}

function Initiatives() {
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <Link to="/coder-of-the-month" className="group grid gap-6 rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-lift sm:p-10 md:grid-cols-[1.5fr_1fr] md:items-center">
          <div>
            <Trophy className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-2xl font-bold text-navy sm:text-3xl">Coder of the Month</h3>
            <p className="mt-2 text-muted-foreground">{CODER_OF_MONTH.about}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">See the winners <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </div>
          <div className="rounded-2xl bg-cyan-soft/60 p-6 md:text-right">
            <span className="block font-display text-5xl font-extrabold text-brand">{CODER_OF_MONTH.metric.value}</span>
            <span className="mt-1 block text-sm text-muted-foreground">{CODER_OF_MONTH.metric.label}</span>
          </div>
        </Link>
      </Container>
    </section>
  );
}

function Platforms() {
  return (
    <section className="py-16">
      <Container>
        <Eyebrow>Platforms we train on</Eyebrow>
        <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-marquee gap-4">
            {[...PLATFORMS, ...PLATFORMS].map((p, i) => (
              <div key={i} className="w-64 shrink-0 rounded-2xl border border-border bg-card p-5">
                <p className="font-display text-lg font-bold text-navy">{p.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.use}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function AchievementsPreview() {
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead eyebrow="Achievements" title={<>"Coding without recognition is <span className="text-brand">not</span> our thing!"</>} />
          <Link to="/achievements" className="mb-10 text-sm font-semibold text-primary">Achiever's wall →</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {ACHIEVEMENTS.slice(0, 3).map((a) => (
            <div key={a.title} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <img src={a.photo} alt={a.title} loading="lazy" className="aspect-[16/10] w-full object-cover" />
              <div className="p-5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-primary">{a.tag}</span>
                <h3 className="mt-1 font-bold text-navy">{a.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{a.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function CommitteePreview() {
  return (
    <section className="border-y border-border bg-card py-14 sm:py-20">
      <Container>
        <SectionHead eyebrow="Core Committee" title="The people behind the club." />
        <div className="mx-auto grid max-w-xs grid-cols-1 gap-6 sm:max-w-2xl sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-3">
          {COMMITTEE.map((m) => <MemberCard key={m.name} m={m} />)}
        </div>
        <div className="mt-14">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.25em] text-primary">Faculty Mentor</p>
          <div className="mx-auto max-w-sm sm:max-w-2xl"><MentorCard m={MENTOR} /></div>
        </div>
        <div className="mt-10 text-center">
          <Link to="/committee" className="inline-flex rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-navy hover:border-primary">Meet the full committee</Link>
        </div>
      </Container>
    </section>
  );
}

function JoinCta() {
  return (
    <section className="pt-20">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-brand p-10 text-primary-foreground sm:p-14">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] opacity-80">{CLUB.slogan}</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Ready to start your streak?</h2>
              <p className="mt-3 max-w-lg opacity-90">Join the Competitive Programming Club.</p>
            </div>
            <div className="md:text-right">
              <Link to="/join" className="inline-flex items-center gap-2 rounded-full bg-card px-6 py-3 text-sm font-semibold text-navy">
                Join the Club <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}


const REPORTED = SEED_EVENTS.filter((e) => e.reportBacked);
const HIGHLIGHTS = [
  ["r8", 0], ["r17", 0], ["r7", 0], ["r12", 7], ["r11", 0], ["r14", 3],
].map(([id, i]) => {
  const e = REPORTED.find((x) => x.id === id);
  return e?.photos?.[i as number] ? { src: e.photos[i as number]!, event: e.title, year: e.year } : null;
}).filter(Boolean) as { src: string; event: string; year: number }[];

function HeroPhotos() {
  const [a, b, c] = HIGHLIGHTS;
  if (!a || !b || !c) return null;
  return (
    <div className="mb-5 grid grid-cols-3 grid-rows-2 gap-2 sm:gap-3">
      <img src={a.src} alt={a.event} className="col-span-2 row-span-2 aspect-[4/3] h-full w-full rounded-2xl border border-border object-cover shadow-lift" />
      <img src={b.src} alt={b.event} className="aspect-square h-full w-full rounded-2xl border border-border object-cover shadow-soft" />
      <img src={c.src} alt={c.event} className="aspect-square h-full w-full rounded-2xl border border-border object-cover shadow-soft" />
    </div>
  );
}

function Pillars() {
  const items = [
    ["Workshops & Masterclasses", "C, C++, Java & OOP, Git & GitHub, Linux, Unity — hands-on, lab-based sessions."],
    ["Algorithmic Problem Solving", "Practice on LeetCode, HackerRank, Codeforces and CodeChef with guidance."],
    ["Mock Contests & Hackathons", "CodeCrack Challenge, CodeQuest and the Coding Relay Race at MU Fest."],
    ["Peer Learning & Mentorship", "Seniors and the core team guide juniors, plus STEM outreach for schools."],
  ];
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <SectionHead eyebrow="What we do" title="Build. Practice. Compete. Learn." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(([t, d], i) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
              <span className="font-mono text-sm font-bold text-primary">0{i + 1}</span>
              <h3 className="mt-3 font-bold text-navy">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Highlights() {
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead eyebrow="Event highlights" title="Real rooms. Real code. Real people." />
          <Link to="/gallery" className="mb-10 text-sm font-semibold text-primary">Full gallery →</Link>
        </div>
        <PhotoGrid photos={HIGHLIGHTS} masonry={false} />
      </Container>
    </section>
  );
}

function CommunityCount() {
  const total = REPORTED.reduce((s, e) => s + (e.participants ?? 0), 0);
  const stats = [
    [String(REPORTED.length), "Events with official reports"],
    [`${total}+`, "Recorded attendance across those events"],
    [String(CONSISTENCY.length), "Members in Consistency in CP"],
  ];
  return (
    <section className="border-y border-border bg-card py-14">
      <Container>
        <div className="grid gap-6 sm:grid-cols-3">
          {stats.map(([v, l]) => (
            <div key={l} className="text-center">
              <span className="block font-display text-5xl font-extrabold text-brand">{v}</span>
              <span className="mt-2 block text-sm text-muted-foreground">{l}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Counted only from the club's event reports and submissions.</p>
      </Container>
    </section>
  );
}
