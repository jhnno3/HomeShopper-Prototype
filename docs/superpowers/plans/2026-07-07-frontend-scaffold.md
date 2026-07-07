# HomeShopper 프론트엔드 스캐폴드 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working, demo-able Next.js frontend for every page in the HomeShopper fake-door prototype, using mock data and stubbed login/analytics — no real backend, DB, or auth.

**Architecture:** A single Next.js 14 App Router project. All product data flows through typed mock fixtures in `lib/mock-data.ts` consumed via props; there is no network layer to swap later beyond re-implementing the same function signatures against real services. Kakao/Naver login and GA4 are stand-ins (a local-state modal, and `console.log` respectively) with the same call sites a real integration would use.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, lucide-react, `motion` (animation), Vitest + React Testing Library (component tests), npm.

## Design Addendum (2026-07-08 — overrides task details below where they conflict)

The visual foundation is the **landing-kit** at `docs/superpowers/specs/landing-kit/` (theme.css + 7 components). Rules:

1. **Scaffold with `create-next-app@latest` (Next 15 + Tailwind v4)**, not `@14` — the kit's `theme.css` uses Tailwind v4 syntax (`@utility`, `@theme inline`). Also `npm install clsx tailwind-merge` (kit deps). Task 1 Step 1's command changes accordingly; everything else in Task 1 stands.
2. **Copy the kit into the project**: `lib/cn.ts` from kit's `lib/`, kit components into `components/kit/`, and `theme.css` imported from `app/globals.css` (replacing the default Tailwind import per the kit README). Fix the components' `../lib/cn` imports to `@/lib/cn`.
3. **Theme tokens are the kit's**: Pretendard font, `--color-blue #0083ff` → `--color-purple #4c2ce2` gradient, `--color-bg #f4f6fb`, ink/slate text colors, `bg-glass`/`border-glass`/`shadow-glass`/`glass-edge`/`text-grad`/`bg-grad` utilities. Do NOT introduce other color palettes; the plan's `bg-blue-600`, `bg-gray-900` etc. in task code blocks should be replaced with kit tokens/utilities (`bg-grad` primary buttons, `GlassCard` surfaces, `text-[var(--color-slate)]` secondary text).
4. **Reuse kit components where they fit**: `Button`, `GlassCard`, `Nav`, `Hero` (adapt copy via props), `FeatureGrid` (How-it-works), `Footer`. Page-specific components (report tables, forms, progress animation) are new but must be styled with the same glass/token vocabulary.
5. **Design stance — minimal, calm, not overwhelming** (fake-door test): single-column layouts, one primary CTA per screen (secondary actions visually subordinate), max ~3 items per section, generous whitespace. Smooth transitions with `motion`: 150–300ms micro-interactions, ease-out entrances, subtle stagger (30–50ms) on lists, respect `prefers-reduced-motion`. No decorative animation beyond this.
6. Landing page (Task 3) uses kit `Nav` + `Hero` + `FeatureGrid` + `Footer` structure with the spec's HomeShopper copy; the plan's hand-rolled Hero/HowItWorks code blocks serve as content reference, not markup to copy verbatim. Test assertions on copy/hrefs still apply.

## Global Constraints

- Stack is exactly: Next.js (latest, App Router) · TypeScript · Tailwind CSS v4 · lucide-react · `motion` · clsx + tailwind-merge. No Supabase, no OAuth libraries, no HTTP client libraries — this phase is frontend-only.
- Never render a score, grade, or traffic-light indicator anywhere in report UI (spec §3.3.3 / §4.3: "판정·점수·등급·신호등 표시 금지"). Concerns are always presented as fact → reason → how-to-check, never a verdict.
- Legal disclaimer copy in the basic report (spec §3.3.6) must appear verbatim.
- Analytics event names must exactly match the taxonomy in spec §5: `analyze_start`, `analyze_complete`, `report_view`, `premium_cta_click`, `login_complete`, `premium_sent`, `premium_view`, `visit_cta_click`, `reserve_phone_complete`.
- Deployment target is Vercel — avoid any Node API that doesn't work in a serverless/edge context (not exercised in this phase, but keep in mind).
- Import alias is `@/*` mapping to the project root.

---

### Task 1: Project scaffold and test tooling

**Files:**
- Create: entire Next.js project via `create-next-app` (package.json, tsconfig.json, tailwind.config.ts, app/layout.tsx, app/page.tsx, app/globals.css, etc.)
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Test: `tests/setup-sanity.test.tsx`
- Modify: `package.json` (add `test` script)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: a running Next.js dev server (`npm run dev`), a working Vitest + jsdom + React Testing Library harness (`npm test`), and the `@/*` import alias resolving to the project root — every later task relies on both.

- [ ] **Step 1: Scaffold the Next.js project**

Run from `/Users/xxno/2026/HomeShopper/Home_prototype`:

```bash
npx --yes create-next-app@14 . --typescript --tailwind --eslint --app --import-alias "@/*" --use-npm --no-src-dir
```

If it prompts anyway, answer: TypeScript = Yes, ESLint = Yes, Tailwind = Yes, `src/` directory = No, App Router = Yes, import alias = `@/*`.

- [ ] **Step 2: Verify the default app runs**

Run: `npm run dev` (then stop it with Ctrl+C once you see "Ready" in the terminal — this is just a smoke check, not a running step for later tasks).

Expected: no errors, server starts on port 3000.

- [ ] **Step 3: Install animation and icon libraries**

```bash
npm install motion lucide-react
```

- [ ] **Step 4: Install test tooling**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @types/node
```

- [ ] **Step 5: Write the Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 6: Add the `test` script**

Modify `package.json` — add to the `"scripts"` block:

```json
"test": "vitest run"
```

- [ ] **Step 7: Write the failing sanity test**

Create `tests/setup-sanity.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

function Sample() {
  return <p>ok</p>;
}

describe('test environment', () => {
  it('renders with jsdom and testing-library', () => {
    render(<Sample />);
    expect(screen.getByText('ok')).toBeInTheDocument();
  });
});
```

- [ ] **Step 8: Run it to make sure the harness works**

Run: `npx vitest run tests/setup-sanity.test.tsx`
Expected: PASS (1 test passed). If it fails, the harness setup (Steps 3-6) is misconfigured — fix before continuing.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Scaffold Next.js project with Vitest + Testing Library harness"
```

---

### Task 2: Data contracts, mock fixtures, and analytics stub

**Files:**
- Create: `lib/types.ts`
- Create: `lib/mock-data.ts`
- Create: `lib/analytics.ts`
- Test: `tests/lib/mock-data.test.ts`
- Test: `tests/lib/analytics.test.ts`

**Interfaces:**
- Consumes: nothing new beyond Task 1's project structure.
- Produces:
  - Types: `DealType`, `ApiSourceStatus`, `Submission`, `ReportFacts`, `ReportConcern`, `RegistryFacts`, `Report`, `LoginProvider`, `PremiumRequest`, `VisitTiming`, `ReservationSource`, `Reservation`, `AnalyticsEvent`.
  - Functions/values: `getReportById(id: string): Report | undefined`, `mockReports: Report[]`, `mockPremiumRequests: PremiumRequest[]`, `demoReportId: string`, `trackEvent(name: AnalyticsEvent, payload?: Record<string, unknown>): void`.
  - Every later task imports from `@/lib/types`, `@/lib/mock-data`, and `@/lib/analytics` using exactly these names.

- [ ] **Step 1: Write the failing tests**

Create `tests/lib/mock-data.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getReportById, mockReports, demoReportId } from '@/lib/mock-data';

describe('mock-data', () => {
  it('returns the demo report by id', () => {
    const report = getReportById(demoReportId);
    expect(report?.id).toBe(demoReportId);
    expect(report?.tier).toBe('basic');
  });

  it('returns undefined for an unknown id', () => {
    expect(getReportById('does-not-exist')).toBeUndefined();
  });

  it('includes a report with a failed API status to exercise the partial-failure UI', () => {
    const failed = mockReports.find((r) => r.apiStatus.transactions === 'failed');
    expect(failed).toBeDefined();
  });

  it('includes a premium report with registry facts', () => {
    const premium = mockReports.find((r) => r.tier === 'premium');
    expect(premium?.registryFacts).toBeDefined();
  });
});
```

Create `tests/lib/analytics.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { trackEvent } from '@/lib/analytics';

describe('trackEvent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs the event name and payload to the console', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    trackEvent('report_view', { reportId: 'demo-1' });
    expect(logSpy).toHaveBeenCalledWith('[analytics] report_view', { reportId: 'demo-1' });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib`
Expected: FAIL — `Cannot find module '@/lib/mock-data'` (or similar, since the files don't exist yet).

- [ ] **Step 3: Write `lib/types.ts`**

```ts
export type DealType = '전세' | '월세';

export type ApiSourceStatus = 'ok' | 'failed' | 'pending';

export interface Submission {
  id: string;
  createdAt: string;
  sourceUrl?: string;
  addressNorm: string;
  region: string;
  dealType: DealType;
  deposit?: number;
  reportId: string;
}

export interface ReportFacts {
  recentTransactions: {
    summary: string;
    count: number;
    priceRangeLow: number;
    priceRangeHigh: number;
  };
  buildingRegistry: {
    summary: string;
    hasViolation: boolean;
    mainUse: string;
    approvalYear: number;
  };
  agencyValidity: {
    summary: string;
    isValid: boolean;
    registrationNumber?: string;
  } | null;
}

export interface ReportConcern {
  id: string;
  fact: string;
  reason: string;
  howToCheck: string;
}

export interface RegistryFacts {
  ownerMatchesLandlord: boolean;
  maxClaimAmount: number;
  priorLienSummary: string;
  priorDepositInfo: string;
}

export interface Report {
  id: string;
  submissionId: string;
  tier: 'basic' | 'premium';
  addressMasked: string;
  dealType: DealType;
  deposit?: number;
  facts: ReportFacts;
  registryFacts?: RegistryFacts;
  concerns: ReportConcern[];
  apiStatus: Record<'transactions' | 'registry' | 'agency', ApiSourceStatus>;
  shareCount: number;
  viewedAt?: string;
}

export type LoginProvider = 'kakao' | 'naver';

export interface PremiumRequest {
  id: string;
  reportId: string;
  userId: string;
  provider: LoginProvider;
  status: 'queued' | 'writing' | 'sent';
  requestedAt: string;
  sentAt?: string;
}

export type VisitTiming = '1주 내' | '1개월 내' | '미정';

export type ReservationSource = 'basic_report' | 'premium_report' | 'landing';

export interface Reservation {
  id: string;
  createdAt: string;
  reportId?: string;
  userId?: string;
  name: string;
  phone: string;
  region: string;
  visitTiming: VisitTiming;
  src: ReservationSource;
}
```

- [ ] **Step 4: Write `lib/mock-data.ts`**

```ts
import type { Report, Submission, PremiumRequest } from './types';

export const demoReportId = 'demo-1';

export const mockSubmission: Submission = {
  id: 'sub-1',
  createdAt: '2026-07-01T09:00:00Z',
  sourceUrl: 'https://land.naver.com/article/12345',
  addressNorm: '서울특별시 마포구 연남동 123-45',
  region: '서울 마포구',
  dealType: '전세',
  deposit: 32000,
  reportId: demoReportId,
};

export const mockReports: Report[] = [
  {
    id: demoReportId,
    submissionId: 'sub-1',
    tier: 'basic',
    addressMasked: '서울 마포구 연남동 OO번지 인근',
    dealType: '전세',
    deposit: 32000,
    facts: {
      recentTransactions: {
        summary: '인근 동일 유형 최근 전세 실거래 6건, 2.8억~3.4억',
        count: 6,
        priceRangeLow: 28000,
        priceRangeHigh: 34000,
      },
      buildingRegistry: {
        summary: '위반건축물 등재 없음, 주용도 다세대주택, 사용승인 2016년',
        hasViolation: false,
        mainUse: '다세대주택',
        approvalYear: 2016,
      },
      agencyValidity: {
        summary: '광고 게시 사무소 등록번호 정상',
        isValid: true,
        registrationNumber: '서울마포-2021-00123',
      },
    },
    concerns: [
      {
        id: 'concern-1',
        fact: '해당 매물의 보증금은 인근 실거래 평균 대비 다소 낮은 편입니다.',
        reason: '시세보다 낮은 보증금은 임대인의 자금 상황과 관련이 있을 수 있어 확인이 필요합니다.',
        howToCheck: '임대인에게 근저당 설정 여부와 대출 상환 계획을 직접 문의해보세요.',
      },
    ],
    apiStatus: { transactions: 'ok', registry: 'ok', agency: 'ok' },
    shareCount: 3,
    viewedAt: '2026-07-01T09:05:00Z',
  },
  {
    id: 'demo-2',
    submissionId: 'sub-2',
    tier: 'basic',
    addressMasked: '경기 성남시 분당구 OO번지 인근',
    dealType: '월세',
    deposit: 5000,
    facts: {
      recentTransactions: {
        summary: '확인이 지연되고 있어요. 완료되면 알려드릴까요?',
        count: 0,
        priceRangeLow: 0,
        priceRangeHigh: 0,
      },
      buildingRegistry: {
        summary: '위반건축물 등재 없음, 주용도 오피스텔, 사용승인 2019년',
        hasViolation: false,
        mainUse: '오피스텔',
        approvalYear: 2019,
      },
      agencyValidity: null,
    },
    concerns: [],
    apiStatus: { transactions: 'failed', registry: 'ok', agency: 'pending' },
    shareCount: 0,
  },
  {
    id: 'demo-3',
    submissionId: 'sub-3',
    tier: 'premium',
    addressMasked: '인천 부평구 OO번지 인근',
    dealType: '전세',
    deposit: 22000,
    facts: {
      recentTransactions: {
        summary: '인근 동일 유형 최근 전세 실거래 4건, 2.0억~2.5억',
        count: 4,
        priceRangeLow: 20000,
        priceRangeHigh: 25000,
      },
      buildingRegistry: {
        summary: '위반건축물 등재 없음, 주용도 다가구주택, 사용승인 2011년',
        hasViolation: false,
        mainUse: '다가구주택',
        approvalYear: 2011,
      },
      agencyValidity: {
        summary: '광고 게시 사무소 등록번호 정상',
        isValid: true,
        registrationNumber: '인천부평-2019-00456',
      },
    },
    registryFacts: {
      ownerMatchesLandlord: true,
      maxClaimAmount: 18000,
      priorLienSummary: '선순위 근저당 1건 존재',
      priorDepositInfo: '채권최고액과 보증금 합계가 시세의 약 92%',
    },
    concerns: [
      {
        id: 'concern-2',
        fact: '채권최고액과 보증금 합계가 시세의 약 92%에 해당합니다.',
        reason: '경매 등 상황 발생 시 보증금 전액을 회수하지 못할 가능성이 있어 확인이 필요합니다.',
        howToCheck: '등기부등본상 선순위 채권 내역을 등기소에서 다시 확인하고 전문가와 상담해보세요.',
      },
    ],
    apiStatus: { transactions: 'ok', registry: 'ok', agency: 'ok' },
    shareCount: 12,
    viewedAt: '2026-07-03T14:20:00Z',
  },
];

export const mockPremiumRequests: PremiumRequest[] = [
  {
    id: 'pr-1',
    reportId: 'demo-1',
    userId: 'user-1',
    provider: 'kakao',
    status: 'queued',
    requestedAt: '2026-07-01T09:10:00Z',
  },
  {
    id: 'pr-2',
    reportId: 'demo-3',
    userId: 'user-2',
    provider: 'naver',
    status: 'sent',
    requestedAt: '2026-06-28T11:00:00Z',
    sentAt: '2026-06-29T10:00:00Z',
  },
];

export function getReportById(id: string): Report | undefined {
  return mockReports.find((r) => r.id === id);
}
```

- [ ] **Step 5: Write `lib/analytics.ts`**

```ts
export type AnalyticsEvent =
  | 'analyze_start'
  | 'analyze_complete'
  | 'report_view'
  | 'premium_cta_click'
  | 'login_complete'
  | 'premium_sent'
  | 'premium_view'
  | 'visit_cta_click'
  | 'reserve_phone_complete';

export function trackEvent(name: AnalyticsEvent, payload?: Record<string, unknown>): void {
  console.log(`[analytics] ${name}`, payload ?? {});
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run tests/lib`
Expected: PASS (5 tests passed).

- [ ] **Step 7: Commit**

```bash
git add lib tests/lib
git commit -m "Add data contracts, mock report fixtures, and analytics stub"
```

---

### Task 3: Landing page (`/`)

**Files:**
- Create: `components/landing/Hero.tsx`
- Create: `components/landing/HowItWorks.tsx`
- Create: `components/landing/SampleReportPreview.tsx`
- Create: `components/landing/TrustSection.tsx`
- Create: `components/landing/ReserveBanner.tsx`
- Modify: `app/page.tsx` (replace default `create-next-app` content)
- Modify: `app/layout.tsx` (replace default metadata)
- Test: `tests/app/landing.test.tsx`

**Interfaces:**
- Consumes: nothing beyond Next.js `Link`.
- Produces: `app/page.tsx` default export (`LandingPage`) composing the five landing components. No other task depends on these components' internals, only on the routes they link to (`/analyze`, `/reserve?src=landing`).

- [ ] **Step 1: Write the failing test**

Create `tests/app/landing.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LandingPage from '@/app/page';

describe('LandingPage', () => {
  it('renders the hero headline and a link into the analyze flow', () => {
    render(<LandingPage />);
    expect(
      screen.getByText('그 매물, 임장 가기 전에 30초 만에 서류부터 확인하세요')
    ).toBeInTheDocument();
    expect(screen.getByText('무료로 서류 확인하기').closest('a')).toHaveAttribute('href', '/analyze');
  });

  it('expands an FAQ answer on click', () => {
    render(<LandingPage />);
    expect(
      screen.queryByText('베이직 리포트는 로그인 없이 무료로 확인할 수 있어요.')
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('정말 무료인가요?'));
    expect(
      screen.getByText('베이직 리포트는 로그인 없이 무료로 확인할 수 있어요.')
    ).toBeInTheDocument();
  });

  it('links the reserve banner to the reserve page with a landing source', () => {
    render(<LandingPage />);
    expect(screen.getByText('사전예약하기').closest('a')).toHaveAttribute('href', '/reserve?src=landing');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/app/landing.test.tsx`
Expected: FAIL (landing page still has the default `create-next-app` content).

- [ ] **Step 3: Write the landing components**

Create `components/landing/Hero.tsx`:

```tsx
import Link from 'next/link';

export function Hero() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold sm:text-4xl">
        그 매물, 임장 가기 전에 30초 만에 서류부터 확인하세요
      </h1>
      <p className="mt-3 text-gray-500">가입 없이 무료</p>
      <Link
        href="/analyze"
        className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white"
      >
        무료로 서류 확인하기
      </Link>
    </section>
  );
}
```

Create `components/landing/HowItWorks.tsx`:

```tsx
const STEPS = [
  { title: '붙여넣기', desc: '매물 링크나 주소를 입력하세요' },
  { title: '30초 분석', desc: '공공 데이터로 서류를 자동 확인해요' },
  { title: '리포트', desc: '실거래가·건축물대장·중개업소 확인 결과를 받아보세요' },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h2 className="text-center text-2xl font-bold">이렇게 확인해요</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <div key={step.title} className="rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-sm font-semibold text-blue-600">STEP {index + 1}</p>
            <p className="mt-2 font-bold">{step.title}</p>
            <p className="mt-1 text-sm text-gray-500">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

Create `components/landing/SampleReportPreview.tsx`:

```tsx
export function SampleReportPreview() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h2 className="text-center text-2xl font-bold">리포트 샘플 미리보기</h2>
      <div className="relative mt-8 overflow-hidden rounded-lg border border-gray-200 p-6">
        <div className="pointer-events-none select-none space-y-3 blur-sm" aria-hidden="true">
          <p className="font-semibold">서울 마포구 연남동 OO번지 인근</p>
          <p className="text-sm text-gray-600">인근 동일 유형 최근 전세 실거래 6건, 2.8억~3.4억</p>
          <p className="text-sm text-gray-600">위반건축물 등재 없음, 사용승인 2016년</p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/40">
          <span className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
            샘플입니다
          </span>
        </div>
      </div>
    </section>
  );
}
```

Create `components/landing/TrustSection.tsx`:

```tsx
'use client';
import { useState } from 'react';

const FAQS = [
  { q: '정말 무료인가요?', a: '베이직 리포트는 로그인 없이 무료로 확인할 수 있어요.' },
  { q: '전국 어디서나 되나요?', a: '자동 분석은 공공 API 기반으로 전국에서 동작해요.' },
  { q: '실제 매물 추천도 해주나요?', a: '아니요, 사용자가 가져온 매물의 공부상 사실만 정리해 제공해요.' },
];

export function TrustSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-center text-sm text-gray-500">하나 소셜벤처 선정 · 경기도 공공데이터 활용 수상</p>

      <h2 className="mt-10 text-center text-2xl font-bold">자주 묻는 질문</h2>
      <div className="mt-6 space-y-2">
        {FAQS.map((faq, index) => (
          <div key={faq.q} className="rounded-lg border border-gray-200">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
            >
              {faq.q}
            </button>
            {openIndex === index && <p className="px-4 pb-3 text-sm text-gray-600">{faq.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
```

Create `components/landing/ReserveBanner.tsx`:

```tsx
import Link from 'next/link';

export function ReserveBanner() {
  return (
    <section className="bg-gray-900 px-6 py-10 text-center text-white">
      <p className="text-lg font-semibold">동행 임장 · 반값 정찰 중개, 사전예약 진행 중</p>
      <Link
        href="/reserve?src=landing"
        className="mt-4 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900"
      >
        사전예약하기
      </Link>
    </section>
  );
}
```

- [ ] **Step 4: Replace `app/page.tsx`**

```tsx
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { SampleReportPreview } from '@/components/landing/SampleReportPreview';
import { TrustSection } from '@/components/landing/TrustSection';
import { ReserveBanner } from '@/components/landing/ReserveBanner';

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <SampleReportPreview />
      <TrustSection />
      <ReserveBanner />
    </main>
  );
}
```

- [ ] **Step 5: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '홈쇼퍼 | 서류 선검증 프리토타입',
  description: '계약 전 서류부터 30초 만에 확인하세요',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/app/landing.test.tsx`
Expected: PASS (3 tests passed).

- [ ] **Step 7: Commit**

```bash
git add app components/landing tests/app/landing.test.tsx
git commit -m "Build landing page from mock content"
```

---

### Task 4: `/analyze` submission and progress flow

**Files:**
- Create: `components/analyze/ProgressAnimation.tsx`
- Create: `app/analyze/page.tsx`
- Test: `tests/app/analyze.test.tsx`

**Interfaces:**
- Consumes: `demoReportId` from `@/lib/mock-data`, `trackEvent` from `@/lib/analytics`, `DealType` from `@/lib/types`.
- Produces: `app/analyze/page.tsx` default export (`AnalyzePage`), `ProgressAnimation({ onComplete, stepDurationMs? }: { onComplete: () => void; stepDurationMs?: number })`. No later task imports these directly (navigation only, via `router.push`).

- [ ] **Step 1: Write the failing test**

Create `tests/app/analyze.test.tsx`:

```tsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AnalyzePage from '@/app/analyze/page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('AnalyzePage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    pushMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('walks through both steps and redirects to the report after progress completes', () => {
    render(<AnalyzePage />);

    fireEvent.change(screen.getByLabelText('매물 링크'), {
      target: { value: 'https://land.naver.com/article/1' },
    });
    fireEvent.click(screen.getByText('다음'));

    expect(screen.getByText('거래 정보를 알려주세요')).toBeInTheDocument();

    fireEvent.click(screen.getByText('분석 시작'));

    expect(screen.getByText('서류를 확인하고 있어요')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(pushMock).toHaveBeenCalledWith('/report/demo-1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/app/analyze.test.tsx`
Expected: FAIL — `app/analyze/page.tsx` does not exist yet.

- [ ] **Step 3: Write `components/analyze/ProgressAnimation.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

const STEPS = ['실거래가 조회', '건축물대장 확인', '광고 중개사무소 검증'];

interface ProgressAnimationProps {
  onComplete: () => void;
  stepDurationMs?: number;
}

export function ProgressAnimation({ onComplete, stepDurationMs = 700 }: ProgressAnimationProps) {
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (completedCount >= STEPS.length) {
      const finishTimer = setTimeout(onComplete, stepDurationMs);
      return () => clearTimeout(finishTimer);
    }
    const timer = setTimeout(() => setCompletedCount((c) => c + 1), stepDurationMs);
    return () => clearTimeout(timer);
  }, [completedCount, onComplete, stepDurationMs]);

  return (
    <div className="space-y-4" role="status" aria-label="분석 진행 상황">
      {STEPS.map((label, index) => (
        <motion.div
          key={label}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: index < completedCount ? 1 : 0.3 }}
          className="flex items-center gap-3 text-sm"
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full border ${
              index < completedCount
                ? 'border-green-600 bg-green-600 text-white'
                : 'border-gray-300 text-gray-300'
            }`}
          >
            <Check size={14} />
          </span>
          <span className={index < completedCount ? 'text-gray-900' : 'text-gray-400'}>{label}</span>
        </motion.div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Write `app/analyze/page.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressAnimation } from '@/components/analyze/ProgressAnimation';
import { trackEvent } from '@/lib/analytics';
import { demoReportId } from '@/lib/mock-data';
import type { DealType } from '@/lib/types';

type Step = 'input' | 'details' | 'progress';

export default function AnalyzePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('input');
  const [inputMode, setInputMode] = useState<'link' | 'address'>('link');
  const [sourceValue, setSourceValue] = useState('');
  const [dealType, setDealType] = useState<DealType>('전세');
  const [deposit, setDeposit] = useState('');

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sourceValue.trim()) return;
    setStep('details');
  }

  function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault();
    trackEvent('analyze_start', { inputMode, dealType });
    setStep('progress');
  }

  function handleProgressComplete() {
    trackEvent('analyze_complete', { reportId: demoReportId });
    router.push(`/report/${demoReportId}`);
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      {step === 'input' && (
        <form onSubmit={handleStep1Submit} className="space-y-4">
          <h1 className="text-2xl font-bold">매물 정보를 알려주세요</h1>
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => setInputMode('link')}
              className={inputMode === 'link' ? 'font-semibold text-blue-600' : 'text-gray-400'}
            >
              링크로 입력
            </button>
            <button
              type="button"
              onClick={() => setInputMode('address')}
              className={inputMode === 'address' ? 'font-semibold text-blue-600' : 'text-gray-400'}
            >
              주소로 입력
            </button>
          </div>
          <input
            type="text"
            value={sourceValue}
            onChange={(e) => setSourceValue(e.target.value)}
            placeholder={inputMode === 'link' ? '매물 링크를 붙여넣으세요' : '주소를 입력하세요'}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
            aria-label={inputMode === 'link' ? '매물 링크' : '매물 주소'}
          />
          <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white">
            다음
          </button>
        </form>
      )}

      {step === 'details' && (
        <form onSubmit={handleStep2Submit} className="space-y-4">
          <h1 className="text-2xl font-bold">거래 정보를 알려주세요</h1>
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => setDealType('전세')}
              className={dealType === '전세' ? 'font-semibold text-blue-600' : 'text-gray-400'}
            >
              전세
            </button>
            <button
              type="button"
              onClick={() => setDealType('월세')}
              className={dealType === '월세' ? 'font-semibold text-blue-600' : 'text-gray-400'}
            >
              월세
            </button>
          </div>
          <input
            type="number"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            placeholder="보증금 (선택, 단위: 만원)"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
            aria-label="보증금"
          />
          <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white">
            분석 시작
          </button>
        </form>
      )}

      {step === 'progress' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">서류를 확인하고 있어요</h1>
          <ProgressAnimation onComplete={handleProgressComplete} />
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/app/analyze.test.tsx`
Expected: PASS (1 test passed).

- [ ] **Step 6: Commit**

```bash
git add components/analyze app/analyze tests/app/analyze.test.tsx
git commit -m "Build /analyze submission form and progress animation"
```

---

### Task 5: `/report/[id]` basic report

**Files:**
- Create: `components/report/FactsTable.tsx`
- Create: `components/report/ConcernsList.tsx`
- Create: `components/report/UpgradeCard.tsx`
- Create: `components/report/VisitCta.tsx`
- Create: `components/report/Disclaimer.tsx`
- Create: `app/report/[id]/page.tsx`
- Test: `tests/app/report.test.tsx`

**Interfaces:**
- Consumes: `getReportById`, `mockReports` from `@/lib/mock-data`; `trackEvent` from `@/lib/analytics`; `ReportFacts`, `ApiSourceStatus`, `ReportConcern`, `LoginProvider`, `ReservationSource` from `@/lib/types`.
- Produces: `app/report/[id]/page.tsx` default export (`ReportPage`); `FactsTable({ facts, apiStatus })`, `ConcernsList({ concerns })`, `UpgradeCard({ reportId })`, `VisitCta({ reportId, tier, src })`, `Disclaimer()` — all four report components are reused as-is by Task 6.

- [ ] **Step 1: Write the failing test**

Create `tests/app/report.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ReportPage from '@/app/report/[id]/page';

describe('ReportPage', () => {
  it('shows a pending message for facts whose API call failed', () => {
    render(<ReportPage params={{ id: 'demo-2' }} />);
    expect(
      screen.getAllByText('확인이 지연되고 있어요. 완료되면 알려드릴까요?').length
    ).toBeGreaterThan(0);
  });

  it('renders concerns and lets the user complete the login stub', () => {
    render(<ReportPage params={{ id: 'demo-1' }} />);

    expect(
      screen.getByText('해당 매물의 보증금은 인근 실거래 평균 대비 다소 낮은 편입니다.')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('카카오로 3초 만에 받기'));
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } });
    fireEvent.click(screen.getByText('카카오로 계속하기'));

    expect(screen.getByText('접수 완료 · 접수번호 #HS-0041')).toBeInTheDocument();
  });

  it('links the visit CTA to the reserve page with the basic_report source', () => {
    render(<ReportPage params={{ id: 'demo-1' }} />);
    const link = screen.getByText('이 매물, 전문가와 동행 임장하기').closest('a');
    expect(link).toHaveAttribute('href', '/reserve?src=basic_report&reportId=demo-1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/app/report.test.tsx`
Expected: FAIL — `app/report/[id]/page.tsx` does not exist yet.

- [ ] **Step 3: Write `components/report/FactsTable.tsx`**

```tsx
import type { ReportFacts, ApiSourceStatus } from '@/lib/types';

interface FactsTableProps {
  facts: ReportFacts;
  apiStatus: Record<'transactions' | 'registry' | 'agency', ApiSourceStatus>;
}

function pendingMessage(status: ApiSourceStatus) {
  return status === 'failed' || status === 'pending'
    ? '확인이 지연되고 있어요. 완료되면 알려드릴까요?'
    : null;
}

export function FactsTable({ facts, apiStatus }: FactsTableProps) {
  const rows = [
    { label: '실거래가', value: pendingMessage(apiStatus.transactions) ?? facts.recentTransactions.summary },
    { label: '건축물대장', value: pendingMessage(apiStatus.registry) ?? facts.buildingRegistry.summary },
    {
      label: '중개업소',
      value: facts.agencyValidity
        ? facts.agencyValidity.summary
        : pendingMessage(apiStatus.agency) ?? '링크 제출 시 확인됩니다',
    },
  ];

  return (
    <section aria-label="확인 결과">
      <h2 className="mb-3 text-lg font-semibold">확인 결과</h2>
      <dl className="divide-y divide-gray-200 rounded-lg border border-gray-200">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 px-4 py-3 text-sm">
            <dt className="font-medium text-gray-600">{row.label}</dt>
            <dd className="text-right text-gray-900">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

- [ ] **Step 4: Write `components/report/ConcernsList.tsx`**

```tsx
import type { ReportConcern } from '@/lib/types';

export function ConcernsList({ concerns }: { concerns: ReportConcern[] }) {
  if (concerns.length === 0) return null;

  return (
    <section aria-label="함께 확인해보시면 좋은 부분">
      <h2 className="mb-3 text-lg font-semibold">함께 확인해보시면 좋은 부분</h2>
      <ul className="space-y-4">
        {concerns.map((concern) => (
          <li key={concern.id} className="rounded-lg bg-amber-50 p-4 text-sm text-gray-800">
            <p>{concern.fact}</p>
            <p className="mt-1 text-gray-600">{concern.reason}</p>
            <p className="mt-1 font-medium text-amber-800">{concern.howToCheck}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 5: Write `components/report/UpgradeCard.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import type { LoginProvider } from '@/lib/types';

export function UpgradeCard({ reportId }: { reportId: string }) {
  const [loggedInAs, setLoggedInAs] = useState<{ provider: LoginProvider; name: string } | null>(null);
  const [pendingProvider, setPendingProvider] = useState<LoginProvider | null>(null);
  const [nameInput, setNameInput] = useState('');

  function openLoginStub(provider: LoginProvider) {
    trackEvent('premium_cta_click', { reportId, provider });
    setPendingProvider(provider);
  }

  function confirmLoginStub(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingProvider || !nameInput.trim()) return;
    setLoggedInAs({ provider: pendingProvider, name: nameInput.trim() });
    trackEvent('login_complete', { reportId, provider: pendingProvider });
    setPendingProvider(null);
  }

  return (
    <section className="rounded-lg border border-blue-200 bg-blue-50 p-5">
      <h2 className="font-semibold">등기부 분석은 정밀 리포트에서</h2>
      <p className="mt-1 text-sm text-gray-700">
        소유자·근저당·선순위 보증금까지 전문가가 직접 확인해 24시간 내 보내드립니다. 지금은 무료.
      </p>

      {loggedInAs ? (
        <p className="mt-4 text-sm font-medium text-blue-700">접수 완료 · 접수번호 #HS-0041</p>
      ) : pendingProvider ? (
        <form onSubmit={confirmLoginStub} className="mt-4 flex gap-2">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="이름"
            aria-label="이름"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
            {pendingProvider === 'kakao' ? '카카오로 계속하기' : '네이버로 계속하기'}
          </button>
        </form>
      ) : (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => openLoginStub('kakao')}
            className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-gray-900"
          >
            카카오로 3초 만에 받기
          </button>
          <button
            onClick={() => openLoginStub('naver')}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"
          >
            네이버로 받기
          </button>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 6: Write `components/report/VisitCta.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';
import type { ReservationSource } from '@/lib/types';

export function VisitCta({
  reportId,
  tier,
  src,
}: {
  reportId: string;
  tier: 'basic' | 'premium';
  src: ReservationSource;
}) {
  return (
    <section className="rounded-lg border border-gray-200 p-5 text-center">
      <p className="text-sm text-gray-600">
        서류로 확인할 수 없는 것들: 누수 · 곰팡이 · 소음 · 실측 — 임장에서 확인합니다
      </p>
      <Link
        href={`/reserve?src=${src}&reportId=${reportId}`}
        onClick={() => trackEvent('visit_cta_click', { reportId, tier })}
        className="mt-3 inline-block rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white"
      >
        이 매물, 전문가와 동행 임장하기
      </Link>
    </section>
  );
}
```

- [ ] **Step 7: Write `components/report/Disclaimer.tsx`**

```tsx
export function Disclaimer() {
  return (
    <p className="text-xs text-gray-400">
      본 리포트는 공개된 공부 기재 사항을 정리한 정보 제공 자료로, 법률 자문·감정평가·중개행위에
      해당하지 않으며 계약 판단의 책임은 이용자에게 있습니다.
    </p>
  );
}
```

- [ ] **Step 8: Write `app/report/[id]/page.tsx`**

```tsx
'use client';
import { useEffect } from 'react';
import { getReportById, mockReports } from '@/lib/mock-data';
import { FactsTable } from '@/components/report/FactsTable';
import { ConcernsList } from '@/components/report/ConcernsList';
import { UpgradeCard } from '@/components/report/UpgradeCard';
import { VisitCta } from '@/components/report/VisitCta';
import { Disclaimer } from '@/components/report/Disclaimer';
import { trackEvent } from '@/lib/analytics';

export default function ReportPage({ params }: { params: { id: string } }) {
  const report = getReportById(params.id) ?? mockReports[0];

  useEffect(() => {
    trackEvent('report_view', { reportId: report.id, tier: report.tier });
  }, [report.id, report.tier]);

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-6 py-12">
      <header>
        <p className="text-sm text-gray-500">
          {report.dealType} · 보증금 {report.deposit?.toLocaleString()}만원
        </p>
        <h1 className="text-xl font-bold">{report.addressMasked}</h1>
      </header>

      <FactsTable facts={report.facts} apiStatus={report.apiStatus} />
      <ConcernsList concerns={report.concerns} />
      <UpgradeCard reportId={report.id} />
      <VisitCta reportId={report.id} tier={report.tier} src="basic_report" />
      <Disclaimer />
    </main>
  );
}
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npx vitest run tests/app/report.test.tsx`
Expected: PASS (3 tests passed).

- [ ] **Step 10: Commit**

```bash
git add components/report app/report tests/app/report.test.tsx
git commit -m "Build basic report page with upgrade card and visit CTA"
```

---

### Task 6: `/report/[id]/premium` premium report

**Files:**
- Create: `components/report/RegistrySection.tsx`
- Create: `app/report/[id]/premium/page.tsx`
- Test: `tests/app/premium-report.test.tsx`

**Interfaces:**
- Consumes: `getReportById`, `mockReports` from `@/lib/mock-data`; `trackEvent` from `@/lib/analytics`; `RegistryFacts` from `@/lib/types`; `FactsTable`, `ConcernsList`, `VisitCta`, `Disclaimer` from Task 5 (unchanged signatures).
- Produces: `app/report/[id]/premium/page.tsx` default export (`PremiumReportPage`); `RegistrySection({ registry })`. No later task depends on these.

- [ ] **Step 1: Write the failing test**

Create `tests/app/premium-report.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PremiumReportPage from '@/app/report/[id]/premium/page';

describe('PremiumReportPage', () => {
  it('renders the registry section for a premium report', () => {
    render(<PremiumReportPage params={{ id: 'demo-3' }} />);

    expect(screen.getByText('등기부 분석')).toBeInTheDocument();
    expect(screen.getByText('선순위 근저당 1건 존재')).toBeInTheDocument();
  });

  it('links the visit CTA to the reserve page with the premium_report source', () => {
    render(<PremiumReportPage params={{ id: 'demo-3' }} />);
    const link = screen.getByText('이 매물, 전문가와 동행 임장하기').closest('a');
    expect(link).toHaveAttribute('href', '/reserve?src=premium_report&reportId=demo-3');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/app/premium-report.test.tsx`
Expected: FAIL — `app/report/[id]/premium/page.tsx` does not exist yet.

- [ ] **Step 3: Write `components/report/RegistrySection.tsx`**

```tsx
import type { RegistryFacts } from '@/lib/types';

export function RegistrySection({ registry }: { registry: RegistryFacts }) {
  return (
    <section aria-label="등기부 분석">
      <h2 className="mb-3 text-lg font-semibold">등기부 분석</h2>
      <dl className="divide-y divide-gray-200 rounded-lg border border-gray-200">
        <div className="flex justify-between gap-4 px-4 py-3 text-sm">
          <dt className="font-medium text-gray-600">소유자–임대인 일치</dt>
          <dd className="text-right text-gray-900">
            {registry.ownerMatchesLandlord ? '일치' : '불일치 — 확인 필요'}
          </dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3 text-sm">
          <dt className="font-medium text-gray-600">근저당 채권최고액</dt>
          <dd className="text-right text-gray-900">{registry.maxClaimAmount.toLocaleString()}만원</dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3 text-sm">
          <dt className="font-medium text-gray-600">선순위 관계</dt>
          <dd className="text-right text-gray-900">{registry.priorLienSummary}</dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3 text-sm">
          <dt className="font-medium text-gray-600">선순위 보증금 정보</dt>
          <dd className="text-right text-gray-900">{registry.priorDepositInfo}</dd>
        </div>
      </dl>
    </section>
  );
}
```

- [ ] **Step 4: Write `app/report/[id]/premium/page.tsx`**

```tsx
'use client';
import { useEffect } from 'react';
import { getReportById, mockReports } from '@/lib/mock-data';
import { FactsTable } from '@/components/report/FactsTable';
import { ConcernsList } from '@/components/report/ConcernsList';
import { RegistrySection } from '@/components/report/RegistrySection';
import { VisitCta } from '@/components/report/VisitCta';
import { Disclaimer } from '@/components/report/Disclaimer';
import { trackEvent } from '@/lib/analytics';

export default function PremiumReportPage({ params }: { params: { id: string } }) {
  const report =
    getReportById(params.id) ?? mockReports.find((r) => r.tier === 'premium') ?? mockReports[0];

  useEffect(() => {
    trackEvent('premium_view', { reportId: report.id });
  }, [report.id]);

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-6 py-12">
      <header>
        <p className="text-sm text-gray-500">
          {report.dealType} · 보증금 {report.deposit?.toLocaleString()}만원
        </p>
        <h1 className="text-xl font-bold">{report.addressMasked}</h1>
        <span className="mt-1 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          정밀 리포트
        </span>
      </header>

      <FactsTable facts={report.facts} apiStatus={report.apiStatus} />
      {report.registryFacts && <RegistrySection registry={report.registryFacts} />}
      <ConcernsList concerns={report.concerns} />
      <VisitCta reportId={report.id} tier={report.tier} src="premium_report" />
      <Disclaimer />
    </main>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/app/premium-report.test.tsx`
Expected: PASS (2 tests passed).

- [ ] **Step 6: Commit**

```bash
git add components/report/RegistrySection.tsx app/report/[id]/premium tests/app/premium-report.test.tsx
git commit -m "Build premium report page with registry section"
```

---

### Task 7: `/reserve` reservation form

**Files:**
- Create: `components/reserve/ReserveForm.tsx`
- Create: `app/reserve/page.tsx`
- Test: `tests/components/reserve-form.test.tsx`

**Interfaces:**
- Consumes: `trackEvent` from `@/lib/analytics`; `VisitTiming`, `ReservationSource` from `@/lib/types`.
- Produces: `components/reserve/ReserveForm.tsx` (`ReserveForm`, no props — reads `src`/`reportId` from `useSearchParams`); `app/reserve/page.tsx` default export wrapping it in `<Suspense>`. No later task depends on these.

- [ ] **Step 1: Write the failing test**

Create `tests/components/reserve-form.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReserveForm } from '@/components/reserve/ReserveForm';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('src=basic_report&reportId=demo-1'),
}));

describe('ReserveForm', () => {
  it('does not submit without a phone number', () => {
    render(<ReserveForm />);
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '김민지' } });
    fireEvent.click(screen.getByText('사전예약 신청'));
    expect(screen.queryByText('사전예약이 완료됐어요')).not.toBeInTheDocument();
  });

  it('shows a confirmation screen once name and phone are filled in', () => {
    render(<ReserveForm />);
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '김민지' } });
    fireEvent.change(screen.getByLabelText('전화번호'), { target: { value: '010-1111-2222' } });
    fireEvent.click(screen.getByText('사전예약 신청'));
    expect(screen.getByText('사전예약이 완료됐어요')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/reserve-form.test.tsx`
Expected: FAIL — `@/components/reserve/ReserveForm` does not exist yet.

- [ ] **Step 3: Write `components/reserve/ReserveForm.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';
import type { VisitTiming, ReservationSource } from '@/lib/types';

const VISIT_TIMINGS: VisitTiming[] = ['1주 내', '1개월 내', '미정'];

export function ReserveForm() {
  const searchParams = useSearchParams();
  const src = (searchParams.get('src') as ReservationSource) ?? 'landing';
  const reportId = searchParams.get('reportId') ?? undefined;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [visitTiming, setVisitTiming] = useState<VisitTiming>('미정');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    trackEvent('reserve_phone_complete', { src, reportId });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="text-xl font-bold">사전예약이 완료됐어요</h1>
        <p className="mt-2 text-sm text-gray-600">예약 순번 #128</p>
        <button className="mt-6 rounded-lg bg-yellow-400 px-5 py-3 text-sm font-semibold text-gray-900">
          오픈 소식과 임장 일정을 카톡으로
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <p className="rounded-lg bg-gray-100 p-4 text-sm text-gray-700">
        동행 임장·반값 정찰 수수료 중개는 정식 오픈 준비 중입니다. 지금 신청하시면 오픈 시 우선
        배정해드려요.
      </p>
      <p className="mt-3 text-sm font-medium text-blue-700">
        사전예약자 전원 프리미엄 AI 권리분석 무료 — 계약 후 등기부 변동 자동 모니터링 + 특약 문구
        추천 포함
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          aria-label="이름"
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="전화번호"
          aria-label="전화번호"
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="희망 지역"
          aria-label="희망 지역"
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />
        <div className="flex gap-2 text-sm">
          {VISIT_TIMINGS.map((timing) => (
            <button
              key={timing}
              type="button"
              onClick={() => setVisitTiming(timing)}
              className={visitTiming === timing ? 'font-semibold text-blue-600' : 'text-gray-400'}
            >
              {timing}
            </button>
          ))}
        </div>
        <button type="submit" className="w-full rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white">
          사전예약 신청
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Write `app/reserve/page.tsx`**

```tsx
import { Suspense } from 'react';
import { ReserveForm } from '@/components/reserve/ReserveForm';

export default function ReservePage() {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-center text-sm text-gray-400">불러오는 중...</p>}>
      <ReserveForm />
    </Suspense>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/components/reserve-form.test.tsx`
Expected: PASS (2 tests passed).

- [ ] **Step 6: Commit**

```bash
git add components/reserve app/reserve tests/components/reserve-form.test.tsx
git commit -m "Build /reserve form with local confirmation state"
```

---

### Task 8: `/admin` premium request queue

**Files:**
- Create: `app/admin/page.tsx`
- Test: `tests/app/admin.test.tsx`

**Interfaces:**
- Consumes: `mockPremiumRequests` from `@/lib/mock-data`; `PremiumRequest` from `@/lib/types`.
- Produces: `app/admin/page.tsx` default export (`AdminPage`). Terminal task — nothing depends on it.

- [ ] **Step 1: Write the failing test**

Create `tests/app/admin.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AdminPage from '@/app/admin/page';

describe('AdminPage', () => {
  it('rejects invalid JSON when sending a report', () => {
    render(<AdminPage />);
    fireEvent.click(screen.getAllByText('작성하기')[0]);
    fireEvent.change(screen.getByLabelText('리포트 JSON'), { target: { value: '{invalid' } });
    fireEvent.click(screen.getByText('발송 처리'));
    expect(screen.getByText('유효한 JSON이 아닙니다')).toBeInTheDocument();
  });

  it('marks a request as sent once valid JSON is submitted', () => {
    render(<AdminPage />);
    fireEvent.click(screen.getAllByText('작성하기')[0]);
    fireEvent.change(screen.getByLabelText('리포트 JSON'), { target: { value: '{"facts": {}}' } });
    fireEvent.click(screen.getByText('발송 처리'));
    expect(screen.getAllByText('sent')).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/app/admin.test.tsx`
Expected: FAIL — `app/admin/page.tsx` does not exist yet.

- [ ] **Step 3: Write `app/admin/page.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { mockPremiumRequests } from '@/lib/mock-data';
import type { PremiumRequest } from '@/lib/types';

export default function AdminPage() {
  const [requests, setRequests] = useState<PremiumRequest[]>(mockPremiumRequests);
  const [jsonInput, setJsonInput] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    try {
      JSON.parse(jsonInput || '{}');
    } catch {
      setError('유효한 JSON이 아닙니다');
      return;
    }
    setError(null);
    setRequests((prev) =>
      prev.map((req) =>
        req.id === selectedId ? { ...req, status: 'sent', sentAt: new Date().toISOString() } : req
      )
    );
    setJsonInput('');
    setSelectedId(null);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <h1 className="text-xl font-bold">정밀 리포트 요청 큐</h1>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="py-2">리포트 ID</th>
            <th className="py-2">제공자</th>
            <th className="py-2">상태</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id} className="border-b border-gray-100">
              <td className="py-2">{req.reportId}</td>
              <td className="py-2">{req.provider}</td>
              <td className="py-2">{req.status}</td>
              <td className="py-2">
                {req.status !== 'sent' && (
                  <button onClick={() => setSelectedId(req.id)} className="text-blue-600 underline">
                    작성하기
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedId && (
        <form onSubmit={handleSend} className="space-y-3">
          <h2 className="font-semibold">리포트 JSON 입력 — {selectedId}</h2>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            aria-label="리포트 JSON"
            rows={6}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-xs"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
            발송 처리
          </button>
        </form>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/app/admin.test.tsx`
Expected: PASS (2 tests passed).

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: all tests across every task pass together (no cross-test pollution).

- [ ] **Step 6: Commit**

```bash
git add app/admin tests/app/admin.test.tsx
git commit -m "Build /admin premium request queue"
```

---

## Self-Review Notes

- **Spec coverage:** §3.1 (Task 3), §3.2 (Task 4), §3.3 (Task 5), §3.4 (Task 6), §3.5 (Task 7), §3.6 (Task 8), §5 data model (Task 2 `lib/types.ts`), §5 GA4 events (Task 2 `lib/analytics.ts`, called from Tasks 4–7). Backend items (§4, real API/Supabase/OAuth/GA4 wiring) are explicitly out of scope per the design doc.
- **Placeholder scan:** no TBD/TODO markers; every step has complete, runnable code.
- **Type consistency:** `Report`, `ReportFacts`, `ReportConcern`, `RegistryFacts`, `PremiumRequest`, `VisitTiming`, `ReservationSource`, `LoginProvider` are defined once in Task 2 and reused with identical names/shapes through Task 8. `VisitCta`, `FactsTable`, `ConcernsList`, `Disclaimer` are defined once in Task 5 and reused unchanged in Task 6.
