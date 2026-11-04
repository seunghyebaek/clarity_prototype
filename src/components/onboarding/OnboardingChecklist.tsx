import { Link } from "@tanstack/react-router";
import { CalendarDays, Check, FileText, MessageSquare } from "lucide-react";
import { useApp } from "@/lib/app-context";
import type { OnboardingPhase, OnboardingTask } from "@/types/api";
import type { DictKey } from "@/i18n/en";

const phases: OnboardingPhase[] = ["day", "week", "month"];

export function OnboardingChecklist({ tasks, done, onToggle }: { tasks: OnboardingTask[]; done: string[]; onToggle: (id: string) => void }) {
  const { t, loc } = useApp();
  return (
    <div className="space-y-8">
      {phases.map((p, pi) => {
        const items = tasks.filter((x) => x.phase === p);
        if (!items.length) return null;
        const n = items.filter((x) => done.includes(x.id)).length;
        return (
          <section key={p} aria-labelledby={`ph-${p}`}>
            <div className="mb-3 flex items-baseline gap-3">
              <span className="font-display text-sm font-bold text-learn">0{pi + 1}</span>
              <h2 id={`ph-${p}`} className="font-display text-lg font-semibold">{t(`phase_${p}` as DictKey)}</h2>
              <span className="text-xs text-muted-foreground">{n}/{items.length}</span>
            </div>
            <ul className="space-y-2">
              {items.map((task) => {
                const isDone = done.includes(task.id);
                return (
                  <li key={task.id} className={`flex gap-4 rounded-2xl border p-4 transition-colors ${isDone ? "border-success/30 bg-success-soft/50" : "bg-card"}`}>
                    <button type="button" role="checkbox" aria-checked={isDone} aria-label={`${t("markComplete")}: ${loc(task.title)}`} onClick={() => onToggle(task.id)}
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${isDone ? "border-success bg-success text-primary-foreground" : "border-input hover:border-learn"}`}>
                      {isDone && <Check className="h-4 w-4" aria-hidden />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`font-medium ${isDone ? "text-muted-foreground line-through" : ""}`}>{loc(task.title)}</h3>
                        {isDone && <span className="text-xs font-medium text-success">{t("completed")}</span>}
                        {task.due && <span className="inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2 py-0.5 text-[0.7rem] text-muted-foreground"><CalendarDays className="h-3 w-3" aria-hidden />{t("due")}: {loc(task.due)}</span>}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{loc(task.description)}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                        {task.documents.map((d) => (
                          <Link key={d.id} to="/documents" search={{ doc: d.id }} className="inline-flex items-center gap-1 text-foreground hover:text-primary hover:underline">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />{d.title}
                          </Link>
                        ))}
                        <Link to="/ask" search={{ q: task.ask_question, from: "onboarding" }} className="inline-flex items-center gap-1 font-medium text-learn hover:underline">
                          <MessageSquare className="h-3.5 w-3.5" aria-hidden />{t("askStep")}
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
