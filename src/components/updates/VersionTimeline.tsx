import { useApp } from "@/lib/app-context";
import { effectiveState } from "@/lib/onboarding";
import type { PolicyUpdate } from "@/types/api";

export function VersionTimeline({ items }: { items: PolicyUpdate["timeline"] }) {
  const { t } = useApp();
  return (
    <ol className="relative space-y-4 border-l-2 border-border pl-5">
      {items.map((v) => {
        // Status is re-derived from dates so "scheduled" flips to current once effective.
        const status = v.status === "superseded" ? "superseded" : effectiveState(v.date) === "future" ? "scheduled" : "current";
        const dot = status === "current" ? "bg-success" : status === "scheduled" ? "bg-warning" : "bg-muted-foreground/40";
        const label = status === "current" ? t("currentlyEffective") : status === "scheduled" ? t("scheduled") : t("superseded");
        return (
          <li key={v.version} className="relative">
            <span className={`absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full ring-4 ring-card ${dot}`} aria-hidden />
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-sm font-semibold">{v.version}</span>
              <span className="text-xs text-muted-foreground">{v.date}</span>
            </div>
            <div className={`text-xs ${status === "superseded" ? "text-muted-foreground" : status === "current" ? "text-success" : "text-warning"}`}>{label}</div>
          </li>
        );
      })}
    </ol>
  );
}
