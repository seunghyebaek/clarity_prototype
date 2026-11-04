import { useEffect, useRef, useState } from "react";
import { ChevronDown, FilePlus2, Link2, Search, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-context";
import { demoOwners } from "@/fixtures/workspace";
import type { DocumentSummary, GapCause, KnowledgeGap } from "@/types/api";
import type { GapPatch } from "@/api/adapter";
import type { DictKey } from "@/i18n/en";
import { Button } from "@/components/ui/button";

export function gapMatches(gap: KnowledgeGap, question?: string) {
  if (!question) return false;
  const q = question.toLowerCase();
  return gap.keywords.some((k) => q.includes(k.toLowerCase()));
}

const causes: GapCause[] = ["unconfirmed", "missing_document", "unclear_policy", "retrieval_issue", "outdated_version", "conflicting_sources"];

const statusTone: Record<KnowledgeGap["status"], string> = {
  unreviewed: "bg-muted text-muted-foreground",
  cause_identified: "bg-accent text-accent-foreground",
  action_taken: "bg-warning-soft text-warning",
  revalidated: "bg-success-soft text-success",
  resolved: "bg-success-soft text-success",
};

export function KnowledgeGapTable({ gaps, docs, highlightId, question, onPatch, onRequest }: {
  gaps: KnowledgeGap[]; docs: DocumentSummary[]; highlightId?: string | undefined; question?: string | undefined;
  onPatch: (id: string, patch: GapPatch) => void; onRequest: (g: KnowledgeGap) => void;
}) {
  const { t, loc } = useApp();
  const [open, setOpen] = useState<string | null>(null);
  const hlRef = useRef<HTMLLIElement>(null);
  const target = highlightId ?? gaps.find((g) => gapMatches(g, question))?.id;
  useEffect(() => { if (target) { setOpen(target); hlRef.current?.scrollIntoView({ block: "center" }); } }, [target, gaps.length]);

  const revalidate = (g: KnowledgeGap) => {
    // Mock revalidation: deterministic pass/fail per gap so the flow is reproducible.
    const pass = g.id !== "gap-home-office";
    onPatch(g.id, {
      status: "revalidated",
      revalidation: { result: pass ? "pass" : "fail", note: pass ? "Example questions now return cited answers." : "Example questions still return conflicting passages.", at: new Date().toISOString() },
    });
    toast(pass ? t("revalidationPass") : t("revalidationFail"));
  };

  return (
    <ul className="space-y-2">
      {gaps.map((g) => {
        const isOpen = open === g.id;
        const content = g.cause !== "retrieval_issue";
        return (
          <li key={g.id} ref={g.id === target ? hlRef : undefined}
            className={`rounded-2xl border bg-card transition-shadow ${g.id === target ? "border-primary shadow-raised animate-rise" : ""}`}>
            <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : g.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 p-4 text-left">
              <span className="min-w-40 flex-1">
                <span className="block font-medium">{loc(g.topic)}</span>
                <span className="text-xs text-muted-foreground">{t(`gc_${g.cause}` as DictKey)} · {content ? t("gapKindContent") : t("gapKindRetrieval")}</span>
              </span>
              <span className="text-sm"><strong className="font-display">{g.frequency}</strong> <span className="text-xs text-muted-foreground">{t("inLastDays", { n: g.period_days })}</span></span>
              <span className="hidden text-xs text-muted-foreground md:inline">{g.first_seen} → {g.last_seen}</span>
              <span className="inline-flex items-center gap-1 text-xs"><UserRound className="h-3 w-3 text-muted-foreground" aria-hidden />{g.owner ?? t("unassigned")}</span>
              <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${statusTone[g.status]}`}>{t(`gs_${g.status}` as DictKey)}</span>
              {g.id === target && question && <span className="rounded-full bg-accent px-2 py-0.5 text-[0.7rem] font-medium text-accent-foreground">{t("matchesQuestion")}</span>}
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {isOpen && (
              <div className="space-y-4 border-t p-4 animate-rise">
                <div>
                  <h4 className="mb-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground"><Search className="h-3 w-3" aria-hidden />{t("examples")}</h4>
                  <ul className="space-y-1 text-sm">{g.examples.map((e) => <li key={e} className="rounded-lg bg-surface-sunken px-3 py-1.5">“{e}”</li>)}</ul>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block text-xs"><span className="mb-1 block font-medium text-muted-foreground">{t("cause")}</span>
                    <select value={g.cause} onChange={(e) => onPatch(g.id, { cause: e.target.value as GapCause })} className="w-full rounded-lg border bg-card px-2 py-1.5 text-sm">
                      {causes.map((c) => <option key={c} value={c}>{t(`gc_${c}` as DictKey)}</option>)}
                    </select>
                  </label>
                  <label className="block text-xs"><span className="mb-1 flex items-center gap-1 font-medium text-muted-foreground"><Link2 className="h-3 w-3" aria-hidden />{t("linkDocument")}</span>
                    <select value={g.linked_document_id ?? ""} onChange={(e) => onPatch(g.id, { linked_document_id: e.target.value || null })} className="w-full rounded-lg border bg-card px-2 py-1.5 text-sm">
                      <option value="">{t("selectRelatedDoc")}</option>
                      {docs.map((d) => <option key={d.id} value={d.id}>{d.title} {d.version}</option>)}
                    </select>
                  </label>
                  <label className="block text-xs"><span className="mb-1 flex items-center gap-1 font-medium text-muted-foreground"><UserRound className="h-3 w-3" aria-hidden />{t("assignOwner")}</span>
                    <select value={g.owner ?? ""} onChange={(e) => onPatch(g.id, { owner: e.target.value || null })} className="w-full rounded-lg border bg-card px-2 py-1.5 text-sm">
                      <option value="">{t("unassigned")}</option>
                      {demoOwners.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </label>
                </div>

                {g.revalidation && (
                  <p className={`rounded-lg border p-3 text-xs ${g.revalidation.result === "pass" ? "border-success/40 bg-success-soft text-success" : "border-destructive/40 bg-danger-soft text-destructive"}`}>
                    <strong>{t("revalidationResult")}: </strong>
                    {g.revalidation.result === "pass" ? t("revalidationPass") : t("revalidationFail")} — {g.revalidation.note}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {g.status === "unreviewed" && (
                    <Button size="sm" onClick={() => onPatch(g.id, { status: "cause_identified" })} disabled={g.cause === "unconfirmed"} title={g.cause === "unconfirmed" ? t("cause") : undefined}>
                      {t("markCauseIdentified")}
                    </Button>
                  )}
                  {g.status === "cause_identified" && (
                    <>
                      <Button size="sm" onClick={() => onRequest(g)}><FilePlus2 className="h-3.5 w-3.5" />{t("createRequest")}</Button>
                      <Button size="sm" variant="outline" onClick={() => onPatch(g.id, { status: "action_taken" })}>{t("markActionTaken")}</Button>
                    </>
                  )}
                  {g.status === "action_taken" && (
                    <Button size="sm" onClick={() => revalidate(g)}>{t("runRevalidation")}</Button>
                  )}
                  {g.status === "revalidated" && (
                    <Button size="sm" onClick={() => onPatch(g.id, { status: "resolved" })} disabled={g.revalidation?.result !== "pass"} title={g.revalidation?.result !== "pass" ? t("resolveNeedsRevalidation") : undefined}>
                      {t("resolveGap")}
                    </Button>
                  )}
                  {g.status !== "unreviewed" && (
                    <Button size="sm" variant="ghost" onClick={() => onPatch(g.id, { status: "unreviewed", revalidation: null })}>{t("reopen")}</Button>
                  )}
                </div>
                <p className="text-[0.7rem] text-muted-foreground">{t("reviewVsResolveNote")}</p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
