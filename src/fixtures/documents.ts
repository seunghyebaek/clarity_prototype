// FICTIONAL corpus: Northstar Labs is not a real company. All policies are invented.
import type { DocumentDetail } from "@/types/api";

export const documentFixtures: DocumentDetail[] = [
  {
    document: { id: "doc-remote-ca", title: "Remote Work Policy — Canada", department: "People Ops", country: "CA", language: "en", version: "v3.1", effective_date: "2026-03-01", status: "ready", policy_status: "current" },
    sections: [
      { id: "s1", title: "1. Eligibility", text: "This policy covers the Toronto and Vancouver offices. All full-time employees who have completed their 90-day onboarding period are eligible for hybrid work. Contractors follow the terms of their agreement." },
      { id: "s2", title: "2. Hybrid schedule", text: "Eligible employees may work remotely up to three (3) days per week. Tuesdays and Thursdays are designated in-office collaboration days. Teams may agree on additional office days for planning weeks." },
      { id: "s3", title: "3. Home office stipend", text: "Northstar Labs Canada provides a one-time home office stipend of CAD 600, claimable within 60 days of hybrid eligibility. Receipts must be submitted through the Expense portal." },
      { id: "s4", title: "4. Working from another province", text: "Remote work from outside the employee's home province for more than 14 consecutive days requires prior written approval from People Ops. Working from outside Canada is not covered by this policy." },
    ],
  },
  {
    document: { id: "doc-travel-global", title: "Global Business Travel & Expense Policy", department: "Finance", country: "Global", language: "en", version: "v5.0", effective_date: "2026-01-15", status: "ready", policy_status: "current" },
    sections: [
      { id: "s1", title: "1. Scope", text: "This policy applies to all Northstar Labs entities. Country-specific limits are listed in the regional appendices." },
      { id: "s2", title: "Appendix KR — Korea", text: "Domestic lodging: up to KRW 150,000 per night. Daily meal allowance: KRW 50,000. International lodging limits follow Appendix G." },
      { id: "s3", title: "Appendix CA — Canada", text: "Domestic lodging: up to CAD 250 per night. Daily meal allowance: CAD 60 per day. Alcohol is not reimbursable." },
      { id: "s4", title: "Appendix G — International", text: "International lodging: up to USD 280 per night in tier-1 cities and USD 200 elsewhere." },
      { id: "s5", title: "5. Submitting claims", text: "Submit expense claims within 30 days of the expense in the Expense portal with itemized receipts. Claims over CAD 500 (or local equivalent) require manager approval." },
    ],
  },
  {
    document: { id: "doc-travel-global-v51", title: "Global Business Travel & Expense Policy", department: "Finance", country: "Global", language: "en", version: "v5.1", effective_date: "2026-12-01", status: "ready", policy_status: "upcoming" },
    sections: [
      { id: "s1", title: "1. Scope", text: "This policy applies to all Northstar Labs entities. Country-specific limits are listed in the regional appendices." },
      { id: "s3", title: "Appendix CA — Canada", text: "Domestic lodging: up to CAD 250 per night. Daily meal allowance: CAD 75 per day, including gratuities. Alcohol is not reimbursable." },
      { id: "s5", title: "5. Submitting claims", text: "Submit expense claims within 30 days of the expense in the Expense portal with itemized receipts. Claims over CAD 500 (or local equivalent) require manager approval." },
    ],
  },
  {
    document: { id: "doc-parental-global", title: "Parental Leave Policy", department: "People Ops", country: "Global", language: "en", version: "v2.2", effective_date: "2025-11-01", status: "ready", policy_status: "current" },
    sections: [
      { id: "s1", title: "2. Leave entitlement", text: "Primary caregivers receive 20 weeks of fully paid parental leave. Secondary caregivers receive 8 weeks of fully paid leave. Entitlements are not reduced by statutory benefits." },
      { id: "s2", title: "3. Timing", text: "Leave may be taken within 12 months of the birth or adoption and may be split into up to two blocks." },
    ],
  },
  {
    document: { id: "doc-it-global", title: "IT Accounts & Equipment Guide", department: "IT", country: "Global", language: "en", version: "v1.3", effective_date: "2026-06-01", status: "ready", policy_status: "current" },
    sections: [
      { id: "s1", title: "1. Day-one accounts", text: "On your first day, activate your Northstar SSO account using the link sent to your personal email, then enroll a passkey or authenticator app. Email, chat and the Expense portal are available through SSO." },
      { id: "s2", title: "2. Standard equipment", text: "Each employee receives one laptop and one external monitor. Additional equipment such as a second monitor or ergonomic keyboard can be requested in the IT portal with manager approval." },
    ],
  },
  {
    document: { id: "doc-security-kr", title: "정보보안 기본 지침", department: "Security", country: "KR", language: "ko", version: "v1.4", effective_date: "2026-02-10", status: "ready", policy_status: "current" },
    sections: [
      { id: "s1", title: "1. 보안 교육", text: "모든 신규 입사자는 입사 후 7일 이내에 온라인 보안 오리엔테이션을 이수해야 합니다. 교육은 약 40분이 소요됩니다." },
      { id: "s2", title: "2. 기기 관리", text: "업무용 노트북은 디스크 암호화와 화면 잠금(5분)을 반드시 설정해야 합니다." },
      { id: "s3", title: "3. 외부 공유", text: "고객 데이터는 승인된 저장소 외부로 공유할 수 없습니다." },
    ],
  },
  {
    document: { id: "doc-leave-kr", title: "연차휴가 운영 기준 (한국)", department: "People Ops", country: "KR", language: "ko", version: "v3.0", effective_date: "2026-01-01", status: "ready", policy_status: "current" },
    sections: [
      { id: "s1", title: "1. 신청 방법", text: "연차휴가는 HR 포털에서 사용 예정일 3영업일 전까지 신청합니다. 팀장 승인 후 확정됩니다." },
      { id: "s2", title: "2. 반차", text: "반차는 오전 또는 오후 4시간 단위로 사용할 수 있습니다." },
    ],
  },
  {
    document: { id: "doc-benefits-kr", title: "복리후생 안내 (한국)", department: "People Ops", country: "KR", language: "ko", version: "v2.0", effective_date: "2026-04-01", status: "processing", policy_status: "current" },
    sections: [{ id: "s1", title: "1. 건강검진", text: "연 1회 종합건강검진을 지원합니다." }],
  },
  {
    document: { id: "doc-onboarding-us", title: "Engineering Onboarding Checklist", department: "Engineering", country: "US", language: "en", version: "v0.9", effective_date: "2026-05-01", status: "pending", policy_status: "current" },
    sections: [],
  },
  {
    document: { id: "doc-procure-global", title: "Procurement Approval Matrix", department: "Finance", country: "Global", language: "en", version: "v1.1", effective_date: "2025-09-01", status: "failed", policy_status: "current" },
    sections: [],
  },
  {
    document: { id: "doc-remote-ca-old", title: "Remote Work Policy — Canada", department: "People Ops", country: "CA", language: "en", version: "v2.0", effective_date: "2024-06-01", status: "inactive", policy_status: "previous" },
    sections: [{ id: "s2", title: "2. Hybrid schedule", text: "Employees may work remotely up to two (2) days per week." }],
  },
];

export const pinnedDocumentIds = ["doc-travel-global", "doc-remote-ca", "doc-it-global"];
