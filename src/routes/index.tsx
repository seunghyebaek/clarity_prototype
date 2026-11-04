import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home/HomePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clarity — Company Knowledge Workspace" },
      { name: "description", content: "Your company's knowledge, connected to your work: answers, policies, updates and onboarding." },
      { property: "og:title", content: "Clarity — Company Knowledge Workspace" },
      { property: "og:description", content: "Your company's knowledge, connected to your work: answers, policies, updates and onboarding." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});
