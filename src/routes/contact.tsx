import { createFileRoute, Link } from "@tanstack/react-router";
import { Instagram, MapPin } from "lucide-react";
import { CLUB, INSTAGRAM, MENTOR } from "@/lib/content";
import { Card, Container, PageHero } from "@/components/site/kit";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — CP Club, Marwadi University" },
      { name: "description", content: "Reach the Competitive Programming Club, ICT Department, Marwadi University." },
      { property: "og:title", content: "Contact the CP Club" },
      { property: "og:description", content: "Instagram, location and how to get involved with the CP Club." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <>
      <PageHero eyebrow="Contact & Social" title="Say hello." sub="The fastest way to reach us is on Instagram." />
      <Container className="grid gap-5 py-14 md:grid-cols-3">
        <a href={INSTAGRAM.url} target="_blank" rel="noreferrer" className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-lift">
          <Instagram className="h-6 w-6 text-primary" />
          <p className="mt-4 font-bold text-navy">Instagram</p>
          <p className="text-sm text-muted-foreground">{INSTAGRAM.handle}</p>
        </a>
        <Card>
          <MapPin className="h-6 w-6 text-primary" />
          <p className="mt-4 font-bold text-navy">Where we are</p>
          <p className="text-sm text-muted-foreground">{CLUB.department}, {CLUB.university}, Rajkot</p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Faculty Mentor</p>
          <p className="mt-3 font-bold text-navy">{MENTOR.name}</p>
          <p className="text-sm text-muted-foreground">{MENTOR.dept}</p>
          <Link to="/join" className="mt-4 inline-block text-sm font-semibold text-primary">Join the club →</Link>
        </Card>
      </Container>
    </>
  );
}
