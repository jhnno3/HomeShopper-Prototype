# Report Page Cleanup — Design

## Context

The report pages (`/report/[id]` and `/report/[id]/premium`) currently render two
pieces that don't match what the product can actually deliver today:

1. **`ConcernsList`** ("함께 확인해보시면 좋은 부분") shows risk-judgment copy
   (e.g. "보증금이 시세보다 낮은 편입니다 — 임대인에게 문의하세요") that is
   currently hardcoded per report in `mock-data.ts`. There's no LLM and no rule
   engine behind it — the copy is fabricated per fixture, not computed from
   report facts. Shipping it as-is would show judgment the product hasn't
   actually formed.
2. **`UpgradeCard`**'s "네이버로 받기" button offers a second stub login
   provider that isn't needed — Kakao alone covers the upgrade-request flow.

## Changes

### 1. Remove the concerns feature entirely (for now)

- Delete `components/report/ConcernsList.tsx` — nothing else renders it once
  removed from the two report pages.
- Remove the `<ConcernsList>` element and its import from
  `app/report/[id]/page.tsx` and `app/report/[id]/premium/page.tsx`.
- Remove `ReportConcern` from `lib/types.ts` and the `concerns` field from
  `Report`.
- Remove the `concerns: [...]` arrays from every report fixture in
  `lib/mock-data.ts`.
- Update `tests/app/report.test.tsx` — the test titled *"renders concerns and
  lets the user complete the login stub"* currently asserts on concerns copy;
  rename it and drop the concerns assertion, keeping the login-stub assertion.

This isn't a permanent cancellation — see the reference doc below for the
version worth building once real rules exist.

### 2. Remove the Naver option from UpgradeCard

- `components/report/UpgradeCard.tsx`: delete the "네이버로 받기" and
  "네이버로 계속하기" buttons and the `naver` branch of the provider-select
  logic. "카카오로 3초 만에 받기" remains the sole entry point into the
  login-stub flow.
- `LoginProvider` in `lib/types.ts` stays `'kakao' | 'naver'` — unrelated to
  this UI change, `mockPremiumRequests` still has a real `naver` provider
  record (historical data, not a UI affordance).

### 3. Reference doc for a future rule-based concerns engine

New file `docs/superpowers/specs/2026-07-18-concern-rules-idea.md`, written as
a reference/idea doc (not a plan to implement now). It documents 5
deterministic, non-LLM rules derivable from fields already on `Report` /
`RegistryFacts`:

| Rule | Trigger | Data used |
|---|---|---|
| Deposit below market | `deposit` sits more than a fixed % below `facts.recentTransactions.priceRangeLow` | `Report.deposit`, `facts.recentTransactions` |
| Violation on record | `facts.buildingRegistry.hasViolation === true` | `facts.buildingRegistry` |
| Agency unverifiable | `facts.agencyValidity === null \|\| !facts.agencyValidity.isValid` | `facts.agencyValidity` |
| High lien ratio (premium) | `(registryFacts.maxClaimAmount + deposit) / marketPrice` crosses a fixed threshold (e.g. 80%) | `registryFacts`, `deposit` |
| Owner mismatch (premium) | `registryFacts.ownerMatchesLandlord === false` | `registryFacts` |

Each rule is a plain threshold/boolean check producing fixed message copy —
no model call, no free-form reasoning. This doc exists so the shape and logic
are ready to pick up later; nothing from it is wired into code in this pass.

## Testing

- `tests/app/report.test.tsx`: update the affected test name/body (drop
  concerns assertion, keep login-stub assertion).
- `tests/app/premium-report.test.tsx`: check for any concerns-related
  assertions and remove if present.
- `tests/lib/mock-data.test.ts`: update if it references `concerns` or
  `ReportConcern`.
- Run full suite (`npx vitest run`) and `npx tsc --noEmit` after changes —
  expect the same 3 pre-existing unrelated failures in `landing.test.tsx`,
  nothing new.

## Out of scope

- Building the actual rule engine (tracked as a future idea, not this pass).
- Any change to the FactsTable / RegistrySection data-availability copy — the
  reference image's 확인 가능 여부 table matches what's already shown there
  (실거래가, 건축물대장 주용도/사용승인연도, 중개업소 등록번호); 위반건축물
  여부 unavailability is already implicitly covered by `hasViolation` being
  sourced from the same registry call, so no table changes are needed.
