import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { COMMITTEE, MENTOR, PSEUDO_COMMITTEE } from "@/lib/content";
import { committeeApi, type BackendMember } from "@/lib/api/services";
import { useMock } from "@/lib/api/http";
import { Container, PageHero, SectionHead } from "@/components/site/kit";
import { MemberCard, MentorCard } from "@/components/site/MemberCard";

export const Route = createFileRoute("/committee")({
  head: () => ({
    meta: [
      { title: "Core Committee — CP Club, Marwadi University" },
      { name: "description", content: "Faculty mentor Prof. Nishith Kotak and the student core committee of the Competitive Programming Club." },
      { property: "og:title", content: "CP Club Core Committee" },
      { property: "og:description", content: "Meet the faculty mentor and student core committee of the CP Club." },
    ],
  }),
  component: Committee,
});

function Committee() {
  const { data: backendMembers = [] } = useQuery({
    queryKey: ["committee"],
    queryFn: () => committeeApi.list(),
    enabled: !useMock,
  });

  // When connected to backend, derive committee, pseudo-core, and mentor from API data
  const useBackend = !useMock && backendMembers.length > 0;

  // Map backend members into the shape MemberCard expects
  const toMember = (m: BackendMember) => ({
    name: m.name,
    role: m.role,
    badge: m.badge ?? m.role,
    photo: m.photoUrl ?? "",
  });

  const coreMembers = useBackend
    ? backendMembers.filter((m) => !m.isMentor && !m.isPseudoCore).map(toMember)
    : COMMITTEE;

  const pseudoMembers = useBackend
    ? backendMembers.filter((m) => m.isPseudoCore).map(toMember)
    : PSEUDO_COMMITTEE;

  const mentor = useBackend
    ? backendMembers.find((m) => m.isMentor)
    : null;

  return (
    <>
      <PageHero eyebrow="Competitive Programming Club (Core)" title="Core Committee & Leadership." sub="Same Passion, Bigger Possibilities." />
      <Container className="py-12 sm:py-16">
        <SectionHead eyebrow="Core Committee" title="The team running the club." />
        <div className="mx-auto grid max-w-xs grid-cols-1 gap-6 sm:max-w-2xl sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-3">
          {coreMembers.map((m) => <MemberCard key={m.name} m={m} />)}
        </div>
        {pseudoMembers.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <SectionHead eyebrow="Pseudo-Core Committee" title="Supporting the core team." />
            <div className="mx-auto grid max-w-sm grid-cols-2 gap-4 sm:max-w-3xl sm:grid-cols-4 sm:gap-5">
              {pseudoMembers.map((m) => <MemberCard key={m.name} m={m} className="[&_h3]:whitespace-normal [&_h3]:text-sm [&_h3]:sm:text-sm [&_p]:text-xs [&>div:last-child]:px-3 [&>div:last-child]:py-3" />)}
            </div>
          </div>
        )}
        <div className="mt-16 sm:mt-20">
          <SectionHead eyebrow="Faculty Mentor" title="Guided by experience." />
          <div className="mx-auto max-w-sm sm:max-w-2xl">
            {mentor ? (
              <MentorCard m={{ name: mentor.name, role: mentor.role, dept: "Department of ICT", photo: mentor.photoUrl ?? "" }} />
            ) : (
              <MentorCard m={MENTOR} />
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
