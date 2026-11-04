import { ApiError } from "@/types/api";
import type { ApiAdapter, DocumentQuery } from "./adapter";
import { authAdapter } from "./auth";
import { config } from "@/lib/config";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(await authAdapter.getAuthHeaders()) };
  if (init.body && !(init.body instanceof FormData)) headers["Content-Type"] = "application/json";
  let res: Response;
  try {
    res = await fetch(`${config.apiBaseUrl}${path}`, { ...init, headers, credentials: "include" });
  } catch {
    throw new ApiError("network_error", "Network request failed");
  }
  if (!res.ok) {
    let body: { error?: { code?: string; message?: string; request_id?: string } } = {};
    try { body = await res.json(); } catch { /* non-JSON error */ }
    const code =
      body.error?.code ??
      (res.status === 401 ? "session_expired" : res.status === 429 ? "rate_limited" : res.status === 403 ? "forbidden" : "server_error");
    if (code === "session_expired") authAdapter.onSessionExpired();
    throw new ApiError(code, body.error?.message ?? res.statusText, res.status, body.error?.request_id ?? null);
  }
  return res.json() as Promise<T>;
}

const qs = (o: Record<string, string | undefined>) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => v && p.set(k, v));
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const httpAdapter: ApiAdapter = {
  getMe: () => request("/me"),
  chat: (req) => request("/chat", { method: "POST", body: JSON.stringify(req) }),
  listConversations: (cursor) => request(`/conversations${qs({ cursor })}`),
  getConversation: (id) => request(`/conversations/${encodeURIComponent(id)}`),
  listDocuments: (q: DocumentQuery) => request(`/documents${qs({ ...q })}`),
  getDocument: (id) => request(`/documents/${encodeURIComponent(id)}`),
  sendFeedback: (req) => request("/feedback", { method: "POST", body: JSON.stringify(req) }),
  uploadDocument: (file, metadata) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("metadata", JSON.stringify(metadata));
    return request("/admin/documents", { method: "POST", body: fd });
  },
  getJob: (id) => request(`/admin/jobs/${encodeURIComponent(id)}`),
  listEvalRuns: () => request("/eval/runs"),
  getEvalRun: (id) => request(`/eval/runs/${encodeURIComponent(id)}`),
  listUpdates: () => request("/updates"),
  getUpdate: (id) => request(`/updates/${encodeURIComponent(id)}`),
  listOnboardingTasks: () => request("/onboarding/tasks"),
  reportPassage: (req) => request("/feedback/passages", { method: "POST", body: JSON.stringify(req) }),
  listFeedbackReports: () => request("/admin/feedback"),
  updateFeedbackReport: (id, patch) => request(`/admin/feedback/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) }),
  listKnowledgeGaps: () => request("/admin/knowledge-gaps"),
  updateKnowledgeGap: (id, patch) => request(`/admin/knowledge-gaps/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) }),
  createDocumentationRequest: (req) => request("/admin/documentation-requests", { method: "POST", body: JSON.stringify(req) }),
  listDocumentationRequests: () => request("/admin/documentation-requests"),
};
