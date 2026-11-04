// Mock adapter. Conversations/uploads are in-memory; reports, gaps and documentation
// requests persist in this browser's localStorage so demo state survives a refresh.
// Nothing is sent to any server.
import { ApiError } from "@/types/api";
import type {
  ChatResponse,
  ConversationDetail,
  ConversationSummary,
  DocumentDetail,
  Me,
} from "@/types/api";
import type { ApiAdapter, GapPatch } from "./adapter";
import { mockScenarios } from "@/fixtures/chat";
import { documentFixtures } from "@/fixtures/documents";
import { evalFixtures } from "@/fixtures/evaluations";
import {
  docRequestFixtures,
  feedbackFixtures,
  gapFixtures,
  onboardingTasks,
  updateFixtures,
} from "@/fixtures/workspace";
import { DEMO_TODAY } from "@/lib/demo-date";
import type { DocumentationRequest, FeedbackReport, KnowledgeGap } from "@/types/api";

const STORE_KEYS = {
  reports: "clarity.demo.reports.v1",
  gaps: "clarity.demo.gaps.v1",
  requests: "clarity.demo.requests.v1",
} as const;

function loadStored<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return structuredClone(fallback);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}
function saveStored(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full/blocked */ }
}

/** Clears all persisted demo records (reports, gaps, requests). Onboarding progress has its own key in app-context. */
export function resetDemoRecords() {
  for (const k of Object.values(STORE_KEYS)) localStorage.removeItem(k);
}

export type SimulatedPersona = "employee" | "admin";
export type SimulatedFailure = "none" | "network_error" | "rate_limited" | "session_expired";

// SIMULATION controls (mock mode only). Not authentication.
export const simulation = {
  persona: "employee" as SimulatedPersona,
  nextFailure: "none" as SimulatedFailure,
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
let seq = 0;
const id = (p: string) => `${p}-${++seq}`;

const conversations = new Map<string, { summary: ConversationSummary; detail: ConversationDetail }>();
const docs: DocumentDetail[] = documentFixtures.map((d) => ({ ...d, document: { ...d.document } }));
const jobs = new Map<string, string>();

export const UNSUPPORTED_ANSWER = "__mock_unsupported__";

function consumeFailure() {
  const f = simulation.nextFailure;
  simulation.nextFailure = "none";
  if (f === "network_error") throw new ApiError("network_error", "Simulated network error");
  if (f === "rate_limited") throw new ApiError("rate_limited", "Simulated rate limit", 429, "mock-req");
  if (f === "session_expired") throw new ApiError("session_expired", "Simulated session expiry", 401, "mock-req");
}

type ExtKeys = "listUpdates" | "getUpdate" | "listOnboardingTasks" | "reportPassage" | "listFeedbackReports" | "updateFeedbackReport" | "listKnowledgeGaps" | "updateKnowledgeGap" | "createDocumentationRequest" | "listDocumentationRequests";
const baseAdapter: Omit<ApiAdapter, ExtKeys> = {
  async getMe(): Promise<Me> {
    await delay(100);
    const admin = simulation.persona === "admin";
    return {
      user_id: admin ? "demo-admin" : "demo-employee",
      display_name: admin ? "Demo Admin" : "Demo Employee",
      country: "CA",
      groups: admin ? ["people-ops", "kb-admins"] : ["engineering"],
      capabilities: admin ? ["documents:upload", "admin:view"] : [],
    };
  },

  async chat(req) {
    await delay(900);
    consumeFailure();
    const scenario = mockScenarios.find((s) => s.match(req.message));
    const convId = req.conversation_id ?? id("conv");
    const base: Omit<ChatResponse, "conversation_id" | "run_id"> = scenario?.response ?? {
      status: "insufficient_evidence",
      answer: UNSUPPORTED_ANSWER,
      clarification_question: null,
      citations: [],
      metrics: { latency_ms: null, input_tokens: null, output_tokens: null },
    };
    const res: ChatResponse = { ...base, conversation_id: convId, run_id: id("run") };
    let c = conversations.get(convId);
    if (!c) {
      c = { summary: { id: convId, title: req.message.slice(0, 60), updated_at: "" }, detail: { id: convId, messages: [] } };
      conversations.set(convId, c);
    }
    c.summary.updated_at = new Date().toISOString();
    c.detail.messages.push(
      { id: id("m"), role: "user", content: req.message, run_id: null, citations: [] },
      { id: id("m"), role: "assistant", content: res.status === "needs_clarification" ? res.clarification_question ?? "" : res.answer, run_id: res.run_id, citations: res.citations, status: res.status, metrics: res.metrics },
    );
    return res;
  },

  async listConversations() {
    const items = [...conversations.values()].map((c) => c.summary).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    return { items, next_cursor: null };
  },

  async getConversation(cid) {
    const c = conversations.get(cid);
    if (!c) throw new ApiError("not_found", "Conversation not found", 404);
    return structuredClone(c.detail);
  },

  async listDocuments(q) {
    await delay(150);
    const term = q.q?.toLowerCase() ?? "";
    const items = docs.map((d) => d.document).filter((d) =>
      (!term || d.title.toLowerCase().includes(term) || d.department.toLowerCase().includes(term)) &&
      (!q.department || d.department === q.department) &&
      (!q.language || d.language === q.language) &&
      (!q.status || d.status === q.status) &&
      (!q.policy_status || d.policy_status === q.policy_status));
    return { items, next_cursor: null };
  },

  async getDocument(did) {
    await delay(100);
    const d = docs.find((x) => x.document.id === did);
    if (!d) throw new ApiError("not_found", "Document not found", 404);
    return structuredClone(d);
  },

  async sendFeedback() {
    await delay(300);
    return { id: id("fb"), saved: true };
  },

  async uploadDocument(file, metadata) {
    if (simulation.persona !== "admin") throw new ApiError("forbidden", "Not allowed", 403);
    await delay(400);
    const docId = id("doc-local");
    docs.unshift({ document: { id: docId, ...metadata, status: "pending", policy_status: metadata.effective_date > DEMO_TODAY ? "upcoming" : "current" }, sections: [] });
    const jobId = id("job");
    jobs.set(jobId, docId);
    // Simulated progression, in memory only.
    setTimeout(() => setStatus(docId, "processing"), 1200);
    setTimeout(() => setStatus(docId, file.size === 0 ? "failed" : "ready"), 3200);
    return { document_id: docId, job_id: jobId, status: "pending" };
  },

  async getJob(jid) {
    const docId = jobs.get(jid);
    const d = docs.find((x) => x.document.id === docId);
    if (!d) throw new ApiError("not_found", "Job not found", 404);
    return { id: jid, status: d.document.status, error: d.document.status === "failed" ? "Empty file" : null };
  },

  async listEvalRuns() {
    await delay(150);
    return { items: evalFixtures.map((e) => e.summary), next_cursor: null };
  },

  async getEvalRun(rid) {
    const e = evalFixtures.find((x) => x.summary.id === rid);
    if (!e) throw new ApiError("not_found", "Run not found", 404);
    return e;
  },
};

const reports: FeedbackReport[] = loadStored(STORE_KEYS.reports, feedbackFixtures);
const gaps: KnowledgeGap[] = loadStored(STORE_KEYS.gaps, gapFixtures);
const docRequests: DocumentationRequest[] = loadStored(STORE_KEYS.requests, docRequestFixtures);

function requireAdmin() {
  if (simulation.persona !== "admin") throw new ApiError("forbidden", "Not allowed", 403);
}

const extAdapter: Pick<ApiAdapter, ExtKeys> = {
  async listUpdates() {
    await delay(120);
    return { items: updateFixtures, next_cursor: null };
  },
  async getUpdate(uid) {
    await delay(100);
    const u = updateFixtures.find((x) => x.id === uid);
    if (!u) throw new ApiError("not_found", "Update not found", 404);
    return u;
  },
  async listOnboardingTasks() {
    await delay(100);
    return { items: onboardingTasks, next_cursor: null };
  },
  async reportPassage(req) {
    await delay(350);
    const r: FeedbackReport = { ...req, id: id("rep"), status: "new", candidate_eval: false, created_at: new Date().toISOString() };
    reports.unshift(r);
    saveStored(STORE_KEYS.reports, reports);
    return r;
  },
  async listFeedbackReports() {
    requireAdmin();
    await delay(100);
    return { items: structuredClone(reports), next_cursor: null };
  },
  async updateFeedbackReport(rid, patch) {
    requireAdmin();
    const r = reports.find((x) => x.id === rid);
    if (!r) throw new ApiError("not_found", "Report not found", 404);
    Object.assign(r, patch);
    saveStored(STORE_KEYS.reports, reports);
    return structuredClone(r);
  },
  async listKnowledgeGaps() {
    requireAdmin();
    await delay(100);
    return { items: structuredClone(gaps), next_cursor: null };
  },
  async updateKnowledgeGap(gid, patch) {
    requireAdmin();
    const g = gaps.find((x) => x.id === gid);
    if (!g) throw new ApiError("not_found", "Gap not found", 404);
    applyGapPatch(g, patch);
    saveStored(STORE_KEYS.gaps, gaps);
    return structuredClone(g);
  },
  async createDocumentationRequest(req) {
    requireAdmin();
    await delay(250);
    const d: DocumentationRequest = { ...req, id: id("docreq"), created_at: new Date().toISOString() };
    docRequests.unshift(d);
    saveStored(STORE_KEYS.requests, docRequests);
    return d;
  },
  async listDocumentationRequests() {
    requireAdmin();
    return { items: structuredClone(docRequests), next_cursor: null };
  },
};

export const mockAdapter: ApiAdapter = { ...baseAdapter, ...extAdapter };

/**
 * Review workflow rules (also unit-tested in workspace-rules.test.ts):
 * - a cause must be identified before action is taken,
 * - "resolved" requires a recorded revalidation that passed.
 */
export function applyGapPatch(g: KnowledgeGap, patch: GapPatch) {
  const next = { ...g, ...patch };
  if (patch.status === "resolved" && next.revalidation?.result !== "pass") {
    throw new ApiError("validation_error", "A passing revalidation is required before resolving a gap.");
  }
  const order = ["unreviewed", "cause_identified", "action_taken", "revalidated", "resolved"] as const;
  if (patch.status && order.indexOf(patch.status) < order.indexOf(g.status) && patch.status !== "unreviewed") {
    throw new ApiError("validation_error", "Status can only move forward in the review workflow.");
  }
  if (patch.status === "cause_identified" && next.cause === "unconfirmed") {
    throw new ApiError("validation_error", "Choose a cause before marking the cause as identified.");
  }
  Object.assign(g, patch);
}

function setStatus(docId: string, status: DocumentDetail["document"]["status"]) {
  const d = docs.find((x) => x.document.id === docId);
  if (d) d.document.status = status;
}
