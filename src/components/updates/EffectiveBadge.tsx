import { CircleCheck, Clock } from "lucide-react";
import { useApp } from "@/lib/app-context";

export function EffectiveBadge({ state }: { state: "current" | "future" }) {
  const { t } = useApp();
  return state === "future" ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning-soft px-2 py-0.5 text-[0.7rem] font-medium text-warning">
      <Clock className="h-3 w-3" aria-hidden /> {t("futureNotEffective")}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success-soft px-2 py-0.5 text-[0.7rem] font-medium text-success">
      <CircleCheck className="h-3 w-3" aria-hidden /> {t("currentlyEffective")}
    </span>
  );
}
