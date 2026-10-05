import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, FileText, Share2 } from "lucide-react";
import { PhotoGrid } from "@/components/site/Lightbox";
import { academicYear } from "@/lib/api/seed-events";
import { toast } from "sonner";
import { eventsApi } from "@/lib/api/services";
import { Card, Container, Eyebrow } from "@/components/site/kit";

export const Route = createFileRoute("/events/$slug")({
  head: () => ({
    meta: [
      { title: "Event Details — CP Club, Marwadi University" },
      { name: "description", content: "Details, takeaways and registration for a Competitive Programming Club event." },
      { property: "og:title", content: "CP Club Event" },
      { property: "og:description", content: "Event details from the Competitive Programming Club, Marwadi University." },
    ],
  }),
  component: EventDetail,
});

function EventDetail() {
  const { slug } = Route.useParams();
  const { data: e, isLoading } = useQuery({ queryKey: ["event", slug], queryFn: () => eventsApi.get(slug) });

  if (isLoading) return <Container className="py-24 text-muted-foreground">Loading…</Container>;
  if (!e)
    return (
      <Container className="py-24 text-center">
        <h1 className="text-3xl font-bold text-navy">Event not found</h1>
        <Link to="/events" className="mt-6 inline-block text-primary">Back to events</Link>
      </Container>
    );

  const share = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied");
  };

  return (
    <section className="bg-hero">
      <Container className="py-12">
        <Link to="/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-navy"><ArrowLeft className="h-4 w-4" /> All events</Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <Eyebrow>{e.category} · {e.upcoming ? "Upcoming" : e.year}</Eyebrow>
            <h1 className="mt-3 text-4xl font-extrabold text-navy sm:text-5xl">{e.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{e.description}</p>
            {e.photos && e.photos[0] && (
              <img src={e.photos[0]} alt={e.title} className="mt-8 aspect-[16/9] w-full rounded-3xl border border-border object-cover shadow-lift" />
            )}
            {e.overview && e.overview.length > 0 && (
              <Card className="mt-8">
                <h2 className="text-lg font-bold text-navy">What happened</h2>
                <ol className="mt-4 space-y-3">
                  {e.overview.map((a, i) => (
                    <li key={a} className="flex gap-3 text-sm text-navy"><span className="font-mono text-primary">{String(i + 1).padStart(2, "0")}</span>{a}</li>
                  ))}
                </ol>
              </Card>
            )}
            {e.takeaways.length > 0 && (
              <Card className="mt-5">
                <h2 className="text-lg font-bold text-navy">{e.reportBacked ? "Achievements & outcomes" : "Key takeaways"}</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {e.takeaways.map((t) => (
                    <li key={t} className="flex gap-2 text-sm text-navy"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{t}</li>
                  ))}
                </ul>
              </Card>
            )}
            {e.reportBacked && (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-cyan-soft px-3 py-1.5 text-xs font-medium text-navy"><FileText className="h-3.5 w-3.5" /> Summarised from the official CP Club event report</p>
            )}
            {e.agenda && e.agenda.length > 0 && (
              <Card className="mt-5">
                <h2 className="text-lg font-bold text-navy">Agenda</h2>
                <ol className="mt-4 space-y-3">
                  {e.agenda.map((a, i) => (
                    <li key={a} className="flex gap-3 text-sm"><span className="font-mono text-primary">{String(i + 1).padStart(2, "0")}</span>{a}</li>
                  ))}
                </ol>
              </Card>
            )}
            {e.prerequisites && e.prerequisites.length > 0 && (
              <Card className="mt-5">
                <h2 className="text-lg font-bold text-navy">Prerequisites</h2>
                <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">{e.prerequisites.map((p) => <li key={p}>{p}</li>)}</ul>
              </Card>
            )}
          </div>
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <Card>
              <dl className="space-y-4 text-sm">
                <Row k="Year" v={String(e.year)} />
                <Row k="Date" v={e.date ? new Date(e.date).toLocaleDateString("en-IN", { dateStyle: "long" }) : "—"} />
                {e.date && <Row k="Academic year" v={academicYear(e.date)!} />}
                <Row k="Mode" v={e.mode ?? "—"} />
                {e.venue && <Row k="Venue" v={e.venue} />}
                {e.participants && <Row k="Attendance" v={`${e.participants} participants`} />}
                {e.audience && <Row k="Audience" v={e.audience} />}
                <Row k="Hosted by" v={e.speaker ?? "CP Club"} />
              </dl>
              {e.upcoming && e.registrationOpen ? (
                <Link to="/join" search={{ event: e.id }} className="mt-6 block rounded-full bg-brand py-3 text-center text-sm font-semibold text-primary-foreground">Register for this event</Link>
              ) : (
                <p className="mt-6 rounded-xl bg-muted p-3 text-center text-xs text-muted-foreground">{e.upcoming ? "Registrations will open soon." : "This event has concluded."}</p>
              )}
              <button onClick={share} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-medium text-navy"><Share2 className="h-4 w-4" /> Copy link</button>
            </Card>
          </aside>
        </div>
        {e.photos && e.photos.length > 1 && (
          <div className="mt-14">
            <Eyebrow>Event gallery</Eyebrow>
            <h2 className="mb-6 mt-2 text-2xl font-bold text-navy">Photos from {e.title}</h2>
            <PhotoGrid photos={e.photos.map((src, i) => ({ src, event: e.title, year: e.year, caption: `Photo ${i + 1} of ${e.photos!.length}` }))} />
          </div>
        )}
      </Container>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-medium text-navy">{v}</dd>
    </div>
  );
}
