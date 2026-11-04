import { createFileRoute } from "@tanstack/react-router";
import { OnboardingPage } from "@/components/onboarding/OnboardingPage";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding — Clarity Workspace" },
      { name: "description", content: "A role-based checklist for your first day, week and month." },
      { property: "og:title", content: "Onboarding — Clarity Workspace" },
      { property: "og:description", content: "A role-based checklist for your first day, week and month." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OnboardingPage,
});
