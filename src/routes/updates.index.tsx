import { createFileRoute } from "@tanstack/react-router";
import { UpdatesPage } from "@/components/updates/UpdatesPage";

export const Route = createFileRoute("/updates/")({
  head: () => ({
    meta: [
      { title: "Policy updates — Clarity Workspace" },
      { name: "description", content: "What changed in company policies, with before/after comparisons." },
      { property: "og:title", content: "Policy updates — Clarity Workspace" },
      { property: "og:description", content: "What changed in company policies, with before/after comparisons." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UpdatesPage,
});
