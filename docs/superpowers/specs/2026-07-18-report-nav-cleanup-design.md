# Report page nav cleanup

## Goal

Two independent cleanups bundled into one small branch:

1. Remove the 전세/월세 + deposit step from the `/analyze` submission flow.
2. Add a shared "back to home" header (logo + wordmark) to the non-landing pages that currently have no navigation at all.

## 1. Simplify `/analyze`

`app/analyze/page.tsx` currently has three steps: `input` (link/address) → `details` (전세/월세 toggle + deposit) → `progress` (fake animation) → redirect to `/report/[id]`.

Remove the `details` step entirely:
- `Step` type becomes `'input' | 'progress'`.
- `dealType` / `deposit` state, the `SegmentedButton` deal-type toggle, and the deposit `<input>` are deleted.
- `handleStep1Submit` fires `trackEvent('analyze_start', { inputMode })` and moves straight to `'progress'` (merging what `handleStep2Submit` used to do, minus deal-type/deposit).
- The landing page's `?source=` query param (used when the user submits the hero search bar directly) currently skips straight to `'details'`; it now skips straight to `'progress'` instead.

`DealType` stays in `lib/types.ts` / `lib/mock-data.ts` unchanged — it's still used to *display* the deal type on report pages (`report.dealType`), which is independent of the removed input step.

## 2. Shared site header on non-landing pages

Today only the landing page (`app/page.tsx`) has a header, built inline (logo + "홈쇼퍼" + nav links + CTA). `components/kit/Nav.tsx` is a similar but unused component. Report, premium report, reserve, and admin pages have no site header.

Changes:
- Extract the `Logo` SVG out of `app/page.tsx` into `components/kit/Logo.tsx` so it can be shared. Landing page imports it from there instead of defining it locally.
- Repurpose `components/kit/Nav.tsx` into a minimal header: logo + "홈쇼퍼" wordmark, the whole bar wrapped in a `Link` to `/`, no CTA button, no extra nav links. Sticky, glass background (`bg-glass` / `border-glass`), consistent with existing design tokens in `app/theme.css`.
- Add a small client component (e.g. `components/kit/SiteHeader.tsx`) rendered in `app/layout.tsx`, above `{children}`. It reads `usePathname()` and shows the minimal header only on an explicit allowlist of routes:
  - `/report/*` (covers both `/report/[id]` and `/report/[id]/premium`)
  - `/reserve`
  - `/admin`
- Everywhere else (currently just `/`) renders nothing — landing keeps its own inline header untouched. New routes added later do **not** get the header automatically; they'd need to be added to the allowlist deliberately.

## Out of scope

- No changes to the landing page's own header/nav.
- No changes to `DealType`/report mock data.
- No visual redesign of the report/reserve/admin page content itself — only the new header bar above it.
