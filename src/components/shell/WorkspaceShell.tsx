import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Activity, BellRing, FileText, FlaskConical, GraduationCap, Home, Menu, MessageSquare, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { isMock } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EvidenceDrawer } from "@/components/evidence/EvidenceDrawer";
import { SimulationPanel } from "./SimulationPanel";
import { BrandMark } from "./BrandMark";
import { useIsMobile } from "@/hooks/use-mobile";
import type { DictKey } from "@/i18n/en";

type NavTo = "/" | "/ask" | "/documents" | "/updates" | "/onboarding" | "/knowledge-health" | "/evaluations";
const employeeNav: { to: NavTo; key: DictKey; icon: typeof MessageSquare }[] = [
  { to: "/", key: "navHome", icon: Home },
  { to: "/ask", key: "navAsk", icon: MessageSquare },
  { to: "/documents", key: "navDocuments", icon: FileText },
  { to: "/updates", key: "navUpdates", icon: BellRing },
  { to: "/onboarding", key: "navOnboarding", icon: GraduationCap },
];
const adminNav: typeof employeeNav = [
  { to: "/knowledge-health", key: "navHealth", icon: Activity },
  { to: "/evaluations", key: "navEvaluations", icon: FlaskConical },
];

const SIDEBAR_KEY = "clarity.ui.sidebarCollapsed";

function NavGroup({ items, collapsed, onNavigate }: { items: typeof employeeNav; collapsed: boolean; onNavigate?: (() => void) | undefined }) {
  const { t } = useApp();
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map(({ to, key, icon: Icon }) => (
        <li key={to}>
          <Link
            to={to}
            onClick={onNavigate}
            activeOptions={{ exact: to === "/" }}
            title={collapsed ? t(key) : undefined}
            className={`group flex items-center gap-3 rounded-lg py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${collapsed ? "justify-center px-2" : "px-3"}`}
            activeProps={{ className: "bg-sidebar-accent font-medium text-sidebar-accent-foreground", "aria-current": "page" }}
          >
            <Icon className="h-4 w-4 shrink-0 group-aria-[current=page]:text-sidebar-primary" aria-hidden />
            {!collapsed && t(key)}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SidebarBody({ collapsed, onToggleCollapse, onNavigate }: { collapsed: boolean; onToggleCollapse?: (() => void) | undefined; onNavigate?: (() => void) | undefined }) {
  const { t, isAdmin } = useApp();
  return (
    <div className={`flex h-full flex-col gap-6 overflow-y-auto ${collapsed ? "p-2" : "p-4"}`}>
      <div className={`flex items-center ${collapsed ? "flex-col gap-2" : "gap-2.5"}`}>
        <Link to="/" onClick={onNavigate} className="flex min-w-0 items-center gap-2.5 rounded-lg px-1 py-1">
          <BrandMark />
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-display text-lg font-semibold text-sidebar-accent-foreground">{t("appName")}</div>
              <div className="text-[0.7rem] text-sidebar-foreground">{t("appTagline")}</div>
            </div>
          )}
        </Link>
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
            className={`h-7 w-7 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${collapsed ? "" : "ml-auto"}`}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        )}
      </div>
      <nav aria-label="Primary" className="space-y-5">
        <NavGroup items={employeeNav} collapsed={collapsed} onNavigate={onNavigate} />
        {isAdmin && (
          <div>
            {!collapsed && <div className="mb-1.5 px-3 text-[0.68rem] font-semibold uppercase tracking-wider text-sidebar-foreground/70">{t("navAdmin")}</div>}
            <NavGroup items={adminNav} collapsed={collapsed} onNavigate={onNavigate} />
          </div>
        )}
      </nav>
      <div className="mt-auto space-y-3">
        {isMock && !collapsed && <SimulationPanel />}
        {!collapsed && <p className="px-1 text-[0.7rem] text-sidebar-foreground/80">{t("fictionalCorpus")}</p>}
      </div>
    </div>
  );
}

function LangToggle() {
  const { lang, setLang, t } = useApp();
  return (
    <div role="group" aria-label={t("interfaceLanguage")} className="inline-flex rounded-lg border bg-card p-0.5">
      {(["en", "ko"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${lang === l ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
        >
          {l === "en" ? "EN" : "KR"}
        </button>
      ))}
    </div>
  );
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const { t, source, closeSource } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === "1"; } catch { return false; }
  });
  const isMobile = useIsMobile();

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try { localStorage.setItem(SIDEBAR_KEY, c ? "0" : "1"); } catch { /* ignore */ }
      return !c;
    });
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside className={`hidden shrink-0 bg-sidebar transition-[width] duration-200 md:block ${collapsed ? "w-16" : "w-60"}`}>
        <SidebarBody collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
      </aside>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 border-0 bg-sidebar p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{t("appName")}</SheetTitle>
            <SheetDescription>{t("appTagline")}</SheetDescription>
          </SheetHeader>
          <SidebarBody collapsed={false} onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label={t("openMenu")} onClick={() => setMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-display font-semibold md:hidden">{t("appName")}</span>
          <p className="hidden text-sm text-muted-foreground md:block">{t("productLine")}</p>
          <div className="ml-auto flex items-center gap-2">
            {isMock ? (
              <Badge variant="outline" className="gap-1.5 border-warning bg-warning-soft text-warning">
                <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />{t("demoBadge")}
              </Badge>
            ) : (
              <Badge variant="outline" className="border-success bg-success-soft text-success">{t("apiBadge")}</Badge>
            )}
            <LangToggle />
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <main id="main" className="relative min-w-0 flex-1 overflow-y-auto">
            {children}
          </main>
          {!isMobile && source && (
            <aside aria-label={t("sources")} className="flex w-[26rem] shrink-0 animate-in slide-in-from-right-8 fade-in flex-col border-l bg-card duration-200">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="text-sm font-semibold">{t("sources")}</h2>
                <Button variant="ghost" size="icon" aria-label={t("closeSources")} onClick={closeSource}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <EvidenceDrawer />
            </aside>
          )}
        </div>
      </div>

      {isMobile && (
        <Sheet open={!!source} onOpenChange={(o) => !o && closeSource()}>
          <SheetContent side="bottom" className="flex max-h-[85dvh] flex-col p-0">
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle className="text-sm">{t("sources")}</SheetTitle>
              <SheetDescription className="sr-only">{t("evidenceNote")}</SheetDescription>
            </SheetHeader>
            <EvidenceDrawer />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
