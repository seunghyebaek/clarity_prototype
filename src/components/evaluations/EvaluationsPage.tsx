import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { api } from "@/api";
import { errorMessageKey, useApp } from "@/lib/app-context";
import { isMock } from "@/lib/config";
import type { EvalCase, EvalRunSummary, FeedbackReport } from "@/types/api";
import type { DictKey } from "@/i18n/en";

type MetricKey = keyof Pick<EvalRunSummary, "sample_count" | "evidence_coverage" | "answer_correctness" | "abstention_accuracy" | "latency_p50_ms" | "cost_per_1k_usd">;
const metrics: { k: MetricKey; label: DictKey; explain: DictKey; fmt: (v: number) => string }[] = [
  { k: "sample_count", label: "sampleCount", explain: "metricExplain_sample_count", fmt: (v) => String(v) },
  { k: "evidence_coverage", label: "evidenceCoverage", explain: "metricExplain_evidence_coverage", fmt: (v) => `${(v * 100).toFixed(0)}%` },
  { k: "answer_correctness", label: "answerCorrectness", explain: "metricExplain_answer_correctness", fmt: (v) => `${(v * 100).toFixed(0)}%` },
  { k: "abstention_accuracy", label: "abstention", explain: "metricExplain_abstention_accuracy", fmt: (v) => `${(v * 100).toFixed(0)}%` },
  { k: "latency_p50_ms", label: "latencyP50", explain: "metricExplain_latency_p50_ms", fmt: (v) => `${v.toLocaleString()} ms` },
  { k: "cost_per_1k_usd", label: "cost", explain: "metricExplain_cost_per_1k_usd", fmt: (v) => `$${v.toFixed(2)}` },
];

function RunConfig({ run }: { run: EvalRunSummary }) {
  const { t } = useApp();
  const rows: [DictKey, string][] = [
    ["datasetVersion", run.dataset_version],
    ["retrievalConfig", run.retrieval_config],
    ["modelVersion", run.model_version],
    ["promptVersion", run.prompt_version],
    ["changedConditions", run.changed_conditions],
  ];
  return (
    <dl className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-[auto_1fr]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted-foreground">{t(k)}</dt>
          <dd className="font-mono">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EvaluationsPage() {
  const { t } = useApp();
  const [runs, setRuns] = useState<EvalRunSummary[] | null>(null);
  const [cases, setCases] = useState<(EvalCase & { run: string })[]>([]);
  const [openCase, setOpenCase] = useState<string | null>(null);
  const [err, setErr] = useState<DictKey | null>(null);
  const [candidates, setCandidates] = useState<FeedbackReport[]>([]);
  useEffect(() => { api.listFeedbackReports().then((r) => setCandidates(r.items.filter((x) => x.candidate_eval))).catch(() => {}); }, []);

  useEffect(() => {
    api.listEvalRuns().then(async (r) => {
      setRuns(r.items);
      const details = await Promise.all(r.items.map((x) => api.getEvalRun(x.id)));
      setCases(details.flatMap((d) => d.cases.map((c) => ({ ...c, run: d.summary.role }))));
    }).catch((e) => setErr(errorMessageKey(e)));
  }, []);

  const baseline = runs?.find((r) => r.role === "baseline");
  const candidate = runs?.find((r) => r.role === "candidate");
  const cell = (r: EvalRunSummary | undefined, m: (typeof metrics)[number]) => {
    if (!r) return <span className="text-muted-foreground">{t("unavailable")}</span>;
    const v = r[m.k];
    return v == null ? <span className="text-muted-foreground italic">{t("notMeasured")}</span> : m.fmt(v);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{t("evalHeading")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("evalSub")}</p>
      </div>
      {isMock && (
        <div role="note" className="rounded-md border-2 border-warning bg-warning-soft px-4 py-3 text-sm font-semibold text-warning">
          {t("sampleData")}
        </div>
      )}
      {err && <p role="alert" className="text-destructive">{t(err)}</p>}
      {!err && runs === null && <p className="text-muted-foreground">{t("loading")}</p>}
      {runs?.length === 0 && <p className="text-muted-foreground">{t("noRuns")}</p>}

      {runs && runs.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border bg-card shadow-panel">
            <table className="w-full min-w-[36rem] text-sm">
              <thead className="border-b bg-muted text-left text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-2 font-medium">{t("metric")}</th>
                  <th scope="col" className="px-4 py-2 font-medium">{t("baseline")}<div className="font-normal">{baseline?.name}</div></th>
                  <th scope="col" className="px-4 py-2 font-medium">{t("candidate")}<div className="font-normal">{candidate?.name}</div></th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.k} className="border-b last:border-0">
                    <th scope="row" className="px-4 py-2 text-left font-normal">
                      <span className="text-muted-foreground">{t(m.label)}</span>
                      <span className="mt-0.5 block max-w-72 text-[0.7rem] font-normal leading-snug text-muted-foreground/80">{t(m.explain)}</span>
                    </th>
                    <td className="px-4 py-2 align-top tabular-nums">{cell(baseline, m)}</td>
                    <td className="px-4 py-2 align-top tabular-nums">{cell(candidate, m)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section aria-labelledby="cfg-h">
            <h2 id="cfg-h" className="mb-2 font-semibold">{t("runConfig")}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {[baseline, candidate].filter((r): r is EvalRunSummary => !!r).map((r) => (
                <div key={r.id} className="rounded-2xl border bg-card p-4">
                  <div className="mb-2 text-sm font-medium">{t(r.role === "baseline" ? "baseline" : "candidate")} · {r.name}</div>
                  <RunConfig run={r} />
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {candidates.length > 0 && (
        <section>
          <h2 className="font-semibold">{t("candidateFromFeedback")}</h2>
          <p className="mb-2 text-xs text-muted-foreground">{t("candidateNote")}</p>
          <ul className="space-y-2">
            {candidates.map((c) => (
              <li key={c.id} className="rounded-2xl border bg-card p-3 text-sm">
                <div className="text-xs text-muted-foreground">{c.question} · {t(`fc_${c.category}` as DictKey)}</div>
                <div className="mt-1">{c.excerpt}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {cases.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">{t("failureCases")}</h2>
          <ul className="space-y-2">
            {cases.map((c) => {
              const isOpen = openCase === c.id;
              return (
                <li key={c.id} className="rounded-2xl border bg-card">
                  <button type="button" aria-expanded={isOpen} onClick={() => setOpenCase(isOpen ? null : c.id)}
                    className="flex w-full items-center gap-3 p-4 text-left">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{c.question}</span>
                      <span className="text-xs text-muted-foreground">{c.category} · {t(c.run === "baseline" ? "baseline" : "candidate")}</span>
                    </span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                  {isOpen && (
                    <dl className="space-y-3 border-t p-4 text-sm animate-rise">
                      <div><dt className="text-xs font-medium text-muted-foreground">{t("question")}</dt><dd className="mt-0.5">{c.question}</dd></div>
                      <div><dt className="text-xs font-medium text-muted-foreground">{t("expected")}</dt><dd className="mt-0.5">{c.expected_behavior}</dd></div>
                      <div><dt className="text-xs font-medium text-muted-foreground">{t("actual")}</dt><dd className="mt-0.5 text-destructive">{c.actual_output}</dd></div>
                      <div><dt className="text-xs font-medium text-muted-foreground">{t("sources")}</dt><dd className="mt-0.5">{c.sources.length ? c.sources.join(", ") : t("none")}</dd></div>
                      <div><dt className="text-xs font-medium text-muted-foreground">{t("failureExplanation")}</dt><dd className="mt-0.5 rounded-lg bg-surface-sunken p-3">{c.explanation}</dd></div>
                    </dl>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
