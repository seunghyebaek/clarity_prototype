// ILLUSTRATIVE sample numbers only — not measured production performance.
import type { EvalRunDetail } from "@/types/api";

export const evalFixtures: EvalRunDetail[] = [
  {
    summary: {
      id: "run-baseline", name: "Baseline · BM25 + rerank", role: "baseline",
      dataset_version: "faq-eval-v0.3 (sample)", sample_count: 120,
      evidence_coverage: 0.71, answer_correctness: 0.64, abstention_accuracy: 0.58,
      latency_p50_ms: 2100, cost_per_1k_usd: null,
      retrieval_config: "BM25, top-k 5, cross-encoder rerank, no version filter",
      model_version: "demo-llm-small v1.2", prompt_version: "answer-prompt v3",
      changed_conditions: "—",
      created_at: "2026-10-12",
    },
    cases: [
      {
        id: "c1", question: "캐나다 재택근무 며칠 가능해?", category: "Cross-lingual",
        expected_behavior: "Answer 3 days/week citing Remote Work Policy — Canada v3.1",
        actual_output: "Answered 2 days/week (cited inactive v2.0)",
        sources: ["Remote Work Policy — Canada v2.0"],
        explanation: "Retrieval ranked the superseded v2.0 above the current v3.1 because there was no version filter, so the answer used an outdated passage.",
      },
      {
        id: "c2", question: "Does the company provide pet insurance?", category: "Abstention",
        expected_behavior: "State insufficient evidence",
        actual_output: "Claimed pet insurance is part of health benefits",
        sources: [],
        explanation: "No source document mentions pet insurance, but the system answered anyway instead of abstaining.",
      },
    ],
  },
  {
    summary: {
      id: "run-candidate", name: "Candidate · hybrid + version filter", role: "candidate",
      dataset_version: "faq-eval-v0.3 (sample)", sample_count: 120,
      evidence_coverage: 0.83, answer_correctness: 0.76, abstention_accuracy: null,
      latency_p50_ms: 2600, cost_per_1k_usd: null,
      retrieval_config: "Hybrid BM25 + vector, top-k 8, rerank, current-version filter",
      model_version: "demo-llm-small v1.2", prompt_version: "answer-prompt v4",
      changed_conditions: "Added current-version filter; top-k 5 → 8; prompt v3 → v4",
      created_at: "2026-10-20",
    },
    cases: [
      {
        id: "c3", question: "출장비는 얼마까지 지원돼?", category: "Clarification",
        expected_behavior: "Ask for country and expense type",
        actual_output: "Answered with Korea lodging limit only",
        sources: ["Global Business Travel & Expense Policy v5.0"],
        explanation: "The question lacks a country and expense type. The system should have asked a clarifying question but answered with the first matching appendix instead.",
      },
    ],
  },
];
