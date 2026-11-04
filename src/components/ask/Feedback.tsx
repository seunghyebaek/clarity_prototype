import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { api } from "@/api";
import { errorMessageKey, useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { DictKey } from "@/i18n/en";

const cats: { v: string; k: DictKey }[] = [
  { v: "incorrect", k: "catIncorrect" }, { v: "outdated", k: "catOutdated" }, { v: "missing", k: "catMissing" },
  { v: "citation", k: "catCitation" }, { v: "other", k: "catOther" },
];

export function Feedback({ runId }: { runId: string }) {
  const { t } = useApp();
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [category, setCategory] = useState("");
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [err, setErr] = useState<DictKey | null>(null);

  const submit = async (r: "up" | "down") => {
    setState("saving");
    try {
      await api.sendFeedback({ run_id: runId, rating: r, category: category || null, comment: comment.trim() || null });
      setState("saved");
    } catch (e) {
      setErr(errorMessageKey(e));
      setState("error");
    }
  };

  if (state === "saved") return <p role="status" className="text-xs text-success">{t("feedbackThanks")}</p>;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" aria-pressed={rating === "up"} aria-label={t("helpful")} disabled={state === "saving"}
          onClick={() => { setRating("up"); submit("up"); }}>
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" aria-pressed={rating === "down"} aria-label={t("notHelpful")} disabled={state === "saving"}
          onClick={() => setRating("down")}>
          <ThumbsDown className="h-4 w-4" />
        </Button>
      </div>
      {rating === "down" && (
        <div className="space-y-2 rounded-md border bg-muted p-3">
          <label className="block text-xs">
            <span className="mb-1 block text-muted-foreground">{t("feedbackCategory")}</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded border bg-card px-2 py-1.5 text-sm">
              <option value="">—</option>
              {cats.map((c) => <option key={c.v} value={c.v}>{t(c.k)}</option>)}
            </select>
          </label>
          <label className="block text-xs">
            <span className="mb-1 block text-muted-foreground">{t("feedbackComment")}</span>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} maxLength={1000} className="bg-card" />
          </label>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => submit("down")} disabled={state === "saving"}>{t("submitFeedback")}</Button>
            <Button size="sm" variant="ghost" onClick={() => setRating(null)}>{t("cancel")}</Button>
          </div>
        </div>
      )}
      {state === "error" && err && <p role="alert" className="text-xs text-destructive">{t(err)}</p>}
    </div>
  );
}
