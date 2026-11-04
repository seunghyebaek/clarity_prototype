import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { DocumentsPage } from "@/components/documents/DocumentsPage";

export const Route = createFileRoute("/documents")({
  validateSearch: (s) => z.object({ doc: z.string().max(100).optional() }).catch({}).parse(s),
  head: () => ({
    meta: [
      { title: "Documents — Clarity Knowledge Assistant" },
      { name: "description", content: "Browse policy documents, versions and ingestion status." },
      { property: "og:title", content: "Documents — Clarity Knowledge Assistant" },
      { property: "og:description", content: "Browse policy documents, versions and ingestion status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DocumentsRoute,
});

function DocumentsRoute() {
  const { doc } = Route.useSearch();
  return <DocumentsPage docId={doc} />;
}
