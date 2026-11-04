import type {
  ChatRequest, ChatResponse, ConversationDetail, ConversationSummary, DocumentDetail, DocumentSummary,
  EvalRunDetail, EvalRunSummary, DocumentationRequest, FeedbackReport, GapCause, GapRevalidation, GapStatus, KnowledgeGap, OnboardingTask, PassageReportRequest, PolicyUpdate, ReportStatus, FeedbackRequest, FeedbackResponse, JobStatus, Me, Paged, UploadMetadata, UploadResponse,
} from "@/types/api";

export interface DocumentQuery {
  q?: string;
  department?: string;
  language?: string;
  status?: string;
  policy_status?: string;
  cursor?: string;
}

export interface GapPatch {
  owner?: string | null;
  status?: GapStatus;
  cause?: GapCause;
  linked_document_id?: string | null;
  revalidation?: GapRevalidation | null;
}

export interface ApiAdapter {
  getMe(): Promise<Me>;
  chat(req: ChatRequest): Promise<ChatResponse>;
  listConversations(cursor?: string): Promise<Paged<ConversationSummary>>;
  getConversation(id: string): Promise<ConversationDetail>;
  listDocuments(query: DocumentQuery): Promise<Paged<DocumentSummary>>;
  getDocument(id: string): Promise<DocumentDetail>;
  sendFeedback(req: FeedbackRequest): Promise<FeedbackResponse>;
  uploadDocument(file: File, metadata: UploadMetadata): Promise<UploadResponse>;
  getJob(id: string): Promise<JobStatus>;
  listEvalRuns(): Promise<Paged<EvalRunSummary>>;
  getEvalRun(id: string): Promise<EvalRunDetail>;
  // Workspace extensions (proposed endpoints)
  listUpdates(): Promise<Paged<PolicyUpdate>>;
  getUpdate(id: string): Promise<PolicyUpdate>;
  listOnboardingTasks(): Promise<Paged<OnboardingTask>>;
  reportPassage(req: PassageReportRequest & { question: string }): Promise<FeedbackReport>;
  listFeedbackReports(): Promise<Paged<FeedbackReport>>;
  updateFeedbackReport(id: string, patch: { status?: ReportStatus; candidate_eval?: boolean }): Promise<FeedbackReport>;
  listKnowledgeGaps(): Promise<Paged<KnowledgeGap>>;
  updateKnowledgeGap(id: string, patch: GapPatch): Promise<KnowledgeGap>;
  createDocumentationRequest(req: Omit<DocumentationRequest, "id" | "created_at">): Promise<DocumentationRequest>;
  listDocumentationRequests(): Promise<Paged<DocumentationRequest>>;
}
