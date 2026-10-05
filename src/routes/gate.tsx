import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";
import { GATE } from "@/lib/content";
import { gateApi } from "@/lib/api/services";
import { useMock } from "@/lib/api/http";
import { Container, PageHero } from "@/components/site/kit";

export const Route = createFileRoute("/gate")({
  head: () => ({
    meta: [
      { title: "GATE Qualifications — CP Club, Marwadi University" },
      { name: "description", content: "CP Club members who qualified GATE 2024 and GATE 2025." },
      { property: "og:title", content: "CP Club GATE Qualifications" },
      { property: "og:description", content: "CP Club members who qualified the Graduate Aptitude Test in Engineering." },
    ],
  }),
  component: Gate,
});

function Gate() {
  const { data: backendGate = [] } = useQuery({
    queryKey: ["gate"],
    queryFn: () => gateApi.list(),
    enabled: !useMock,
  });

  const useBackend = !useMock && backendGate.length > 0;

  // Normalise to common shape {name, exam, paper}
  const records = useBackend
    ? backendGate.map((g) => ({ name: g.studentName, exam: g.exam, paper: g.paper }))
    : GATE;

  return (
    <>
      <PageHero eyebrow="GATE Qualifications" title="Algorithms that carry into GATE." sub="Members qualifying the Graduate Aptitude Test in Engineering — where strong DSA and algorithmic foundations pay off." />
      <Container className="py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((g) => (
            <div key={g.name + g.exam} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <GraduationCap className="h-6 w-6 text-primary" />
              <p className="mt-4 text-lg font-bold text-navy">{g.name}</p>
              <p className="font-mono text-sm text-primary">{g.exam}</p>
              <p className="mt-1 text-sm text-muted-foreground">{g.paper}</p>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
