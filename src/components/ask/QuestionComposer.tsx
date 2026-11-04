import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { Loader2, Send } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";

/** Presentational composer. Enter sends, Shift+Enter adds a line, never sends during IME composition. */
export function QuestionComposer({ value, onChange, onSubmit, pending = false, placeholder, size = "md", footer, id = "composer", autoFocus }: {
  value: string; onChange: (v: string) => void; onSubmit: (v: string) => void; pending?: boolean;
  placeholder?: string; size?: "md" | "lg"; footer?: ReactNode; id?: string; autoFocus?: boolean;
}) {
  const { t } = useApp();
  const composing = useRef(false);
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !composing.current && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault();
      onSubmit(value);
    }
  };
  const lg = size === "lg";
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(value); }}>
      <label htmlFor={id} className="sr-only">{t("composerLabel")}</label>
      <div className={`flex items-end gap-2 rounded-2xl border bg-card transition-shadow focus-within:border-primary focus-within:shadow-raised ${lg ? "p-3 shadow-raised" : "p-2 shadow-panel"}`}>
        <textarea
          id={id}
          rows={lg ? 3 : 2}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onCompositionStart={() => (composing.current = true)}
          onCompositionEnd={() => (composing.current = false)}
          placeholder={placeholder ?? t("composerPlaceholder")}
          maxLength={4000}
          className={`max-h-48 flex-1 resize-none bg-transparent px-2 py-1 outline-none focus-visible:outline-none ${lg ? "min-h-[4.5rem] text-base" : "min-h-[2.75rem] text-sm"}`}
        />
        <Button type="submit" size={lg ? "lg" : "default"} className="rounded-xl" disabled={pending || !value.trim()} aria-label={pending ? t("sending") : t("send")}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span className="hidden sm:inline">{pending ? t("sending") : t("send")}</span>
        </Button>
      </div>
      {footer}
    </form>
  );
}
