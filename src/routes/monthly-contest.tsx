import { createFileRoute } from "@tanstack/react-router";
import { MONTHLY_CONTEST } from "@/lib/content";
import { MonthlyContestSection } from "@/components/site/MonthlyContest";

export const Route = createFileRoute("/monthly-contest")({
  head: () => ({
    meta: [
      { title: "Monthly Coding Contest — CP Club, Marwadi University" },
      { name: "description", content: MONTHLY_CONTEST.about },
      { property: "og:title", content: "Monthly Coding Contest — CP Club" },
      { property: "og:description", content: "Code. Compete. Improve. A new monthly coding challenge — launching soon." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <MonthlyContestSection showPageLink={false} />,
});
