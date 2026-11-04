import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AskPage } from "@/components/ask/AskPage";

const search = z.object({
  q: z.string().max(4000).optional(),
  context: z.string().max(100).optional(),
  from: z.string().max(40).optional(),
  send: z.literal("1").optional(),
});

export const Route = createFileRoute("/ask")({
  validateSearch: (s) => search.catch({}).parse(s),
  head: () => ({
    meta: [
      { title: "Ask — Clarity Workspace" },
      { name: "description", content: "Ask questions about company policies and explore the cited evidence." },
      { property: "og:title", content: "Ask — Clarity Workspace" },
      { property: "og:description", content: "Ask questions about company policies and explore the cited evidence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AskRoute,
});

function AskRoute() {
  const { q, context, from, send } = Route.useSearch();
  return <AskPage initialQuestion={q} contextUpdateId={context} from={from} autoSend={send === "1"} />;
}
