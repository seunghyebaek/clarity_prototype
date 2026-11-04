import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api";
import { useApp } from "@/lib/app-context";
import type { DocumentDetail } from "@/types/api";
import { Button } from "@/components/ui/button";

/** Splits text around the exact excerpt so only the fixture-defined evidence is highlighted. */
export function HighlightedText({ text, excerpt, markRef }: { text: string; excerpt: string; markRef?: React.Ref<HTMLElement> }) {
  const i = excerpt ? text.indexOf(excerpt) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark ref={markRef} className="evidence-mark animate-flash text-foreground">{excerpt}</mark>
      {text.slice(i + excerpt.length)}
    </>
  );
}

export function EvidenceDrawer() {
  const { source, openSource, t } = useApp();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [docErr, setDocErr] = useState(false);
  const [copied, setCopied] = useState(false);
  const markRef = useRef<HTMLElement>(null);
  const active = source?.citations.find((c) => c.id === source.activeId);

  useEffect(() => {
    if (!active) return;
    setDoc(null); setDocErr(false); setCopied(false);
    api.getDocument(active.document_id).then(setDoc).catch(() => setDocErr(true));
  }, [active?.document_id, active?.chunk_id]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    markRef.current?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }, [doc, active?.id]);

  if (!source || !active) return <p className="p-4 text-sm text-muted-foreground">{t("noSourceSelected")}</p>;
  const sectionId = active.chunk_id.split("#")[1];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(active.excerpt);
      setCopied(true);
      toast.success(t("copied"));
    } catch { /* clipboard blocked */ }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-3 border-b p-4">
        <div role="tablist" aria-label={t("sources")} className="flex flex-wrap gap-1.5">
          {source.citations.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={c.id === source.activeId}
              onClick={() => openSource(source.citations, c.id)}
              className={`h-7 min-w-7 rounded-md border px-2 text-xs font-semibold transition-colors ${c.id === source.activeId ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:border-primary hover:text-foreground"}`}
            >
              {c.id}
            </button>
          ))}
        </div>
        <div>
          <h3 className="font-display text-base font-semibold leading-snug">{active.title}</h3>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
            <dt className="text-muted-foreground">{t("section")}</dt><dd>{active.section}</dd>
            <dt className="text-muted-foreground">{t("version")}</dt><dd>{active.version}</dd>
            <dt className="text-muted-foreground">{t("language")}</dt><dd>{active.language.toUpperCase()}</dd>
            <dt className="text-muted-foreground">{t("effectiveDate")}</dt><dd>{active.effective_date}</dd>
          </dl>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/documents" search={{ doc: active.document_id }}><ExternalLink className="h-3.5 w-3.5" /> {t("openFullDoc")}</Link>
          </Button>
          <Button size="sm" variant="outline" onClick={copy}>
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />} {t("copyExcerpt")}
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-sunken p-4">
        <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="evidence-mark inline-block h-3 w-3" aria-hidden /> {t("evidenceNote")}
        </p>
        {docErr && (
          <div className="space-y-2">
            <p role="alert" className="text-sm text-destructive">{t("documentUnavailable")}</p>
            <blockquote className="rounded-lg border-l-2 border-primary bg-card p-3 text-sm"><mark className="evidence-mark">{active.excerpt}</mark></blockquote>
          </div>
        )}
        {!doc && !docErr && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{t("loadingDoc")}</p>}
        {doc && (
          <article className="space-y-3 rounded-xl border bg-card p-4 shadow-panel" lang={doc.document.language}>
            {doc.sections.map((s) => {
              const isActive = s.id === sectionId;
              return (
                <section key={s.id} aria-current={isActive ? "true" : undefined}
                  className={`rounded-lg p-2 text-sm leading-relaxed transition-colors ${isActive ? "bg-accent/60 ring-1 ring-primary/30" : "text-muted-foreground"}`}>
                  <h4 className="mb-1 text-xs font-semibold text-foreground">{s.title}</h4>
                  {isActive ? <HighlightedText text={s.text} excerpt={active.excerpt} markRef={markRef} /> : s.text}
                </section>
              );
            })}
          </article>
        )}
      </div>
    </div>
  );
}
