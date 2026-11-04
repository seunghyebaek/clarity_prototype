import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { KnowledgeHealthPage } from "@/components/admin/KnowledgeHealthPage";

const search = z.object({
  tab: z.enum(["gaps", "feedback", "requests"]).optional(),
  gap: z.string().max(100).optional(),
  q: z.string().max(4000).optional(),
});

export const Route = createFileRoute("/knowledge-health")({
  validateSearch: (s) => search.catch({}).parse(s),
  head: () => ({
    meta: [
      { title: "Knowledge Health — Clarity Workspace" },
      { name: "description", content: "Admin view of unanswered questions, knowledge gaps and answer reports." },
      { property: "og:title", content: "Knowledge Health — Clarity Workspace" },
      { property: "og:description", content: "Admin view of unanswered questions, knowledge gaps and answer reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HealthRoute,
});

function HealthRoute() {
  const s = Route.useSearch();
  return <KnowledgeHealthPage tab={s.tab} gapId={s.gap} question={s.q} />;
}
