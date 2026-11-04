// Deterministic mock chat scenarios. No retrieval or model inference happens in mock mode.
// Evidence links exist ONLY where a citation marker [n] is placed in the fixture text.
import type { ChatResponse, Citation } from "@/types/api";
import { documentFixtures } from "./documents";

function cite(n: number, docId: string, sectionId: string, excerpt?: string): Citation {
  const d = documentFixtures.find((x) => x.document.id === docId);
  const s = d?.sections.find((x) => x.id === sectionId);
  if (!d || !s) throw new Error(`Fixture citation missing: ${docId}#${sectionId}`);
  const ex = excerpt ?? s.text;
  if (!s.text.includes(ex)) throw new Error(`Excerpt not in section: ${docId}#${sectionId}`);
  return {
    id: String(n), document_id: docId, chunk_id: `${docId}#${sectionId}`, title: d.document.title, section: s.title,
    excerpt: ex, version: d.document.version, language: d.document.language, effective_date: d.document.effective_date,
  };
}

export interface MockScenario {
  id: string;
  match: (q: string) => boolean;
  response: Omit<ChatResponse, "conversation_id" | "run_id">;
}

export const sampleQuestions = [
  "What is the remote work policy for the Canada office?",
  "출장비는 얼마까지 지원돼?",
  "Does the company provide pet insurance?",
  "육아휴직은 몇 주까지 쓸 수 있어?",
];

/** Home task chips. `q` prefills Ask; `to` navigates elsewhere. */
export const taskChips: { label: string; q?: string; to?: "/onboarding" }[] = [
  { label: "출장 준비", q: "출장비는 얼마까지 지원돼?" },
  { label: "휴가 신청", q: "휴가는 어떻게 신청해?" },
  { label: "IT 장비", q: "IT 장비는 어떻게 추가로 신청해?" },
  { label: "새 입사자", to: "/onboarding" },
];

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const has = (q: string, ...words: string[]) => words.some((w) => norm(q).includes(w));
const none = { latency_ms: null, input_tokens: null, output_tokens: null };

export const mockScenarios: MockScenario[] = [
  {
    id: "meal-ca",
    match: (q) => has(q, "meal", "식비") && has(q, "canada", "캐나다"),
    response: {
      status: "answered",
      answer:
        "Under the version that is **currently effective (v5.0)**, the Canada daily meal allowance is **CAD 60 per day** [1].\n\nVersion v5.1 raises it to **CAD 75 per day, including gratuities**, effective **December 1, 2026** [2]. Until that date, the CAD 60 limit applies.\n\nWhether the new limit applies to a specific trip (for example, one that starts before and ends after December 1) requires confirmation with Finance.",
      clarification_question: null,
      citations: [
        cite(1, "doc-travel-global", "s3", "Daily meal allowance: CAD 60 per day."),
        cite(2, "doc-travel-global-v51", "s3", "Daily meal allowance: CAD 75 per day, including gratuities."),
      ],
      metrics: none,
    },
  },
  {
    id: "remote-ca",
    match: (q) => has(q, "remote") && has(q, "canada"),
    response: {
      status: "answered",
      answer:
        "Under the current Canada policy, eligible employees can work **remotely up to three days per week** [1].\n\n- **Eligibility:** full-time staff in Toronto and Vancouver after the 90-day onboarding period [2].\n- **In-office days:** Tuesdays and Thursdays are collaboration days [1].\n- **Stipend:** a one-time CAD 600 home office stipend, claimable within 60 days [3].\n\nWorking from another province for more than 14 consecutive days needs prior approval from People Ops [4].",
      clarification_question: null,
      citations: [
        cite(1, "doc-remote-ca", "s2", "Eligible employees may work remotely up to three (3) days per week. Tuesdays and Thursdays are designated in-office collaboration days."),
        cite(2, "doc-remote-ca", "s1", "All full-time employees who have completed their 90-day onboarding period are eligible for hybrid work."),
        cite(3, "doc-remote-ca", "s3", "a one-time home office stipend of CAD 600, claimable within 60 days of hybrid eligibility"),
        cite(4, "doc-remote-ca", "s4", "Remote work from outside the employee's home province for more than 14 consecutive days requires prior written approval from People Ops."),
      ],
      metrics: none,
    },
  },
  {
    id: "reimburse",
    match: (q) => has(q, "reimburs", "expense claim", "경비 정산"),
    response: {
      status: "answered",
      answer:
        "Submit expense claims in the **Expense portal within 30 days** of the expense, with itemized receipts [1].\n\nClaims over **CAD 500** (or the local equivalent) need manager approval [1]. Country limits, such as meal allowances, are listed in the regional appendices [2].",
      clarification_question: null,
      citations: [
        cite(1, "doc-travel-global", "s5"),
        cite(2, "doc-travel-global", "s1", "Country-specific limits are listed in the regional appendices."),
      ],
      metrics: none,
    },
  },
  {
    id: "accounts",
    match: (q) => has(q, "account", "계정"),
    response: {
      status: "answered",
      answer:
        "On your first day, **activate your Northstar SSO account** from the link sent to your personal email, then enroll a passkey or authenticator app [1].\n\nEmail, chat and the Expense portal all open through SSO [1].",
      clarification_question: null,
      citations: [cite(1, "doc-it-global", "s1")],
      metrics: none,
    },
  },
  {
    id: "equipment-ko",
    match: (q) => q.includes("장비") || has(q, "equipment"),
    response: {
      status: "answered",
      answer:
        "기본 지급 장비는 **노트북 1대와 외부 모니터 1대**입니다 [1].\n\n보조 모니터나 인체공학 키보드 같은 추가 장비는 **IT 포털에서 팀장 승인을 받아** 신청할 수 있습니다 [1].\n\n_참고: 영어 원문 문서를 바탕으로 한 답변입니다._",
      clarification_question: null,
      citations: [cite(1, "doc-it-global", "s2")],
      metrics: none,
    },
  },
  {
    id: "security",
    match: (q) => has(q, "security", "보안"),
    response: {
      status: "answered",
      answer:
        "New employees must complete the **online security orientation within 7 days** of joining; it takes about 40 minutes [1].\n\nWork laptops also need disk encryption and a 5-minute screen lock [2].\n\n_Note: the source document is in Korean; quoted excerpts remain in the original language._",
      clarification_question: null,
      citations: [cite(1, "doc-security-kr", "s1"), cite(2, "doc-security-kr", "s2")],
      metrics: none,
    },
  },
  {
    id: "travel-clarify",
    match: (q) => q.includes("출장비"),
    response: {
      status: "needs_clarification",
      answer: "",
      clarification_question:
        "출장비 한도는 국가와 비용 유형에 따라 다릅니다. 어느 국가의 출장인가요(예: 한국 국내, 캐나다, 해외)? 그리고 숙박비와 식비 중 어떤 항목이 궁금하신가요?",
      citations: [],
      metrics: none,
    },
  },
  {
    id: "pet-insurance",
    match: (q) => has(q, "pet insurance") || q.includes("반려동물"),
    response: {
      status: "insufficient_evidence",
      answer:
        "I couldn't find any Northstar Labs policy that mentions pet insurance in the documents available to you. I won't guess. You may want to ask People Ops directly.",
      clarification_question: null,
      citations: [],
      metrics: none,
    },
  },
  {
    id: "parental-ko",
    match: (q) => q.includes("육아휴직"),
    response: {
      status: "answered",
      answer:
        "주 양육자는 **20주의 유급 육아휴직**을, 보조 양육자는 **8주의 유급 휴직**을 받을 수 있습니다 [1].\n\n휴직은 출생 또는 입양 후 12개월 이내에 사용해야 하며, 최대 두 번으로 나누어 쓸 수 있습니다 [2].\n\n_참고: 이 답변은 영어 원문 문서를 바탕으로 작성되었습니다._",
      clarification_question: null,
      citations: [
        cite(1, "doc-parental-global", "s1", "Primary caregivers receive 20 weeks of fully paid parental leave. Secondary caregivers receive 8 weeks of fully paid leave."),
        cite(2, "doc-parental-global", "s2"),
      ],
      metrics: none,
    },
  },
  {
    id: "leave-ko",
    match: (q) => q.includes("휴가") || has(q, "annual leave", "vacation"),
    response: {
      status: "answered",
      answer:
        "연차휴가는 **HR 포털에서 사용 예정일 3영업일 전까지** 신청하고, 팀장 승인 후 확정됩니다 [1].\n\n반차는 오전 또는 오후 **4시간 단위**로 사용할 수 있습니다 [2].",
      clarification_question: null,
      citations: [cite(1, "doc-leave-kr", "s1"), cite(2, "doc-leave-kr", "s2")],
      metrics: none,
    },
  },
];
