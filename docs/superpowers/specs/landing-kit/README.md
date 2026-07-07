# HomeShopper Landing Kit

Portable design components + theme for a lightweight, HomeShopper-branded landing
page (e.g. a fake-door test project). These files are plain source — copy the whole
`landing-kit/` folder into a new Next.js project and import from there. Nothing here
depends on the rest of this repo.

## 1. Install dependencies

```bash
npm install clsx tailwind-merge lucide-react
```

Assumes a Next.js (App Router) project already scaffolded with Tailwind CSS v4.

## 2. Wire up the theme

Copy `theme.css` into your project (e.g. `src/theme.css`), then import it from your
global stylesheet **instead of** the default `@import "tailwindcss"` line — `theme.css`
already includes that import plus the color tokens, glass utilities, and font setup:

```css
/* src/app/globals.css */
@import "../theme.css";
```

If your project's `globals.css` already defines its own `@theme inline` block, merge
the two rather than importing both — Tailwind v4 only expects one.

## 3. Copy `lib/` and `components/`

Copy `lib/cn.ts` and everything in `components/` into your project (e.g. under
`src/lib` and `src/components`). Update the relative `../lib/cn` imports if you move
them to a different path.

## 4. Usage example

```tsx
// app/page.tsx
"use client";
import { Rocket, ShieldCheck, Wallet } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { FeatureGrid } from "@/components/FeatureGrid";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Nav ctaLabel="알림 신청" onCtaClick={() => {}} />
      <Hero
        headline="매물 100개 대신, 내게 맞는 5개만."
        subcopy="탐색부터 임장, 서류 분석, 계약까지 — 수수료는 법정 상한의 절반, 정찰제."
        ctaLabel="알림 신청하기"
      />
      <FeatureGrid
        features={[
          { icon: Rocket, title: "압축 추천", description: "무한 스크롤 대신 AI가 고른 5개." },
          { icon: ShieldCheck, title: "서류 분석", description: "등기부·건축물대장을 대신 확인." },
          { icon: Wallet, title: "정찰제 수수료", description: "법정 상한의 절반, 숨은 비용 없음." },
        ]}
      />
      <WaitlistForm onSubmit={(email) => console.log("signup:", email)} />
      <Footer />
    </>
  );
}
```

## Components

| Component | Purpose |
|---|---|
| `Button` | Primary (gradient fill) / secondary (glass outline) CTA button |
| `GlassCard` | Base glassmorphism container used by other components |
| `Nav` | Edge-to-edge sticky top bar — wordmark + single CTA |
| `Hero` | Headline + subcopy + CTA over a soft gradient blob background |
| `FeatureGrid` | Responsive grid of icon/title/description `GlassCard`s |
| `WaitlistForm` | Email capture with local success state (no backend required) |
| `Footer` | Edge-to-edge bottom bar — wordmark + copyright |

`WaitlistForm`'s `onSubmit` is optional — without it, submitting still shows the
success state locally, so the form works standalone even before any backend exists.
