import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api";
import { errorMessageKey, useApp } from "@/lib/app-context";
import type { DocumentationRequest, DocumentSummary, FeedbackReport, KnowledgeGap } from "@/types/api";
import type { DictKey } from "@/i18n/en";
import { KnowledgeGapTable } from "./KnowledgeGapTable";
import { FeedbackQueue } from "./FeedbackQueue";
import { DocumentationRequestDialog } from "./DocumentationRequestDialog";

type Tab = "gaps" | "feedback" | "requests";

export function KnowledgeHealthPage({ tab = "gaps", gapId, question }: { tab?: Tab | undefined; gapId?: string | undefined; question?: string | undefined }) {
  const { t, isAdmin, me } = useApp();
  const navigate = useNavigate();
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [requests, setRequests] = useState<DocumentationRequest[]>([]);
  const [docs, setDocs] = useState<DocumentSummary[]>([]);
  const [err, setErr] = useState<DictKey | null>(null);
  const [requestGap, setRequestGap] = useState<KnowledgeGap | null>(null);

  const load = useCallback(() => {
    if (!isAdmin) return;
    Promise.all([api.listKnowledgeGaps(), api.listFeedbackReports(), api.listDocumentationRequests(), api.listDocuments({})])
      .then(([g, r, d, docs]) => { setGaps(g.items); setReports(r.items); setRequests(d.items); setDocs(docs.items); setErr(null); })
      .catch((e) => setErr(errorMessageKey(e)));
  }, [isAdmin]);
  useEffect(load, [load]);

  if (!me) return <p className="p-8 text-muted-foreground">{t("loading")}</p>;
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <ShieldAlert className="mx-auto h-8 w-8 text-warning" aria-hidden />
        <p className="mt-3 text-sm">{t("adminRequired")}</p>
      </div>
    );
  }

  const patchGap = (id: string, p: Partial<KnowledgeGap>) => api.updateKnowledgeGap(id, p).then(load).catch((e) => setErr(errorMessageKey(e)));
  const patchReport = (id: string, p: Partial<FeedbackReport>) => api.updateFeedbackReport(id, p).then(load).catch((e) => setErr(errorMessageKey(e)));
  const tabs: { id: Tab; label: DictKey; count: number }[] = [
    { id: "gaps", label: "tabGaps", count: gaps.filter((g) => g.status !== "resolved").length },
    { id: "feedback", label: "tabFeedback", count: reports.filter((r) => r.status === "new").length },
    { id: "requests", label: "tabRequests", count: requests.length },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">{t("healthHeading")}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{t("healthSub")}</p>
      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-xs text-warning"><ShieldAlert className="h-3.5 w-3.5" aria-hidden />{t("adminOnlyNote")}</p>

      <div role="tablist" aria-label={t("healthHeading")} className="mt-6 flex gap-1 border-b">
        {tabs.map((x) => (
          <button key={x.id} role="tab" aria-selected={tab === x.id}
            onClick={() => navigate({ to: "/knowledge-health", search: { tab: x.id } })}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${tab === x.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t(x.label)} {x.count > 0 && <span className="ml-1 rounded-full bg-muted px-1.5 text-xs">{x.count}</span>}
          </button>
        ))}
      </div>

      <div className="mt-5" role="tabpanel">
        {err && <p role="alert" className="mb-3 text-destructive">{t(err)}</p>}
        {tab === "gaps" && <KnowledgeGapTable gaps={gaps} docs={docs} highlightId={gapId} question={question} onPatch={patchGap} onRequest={setRequestGap} />}
        {tab === "feedback" && <FeedbackQueue reports={reports} onPatch={patchReport} />}
        {tab === "requests" && (requests.length === 0
          ? <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">{t("noRequests")}</p>
          : <ul className="space-y-2">{requests.map((r) => (
              <li key={r.id} className="rounded-2xl border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{r.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${r.status === "done" ? "bg-success-soft text-success" : r.status === "in_progress" ? "bg-warning-soft text-warning" : "bg-muted text-muted-foreground"}`}>{t(`drs_${r.status}` as DictKey)}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[0.7rem] ${r.priority === "high" ? "border-destructive/40 text-destructive" : "text-muted-foreground"}`}>{t(`pri_${r.priority}` as DictKey)}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{r.owner}{r.due_date ? ` · ${t("dueDate")} ${r.due_date}` : ""}</span>
                </div>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-muted-foreground">{r.details}</pre>
                {r.examples.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs">{r.examples.map((e) => <li key={e} className="rounded-lg bg-surface-sunken px-3 py-1.5">“{e}”</li>)}</ul>
                )}
              </li>))}</ul>)}
      </div>

      <DocumentationRequestDialog gap={requestGap} onClose={() => setRequestGap(null)}
        onSaved={() => { setRequestGap(null); toast.success(t("requestSaved")); load(); }} />
    </div>
  );
}
