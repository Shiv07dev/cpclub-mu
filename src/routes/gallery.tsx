import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SEED_EVENTS } from "@/lib/api/seed-events";
import { Container, PageHero } from "@/components/site/kit";
import { PhotoGrid } from "@/components/site/Lightbox";
import { cn } from "@/lib/utils";

const withPhotos = SEED_EVENTS.filter((e) => e.photos && e.photos.length > 0);
const ALL = withPhotos.flatMap((e) => e.photos!.map((src) => ({ src, event: e.title, year: e.year, slug: e.slug })));

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Photo Gallery — CP Club, Marwadi University" },
      { name: "description", content: "Real photographs from CP Club workshops, contests and STEM sessions at the ICT Department, Marwadi University." },
      { property: "og:title", content: "CP Club Photo Gallery" },
      { property: "og:description", content: "Moments from CP Club workshops, contests and sessions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const [slug, setSlug] = useState<string>("all");
  const photos = useMemo(() => (slug === "all" ? ALL : ALL.filter((p) => p.slug === slug)), [slug]);
  return (
    <>
      <PageHero eyebrow="Gallery" title="The club, in real moments." sub={`${ALL.length} photographs from ${withPhotos.length} events, taken from the club's official event reports. Tap any photo to view it full screen.`} />
      <Container className="py-12">
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <Chip active={slug === "all"} onClick={() => setSlug("all")}>All events</Chip>
          {withPhotos.map((e) => (
            <Chip key={e.slug} active={slug === e.slug} onClick={() => setSlug(e.slug)}>
              {e.title} <span className="font-mono opacity-60">’{String(e.year).slice(2)}</span>
            </Chip>
          ))}
        </div>
        <PhotoGrid key={slug} photos={photos} />
      </Container>
    </>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium", active ? "border-navy bg-navy text-primary-foreground" : "border-border bg-card text-navy hover:border-primary")}>
      {children}
    </button>
  );
}
