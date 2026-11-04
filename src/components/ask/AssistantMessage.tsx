import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, HelpCircle, SearchX, ShieldCheck } from "lucide-react";
import type { ConversationMessage } from "@/types/api";
import { useApp } from "@/lib/app-context";
import { UNSUPPORTED_ANSWER } from "@/api/mock";
import { AnswerMarkdown } from "./AnswerMarkdown";
import { Feedback } from "./Feedback";
import { AnswerFeedbackDialog } from "@/components/feedback/AnswerFeedbackDialog";

export function AssistantMessage({ msg, question }: { msg: ConversationMessage; question: string }) {
  const { t, openSource, isAdmin } = useApp();
  const [reportExcerpt, setReportExcerpt] = useState<string | null>(null);
  const m = msg.metrics;
  const fmt = (v: number | null | undefined, unit = "") => (v == null ? t("notMeasured") : `${v.toLocaleString()}${unit}`);
  const unsupported = msg.content === UNSUPPORTED_ANSWER;
  const canReport = !!msg.run_id && !unsupported && msg.status !== "needs_clarification";

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-panel animate-rise">
      <div className="mb-3 flex items-center gap-2 text-xs">
        <span className="font-display font-semibold text-foreground">{t("assistant")}</span>
        {msg.status === "answered" && msg.citations.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 font-medium text-accent-foreground">
            <ShieldCheck className="h-3 w-3" aria-hidden /> {msg.citations.length} {t("sources").toLowerCase()}
          </span>
        )}
        {msg.status === "needs_clarification" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-learn-soft px-2 py-0.5 font-medium text-learn">
            <HelpCircle className="h-3 w-3" aria-hidden /> {t("needsClarification")}
          </span>
        )}
      </div>

      {msg.status === "insufficient_evidence" && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-warning/50 bg-warning-soft p-3 text-sm">
          {unsupported ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden /> : <SearchX className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />}
          <div className="min-w-0">
            <div className="font-semibold text-warning">{t("insufficientEvidence")}</div>
            <div className="text-muted-foreground">{unsupported ? t("unsupportedMock") : t("insufficientNote")}</div>
            {!unsupported && isAdmin && (
              <Link to="/knowledge-health" search={{ q: question }} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                {t("relatedGap")} <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      )}
      {!unsupported && <AnswerMarkdown text={msg.content} citations={msg.citations} onReport={canReport ? setReportExcerpt : undefined} />}

      {msg.citations.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">{t("sources")}</div>
          <ul className="grid gap-1">
            {msg.citations.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => openSource(msg.citations, c.id)} className="flex w-full items-baseline gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-surface-sunken">
                  <span className="shrink-0 whitespace-nowrap text-xs font-bold text-primary">[{c.id}]</span>
                  <span className="min-w-0 truncate">{c.title} · {c.section}</span>
                  <span className="ml-auto shrink-0 font-mono text-[0.7rem] text-muted-foreground">{c.version}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-start justify-between gap-2">
        {msg.run_id && <Feedback runId={msg.run_id} />}
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer select-none rounded px-1">{t("responseDetails")}</summary>
          <dl className="mt-2 grid grid-cols-[auto_auto] gap-x-4 gap-y-1">
            <dt>{t("runId")}</dt><dd className="font-mono">{msg.run_id ?? "—"}</dd>
            <dt>{t("latency")}</dt><dd>{fmt(m?.latency_ms, " ms")}</dd>
            <dt>{t("inputTokens")}</dt><dd>{fmt(m?.input_tokens)}</dd>
            <dt>{t("outputTokens")}</dt><dd>{fmt(m?.output_tokens)}</dd>
          </dl>
        </details>
      </div>

      {msg.run_id && (
        <AnswerFeedbackDialog open={reportExcerpt !== null} onOpenChange={(o) => !o && setReportExcerpt(null)}
          excerpt={reportExcerpt ?? ""} runId={msg.run_id} question={question} citations={msg.citations} />
      )}
    </div>
  );
}
