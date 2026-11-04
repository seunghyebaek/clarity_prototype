// Types mirror the proposed contract in docs/API_CONTRACT.md.

export type ResponseLanguage = "auto" | "en" | "ko";
export type ChatStatus = "answered" | "needs_clarification" | "insufficient_evidence";

export interface Me {
  user_id: string;
  display_name: string;
  country: string;
  groups: string[];
  capabilities: string[]; // e.g. "documents:upload"
}

export interface Citation {
  id: string;
  document_id: string;
  chunk_id: string;
  title: string;
  section: string;
  excerpt: string;
  version: string;
  language: string;
  effective_date: string;
}

export interface ChatMetrics {
  latency_ms: number | null;
  input_tokens: number | null;
  output_tokens: number | null;
}

export interface ChatRequest {
  conversation_id: string | null;
  message: string;
  response_language: ResponseLanguage;
}

export interface ChatResponse {
  conversation_id: string;
  run_id: string;
  status: ChatStatus;
  answer: string;
  clarification_question: string | null;
  citations: Citation[];
  metrics: ChatMetrics;
}

export interface ConversationSummary {
  id: string;
  title: string;
  updated_at: string;
}

export interface Paged<T> {
  items: T[];
  next_cursor: string | null;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  run_id: string | null;
  citations: Citation[];
  status?: ChatStatus;
  metrics?: ChatMetrics;
}

export interface ConversationDetail {
  id: string;
  messages: ConversationMessage[];
}

/** Ingestion/processing state of the document file. */
export type DocumentStatus = "pending" | "processing" | "ready" | "failed" | "inactive";
/** Whether the policy in this document version applies on the demo reference date. */
export type PolicyStatus = "upcoming" | "current" | "previous";

export interface DocumentSummary {
  id: string;
  title: string;
  department: string;
  country: string;
  language: string;
  version: string;
  effective_date: string;
  status: DocumentStatus;
  policy_status: PolicyStatus;
}

export interface DocumentDetail {
  document: DocumentSummary;
  sections: { id: string; title: string; text: string }[];
}

export interface FeedbackRequest {
  run_id: string;
  rating: "up" | "down";
  category: string | null;
  comment: string | null;
}

export interface FeedbackResponse {
  id: string;
  saved: boolean;
}

export interface UploadMetadata {
  title: string;
  department: string;
  country: string;
  language: string;
  version: string;
  effective_date: string;
}

export interface UploadResponse {
  document_id: string;
  job_id: string;
  status: "pending";
}

export interface JobStatus {
  id: string;
  status: DocumentStatus;
  error: string | null;
}

export interface EvalRunSummary {
  id: string;
  name: string;
  role: "baseline" | "candidate";
  dataset_version: string;
  sample_count: number | null;
  evidence_coverage: number | null;
  answer_correctness: number | null;
  abstention_accuracy: number | null;
  latency_p50_ms: number | null;
  cost_per_1k_usd: number | null;
  retrieval_config: string;
  model_version: string;
  prompt_version: string;
  /** What changed relative to the baseline run. */
  changed_conditions: string;
  created_at: string;
}

export interface EvalCase {
  id: string;
  question: string;
  category: string;
  expected_behavior: string;
  actual_output: string;
  sources: string[];
  /** Why the case failed, in plain language. */
  explanation: string;
}

export interface EvalRunDetail {
  summary: EvalRunSummary;
  cases: EvalCase[];
}

export type ApiErrorCode =
  | "network_error"
  | "rate_limited"
  | "session_expired"
  | "forbidden"
  | "validation_error"
  | "server_error"
  | string;

export class ApiError extends Error {
  code: ApiErrorCode;
  requestId: string | null;
  status: number | null;
  constructor(code: ApiErrorCode, message: string, status: number | null = null, requestId: string | null = null) {
    super(message);
    this.code = code;
    this.status = status;
    this.requestId = requestId;
  }
}

// ---- Workspace extensions (proposed; see docs/PROTOTYPE_GUIDE.md) ----

export interface Localized {
  en: string;
  ko: string;
}

export type DiffSegment = { type: "same" | "added" | "removed"; text: string };

export interface PolicyUpdate {
  id: string;
  document_id: string;
  title: string;
  department: string;
  country: string;
  previous_version: string;
  current_version: string;
  published_at: string;
  effective_date: string;
  /** Human-written change summary (original language EN; KO is a translation). */
  summary: Localized;
  /** AI-generated explanation. Must be labeled as such. */
  explanation: Localized;
  source_links: { label: string; document_id: string; version: string }[];
  changes: { id: string; section: string; segments: DiffSegment[] }[];
  timeline: { version: string; date: string; status: "superseded" | "current" | "scheduled" }[];
  suggested_question: Localized;
}

export type OnboardingPhase = "day" | "week" | "month";

export interface OnboardingTask {
  id: string;
  phase: OnboardingPhase;
  title: Localized;
  description: Localized;
  documents: { id: string; title: string }[];
  due: Localized | null;
  ask_question: string;
  applies_to?: { country?: string[]; department?: string[]; role?: string[] };
}

export type FeedbackCategory = "incorrect" | "missing_context" | "unsupported_citation" | "outdated" | "translation" | "other";
export type ReportStatus = "new" | "under_review" | "resolved";

export interface PassageReportRequest {
  run_id: string;
  excerpt: string;
  category: FeedbackCategory;
  comment: string | null;
  /** Source the report refers to, when the reporter selected one. */
  document_title?: string | null;
  document_version?: string | null;
}

export interface FeedbackReport extends PassageReportRequest {
  id: string;
  question: string;
  status: ReportStatus;
  candidate_eval: boolean;
  created_at: string;
}

/** Admin-classified cause of a knowledge gap. "unconfirmed" = not yet diagnosed. */
export type GapCause = "unconfirmed" | "missing_document" | "unclear_policy" | "retrieval_issue" | "outdated_version" | "conflicting_sources";
/** Review workflow: unreviewed → cause_identified → action_taken → revalidated → resolved. */
export type GapStatus = "unreviewed" | "cause_identified" | "action_taken" | "revalidated" | "resolved";

export interface GapRevalidation {
  result: "pass" | "fail";
  note: string;
  at: string;
}

export interface KnowledgeGap {
  id: string;
  topic: Localized;
  keywords: string[];
  frequency: number;
  period_days: number;
  first_seen: string;
  last_seen: string;
  examples: string[];
  cause: GapCause;
  owner: string | null;
  status: GapStatus;
  linked_document_id: string | null;
  revalidation: GapRevalidation | null;
}

export type DocRequestPriority = "low" | "medium" | "high";
export type DocRequestStatus = "draft" | "requested" | "in_progress" | "done";

export interface DocumentationRequest {
  id: string;
  gap_id: string;
  title: string;
  /** Problem description. */
  details: string;
  examples: string[];
  owner: string;
  priority: DocRequestPriority;
  due_date: string | null;
  status: DocRequestStatus;
  created_at: string;
}
