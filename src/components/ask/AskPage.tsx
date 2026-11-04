import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, BellRing, GraduationCap, Loader2, PanelLeftClose, PanelLeftOpen, Plus, RotateCcw, X } from "lucide-react";
import { api } from "@/api";
import { errorMessageKey, useApp } from "@/lib/app-context";
import { sampleQuestions } from "@/fixtures/chat";
import { isMock } from "@/lib/config";
import { ApiError, type ConversationMessage, type ConversationSummary, type PolicyUpdate, type ResponseLanguage } from "@/types/api";
import { Button } from "@/components/ui/button";
import { AssistantMessage } from "./AssistantMessage";
import { QuestionComposer } from "./QuestionComposer";
import type { DictKey } from "@/i18n/en";

export interface AskPageProps {
  initialQuestion?: string | undefined;
  contextUpdateId?: string | undefined;
  from?: string | undefined;
  autoSend?: boolean | undefined;
}

export function AskPage({ initialQuestion, contextUpdateId, from, autoSend }: AskPageProps) {
  const { t, answerLang, setAnswerLang, closeSource } = useApp();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [convs, setConvs] = useState<ConversationSummary[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [contextUpdate, setContextUpdate] = useState<PolicyUpdate | null>(null);
  const [error, setError] = useState<{ key: DictKey; requestId: string | null; message: string } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef<string | null>(null);

  const refreshConvs = () => api.listConversations().then((r) => setConvs(r.items)).catch(() => {});
  useEffect(() => { refreshConvs(); return () => closeSource(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages, pending, error]);

  // Prefill from links (update briefing, onboarding, home chips). Only Home's own composer auto-sends.
  useEffect(() => {
    if (!initialQuestion || sentInitial.current === initialQuestion) return;
    sentInitial.current = initialQuestion;
    if (autoSend) send(initialQuestion);
    else { setInput(initialQuestion); setPrefilled(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion, autoSend]);

  useEffect(() => {
    if (!contextUpdateId) { setContextUpdate(null); return; }
    api.getUpdate(contextUpdateId).then(setContextUpdate).catch(() => setContextUpdate(null));
  }, [contextUpdateId]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || pending) return;
    setError(null);
    setPending(true);
    setPrefilled(false);
    if (messages.at(-1)?.content !== q || messages.at(-1)?.role !== "user") {
      setMessages((m) => [...m, { id: `local-${Date.now()}`, role: "user", content: q, run_id: null, citations: [] }]);
    }
    setInput("");
    try {
      const res = await api.chat({ conversation_id: conversationId, message: q, response_language: answerLang });
      setConversationId(res.conversation_id);
      setMessages((m) => [...m, {
        id: res.run_id, role: "assistant", run_id: res.run_id, citations: res.citations, status: res.status, metrics: res.metrics,
        content: res.status === "needs_clarification" ? res.clarification_question ?? res.answer : res.answer,
      }]);
      refreshConvs();
    } catch (e) {
      setError({ key: errorMessageKey(e), requestId: e instanceof ApiError ? e.requestId : null, message: q });
    } finally {
      setPending(false);
    }
  };

  const newConversation = () => { setConversationId(null); setMessages([]); setError(null); closeSource(); };
  const openConversation = async (id: string) => {
    try {
      const d = await api.getConversation(id);
      setConversationId(d.id); setMessages(d.messages); setError(null); closeSource();
    } catch (e) {
      setError({ key: errorMessageKey(e), requestId: null, message: "" });
    }
  };

  return (
    <div className="flex h-full">
      {historyOpen && (
        <section aria-label={t("conversations")} className="hidden w-56 shrink-0 flex-col border-r bg-card/60 xl:flex">
          <div className="flex items-center gap-1 p-3 pb-1">
            <Button variant="outline" className="w-full justify-start rounded-xl" onClick={newConversation}>
              <Plus className="h-4 w-4" /> {t("newConversation")}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label={t("hideConversations")} onClick={() => setHistoryOpen(false)}>
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="px-4 pb-1 pt-2 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">{t("conversations")}</h2>
          <ul className="flex-1 overflow-y-auto px-2 pb-3">
            {convs.length === 0 && <li className="px-2 py-2 text-sm text-muted-foreground">{t("noConversations")}</li>}
            {convs.map((c) => (
              <li key={c.id}>
                <button onClick={() => openConversation(c.id)} aria-current={c.id === conversationId}
                  className={`w-full truncate rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted ${c.id === conversationId ? "bg-accent text-accent-foreground" : ""}`}>
                  {c.title}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:px-6">
            <div className="flex flex-wrap items-center gap-2 xl:hidden">
              <Button variant="outline" size="sm" className="rounded-lg" onClick={newConversation}><Plus className="h-4 w-4" /> {t("newConversation")}</Button>
            </div>
            {!historyOpen && (
              <div className="hidden xl:block">
                <Button variant="ghost" size="sm" aria-label={t("showConversations")} onClick={() => setHistoryOpen(true)}>
                  <PanelLeftOpen className="h-4 w-4" /> {t("conversations")}
                </Button>
              </div>
            )}
            {from === "onboarding" && (
              <Link to="/onboarding" className="inline-flex items-center gap-1.5 rounded-full bg-learn-soft px-3 py-1 text-xs font-medium text-learn hover:underline">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden /> {t("fromOnboarding")} · <ArrowLeft className="h-3 w-3" /> {t("backToOnboarding")}
              </Link>
            )}
            {messages.length === 0 && !pending && (
              <div className="space-y-5 pt-4">
                <div>
                  <h1 className="font-display text-3xl font-semibold tracking-tight">{t("askHeading")}</h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">{t("askSub")}</p>
                </div>
                <div>
                  <h2 className="mb-2 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">{t("recommended")}</h2>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {sampleQuestions.map((q) => (
                      <button key={q} onClick={() => send(q)} className="rounded-xl border bg-card p-3 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-panel">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end animate-rise">
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-foreground px-4 py-2.5 text-sm text-background">
                    <span className="sr-only">{t("you")}: </span>{m.content}
                  </div>
                </div>
              ) : (
                <AssistantMessage key={m.id} msg={m} question={messages[i - 1]?.content ?? ""} />
              ),
            )}

            {pending && (
              <div role="status" className="flex items-center gap-3 rounded-2xl border border-dashed bg-card/60 p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden /> {t("waiting")}
              </div>
            )}

            {error && (
              <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/50 bg-danger-soft p-3 text-sm animate-rise">
                <span className="text-destructive">{t(error.key)}</span>
                {error.requestId && <span className="text-xs text-muted-foreground">{t("requestId")}: {error.requestId}</span>}
                {error.message && error.key !== "errSession" && (
                  <Button size="sm" variant="outline" className="ml-auto" onClick={() => send(error.message)} disabled={pending}>
                    <RotateCcw className="h-3.5 w-3.5" /> {t("retry")}
                  </Button>
                )}
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        <div className="border-t bg-background/80 px-4 py-3 backdrop-blur md:px-6">
          <div className="mx-auto max-w-3xl space-y-2">
            {contextUpdate && (
              <div className="flex items-center gap-2 rounded-xl border border-warning/40 bg-warning-soft px-3 py-1.5 text-xs">
                <BellRing className="h-3.5 w-3.5 shrink-0 text-warning" aria-hidden />
                <span className="shrink-0 whitespace-nowrap font-medium text-warning">{t("askingAbout")}:</span>
                <span className="truncate">{contextUpdate.title} ({contextUpdate.previous_version} → {contextUpdate.current_version})</span>
                <Link to="/updates/$id" params={{ id: contextUpdate.id }} className="ml-auto shrink-0 text-primary hover:underline">{t("backToUpdate")}</Link>
                <button onClick={() => setContextUpdate(null)} aria-label={t("removeContext")} className="rounded p-0.5 hover:bg-card"><X className="h-3 w-3" /></button>
              </div>
            )}
            {prefilled && <p role="status" className="text-xs text-primary">{t("suggestedPrefilled")}</p>}
            <QuestionComposer
              value={input}
              onChange={setInput}
              onSubmit={send}
              pending={pending}
              footer={
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <label htmlFor="answer-lang">{t("answerLanguage")}</label>
                  <select id="answer-lang" value={answerLang} onChange={(e) => setAnswerLang(e.target.value as ResponseLanguage)} className="rounded-md border bg-card px-1.5 py-0.5">
                    <option value="auto">{t("langAuto")}</option>
                    <option value="en">{t("langEn")}</option>
                    <option value="ko">{t("langKo")}</option>
                  </select>
                  {isMock && <span className="ml-auto">{t("fictionalCorpus")}</span>}
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
