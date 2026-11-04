// FICTIONAL Northstar Labs workspace fixtures. Deterministic; no live clustering or inference.
import type { DocumentationRequest, FeedbackReport, KnowledgeGap, OnboardingTask, PolicyUpdate } from "@/types/api";

export const updateFixtures: PolicyUpdate[] = [
  {
    id: "upd-ca-meal",
    document_id: "doc-travel-global-v51",
    title: "Global Business Travel & Expense Policy",
    department: "Finance",
    country: "CA",
    previous_version: "v5.0",
    current_version: "v5.1",
    published_at: "2026-10-22",
    effective_date: "2026-12-01",
    summary: {
      en: "Canada daily meal allowance increases from CAD 60 to CAD 75 per day, now including gratuities.",
      ko: "캐나다 일일 식비 한도가 CAD 60에서 CAD 75로 인상되며, 팁이 포함됩니다.",
    },
    explanation: {
      en: "From December 1, 2026, trips in Canada can claim up to CAD 15 more per day for meals. Tips are now counted inside the allowance rather than claimed separately. Lodging limits and the claim process are unchanged.",
      ko: "2026년 12월 1일부터 캐나다 출장 시 식비를 하루 최대 CAD 15 더 청구할 수 있습니다. 팁은 별도로 청구하지 않고 한도에 포함됩니다. 숙박 한도와 청구 절차는 변경되지 않았습니다.",
    },
    source_links: [
      { label: "v5.0 · Appendix CA", document_id: "doc-travel-global", version: "v5.0" },
      { label: "v5.1 · Appendix CA", document_id: "doc-travel-global-v51", version: "v5.1" },
    ],
    changes: [
      {
        id: "ch1",
        section: "Appendix CA — Canada",
        segments: [
          { type: "same", text: "Domestic lodging: up to CAD 250 per night. Daily meal allowance: " },
          { type: "removed", text: "CAD 60 per day." },
          { type: "added", text: "CAD 75 per day, including gratuities." },
          { type: "same", text: " Alcohol is not reimbursable." },
        ],
      },
    ],
    timeline: [
      { version: "v4.2", date: "2025-02-01", status: "superseded" },
      { version: "v5.0", date: "2026-01-15", status: "current" },
      { version: "v5.1", date: "2026-12-01", status: "scheduled" },
    ],
    suggested_question: {
      en: "What is the Canada meal allowance, and when does the new limit apply?",
      ko: "캐나다 식비 한도는 얼마이고 새 한도는 언제부터 적용돼?",
    },
  },
  {
    id: "upd-ca-remote",
    document_id: "doc-remote-ca",
    title: "Remote Work Policy — Canada",
    department: "People Ops",
    country: "CA",
    previous_version: "v2.0",
    current_version: "v3.1",
    published_at: "2026-02-12",
    effective_date: "2026-03-01",
    summary: {
      en: "Remote days increase from two to three per week; Tuesdays and Thursdays become in-office days.",
      ko: "재택근무 가능 일수가 주 2일에서 3일로 늘고, 화·목요일이 출근일로 지정됩니다.",
    },
    explanation: {
      en: "Eligible Canada employees can now work remotely one more day each week, but must be in the office on Tuesdays and Thursdays.",
      ko: "캐나다 대상 직원은 주 1일을 더 재택근무할 수 있으며, 화요일과 목요일에는 출근해야 합니다.",
    },
    source_links: [
      { label: "v2.0 · Section 2", document_id: "doc-remote-ca-old", version: "v2.0" },
      { label: "v3.1 · Section 2", document_id: "doc-remote-ca", version: "v3.1" },
    ],
    changes: [
      {
        id: "ch1",
        section: "2. Hybrid schedule",
        segments: [
          { type: "removed", text: "Employees may work remotely up to two (2) days per week." },
          { type: "added", text: "Eligible employees may work remotely up to three (3) days per week. Tuesdays and Thursdays are designated in-office collaboration days." },
        ],
      },
    ],
    timeline: [
      { version: "v2.0", date: "2024-06-01", status: "superseded" },
      { version: "v3.1", date: "2026-03-01", status: "current" },
    ],
    suggested_question: { en: "What is the remote work policy for the Canada office?", ko: "What is the remote work policy for the Canada office?" },
  },
];

export const onboardingOptions = {
  country: ["CA", "KR", "US"],
  department: ["Engineering", "Finance", "People Ops"],
  role: ["Individual contributor", "Manager"],
};

export const onboardingTasks: OnboardingTask[] = [
  {
    id: "t-accounts", phase: "day",
    title: { en: "Set up company accounts", ko: "회사 계정 설정하기" },
    description: { en: "Activate SSO and enroll a passkey so email, chat and the Expense portal work.", ko: "SSO를 활성화하고 패스키를 등록해 메일, 메신저, 경비 포털을 사용할 수 있게 합니다." },
    documents: [{ id: "doc-it-global", title: "IT Accounts & Equipment Guide" }],
    due: { en: "Day 1", ko: "1일차" },
    ask_question: "How do I set up my company accounts?",
  },
  {
    id: "t-remote", phase: "day",
    title: { en: "Review the remote work policy", ko: "재택근무 정책 확인하기" },
    description: { en: "Learn your hybrid schedule and in-office days.", ko: "하이브리드 근무 일정과 출근일을 확인합니다." },
    documents: [{ id: "doc-remote-ca", title: "Remote Work Policy — Canada" }],
    due: { en: "Day 1", ko: "1일차" },
    ask_question: "What is the remote work policy for the Canada office?",
    applies_to: { country: ["CA"] },
  },
  {
    id: "t-security", phase: "week",
    title: { en: "Complete security orientation", ko: "보안 오리엔테이션 이수하기" },
    description: { en: "A 40-minute online course required within your first 7 days.", ko: "입사 후 7일 이내에 이수해야 하는 40분 온라인 과정입니다." },
    documents: [{ id: "doc-security-kr", title: "정보보안 기본 지침" }],
    due: { en: "Within 7 days", ko: "7일 이내" },
    ask_question: "When do I need to complete the security orientation?",
  },
  {
    id: "t-expense", phase: "week",
    title: { en: "Read expense reimbursement rules", ko: "경비 정산 규정 읽기" },
    description: { en: "Know the 30-day claim window and approval thresholds before your first trip.", ko: "첫 출장 전에 30일 청구 기한과 승인 기준을 확인합니다." },
    documents: [{ id: "doc-travel-global", title: "Global Business Travel & Expense Policy" }],
    due: null,
    ask_question: "How do I get reimbursed for business expenses?",
  },
  {
    id: "t-leave-kr", phase: "week",
    title: { en: "Learn how to request leave", ko: "휴가 신청 방법 알아두기" },
    description: { en: "Leave is requested in the HR portal three business days ahead.", ko: "휴가는 3영업일 전까지 HR 포털에서 신청합니다." },
    documents: [{ id: "doc-leave-kr", title: "연차휴가 운영 기준 (한국)" }],
    due: null,
    ask_question: "휴가는 어떻게 신청해?",
    applies_to: { country: ["KR"] },
  },
  {
    id: "t-equipment", phase: "month",
    title: { en: "Request additional equipment if needed", ko: "필요 시 추가 장비 신청하기" },
    description: { en: "Second monitors and ergonomic gear need manager approval.", ko: "보조 모니터와 인체공학 장비는 팀장 승인이 필요합니다." },
    documents: [{ id: "doc-it-global", title: "IT Accounts & Equipment Guide" }],
    due: null,
    ask_question: "IT 장비는 어떻게 추가로 신청해?",
  },
  {
    id: "t-approvals", phase: "month",
    title: { en: "Review expense approval responsibilities", ko: "경비 승인 책임 확인하기" },
    description: { en: "Managers approve team claims over CAD 500.", ko: "팀장은 CAD 500 초과 청구를 승인합니다." },
    documents: [{ id: "doc-travel-global", title: "Global Business Travel & Expense Policy" }],
    due: { en: "By day 30", ko: "30일 이내" },
    ask_question: "How do I get reimbursed for business expenses?",
    applies_to: { role: ["Manager"] },
  },
];

export const gapFixtures: KnowledgeGap[] = [
  {
    id: "gap-pet", topic: { en: "Pet insurance", ko: "반려동물 보험" }, keywords: ["pet", "반려동물"],
    frequency: 14, period_days: 30, first_seen: "2026-09-04", last_seen: "2026-10-28",
    examples: ["Does the company provide pet insurance?", "반려동물 보험 지원돼?", "Can I add my dog to health benefits?"],
    cause: "unconfirmed", owner: null, status: "unreviewed", linked_document_id: null, revalidation: null,
  },
  {
    id: "gap-intl-remote", topic: { en: "International remote work", ko: "해외 원격 근무" }, keywords: ["abroad", "international", "해외"],
    frequency: 9, period_days: 30, first_seen: "2026-08-19", last_seen: "2026-10-25",
    examples: ["Can I work from Korea for a month?", "해외에서 재택근무 가능해?"],
    cause: "unclear_policy", owner: "People Ops — Mina K.", status: "cause_identified", linked_document_id: "doc-remote-ca", revalidation: null,
  },
  {
    id: "gap-home-office", topic: { en: "Home office equipment reimbursement", ko: "재택 장비 비용 지원" }, keywords: ["chair", "desk", "의자"],
    frequency: 6, period_days: 30, first_seen: "2026-09-30", last_seen: "2026-10-27",
    examples: ["Is a desk chair covered by the stipend?", "재택용 의자 비용 청구 돼?"],
    cause: "conflicting_sources", owner: null, status: "cause_identified", linked_document_id: null, revalidation: null,
  },
  {
    id: "gap-vpn", topic: { en: "VPN setup questions", ko: "VPN 설정 문의" }, keywords: ["vpn"],
    frequency: 4, period_days: 30, first_seen: "2026-10-02", last_seen: "2026-10-21",
    examples: ["How do I connect to the VPN?"],
    cause: "retrieval_issue", owner: "IT — Sam R.", status: "action_taken", linked_document_id: "doc-it-global", revalidation: null,
  },
];

export const demoOwners = ["People Ops — Mina K.", "Finance — Daniel L.", "IT — Sam R.", "Security — Jiwoo P."];

export const feedbackFixtures: FeedbackReport[] = [
  {
    id: "rep-seed-1", run_id: "run-seed-1", question: "캐나다 재택근무 며칠 가능해?",
    excerpt: "Employees may work remotely up to two (2) days per week.", category: "outdated",
    comment: "This is the old version.", status: "under_review", candidate_eval: false, created_at: "2026-10-26T09:12:00Z",
    document_title: "Remote Work Policy — Canada", document_version: "v2.0",
  },
];

export const docRequestFixtures: DocumentationRequest[] = [
  {
    id: "docreq-seed-1", gap_id: "gap-intl-remote",
    title: "Clarify international remote work rules",
    details: "Employees ask whether they can work from abroad for extended periods. The Canada policy only covers other provinces; confirm and document the international rule.",
    examples: ["Can I work from Korea for a month?", "해외에서 재택근무 가능해?"],
    owner: "People Ops — Mina K.", priority: "medium", due_date: "2026-11-14", status: "requested",
    created_at: "2026-10-24T10:00:00Z",
  },
];
