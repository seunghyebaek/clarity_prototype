import { useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Flag } from "lucide-react";
import type { Citation } from "@/types/api";
import { useApp } from "@/lib/app-context";

function Block({ text, citations, onReport }: { text: string; citations: Citation[]; onReport?: ((excerpt: string) => void) | undefined }) {
  const { openSource, source, t } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const withLinks = text.replace(/\[(\d+)\](?!\()/g, (m, n) => (citations.some((c) => c.id === n) ? `[${n}](#cite-${n})` : m));
  const report = () => {
    const sel = window.getSelection();
    const selected = sel && ref.current && sel.rangeCount && ref.current.contains(sel.anchorNode) ? sel.toString().trim() : "";
    // Strip markdown/citation markers for the excerpt shown to reviewers.
    onReport?.(selected || text.replace(/\*\*|_|\[\d+\]/g, "").replace(/^- /gm, "").trim());
  };
  return (
    <div className="group relative -mx-2 rounded-lg px-2 py-0.5 transition-colors focus-within:bg-surface-sunken hover:bg-surface-sunken">
      <div ref={ref} className="prose-answer pr-8">
        <ReactMarkdown
          skipHtml
          components={{
            a: ({ href, children }) => {
              const m = href?.match(/^#cite-(\d+)$/);
              if (m) {
                const id = m[1]!;
                const selected = source?.activeId === id && source.citations === citations;
                return (
                  <button
                    type="button"
                    onClick={() => openSource(citations, id)}
                    aria-label={`${t("citation")} ${id}`}
                    aria-pressed={selected}
                    className={`mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md border px-1 align-text-top text-[0.7rem] font-bold transition-colors ${selected ? "border-primary bg-primary text-primary-foreground" : "border-primary/40 bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground"}`}
                  >
                    {id}
                  </button>
                );
              }
              return <a href={href} target="_blank" rel="noreferrer noopener">{children}</a>;
            },
          }}
        >
          {withLinks}
        </ReactMarkdown>
      </div>
      {onReport && (
        <button
          type="button"
          onClick={report}
          aria-label={t("reportIssue")}
          title={t("reportIssue")}
          className="absolute right-1 top-1 rounded-md p-1.5 text-muted-foreground opacity-60 transition-opacity hover:bg-card hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Flag className="h-3.5 w-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
}

// react-markdown never renders raw HTML here (skipHtml).
export function AnswerMarkdown({ text, citations, onReport }: { text: string; citations: Citation[]; onReport?: ((excerpt: string) => void) | undefined }) {
  const blocks = text.split(/\n{2,}/).filter((b) => b.trim());
  return (
    <div className="space-y-1 text-[0.95rem]">
      {blocks.map((b, i) => <Block key={i} text={b} citations={citations} onReport={onReport} />)}
    </div>
  );
}
