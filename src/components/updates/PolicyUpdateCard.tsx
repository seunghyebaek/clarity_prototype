import { Link } from "@tanstack/react-router";
import { ArrowRight, BellRing, CalendarClock } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { effectiveState } from "@/lib/onboarding";
import type { PolicyUpdate } from "@/types/api";
import { EffectiveBadge } from "./EffectiveBadge";

export function PolicyUpdateCard({ update, featured = false }: { update: PolicyUpdate; featured?: boolean }) {
  const { t, loc, lang } = useApp();
  const state = effectiveState(update.effective_date);
  return (
    <article className={`group relative overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-raised ${featured ? "border-warning/40 p-5 shadow-panel" : "p-4"}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {featured && (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 font-semibold text-warning">
            <BellRing className="h-3 w-3" aria-hidden /> {t("featuredUpdate")}
          </span>
        )}
        <span className="text-muted-foreground">{update.department} · {update.country}</span>
        <EffectiveBadge state={state} />
      </div>
      <h3 className={`mt-2 font-display font-semibold leading-snug ${featured ? "text-xl" : "text-base"}`}>{update.title}</h3>
      <p className={`mt-1.5 text-muted-foreground ${featured ? "text-[0.95rem]" : "text-sm"}`}>{loc(update.summary)}</p>
      {lang === "ko" && <p className="mt-1 text-[0.7rem] italic text-muted-foreground">{t("translatedSummary")}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="font-mono"><span className="diff-removed">{update.previous_version}</span> → <span className="diff-added">{update.current_version}</span></span>
        <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" aria-hidden />{t("effective")} {update.effective_date}</span>
        <Link to="/updates/$id" params={{ id: update.id }} className="ml-auto inline-flex items-center gap-1 font-semibold text-primary after:absolute after:inset-0 hover:underline">
          {t("viewUpdate")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
