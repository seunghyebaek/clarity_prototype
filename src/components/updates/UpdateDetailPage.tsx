import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Info, MessageSquare, ScrollText, Sparkles } from "lucide-react";
import { api } from "@/api";
import { errorMessageKey, useApp } from "@/lib/app-context";
import { effectiveState } from "@/lib/onboarding";
import type { PolicyUpdate } from "@/types/api";
import type { DictKey } from "@/i18n/en";
import { Button } from "@/components/ui/button";
import { PolicyDiffView } from "./PolicyDiffView";
import { VersionTimeline } from "./VersionTimeline";
import { EffectiveBadge } from "./EffectiveBadge";

export function UpdateDetailPage({ id }: { id: string }) {
  const { t, loc, lang } = useApp();
  const [u, setU] = useState<PolicyUpdate | null>(null);
  const [err, setErr] = useState<DictKey | null>(null);
  useEffect(() => { setU(null); api.getUpdate(id).then(setU).catch((e) => setErr(errorMessageKey(e))); }, [id]);

  if (err) return <p role="alert" className="p-8 text-destructive">{t(err)}</p>;
  if (!u) return <p className="p-8 text-muted-foreground">{t("loading")}</p>;
  const state = effectiveState(u.effective_date);
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
      <Link to="/updates" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("updatesHeading")}
      </Link>

      <header className="mt-3 flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{u.department} · {u.country}</span>
            <EffectiveBadge state={state} />
          </div>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight md:text-3xl">{u.title}</h1>
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <div><dt className="inline text-muted-foreground">{t("previousVersion")}: </dt><dd className="inline font-mono">{u.previous_version}</dd></div>
            <div><dt className="inline text-muted-foreground">{t("currentVersion")}: </dt><dd className="inline font-mono">{u.current_version}</dd></div>
            <div><dt className="inline text-muted-foreground">{t("published")}: </dt><dd className="inline">{u.published_at}</dd></div>
            <div><dt className="inline text-muted-foreground">{t("effective")}: </dt><dd className="inline font-semibold">{u.effective_date}</dd></div>
          </dl>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => document.getElementById("changes")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })}>
            <ScrollText className="h-4 w-4" /> {t("viewChanged")}
          </Button>
          <Button asChild>
            <Link to="/ask" search={{ q: loc(u.suggested_question), context: u.id }}><MessageSquare className="h-4 w-4" /> {t("askAboutUpdate")}</Link>
          </Button>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_16rem]">
        <div className="space-y-6">
          <section className="rounded-2xl border bg-card p-5">
            <h2 className="text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">{t("changeSummary")}</h2>
            <p className="mt-1.5 text-[0.95rem]">{loc(u.summary)}</p>
            {lang === "ko" && <p className="mt-1 text-[0.7rem] italic text-muted-foreground">{t("translatedSummary")}</p>}
            <div className="mt-4 rounded-xl border border-learn/30 bg-learn-soft p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-learn"><Sparkles className="h-3.5 w-3.5" aria-hidden /> {t("aiExplanation")}</div>
              <p className="mt-1.5 text-sm">{loc(u.explanation)}</p>
              <p className="mt-2 text-[0.7rem] text-muted-foreground">{t("aiExplanationNote")}</p>
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-surface-sunken p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {t("applicability")}
            </p>
          </section>

          <section id="changes" className="scroll-mt-16">
            <h2 className="mb-1 font-display text-lg font-semibold">{t("originalText")}</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              {u.previous_version}: {t("currentlyEffective")} → {u.current_version}: {state === "future" ? `${t("futureNotEffective")} (${u.effective_date})` : t("currentlyEffective")}
            </p>
            <PolicyDiffView changes={u.changes} previous={u.previous_version} current={u.current_version} />
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border bg-card p-5">
            <h2 className="mb-4 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">{t("versionTimeline")}</h2>
            <VersionTimeline items={u.timeline} />
          </section>
          <section>
            <h2 className="mb-2 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">{t("originalSources")}</h2>
            <ul className="space-y-1.5">
              {u.source_links.map((s) => (
                <li key={s.document_id}>
                  <Link to="/documents" search={{ doc: s.document_id }} className="block rounded-lg border bg-card px-3 py-2 text-sm hover:border-primary">
                    <span className="font-mono text-xs text-primary">{s.label}</span>
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
