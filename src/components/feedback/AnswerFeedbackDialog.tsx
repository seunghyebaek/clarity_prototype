import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { api } from "@/api";
import { errorMessageKey, useApp } from "@/lib/app-context";
import type { Citation, FeedbackCategory } from "@/types/api";
import type { DictKey } from "@/i18n/en";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

/** Categories offered in the report dialog (per product spec). */
export const feedbackCategories: FeedbackCategory[] = ["incorrect", "outdated", "unsupported_citation", "other"];

export function AnswerFeedbackDialog({ open, onOpenChange, excerpt, runId, question, citations = [] }: {
  open: boolean; onOpenChange: (o: boolean) => void; excerpt: string; runId: string; question: string;
  citations?: Citation[];
}) {
  const { t } = useApp();
  const [category, setCategory] = useState<FeedbackCategory | "">("");
  const [comment, setComment] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [err, setErr] = useState<DictKey | null>(null);

  useEffect(() => { if (open) { setCategory(""); setComment(""); setSourceId(""); setState("idle"); setErr(null); } }, [open, excerpt]);

  const submit = async () => {
    if (!category) { setErr("chooseCategory"); return; }
    setState("saving"); setErr(null);
    const source = citations.find((c) => c.id === sourceId);
    try {
      await api.reportPassage({
        run_id: runId, excerpt, category, comment: comment.trim() || null, question,
        document_title: source?.title ?? null, document_version: source?.version ?? null,
      });
      setState("saved");
    } catch (e) {
      setErr(errorMessageKey(e)); setState("idle");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{t("reportTitle")}</DialogTitle>
          <DialogDescription className="sr-only">{t("reportIssue")}</DialogDescription>
        </DialogHeader>
        {state === "saved" ? (
          <div role="status" className="flex items-start gap-3 rounded-xl bg-success-soft p-4 text-sm animate-rise">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden />
            <p>{t("reportThanks")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">{t("reportedPassage")}</div>
              <blockquote className="max-h-32 overflow-y-auto rounded-lg border-l-2 border-destructive bg-surface-sunken px-3 py-2 text-sm">{excerpt}</blockquote>
            </div>
            <fieldset>
              <legend className="mb-1.5 text-xs font-medium text-muted-foreground">{t("reportCategory")}</legend>
              <div className="flex flex-wrap gap-1.5">
                {feedbackCategories.map((c) => (
                  <label key={c} className={`cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${category === c ? "border-primary bg-accent font-medium text-accent-foreground" : "hover:border-primary"}`}>
                    <input type="radio" name="fc" value={c} checked={category === c} onChange={() => setCategory(c)} className="sr-only" />
                    {t(`fc_${c}` as DictKey)}
                  </label>
                ))}
              </div>
            </fieldset>
            {citations.length > 0 && (
              <label className="block text-xs">
                <span className="mb-1 block font-medium text-muted-foreground">{t("reportSource")}</span>
                <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} className="w-full rounded-md border bg-card px-2 py-2 text-sm">
                  <option value="">{t("noSpecificSource")}</option>
                  {citations.map((c) => <option key={c.id} value={c.id}>[{c.id}] {c.title} · {c.version}</option>)}
                </select>
              </label>
            )}
            <label className="block text-xs">
              <span className="mb-1 block font-medium text-muted-foreground">{t("feedbackComment")}</span>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} maxLength={1000} />
            </label>
            {err && <p role="alert" className="text-xs text-destructive">{t(err)}</p>}
          </div>
        )}
        <DialogFooter>
          {state === "saved" ? (
            <Button onClick={() => onOpenChange(false)}>OK</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
              <Button onClick={submit} disabled={state === "saving"}>{t("submit")}</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
