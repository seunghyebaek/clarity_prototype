import { createFileRoute } from "@tanstack/react-router";
import { UpdateDetailPage } from "@/components/updates/UpdateDetailPage";

export const Route = createFileRoute("/updates/$id")({
  head: () => ({
    meta: [
      { title: "Policy change briefing — Clarity Workspace" },
      { name: "description", content: "Before and after comparison of a policy change, with version timeline." },
      { property: "og:title", content: "Policy change briefing — Clarity Workspace" },
      { property: "og:description", content: "Before and after comparison of a policy change, with version timeline." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UpdateRoute,
});

function UpdateRoute() {
  const { id } = Route.useParams();
  return <UpdateDetailPage id={id} />;
}
