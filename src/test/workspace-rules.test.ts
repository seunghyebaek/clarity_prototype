import { describe, expect, it } from "vitest";
import { effectiveState, policyStatusOf, DEMO_TODAY, progressOf, tasksForProfile } from "@/lib/onboarding";
import { onboardingTasks } from "@/fixtures/workspace";
import { documentFixtures } from "@/fixtures/documents";
import { mockScenarios } from "@/fixtures/chat";
import { applyGapPatch } from "@/api/mock";
import type { KnowledgeGap } from "@/types/api";

describe("onboarding progress", () => {
  it("is derived from checklist state, not hardcoded", () => {
    const tasks = tasksForProfile(onboardingTasks, { country: "CA", department: "Engineering", role: "Individual contributor" });
    expect(progressOf(tasks, []).completed).toBe(0);
    expect(progressOf(tasks, ["t-accounts", "t-remote"]).completed).toBe(2);
  });
  it("only shows the Korea leave task for KR and the approvals task for managers", () => {
    const ca = tasksForProfile(onboardingTasks, { country: "CA", department: "Finance", role: "Individual contributor" }).map((t) => t.id);
    expect(ca).not.toContain("t-leave-kr");
    expect(ca).not.toContain("t-approvals");
    const krMgr = tasksForProfile(onboardingTasks, { country: "KR", department: "Finance", role: "Manager" }).map((t) => t.id);
    expect(krMgr).toContain("t-leave-kr");
    expect(krMgr).toContain("t-approvals");
  });
});

describe("policy effective date", () => {
  it("uses the fixed demo reference date 2026-10-30", () => {
    expect(DEMO_TODAY).toBe("2026-10-30");
    expect(effectiveState("2026-12-01")).toBe("future");
    expect(effectiveState("2026-03-01")).toBe("current");
  });
});

describe("policy status per document version", () => {
  const docs = documentFixtures.map((d) => d.document);
  const byId = (id: string) => docs.find((d) => d.id === id)!;
  it("travel v5.0 is current, v5.1 upcoming, remote v2.0 previous on the demo date", () => {
    expect(policyStatusOf(byId("doc-travel-global"), docs)).toBe("current");
    expect(policyStatusOf(byId("doc-travel-global-v51"), docs)).toBe("upcoming");
    expect(policyStatusOf(byId("doc-remote-ca"), docs)).toBe("current");
    expect(policyStatusOf(byId("doc-remote-ca-old"), docs)).toBe("previous");
  });
  it("fixture policy_status matches the derived status", () => {
    for (const d of docs) expect(d.policy_status).toBe(policyStatusOf(d, docs));
  });
});

describe("knowledge gap review workflow", () => {
  const base: KnowledgeGap = {
    id: "g", topic: { en: "T", ko: "T" }, keywords: [], frequency: 1, period_days: 30,
    first_seen: "2026-10-01", last_seen: "2026-10-30", examples: [],
    cause: "unconfirmed", owner: null, status: "unreviewed", linked_document_id: null, revalidation: null,
  };
  it("requires a cause before 'cause identified'", () => {
    expect(() => applyGapPatch({ ...base }, { status: "cause_identified" })).toThrow();
    const g = { ...base, cause: "missing_document" as const };
    applyGapPatch(g, { status: "cause_identified" });
    expect(g.status).toBe("cause_identified");
  });
  it("requires a passing revalidation before resolving", () => {
    const g = { ...base, cause: "missing_document" as const, status: "action_taken" as const };
    expect(() => applyGapPatch(g, { status: "resolved" })).toThrow();
    applyGapPatch(g, { status: "revalidated", revalidation: { result: "fail", note: "n", at: "2026-10-30" } });
    expect(() => applyGapPatch(g, { status: "resolved" })).toThrow();
    applyGapPatch(g, { revalidation: { result: "pass", note: "n", at: "2026-10-30" } });
    applyGapPatch(g, { status: "resolved" });
    expect(g.status).toBe("resolved");
  });
  it("does not move backwards except reopening to unreviewed", () => {
    const g = { ...base, cause: "missing_document" as const, status: "revalidated" as const };
    expect(() => applyGapPatch(g, { status: "action_taken" })).toThrow();
    applyGapPatch(g, { status: "unreviewed", revalidation: null });
    expect(g.status).toBe("unreviewed");
  });
});

describe("mock scenarios", () => {
  it("routes the Canada meal allowance question to the cited answer", () => {
    const s = mockScenarios.find((x) => x.match("What is the Canada meal allowance, and when does the new limit apply?"));
    expect(s?.id).toBe("meal-ca");
  });
  it("routes pet insurance to insufficient evidence", () => {
    expect(mockScenarios.find((x) => x.match("Does the company provide pet insurance?"))?.response.status).toBe("insufficient_evidence");
  });
});
