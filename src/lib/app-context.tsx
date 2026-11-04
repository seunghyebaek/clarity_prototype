import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { en, type DictKey } from "@/i18n/en";
import { ko } from "@/i18n/ko";
import type { Citation, Localized, Me, ResponseLanguage } from "@/types/api";
import { api } from "@/api";
import { simulation, type SimulatedPersona } from "@/api/mock";
import { ApiError } from "@/types/api";
import { onboardingOptions } from "@/fixtures/workspace";

export type UiLang = "en" | "ko";

export interface OnboardingProfile {
  country: string;
  department: string;
  role: string;
}

interface AppCtx {
  lang: UiLang;
  setLang: (l: UiLang) => void;
  t: (k: DictKey, vars?: Record<string, string | number>) => string;
  loc: (v: Localized) => string;
  answerLang: ResponseLanguage;
  setAnswerLang: (l: ResponseLanguage) => void;
  me: Me | null;
  isAdmin: boolean;
  persona: SimulatedPersona;
  setPersona: (p: SimulatedPersona) => void;
  source: { citations: Citation[]; activeId: string } | null;
  openSource: (citations: Citation[], activeId: string) => void;
  closeSource: () => void;
  onboarding: { profile: OnboardingProfile; done: string[] };
  setOnboardingProfile: (p: OnboardingProfile) => void;
  toggleTask: (id: string, value?: boolean) => void;
  resetOnboarding: () => void;
}

// Keep one context instance across hot reloads so providers and consumers always match.
const g = globalThis as unknown as { __clarityAppCtx?: React.Context<AppCtx | null> };
const Ctx = g.__clarityAppCtx ?? (g.__clarityAppCtx = createContext<AppCtx | null>(null));
const ONBOARDING_KEY = "clarity.demo.onboarding.v1";
// Guided demo flows were removed; any stale selection saved under these keys is cleared on load.
const LEGACY_SCENARIO_KEYS = ["clarity.demo.scenario.v1", "clarity.demo.scenario", "clarity.scenario"];
const defaultOnboarding = {
  profile: { country: onboardingOptions.country[0]!, department: onboardingOptions.department[0]!, role: onboardingOptions.role[0]! },
  done: [] as string[],
};

export function errorMessageKey(e: unknown): DictKey {
  const code = e instanceof ApiError ? e.code : "network_error";
  if (code === "network_error") return "errNetwork";
  if (code === "rate_limited") return "errRate";
  if (code === "session_expired") return "errSession";
  if (code === "forbidden") return "errForbidden";
  return "errGeneric";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<UiLang>("en");
  const [answerLang, setAnswerLang] = useState<ResponseLanguage>("auto");
  const [me, setMe] = useState<Me | null>(null);
  const [persona, setPersonaState] = useState<SimulatedPersona>(simulation.persona);
  const [source, setSource] = useState<AppCtx["source"]>(null);
  const [onboarding, setOnboarding] = useState(defaultOnboarding);

  // Non-sensitive preferences/demo progress only. Never used for authorization.
  useEffect(() => {
    try { for (const k of LEGACY_SCENARIO_KEYS) localStorage.removeItem(k); } catch { /* ignore */ }
    const saved = localStorage.getItem("clarity.lang");
    if (saved === "en" || saved === "ko") setLangState(saved);
    try {
      const o = JSON.parse(localStorage.getItem(ONBOARDING_KEY) ?? "null");
      if (o && Array.isArray(o.done) && o.profile) setOnboarding({ profile: { ...defaultOnboarding.profile, ...o.profile }, done: o.done.filter((x: unknown) => typeof x === "string") });
    } catch { /* ignore corrupt demo state */ }
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { api.getMe().then(setMe).catch(() => setMe(null)); }, [persona]);

  const saveOnboarding = (o: typeof onboarding) => {
    setOnboarding(o);
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(o));
  };

  const setLang = (l: UiLang) => { setLangState(l); localStorage.setItem("clarity.lang", l); };
  const setPersona = (p: SimulatedPersona) => { simulation.persona = p; setPersonaState(p); };
  const t = useCallback((k: DictKey, vars?: Record<string, string | number>) => {
    let s = (lang === "ko" ? ko : en)[k];
    if (vars) for (const [vk, vv] of Object.entries(vars)) s = s.replace(`{${vk}}`, String(vv));
    return s;
  }, [lang]);
  const loc = useCallback((v: Localized) => v[lang], [lang]);

  return (
    <Ctx.Provider
      value={{
        lang, setLang, t, loc, answerLang, setAnswerLang, me,
        isAdmin: me?.capabilities.includes("admin:view") ?? false,
        persona, setPersona, source,
        openSource: (citations, activeId) => setSource({ citations, activeId }),
        closeSource: () => setSource(null),
        onboarding,
        setOnboardingProfile: (profile) => saveOnboarding({ ...onboarding, profile }),
        toggleTask: (id, value) => {
          const has = onboarding.done.includes(id);
          const next = value ?? !has;
          saveOnboarding({ ...onboarding, done: next ? [...new Set([...onboarding.done, id])] : onboarding.done.filter((x) => x !== id) });
        },
        resetOnboarding: () => saveOnboarding(defaultOnboarding),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp outside AppProvider");
  return c;
}
