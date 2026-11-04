import { createFileRoute } from "@tanstack/react-router";
import { EvaluationsPage } from "@/components/evaluations/EvaluationsPage";

export const Route = createFileRoute("/evaluations")({
  head: () => ({
    meta: [
      { title: "Evaluations — Clarity Knowledge Assistant" },
      { name: "description", content: "Read-only comparison of baseline and candidate experiment runs." },
      { property: "og:title", content: "Evaluations — Clarity Knowledge Assistant" },
      { property: "og:description", content: "Read-only comparison of baseline and candidate experiment runs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EvaluationsPage,
});
