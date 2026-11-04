# Next.js 포팅 순서 (체크리스트)

이 프로토타입은 참조본. 계약/자산은 복사, 화면은 다시 작성.

## 0. 계약·자산 먼저 고정
- [ ] `docs/API_CONTRACT.md`, `docs/PROTOTYPE_GUIDE.md` 복사
- [ ] `src/types/api.ts` 복사 (프론트/백엔드 공통 계약)
- [ ] `src/styles.css` 디자인 토큰 블록 → `app/globals.css`
- [ ] `src/i18n/en.ts`, `src/i18n/ko.ts` 복사
- [ ] `src/fixtures/` (chat, documents, evaluations, workspace) 복사 — 목업/테스트 데이터 전용

## 1. Next.js 뼈대
- [ ] App Router + TypeScript + Tailwind v4 스캐폴드
- [ ] globals.css 토큰 적용 (bg #F7F8FA, navy #172B4D, teal #087F8C 등)
- [ ] 폰트·기본 레이아웃 확인

## 2. 데이터 계층 (화면보다 먼저)
- [ ] `src/api/adapter.ts` 인터페이스
- [ ] `src/api/mock.ts` (fixtures 기반)
- [ ] `src/api/http.ts` (FastAPI 호출, 에러 → 메시지 + 재시도)
- [ ] `src/api/index.ts` 에서 mock/http 전환 (env)
- [ ] `src/lib/demo-date.ts` (`DEMO_TODAY = 2026-10-30`)
- [ ] 규칙: 컴포넌트는 `api`만 호출, `fetch` 직접 금지

## 3. 전역 상태 / 셸
- [ ] App context (언어 EN/KO 영구 저장, 데모 역할 미리보기)
- [ ] i18n 훅 `t()`
- [ ] WorkspaceShell: 사이드바 240px ↔ 아이콘 접힘(localStorage), 데모 데이터 배지
- [ ] Demo settings 패널(기본 접힘): 역할 스위치 + 안내문, Reset demo data, 기준일 텍스트
- [ ] 관리자 메뉴 노출은 `/me` capabilities 로만 판단

## 4. 화면 (의존성 순)
- [ ] Ask — 질문/답변, 인용, 출처 패시지 하이라이트, 복사
- [ ] Evidence 패널 + 신고 다이얼로그(Incorrect/Outdated/Source does not support/Other)
- [ ] Documents — 필터, 정책 상태(upcoming/current/previous), 관리자 전용 처리 상태·업로드
- [ ] Updates — 변경 카드, before/after 비교, 시행일, 맥락 질문
- [ ] Onboarding — 체크리스트, 진행률 Home 연동
- [ ] Home — 요약 카드들
- [ ] Admin Knowledge Health — 갭 6원인, 워크플로(Unreviewed → … → Resolved, 재검증 통과 시만), 피드백 큐, 문서 요청
- [ ] Evaluations — 지표 설명, 실행 설정, 실패 케이스 펼치기, "Not measured"

## 5. 영속화
- [ ] localStorage 키: `clarity.demo.reports.v1`, `clarity.demo.gaps.v1`, `clarity.demo.requests.v1`, `clarity.demo.onboarding.v1`
- [ ] Reset demo data 가 전부 비우기
- [ ] (실서비스) 이후 FastAPI 저장으로 교체

## 6. 마무리
- [ ] `src/test/` 규칙 테스트 이식 (정책 상태 판정, 재검증 게이트 등)
- [ ] EN/KO 전 화면 확인, 모바일 폭 확인
- [ ] 서버 측 관리자 권한 검증 (FastAPI)

## 복사 금지
- `routeTree.gen.ts`, `createFileRoute`, TanStack Router API → Next.js 라우팅으로 재작성
- 가이드 시나리오/“Next response” 시뮬레이터 → 되살리지 않음
