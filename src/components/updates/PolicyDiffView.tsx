import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useApp } from "@/lib/app-context";
import type { PolicyUpdate } from "@/types/api";

type Mode = "split" | "inline";

/** Original policy text diff. Added/removed text is labeled with icons and screen-reader text, not just color. */
export function PolicyDiffView({ changes, previous, current }: { changes: PolicyUpdate["changes"]; previous: string; current: string }) {
  const { t } = useApp();
  const [mode, setMode] = useState<Mode>("split");
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
        <div role="group" aria-label={t("viewChanged")} className="inline-flex rounded-lg border bg-card p-0.5">
          {(["split", "inline"] as const).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}
              className={`rounded-md px-2.5 py-1 font-medium ${mode === m ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
              {m === "split" ? `${t("before")} / ${t("after")}` : "Inline"}
            </button>
          ))}
        </div>
        <span className="inline-flex items-center gap-1"><span className="diff-added inline-flex items-center"><Plus className="h-3 w-3" aria-hidden /></span>{t("added")}</span>
        <span className="inline-flex items-center gap-1"><span className="diff-removed inline-flex items-center"><Minus className="h-3 w-3" aria-hidden /></span>{t("removed")}</span>
      </div>
      <div className="space-y-4">
        {changes.map((c) => (
          <section key={c.id} id={`change-${c.id}`} className="scroll-mt-20 overflow-hidden rounded-xl border bg-card">
            <h4 className="border-b bg-surface-sunken px-4 py-2 text-xs font-semibold">{c.section}</h4>
            {mode === "split" ? (
              <div className="grid md:grid-cols-2 md:divide-x">
                <div className="p-4">
                  <div className="mb-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-destructive">{t("before")} · {previous}</div>
                  <p className="text-sm leading-relaxed" lang="en">
                    {c.segments.filter((s) => s.type !== "added").map((s, i) => s.type === "removed"
                      ? <del key={i} className="diff-removed"><span className="sr-only">[{t("removed")}] </span>{s.text}</del>
                      : <span key={i}>{s.text}</span>)}
                  </p>
                </div>
                <div className="border-t p-4 md:border-t-0">
                  <div className="mb-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-success">{t("after")} · {current}</div>
                  <p className="text-sm leading-relaxed" lang="en">
                    {c.segments.filter((s) => s.type !== "removed").map((s, i) => s.type === "added"
                      ? <ins key={i} className="diff-added"><span className="sr-only">[{t("added")}] </span>{s.text}</ins>
                      : <span key={i}>{s.text}</span>)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="p-4 text-sm leading-relaxed" lang="en">
                {c.segments.map((s, i) =>
                  s.type === "added" ? <ins key={i} className="diff-added"><span className="sr-only">[{t("added")}] </span>{s.text}</ins>
                  : s.type === "removed" ? <del key={i} className="diff-removed"><span className="sr-only">[{t("removed")}] </span>{s.text}</del>
                  : <span key={i}>{s.text}</span>)}
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
