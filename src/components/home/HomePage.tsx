import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, FileText, GraduationCap, Pin } from "lucide-react";
import { api } from "@/api";
import { useApp } from "@/lib/app-context";
import { progressOf, tasksForProfile } from "@/lib/onboarding";
import { taskChips } from "@/fixtures/chat";
import { pinnedDocumentIds } from "@/fixtures/documents";
import type { DocumentSummary, OnboardingTask, PolicyUpdate } from "@/types/api";
import { QuestionComposer } from "@/components/ask/QuestionComposer";
import { PolicyUpdateCard } from "@/components/updates/PolicyUpdateCard";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { PolicyStatusBadge } from "@/components/documents/PolicyStatusBadge";

export function HomePage() {
  const { t, loc, me, onboarding } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [updates, setUpdates] = useState<PolicyUpdate[]>([]);
  const [docs, setDocs] = useState<DocumentSummary[]>([]);
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);

  useEffect(() => {
    api.listUpdates().then((r) => setUpdates(r.items)).catch(() => {});
    api.listDocuments({}).then((r) => setDocs(r.items)).catch(() => {});
    api.listOnboardingTasks().then((r) => setTasks(r.items)).catch(() => {});
  }, []);

  const myTasks = tasksForProfile(tasks, onboarding.profile);
  const progress = progressOf(myTasks, onboarding.done);
  const nextTask = myTasks.find((x) => !onboarding.done.includes(x.id));
  const pinned = pinnedDocumentIds.map((id) => docs.find((d) => d.id === id)).filter((d): d is DocumentSummary => !!d);
  const recent = [...docs].filter((d) => d.policy_status !== "previous").sort((a, b) => b.effective_date.localeCompare(a.effective_date)).slice(0, 5);
  const [featured, ...otherUpdates] = updates;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <p className="text-sm text-muted-foreground">{t("greeting")}{me ? `, ${me.display_name}` : ""}</p>

      <section aria-labelledby="home-ask" className="mt-2">
        <h1 id="home-ask" className="font-display text-3xl font-semibold tracking-tight md:text-[2.1rem]">{t("homeComposerTitle")}</h1>
        <div className="mt-4 max-w-3xl">
          <QuestionComposer
            id="home-composer"
            size="lg"
            value={q}
            onChange={setQ}
            onSubmit={(v) => v.trim() && navigate({ to: "/ask", search: { q: v.trim(), send: "1" } })}
            footer={
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">{t("quickTasks")}:</span>
                {taskChips.map((c) =>
                  c.to ? (
                    <Link key={c.label} to={c.to} className="rounded-full border border-learn/30 bg-learn-soft px-3 py-1 text-xs font-medium text-learn transition-colors hover:border-learn">
                      {c.label}
                    </Link>
                  ) : (
                    <Link key={c.label} to="/ask" search={{ q: c.q }} className="rounded-full border bg-card px-3 py-1 text-xs font-medium transition-colors hover:border-primary hover:text-primary">
                      {c.label}
                    </Link>
                  ),
                )}
                <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">{t("homeComposerHint")}</span>
              </div>
            }
          />
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {featured && <PolicyUpdateCard update={featured} featured />}

          <section aria-labelledby="recent-h">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 id="recent-h" className="text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">{t("recentlyUpdated")}</h2>
              <Link to="/documents" className="text-xs font-medium text-primary hover:underline">{t("navDocuments")} →</Link>
            </div>
            <ul className="divide-y rounded-2xl border bg-card">
              {recent.map((d) => (
                <li key={d.id}>
                  <Link to="/documents" search={{ doc: d.id }} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-sunken">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="min-w-0 flex-1 truncate">{d.title}</span>
                    <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{d.version}</span>
                    <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">{d.effective_date}</span>
                    <PolicyStatusBadge status={d.policy_status} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {otherUpdates.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {otherUpdates.map((u) => <PolicyUpdateCard key={u.id} update={u} />)}
              <Link to="/updates" className="flex items-center justify-center gap-1 rounded-2xl border border-dashed p-4 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary">
                {t("allUpdates")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <section aria-labelledby="onb-h" className="rounded-2xl bg-learn-soft p-5">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-learn" aria-hidden />
              <h2 id="onb-h" className="font-display font-semibold text-learn">{t("yourOnboarding")}</h2>
            </div>
            <div className="mt-3">
              <ProgressBar completed={progress.completed} total={progress.total} tone="learn" />
            </div>
            {nextTask && (
              <p className="mt-3 text-sm">
                <span className="text-muted-foreground">→ </span>{loc(nextTask.title)}
              </p>
            )}
            <Link to="/onboarding" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-learn hover:underline">
              {t("continueOnboarding")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>

          <section aria-labelledby="pin-h">
            <h2 id="pin-h" className="mb-2 flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
              <Pin className="h-3 w-3" aria-hidden /> {t("pinnedDocs")}
            </h2>
            <ul className="space-y-2">
              {pinned.map((d) => (
                <li key={d.id}>
                  <Link to="/documents" search={{ doc: d.id }} className="flex items-start gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-primary">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"><FileText className="h-4 w-4" aria-hidden /></span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{d.title}</span>
                      <span className="text-xs text-muted-foreground">{d.department} · {d.version}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
