# Report Nav Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the 전세/월세 + deposit step from the `/analyze` flow, and add a minimal "logo + brand name, links home" header to every non-landing page (`/analyze`, `/report/[id]`, `/report/[id]/premium`, `/reserve`, `/admin`).

**Architecture:** Extract the landing page's inline `Logo` SVG into a shared `components/kit/Logo.tsx`. Rebuild the currently-unused `components/kit/Nav.tsx` into a minimal presentational header (logo + wordmark wrapped in a `Link` to `/`, no CTA). Add `components/kit/SiteHeader.tsx`, a client component that reads `usePathname()` and renders `Nav` only when the path matches an explicit allowlist; mount it once in `app/layout.tsx` above `{children}`. Separately, trim `app/analyze/page.tsx` down from three steps to two by deleting the deal-type/deposit step.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4 (`bg-glass`/`border-glass`/`--color-ink` utilities from `app/theme.css`), Vitest + Testing Library.

## Global Constraints

- Landing page (`/`) keeps its existing inline header untouched — `SiteHeader` must render nothing there.
- The header allowlist is explicit (`/analyze`, `/report`, `/reserve`, `/admin` and their sub-paths) — new routes added later do NOT get the header automatically.
- `DealType` (`lib/types.ts`, `lib/mock-data.ts`) is unrelated to this change and must not be modified — it's still used to *display* report data.
- No visual redesign of report/reserve/admin page content — only the new header bar above it.
- `tests/app/landing.test.tsx` already fails on this branch before any of these changes (pre-existing, unrelated to this work — stale text assertions against an older landing page copy). Do not attempt to fix it as part of this plan.

---

### Task 1: Extract shared Logo component

**Files:**
- Create: `components/kit/Logo.tsx`
- Modify: `app/page.tsx:135-159` (remove local `Logo` function, import the shared one)
- Test: `tests/components/logo.test.tsx`

**Interfaces:**
- Produces: `Logo` — a React component with no props, rendering the brand mark `<svg>`. Imported as `import { Logo } from '@/components/kit/Logo'`.

- [ ] **Step 1: Write the failing test**

Create `tests/components/logo.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Logo } from '@/components/kit/Logo';

describe('Logo', () => {
  it('renders the brand mark as an svg', () => {
    const { container } = render(<Logo />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/logo.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/kit/Logo"`

- [ ] **Step 3: Create the Logo component**

Create `components/kit/Logo.tsx`:

```tsx
export function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="9" fill="url(#logo-grad)" />
      <path
        d="M12.5 13.5v-1.8a3.5 3.5 0 0 1 7 0v1.8"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="8.5" y="13.5" width="15" height="13" rx="3.2" fill="#F5F8FF" />
      <path d="M11.8 19.2 16 15.4l4.2 3.8Z" fill="#2F6FED" />
      <rect x="13" y="19" width="6" height="5.6" rx="0.8" fill="#2F6FED" />
      <rect x="15.1" y="21" width="1.8" height="3.6" rx="0.5" fill="#F5F8FF" />
      <defs>
        <linearGradient id="logo-grad" x1="3" y1="1" x2="29" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2F8CFF" />
          <stop offset="0.55" stopColor="#2F6FED" />
          <stop offset="1" stopColor="#4536D6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
```

- [ ] **Step 4: Remove the local Logo from the landing page and import the shared one**

In `app/page.tsx`, add to the import block near the top (after the `FaqAccordion` import):

```tsx
import { Logo } from "@/components/kit/Logo";
```

Then delete the local `function Logo() { ... }` definition (currently `app/page.tsx:135-159`). Leave every `<Logo />` usage in the file as-is — only the definition moves.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/components/logo.test.tsx`
Expected: PASS

- [ ] **Step 6: Sanity-check the landing page still builds**

Run: `npx tsc --noEmit`
Expected: no new type errors referencing `app/page.tsx` or `components/kit/Logo.tsx`

- [ ] **Step 7: Commit**

```bash
git add components/kit/Logo.tsx app/page.tsx tests/components/logo.test.tsx
git commit -m "Extract shared Logo component out of the landing page"
```

---

### Task 2: Add SiteHeader with an explicit route allowlist

**Files:**
- Modify: `components/kit/Nav.tsx` (full rewrite)
- Create: `components/kit/SiteHeader.tsx`
- Modify: `app/layout.tsx`
- Test: `tests/components/site-header.test.tsx`

**Interfaces:**
- Consumes: `Logo` from `components/kit/Logo.tsx` (Task 1).
- Produces: `Nav` — presentational header, no props, default export removed in favor of named export `export function Nav()`. `SiteHeader` — client component, no props, named export `export function SiteHeader()`, reads `usePathname()` from `next/navigation` and renders `<Nav />` or `null`.

- [ ] **Step 1: Write the failing test**

Create `tests/components/site-header.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SiteHeader } from '@/components/kit/SiteHeader';

let pathnameValue = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameValue,
}));

describe('SiteHeader', () => {
  it('renders nothing on the landing page', () => {
    pathnameValue = '/';
    const { container } = render(<SiteHeader />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    ['/analyze'],
    ['/report/demo-1'],
    ['/report/demo-1/premium'],
    ['/reserve'],
    ['/admin'],
  ])('shows a brand link back to home on %s', (path) => {
    pathnameValue = path;
    render(<SiteHeader />);
    expect(screen.getByText('홈쇼퍼').closest('a')).toHaveAttribute('href', '/');
  });

  it('renders nothing on a route outside the allowlist', () => {
    pathnameValue = '/some-future-page';
    const { container } = render(<SiteHeader />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/site-header.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/kit/SiteHeader"`

- [ ] **Step 3: Rewrite Nav.tsx as a minimal brand-only header**

Replace the full contents of `components/kit/Nav.tsx`:

```tsx
import Link from "next/link";
import { Logo } from "@/components/kit/Logo";

export function Nav() {
  return (
    <header
      className="bg-glass sticky inset-x-0 top-0 z-30"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        borderBottom: "1px solid var(--glass-border)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-[17px] font-bold tracking-[-0.3px] text-[var(--color-ink)]"
        >
          <Logo />
          홈쇼퍼
        </Link>
      </div>
    </header>
  );
}
```

This drops the old `wordmark`/`ctaLabel`/`onCtaClick`/`ctaHref` props entirely — `Nav` had no callers before this change (verified: no imports of `components/kit/Nav` anywhere in `app/` or `components/`), so there is nothing else to update.

- [ ] **Step 4: Create SiteHeader**

Create `components/kit/SiteHeader.tsx`:

```tsx
"use client";
import { usePathname } from "next/navigation";
import { Nav } from "@/components/kit/Nav";

const HEADER_ROUTE_PREFIXES = ["/analyze", "/report", "/reserve", "/admin"];

export function SiteHeader() {
  const pathname = usePathname();
  const showHeader = HEADER_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!showHeader) return null;
  return <Nav />;
}
```

- [ ] **Step 5: Mount SiteHeader in the root layout**

In `app/layout.tsx`, add the import:

```tsx
import { SiteHeader } from "@/components/kit/SiteHeader";
```

Then update the body so `SiteHeader` renders above `{children}`:

```tsx
      <body className="relative flex min-h-full flex-col">
        <InkBackground />
        <div className="relative z-10 flex min-h-full flex-1 flex-col">
          <SiteHeader />
          {children}
        </div>
      </body>
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/components/site-header.test.tsx`
Expected: PASS (6 tests)

- [ ] **Step 7: Commit**

```bash
git add components/kit/Nav.tsx components/kit/SiteHeader.tsx app/layout.tsx tests/components/site-header.test.tsx
git commit -m "Add shared brand header for non-landing pages"
```

---

### Task 3: Remove the 전세/월세 + deposit step from /analyze

**Files:**
- Modify: `app/analyze/page.tsx`
- Test: `tests/app/analyze.test.tsx` (rewrite)

**Interfaces:**
- Consumes: nothing new from Tasks 1-2 — this task is independent of the header work.
- Produces: `/analyze` flow with `Step = 'input' | 'progress'` (down from `'input' | 'details' | 'progress'`).

- [ ] **Step 1: Write the failing test**

Replace the full contents of `tests/app/analyze.test.tsx`:

```tsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AnalyzePage from '@/app/analyze/page';

const pushMock = vi.fn();
let searchParamsValue = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams(searchParamsValue),
}));

describe('AnalyzePage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    pushMock.mockClear();
    searchParamsValue = '';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('submits the link step and redirects to the report after progress completes', () => {
    render(<AnalyzePage />);

    fireEvent.change(screen.getByLabelText('매물 링크'), {
      target: { value: 'https://land.naver.com/article/1' },
    });
    fireEvent.click(screen.getByText('분석 시작'));

    expect(screen.getByText('서류를 확인하고 있어요')).toBeInTheDocument();
    expect(screen.queryByText('거래 정보를 알려주세요')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(pushMock).toHaveBeenCalledWith('/report/demo-1');
  });

  it('skips straight to the progress step when a source is passed in the query string', () => {
    searchParamsValue = 'source=https://land.naver.com/article/1';
    render(<AnalyzePage />);

    expect(screen.getByText('서류를 확인하고 있어요')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/app/analyze.test.tsx`
Expected: FAIL — the old two-step flow still shows `거래 정보를 알려주세요` and there's no `분석 시작` button after the link step; the query-string test fails because `initialSource` currently routes to the now-removed `'details'` step, not `'progress'`.

- [ ] **Step 3: Simplify the analyze flow**

Replace the full contents of `app/analyze/page.tsx`:

```tsx
'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProgressAnimation } from '@/components/analyze/ProgressAnimation';
import { Button } from '@/components/kit/Button';
import { GlassCard } from '@/components/kit/GlassCard';
import { trackEvent } from '@/lib/analytics';
import { demoReportId } from '@/lib/mock-data';

type Step = 'input' | 'progress';

function looksLikeUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

function SegmentedButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'flex-1 rounded-xl bg-grad px-4 py-2 text-sm font-semibold text-white transition-all duration-150'
          : 'flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-[var(--color-slate)] transition-all duration-150'
      }
    >
      {children}
    </button>
  );
}

function AnalyzeFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // A source passed from the landing search box skips the 매물 정보 step.
  const initialSource = (searchParams.get('source') ?? '').trim();
  const [step, setStep] = useState<Step>(initialSource ? 'progress' : 'input');
  const [inputMode, setInputMode] = useState<'link' | 'address'>(
    initialSource && !looksLikeUrl(initialSource) ? 'address' : 'link'
  );
  const [sourceValue, setSourceValue] = useState(initialSource);

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sourceValue.trim()) return;
    trackEvent('analyze_start', { inputMode });
    setStep('progress');
  }

  function handleProgressComplete() {
    trackEvent('analyze_complete', { reportId: demoReportId });
    router.push(`/report/${demoReportId}`);
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16 md:py-24">
      {step === 'input' && (
        <GlassCard className="p-8">
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <h1 className="text-2xl font-bold text-[var(--color-ink)]">매물 정보를 알려주세요</h1>
            <div className="flex gap-1 rounded-xl bg-glass border-glass p-1">
              <SegmentedButton active={inputMode === 'link'} onClick={() => setInputMode('link')}>
                링크로 입력
              </SegmentedButton>
              <SegmentedButton active={inputMode === 'address'} onClick={() => setInputMode('address')}>
                주소로 입력
              </SegmentedButton>
            </div>
            <input
              type="text"
              value={sourceValue}
              onChange={(e) => setSourceValue(e.target.value)}
              placeholder={inputMode === 'link' ? '매물 링크를 붙여넣으세요' : '주소를 입력하세요'}
              className="w-full rounded-xl border-glass bg-white/50 px-4 py-3 text-[var(--color-ink)] placeholder:text-[var(--color-slate)] focus:outline-none"
              aria-label={inputMode === 'link' ? '매물 링크' : '매물 주소'}
            />
            <Button type="submit" size="lg" className="w-full">
              분석 시작
            </Button>
          </form>
        </GlassCard>
      )}

      {step === 'progress' && (
        <GlassCard className="p-8">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[var(--color-ink)]">서류를 확인하고 있어요</h1>
            <ProgressAnimation onComplete={handleProgressComplete} />
          </div>
        </GlassCard>
      )}
    </main>
  );
}

export default function AnalyzePage() {
  // useSearchParams requires a Suspense boundary for prerendering (Next docs).
  return (
    <Suspense fallback={null}>
      <AnalyzeFlow />
    </Suspense>
  );
}
```

Changes from the original: `Step` drops `'details'`; `dealType`/`deposit` state, the deal-type `SegmentedButton` pair, and the deposit `<input>` are gone; `handleStep1Submit` now calls `trackEvent` and jumps straight to `'progress'` (absorbing what `handleStep2Submit` used to do, minus deal-type/deposit); the step-1 submit button label changes from "다음" to "분석 시작" since it's now the final step before analysis starts; `initialSource` now seeds `step` as `'progress'` instead of `'details'`; the unused `DealType` import is removed.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/app/analyze.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Run the full suite to confirm no regressions**

Run: `npx vitest run`
Expected: same pass/fail counts as the pre-existing baseline, minus the `analyze.test.tsx` failure (that one now passes). The 3 pre-existing `landing.test.tsx` failures remain (out of scope, see Global Constraints).

- [ ] **Step 6: Commit**

```bash
git add app/analyze/page.tsx tests/app/analyze.test.tsx
git commit -m "Remove the deal-type/deposit step from the analyze flow"
```
