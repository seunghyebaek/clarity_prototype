import { useApp } from "@/lib/app-context";

export function ProgressBar({ completed, total, tone = "primary" }: { completed: number; total: number; tone?: "primary" | "learn" }) {
  const { t } = useApp();
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span><strong className="font-display text-lg">{completed}</strong> <span className="text-muted-foreground">{t("ofTasks")} {total} {t("tasksLabel")}</span></span>
      </div>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed} aria-label={t("yourOnboarding")}
        className="h-2 overflow-hidden rounded-full bg-card">
        <div className={`h-full rounded-full transition-[width] duration-500 ${tone === "learn" ? "bg-learn" : "bg-primary"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
