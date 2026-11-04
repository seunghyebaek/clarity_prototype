import { FlaskConical } from "lucide-react";
import { useApp } from "@/lib/app-context";
import type { FeedbackReport, ReportStatus } from "@/types/api";
import type { DictKey } from "@/i18n/en";
import { Button } from "@/components/ui/button";

const statuses: ReportStatus[] = ["new", "under_review", "resolved"];
const tone: Record<ReportStatus, string> = { new: "bg-accent text-accent-foreground", under_review: "bg-warning-soft text-warning", resolved: "bg-success-soft text-success" };

export function FeedbackQueue({ reports, onPatch }: { reports: FeedbackReport[]; onPatch: (id: string, p: { status?: ReportStatus; candidate_eval?: boolean }) => void }) {
  const { t } = useApp();
  if (!reports.length) return <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">{t("noReports")}</p>;
  return (
    <ul className="space-y-2">
      {reports.map((r) => {
        const reviewed = r.status !== "new";
        return (
          <li key={r.id} className="rounded-2xl border bg-card p-4 animate-rise">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full px-2 py-0.5 font-medium ${tone[r.status]}`}>{t(`rs_${r.status}` as DictKey)}</span>
              <span className="rounded-full border px-2 py-0.5">{t(`fc_${r.category}` as DictKey)}</span>
              {r.candidate_eval && <span className="inline-flex items-center gap-1 rounded-full bg-learn-soft px-2 py-0.5 font-medium text-learn"><FlaskConical className="h-3 w-3" aria-hidden />{t("candidateCase")}</span>}
              <span className="ml-auto text-muted-foreground">{r.created_at.slice(0, 16).replace("T", " ")}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t("askedQuestion")}: <span className="text-foreground">{r.question || "—"}</span></p>
            <blockquote className="mt-1.5 rounded-lg border-l-2 border-destructive bg-surface-sunken px-3 py-2 text-sm">{r.excerpt}</blockquote>
            {r.document_title && (
              <p className="mt-1.5 text-xs text-muted-foreground">{t("source")}: <span className="text-foreground">{r.document_title}</span> <span className="font-mono">{r.document_version}</span></p>
            )}
            {r.comment && <p className="mt-1.5 text-sm"><span className="text-xs text-muted-foreground">{t("comment")}: </span>{r.comment}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="text-xs"><span className="sr-only">{t("status")}</span>
                <select value={r.status} onChange={(e) => onPatch(r.id, { status: e.target.value as ReportStatus })} className="rounded-lg border bg-card px-2 py-1.5 text-sm">
                  {statuses.map((s) => <option key={s} value={s}>{t(`rs_${s}` as DictKey)}</option>)}
                </select>
              </label>
              <Button size="sm" variant={r.candidate_eval ? "outline" : "secondary"} disabled={!reviewed && !r.candidate_eval}
                title={!reviewed ? t("reviewFirst") : t("regressionCaseNote")}
                onClick={() => onPatch(r.id, { candidate_eval: !r.candidate_eval })}>
                <FlaskConical className="h-3.5 w-3.5" /> {r.candidate_eval ? t("unmarkCandidate") : t("regressionCase")}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
