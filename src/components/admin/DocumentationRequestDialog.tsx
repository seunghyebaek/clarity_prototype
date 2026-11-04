import { useEffect, useState } from "react";
import { api } from "@/api";
import { errorMessageKey, useApp } from "@/lib/app-context";
import { demoOwners } from "@/fixtures/workspace";
import type { DocRequestPriority, KnowledgeGap } from "@/types/api";
import type { DictKey } from "@/i18n/en";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const priorities: DocRequestPriority[] = ["low", "medium", "high"];

export function DocumentationRequestDialog({ gap, onClose, onSaved }: { gap: KnowledgeGap | null; onClose: () => void; onSaved: () => void }) {
  const { t, loc } = useApp();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [owner, setOwner] = useState(demoOwners[0]!);
  const [priority, setPriority] = useState<DocRequestPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [err, setErr] = useState<DictKey | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!gap) return;
    setTitle(`Document policy: ${gap.topic.en}`);
    setDetails(`Employees asked ${gap.frequency} times in the last ${gap.period_days} days.\n\nPlease confirm whether a policy exists or should be written.`);
    setOwner(gap.owner ?? demoOwners[0]!);
    setPriority(gap.frequency >= 10 ? "high" : "medium");
    setDueDate("");
    setErr(null);
  }, [gap]);

  const save = async () => {
    if (!gap) return;
    if (!title.trim()) { setErr("errRequired"); return; }
    setSaving(true);
    try {
      await api.createDocumentationRequest({
        gap_id: gap.id, title: title.trim(), details, examples: gap.examples,
        owner, priority, due_date: dueDate || null, status: "draft",
      });
      onSaved();
    } catch (e) { setErr(errorMessageKey(e)); } finally { setSaving(false); }
  };

  return (
    <Dialog open={!!gap} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{t("requestDialogTitle")}</DialogTitle>
          <DialogDescription>{gap && loc(gap.topic)} · {t("requestDialogNote")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <label className="block text-xs"><span className="mb-1 block font-medium text-muted-foreground">{t("requestTitle")}</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={err === "errRequired"} />
          </label>
          <label className="block text-xs"><span className="mb-1 block font-medium text-muted-foreground">{t("requestDetails")}</span>
            <Textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={5} />
          </label>
          {gap && gap.examples.length > 0 && (
            <div className="text-xs">
              <span className="mb-1 block font-medium text-muted-foreground">{t("examples")}</span>
              <ul className="space-y-1">{gap.examples.map((e) => <li key={e} className="rounded-lg bg-surface-sunken px-3 py-1.5">“{e}”</li>)}</ul>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-xs"><span className="mb-1 block font-medium text-muted-foreground">{t("owner")}</span>
              <select value={owner} onChange={(e) => setOwner(e.target.value)} className="w-full rounded-lg border bg-card px-2 py-2 text-sm">
                {demoOwners.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="block text-xs"><span className="mb-1 block font-medium text-muted-foreground">{t("priority")}</span>
              <select value={priority} onChange={(e) => setPriority(e.target.value as DocRequestPriority)} className="w-full rounded-lg border bg-card px-2 py-2 text-sm">
                {priorities.map((p) => <option key={p} value={p}>{t(`pri_${p}` as DictKey)}</option>)}
              </select>
            </label>
            <label className="block text-xs"><span className="mb-1 block font-medium text-muted-foreground">{t("dueDate")}</span>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-card" />
            </label>
          </div>
          {err && <p role="alert" className="text-xs text-destructive">{t(err)}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>{t("cancel")}</Button>
          <Button onClick={save} disabled={saving}>{t("saveDraft")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
