import { useState } from "react";
import { ChevronDown, RotateCcw, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-context";
import { resetDemoRecords } from "@/api/mock";
import { DEMO_TODAY } from "@/lib/demo-date";

// Only rendered in mock mode. "Demo role preview" — not authentication or authorization.
export function SimulationPanel() {
  const { t, persona, setPersona } = useApp();
  const [open, setOpen] = useState(false);
  const sel = "w-full rounded-md border border-sidebar-border bg-sidebar-accent px-2 py-1.5 text-sidebar-accent-foreground";

  const reset = () => {
    resetDemoRecords();
    localStorage.removeItem("clarity.demo.onboarding.v1");
    toast.success(t("resetDemoDone"));
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <div className="rounded-xl border border-dashed border-sidebar-border text-xs">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 px-3 py-2.5 font-semibold text-sidebar-primary"
      >
        <Settings2 className="h-3.5 w-3.5" aria-hidden />
        {t("demoSettings")}
        <ChevronDown className={`ml-auto h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div className="space-y-2.5 border-t border-sidebar-border p-3">
          <label className="block">
            <span className="mb-1 block text-sidebar-foreground">{t("persona")}</span>
            <select value={persona} onChange={(e) => setPersona(e.target.value as typeof persona)} className={sel}>
              <option value="employee">{t("personaEmployee")}</option>
              <option value="admin">{t("personaAdmin")}</option>
            </select>
          </label>
          <button
            type="button"
            onClick={reset}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-sidebar-border px-2 py-1.5 font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> {t("resetDemoData")}
          </button>
          <p className="text-[11px] leading-snug text-sidebar-foreground/70">
            {t("demoDate")}: <span className="font-mono">{DEMO_TODAY}</span>
          </p>
        </div>
      )}
    </div>
  );
}
