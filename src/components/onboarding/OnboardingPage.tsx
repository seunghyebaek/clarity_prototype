import { useEffect, useState } from "react";
import { Info, RotateCcw } from "lucide-react";
import { api } from "@/api";
import { errorMessageKey, useApp } from "@/lib/app-context";
import { progressOf, tasksForProfile } from "@/lib/onboarding";
import { onboardingOptions } from "@/fixtures/workspace";
import type { OnboardingTask } from "@/types/api";
import type { DictKey } from "@/i18n/en";
import { Button } from "@/components/ui/button";
import { OnboardingChecklist } from "./OnboardingChecklist";
import { ProgressBar } from "./ProgressBar";

export function OnboardingPage() {
  const { t, onboarding, setOnboardingProfile, toggleTask, resetOnboarding } = useApp();
  const [tasks, setTasks] = useState<OnboardingTask[] | null>(null);
  const [err, setErr] = useState<DictKey | null>(null);
  useEffect(() => { api.listOnboardingTasks().then((r) => setTasks(r.items)).catch((e) => setErr(errorMessageKey(e))); }, []);

  const mine = tasksForProfile(tasks ?? [], onboarding.profile);
  const p = progressOf(mine, onboarding.done);
  const sel = "w-full rounded-lg border bg-card px-2 py-2 text-sm";
  const field = (k: "country" | "department" | "role", label: DictKey) => (
    <label className="block text-xs">
      <span className="mb-1 block font-medium text-muted-foreground">{t(label)}</span>
      <select className={sel} value={onboarding.profile[k]} onChange={(e) => setOnboardingProfile({ ...onboarding.profile, [k]: e.target.value })}>
        {onboardingOptions[k].map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">{t("onboardingHeading")}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{t("onboardingSub")}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_17rem]">
        <div className="order-2 lg:order-1">
          {err && <p role="alert" className="text-destructive">{t(err)}</p>}
          {!err && !tasks && <p className="text-muted-foreground">{t("loading")}</p>}
          {tasks && <OnboardingChecklist tasks={mine} done={onboarding.done} onToggle={(id) => toggleTask(id)} />}
        </div>
        <aside className="order-1 space-y-4 lg:order-2">
          <div className="rounded-2xl bg-learn-soft p-5">
            <ProgressBar completed={p.completed} total={p.total} tone="learn" />
            <p className="mt-3 text-[0.7rem] text-muted-foreground">{t("selfReportedNote")}</p>
            <p className="mt-1 text-[0.7rem] text-muted-foreground">{t("progressNote")}</p>
            <Button variant="ghost" size="sm" className="mt-1 -ml-2 text-learn" onClick={resetOnboarding}>
              <RotateCcw className="h-3.5 w-3.5" /> {t("resetProgress")}
            </Button>
          </div>
          <div className="space-y-3 rounded-2xl border bg-card p-5">
            {field("country", "country")}
            {field("department", "department")}
            {field("role", "role")}
            <p className="flex gap-1.5 text-[0.7rem] text-muted-foreground"><Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />{t("profileNote")}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
