"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { HeroGradient } from "@/components/landing/HeroGradient";
import { Logo } from "@/components/kit/Logo";
import { ReportSummary } from "@/components/report/ReportSummary";
import { demoReport } from "@/lib/report-data";
import { classifyListingInput } from "@/lib/listing-input";
import "./landing.css";

const DOCS = ["허위매물 검증", "전문가 동행 임장", "협상·특약 대행", "수수료 반값"];

const STEPS = [
  {
    n: "1",
    title: "링크 붙여넣기",
    body: "보고 있는 다방 매물 링크를 그대로 붙여넣으세요. 가입도, 앱 설치도 없습니다.",
    grad: "linear-gradient(135deg, #4f93ff 0%, #0a5cff 100%)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    n: "2",
    title: "30초 자동 분석",
    body: "등기부등본·건축물대장·실거래가를 자동으로 대조해 위험 신호를 찾습니다.",
    grad: "linear-gradient(135deg, #0a5cff 0%, #0b3ba7 100%)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    n: "3",
    title: "리포트 확인",
    body: "근저당·가압류 같은 항목을 신호등 색으로 정리한 리포트를 바로 받습니다.",
    grad: "linear-gradient(135deg, #0b3ba7 0%, #0a2f80 100%)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="m9 15 2 2 4-4" />
      </svg>
    ),
  },
];

/* Jigsaw piece artwork for the "how it works" stack (designer-supplied,
   matching set). All three share one 561.56-unit square body and the same
   x-range, so every viewBox is the body box — the SVG fills the card like
   a normal rounded rect and text uses regular padding. Piece 2's tabs and
   the notch mouths extend past the body box, so the <svg> keeps
   overflow-visible; tabs poke vertically into the gaps and nest into the
   neighbors' notches. Piece 1 ships rotated 180° upstream (notch ends up
   on its bottom edge); piece 3 is the same artwork unrotated (notch on
   top). Gradients mirror STEPS[i].grad. */
const PUZZLE_PIECES = [
  {
    // rounded square, single notch on the bottom edge (after rotation;
    // right edge once the row goes horizontal) — padding clears the
    // ~21%-deep notch on whichever side it lands
    viewBox: "1402.4 1407.91 561.56 561.56",
    transform: "rotate(180 1683.178 1688.691)",
    from: "#4f93ff",
    to: "#0a5cff",
    padClass: "p-7 pb-20 lg:pb-7 lg:pr-20",
    d: "M1483.75,1407.91L1622.5,1407.91C1631.16,1407.91,1636.31,1417.68,1631.32,1424.77C1623.9,1435.31,1619.61,1448.22,1619.81,1462.15C1620.3,1496,1647.79,1523.76,1681.63,1524.57C1717.35,1525.42,1746.56,1496.72,1746.56,1461.21C1746.56,1447.64,1742.29,1435.06,1735.03,1424.75C1730.04,1417.67,1735.21,1407.91,1743.87,1407.91L1882.61,1407.91C1927.54,1407.91,1963.96,1444.33,1963.96,1489.27L1963.96,1888.11C1963.96,1933.04,1927.53,1969.47,1882.6,1969.47L1483.76,1969.47C1438.83,1969.47,1402.4,1933.04,1402.4,1888.11L1402.4,1489.27C1402.4,1444.34,1438.82,1407.91,1483.75,1407.91Z",
  },
  {
    // rounded square with a tab out the top (into piece 1's notch) and a
    // tab out the bottom (into piece 3's notch); body edges stay clean
    viewBox: "1402.4 386.1 561.56 561.56",
    from: "#0a5cff",
    to: "#0b3ba7",
    padClass: "p-7",
    d: "M1483.76,386.098L1622.5,386.098C1631.16,386.098,1636.31,376.329,1631.32,369.243C1623.9,358.698,1619.61,345.786,1619.81,331.861C1620.3,298.006,1647.79,270.244,1681.63,269.439C1717.35,268.589,1746.56,297.286,1746.56,332.798C1746.56,346.37,1742.29,358.947,1735.03,369.257C1730.04,376.334,1735.21,386.098,1743.87,386.098L1882.61,386.098C1927.54,386.098,1963.96,422.521,1963.96,467.452L1963.96,866.304C1963.96,911.234,1927.54,947.658,1882.61,947.658L1743.86,947.658C1735.19,947.658,1730.05,957.429,1735.04,964.516C1742.45,975.046,1746.74,987.937,1746.55,1001.84C1746.09,1035.69,1718.64,1063.48,1684.79,1064.32C1649.06,1065.21,1619.8,1036.5,1619.8,1000.97C1619.8,987.389,1624.07,974.811,1631.33,964.5C1636.32,957.422,1631.16,947.658,1622.5,947.658L1483.76,947.658C1438.83,947.658,1402.4,911.23,1402.4,866.294L1402.4,467.462C1402.4,422.526,1438.83,386.098,1483.76,386.098Z",
  },
  {
    // same artwork as piece 1, unrotated — notch on the top edge
    // (left edge in the horizontal row); padding clears it
    viewBox: "1402.4 1407.91 561.56 561.56",
    from: "#0b3ba7",
    to: "#0a2f80",
    padClass: "p-7 pt-20 lg:pt-7 lg:pl-20",
    d: "M1483.75,1407.91L1622.5,1407.91C1631.16,1407.91,1636.31,1417.68,1631.32,1424.77C1623.9,1435.31,1619.61,1448.22,1619.81,1462.15C1620.3,1496,1647.79,1523.76,1681.63,1524.57C1717.35,1525.42,1746.56,1496.72,1746.56,1461.21C1746.56,1447.64,1742.29,1435.06,1735.03,1424.75C1730.04,1417.67,1735.21,1407.91,1743.87,1407.91L1882.61,1407.91C1927.54,1407.91,1963.96,1444.33,1963.96,1489.27L1963.96,1888.11C1963.96,1933.04,1927.53,1969.47,1882.6,1969.47L1483.76,1969.47C1438.83,1969.47,1402.4,1933.04,1402.4,1888.11L1402.4,1489.27C1402.4,1444.34,1438.82,1407.91,1483.75,1407.91Z",
  },
];
const SERVICES = [
  {
    title: "매물 검증 · 시세 조사",
    body: "다방 매물 링크 하나로 허위매물 여부와 적정 시세를 확인해요. 원하는 조건을 입력하면 계약 만료 예정 매물까지 포함해 추천하고, 과거 중개 계약서와 공공데이터로 거래가·계약기간·특약의 기준을 알려드립니다.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    title: "부동산 서류 분석",
    body: "등기부등본·건축물대장 같은 계약 전 필수 서류를 전문가가 직접 분석해 근저당·위반건축물 같은 위험 신호를 짚어드려요.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8M8 17h5" />
      </svg>
    ),
  },
  {
    title: "전문가 동행 임장",
    body: "홈쇼퍼 소속 전문가가 직접 함께 매물을 방문해요. 서류로는 알 수 없는 누수·곰팡이·소음·실측까지 대신 확인해드려요.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "협상 · 특약 조율 대행",
    body: "가격 협상부터 특약 조율까지, 혼자 하기 어려운 순간마다 홈쇼퍼가 대신 나서서 유리한 조건을 만들어드려요.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
  },
  {
    title: "매도인 · 임대인 서류 검증",
    body: "상대방의 서류도 함께 검토해 나뿐 아니라 거래 상대방 쪽 리스크까지 미리 걸러내고, 양쪽 모두 안전한 거래를 만들어요.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "후속 서비스 · 갈등 조정",
    body: "입주 후 하자보수 접수부터 매도자-매수자, 임대인-임차인 사이의 갈등 조정까지 — 계약이 끝난 뒤에도 책임지고 도와드려요.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    title: "권리 행사 알림",
    body: "계약 종료 전 행사할 수 있는 권리(갱신청구권 등)와 행사 가능 기간을 미리 확인해 놓치지 않도록 알려드려요.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    ),
  },
  {
    title: "다음 매물 추천",
    body: "계약 종료가 다가오면 조건에 맞는 다음 매물을 미리 추천해드려, 이사 시점에도 헤매지 않도록 도와드려요.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
  },
];

function focusHeroSearch() {
  const el = document.getElementById("hero-search") as HTMLInputElement | null;
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.focus({ preventScroll: true });
}

function scrollToHow(e: React.MouseEvent) {
  e.preventDefault();
  document.getElementById("how")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function CommandBar() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const hasText = value.trim().length > 0;

  return (
    <>
    <form
      className="g-panel g-bar flex w-full items-center gap-2.5 py-1.5 pl-4 pr-2"
      onSubmit={(e) => {
        e.preventDefault();
        const input = classifyListingInput(value);
        if (input.kind === "invalid") {
          setError(input.message);
          return;
        }
        router.push(`/analyze?source=${encodeURIComponent(input.source)}`);
      }}
    >
      <svg
        className="size-[18px] shrink-0 text-(--faint)"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        id="hero-search"
        type="text"
        inputMode="text"
        aria-label="다방 매물 링크"
        placeholder="다방 매물 링크를 붙여넣으세요"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError(null);
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "hero-search-error" : undefined}
        className="min-h-10 flex-1 px-0"
      />
      <AnimatePresence>
        {hasText && (
          <motion.button
            type="submit"
            aria-label="분석하기"
            className="g-cta grid size-10 shrink-0 place-items-center"
            initial={reduce ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
            transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 520, damping: 26 }}
          >
            <svg
              className="size-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </form>
    {error && (
      <p
        id="hero-search-error"
        role="alert"
        className="mt-2 pl-1 text-left text-[13px] font-semibold text-[var(--color-danger)]"
      >
        {error}
      </p>
    )}
    </>
  );
}

/* The hero preview renders the real <ReportSummary /> with the same sample
   payload the report page uses, so the design, icons, and fields can never
   drift from what the user actually receives. Wrapped in one outer panel
   here so the report reads as a single grouped card in the hero, instead of
   its inner cards floating loose against the page background. */
function SampleReport() {
  return (
    <div className="g-panel g-window mx-auto w-full max-w-md p-5 text-left">
      <p className="mb-3 text-[15px] font-extrabold tracking-tight">매물 확인 리포트</p>
      <ReportSummary report={demoReport} compact />
    </div>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="v3 min-h-dvh">
      {/* nav */}
      <header
        className={`g-navbar sticky top-0 z-40 transition-shadow duration-300 ${scrolled ? "shadow-[0_8px_24px_-14px_rgba(11,59,167,0.35)]" : ""}`}
      >
        <div
          className={`mx-auto flex max-w-5xl items-center justify-between px-4 transition-[padding] duration-300 sm:px-6 ${scrolled ? "py-1.5" : "py-3"}`}
        >
          <Link href="/" className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight">
            <Logo />
            홈쇼퍼
          </Link>
          <nav className="flex items-center gap-2">
            <a href="#how" className="g-ghost hidden px-3 py-2 text-sm sm:block">
              이용 방법
            </a>
            <a href="#faq" className="g-ghost hidden px-3 py-2 text-sm sm:block">
              자주 묻는 질문
            </a>
            <button type="button" onClick={focusHeroSearch} className="g-cta px-4 py-2 text-sm">
              무료 분석
            </button>
          </nav>
        </div>
      </header>

      {/* hero — fills the viewport (minus navbar) and centers. The content
          wrapper widens at larger breakpoints (and the columns' gap grows
          with it) so the layout spreads across the available width instead
          of staying pinned to a fixed, narrow column on big screens.

          The ambient canvas is scoped to this section (absolute + clipped,
          not page-wide fixed) so the floating-gradient blobs scroll away
          with the hero instead of continuing to animate on a fixed layer
          underneath — a fixed canvas made the color appear to drift/slide
          as the white .main-sheet below rose to cover it during scroll. */}
      <section className="relative flex min-h-[calc(100svh-var(--nav-h))] items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-10 xl:px-16">
        <div className="ambient-canvas" aria-hidden>
          <HeroGradient />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl">
          {/*
            Grid areas decouple visual order from DOM order: mobile stacks
            heading → search → report (search stays reachable above the fold
            instead of getting pushed below the tall sample-report image),
            while desktop remaps the same three areas into a 2-column layout
            — heading+search on the left, image on the right spanning both
            rows.
          */}
          <div
            className="grid grid-cols-1 gap-y-9 [grid-template-areas:'heading'_'search'_'report'] sm:gap-y-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-x-16 lg:gap-y-9 xl:gap-x-24 lg:[grid-template-areas:'heading_report'_'search_report']"
          >
            <motion.div
              className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 text-center [grid-area:heading] lg:mx-0 lg:items-start lg:text-left"
              initial={reduce ? false : "hide"}
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.09 } } }}
            >
              {[
                <h1 key="h1" className="text-[34px] leading-[1.25] font-extrabold tracking-[-0.035em] text-balance break-keep sm:text-[60px]">
                  다방 링크만 입력하세요
                  <br />
                  <span className="text-grad">반값 수수료</span>로,
                  <br />
                  계약까지 다 해드립니다
                </h1>,
                <p key="sub" className="max-w-lg break-keep text-[16.5px] leading-relaxed text-(--muted) sm:text-[19px]">
                  부동산 거래 전 과정을 홈쇼퍼가 안내하는 대로 따라오시면
                  끝납니다.
                </p>,
                <ul key="docs" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[14.5px] font-medium text-(--muted) lg:justify-start">
                  {DOCS.map((d) => (
                    <li key={d} className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--royal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {d}
                    </li>
                  ))}
                </ul>,
              ].map((node, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hide: { opacity: 0, y: 18 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
                  }}
                >
                  {node}
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="mx-auto w-full max-w-sm shrink-0 [grid-area:report] lg:mx-0 lg:w-[340px] lg:max-w-none lg:justify-self-end lg:self-center xl:w-[380px]"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <SampleReport />
            </motion.div>

            <motion.div
              className="mx-auto w-full max-w-xl [grid-area:search] lg:mx-0 lg:max-w-none"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <CommandBar />
            </motion.div>
          </div>
        </div>

        {/* scroll cue — short label + bouncing chevron inviting the visitor
            into the next section; sits above the sheet's peeking corner */}
        <a
          href="#how"
          onClick={scrollToHow}
          className="scroll-cue absolute inset-x-0 bottom-6 z-10 mx-auto flex w-fit flex-col items-center gap-1.5 text-[12px] font-bold tracking-[0.14em] text-(--muted) transition-colors hover:text-(--royal-deep) sm:bottom-8"
        >
          이용 방법 보기
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </a>
      </section>

      {/* white sheet — everything after the hero rides this rounded surface
          as it scrolls over the fixed ambient canvas. Pulled up slightly so
          its rounded top corner peeks into the hero above, hinting at the
          next section before the visitor scrolls. */}
      <div className="main-sheet -mt-8 sm:-mt-12">
      {/* how it works — centered header while the puzzle stacks vertically
          (below lg), left-aligned once it becomes a horizontal row (lg+) */}
      <section id="how" className="scroll-mt-24 px-4 py-16 sm:py-[102px]">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="text-center lg:text-left">
              <p className="text-[13px] font-bold tracking-[0.12em] text-(--royal)">HOW IT WORKS</p>
              <h2 className="break-keep mt-2 text-[26px] font-extrabold tracking-[-0.02em] sm:text-[34px]">
                세 걸음이면 끝납니다
              </h2>
              <p className="mx-auto mt-4 max-w-md break-keep text-[15px] leading-relaxed text-(--muted) lg:mx-0">
                매물 링크 하나면 충분해요. 복잡한 서류 확인을 세 단계 자동
                분석으로 압축했습니다.
              </p>
            </div>
          </Reveal>

          {/* designer jigsaw pieces as standalone cards at their native 1:1
              ratio — stacked vertically on phones (chain runs downward),
              a 3-across row from sm up (each piece rotated -90° via
              .pz-orient so the chain runs left → right); spacing keeps the
              tabs pointing at the notches without inserting */}
          <ol className="mx-auto mt-12 grid w-full max-w-[300px] gap-y-24 lg:mt-16 lg:max-w-none lg:grid-cols-3 lg:gap-x-20 lg:gap-y-0">
            {STEPS.map((s, i) => {
              const piece = PUZZLE_PIECES[i];
              const path = <path d={piece.d} fill={`url(#pz-grad-${i})`} />;
              return (
                <motion.li
                  key={s.n}
                  className="jigsaw-shadow relative"
                  initial={reduce ? false : "hide"}
                  whileInView="show"
                  viewport={{ once: false, margin: "-60px" }}
                  variants={{
                    hide: { opacity: 0, y: 24 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                >
                  <svg
                    className="absolute inset-0 h-full w-full overflow-visible"
                    viewBox={piece.viewBox}
                    aria-hidden
                  >
                    <defs>
                      <linearGradient id={`pz-grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor={piece.from} />
                        <stop offset="1" stopColor={piece.to} />
                      </linearGradient>
                    </defs>
                    <g className={`pz-orient-${i + 1}`}>
                      {piece.transform ? <g transform={piece.transform}>{path}</g> : path}
                    </g>
                  </svg>

                  <div
                    className={`relative z-10 flex aspect-square items-center text-white ${piece.padClass}`}
                  >
                    <div className="flex flex-col items-center gap-3 text-center lg:-translate-y-3 lg:items-start lg:gap-3.5 lg:text-left">
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15"
                        aria-hidden
                      >
                        {s.icon}
                      </span>
                      <div>
                        <p className="text-[12px] font-bold tracking-[0.1em] text-white/70">STEP {s.n}</p>
                        <h3 className="mt-1 text-[17px] font-bold">{s.title}</h3>
                        <p className="mt-1.5 break-keep text-[14px] leading-relaxed text-white/85">
                          {s.body}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* what the analyzer checks */}
      <section className="px-4 py-16 sm:py-[102px]">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="text-center text-[14px] font-bold tracking-[0.12em] text-(--royal)">FULL LIFECYCLE SERVICE</p>
            <h2 className="break-keep mt-3 text-center text-[28px] font-extrabold tracking-[-0.025em] sm:text-[42px]">
              서류 검증은 시작일 뿐, <span className="text-grad">계약이 끝난 뒤까지</span> 함께합니다
            </h2>
            <p className="mx-auto mt-4 max-w-2xl break-keep text-center text-[16px] leading-relaxed text-(--muted) sm:text-[17px]">
              매물 검증부터 임장, 협상, 계약, 입주 후 하자보수와 다음 이사까지 —
              부동산 거래의 전 생애주기를 홈쇼퍼가 반값 수수료로 대신
              처리해드립니다.
            </p>
          </Reveal>

          <div className="mt-14 grid justify-center gap-5 sm:mt-16 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.05}>
                <article className="g-panel g-check-card h-full rounded-3xl p-7">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: "rgba(10,92,255,0.1)", color: "var(--royal)" }}
                    aria-hidden
                  >
                    {c.icon}
                  </span>
                  <h3 className="break-keep mt-4 text-[17px] font-bold">{c.title}</h3>
                  <p className="mt-2 break-keep text-[14px] leading-relaxed text-(--muted)">
                    {c.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <div className="mx-auto mt-16 flex max-w-lg flex-col items-center gap-5 text-center sm:mt-20">
              <p className="break-keep text-[16px] leading-relaxed text-(--muted)">
                이 모든 과정을 홈쇼퍼가 대신 처리하는데, 수수료는 절반이에요.
                다방 링크만 입력하고 안내하는 대로만 따라오시면 됩니다.
              </p>
              <button type="button" onClick={focusHeroSearch} className="g-cta inline-flex items-center gap-2 px-7 py-3.5 text-[15px]">
                무료로 상세 분석 받기
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* trust + faq */}
      <section id="faq" className="scroll-mt-24 px-4 py-16 sm:py-[102px]">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {["하나 소셜벤처 유니버시티 선정", "경기도 공공데이터 활용 창업경진대회 수상"].map((t) => (
                <span key={t} className="g-chip flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-(--muted)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--royal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="12" cy="8" r="5" />
                    <path d="M8.2 12.5 7 21l5-3 5 3-1.2-8.5" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="break-keep mt-14 text-center text-[28px] font-extrabold tracking-[-0.025em] sm:text-[38px]">
              자주 묻는 질문
            </h2>
            <FaqAccordion />
          </Reveal>
        </div>
      </section>

      {/* reserve banner */}
      <section className="px-4 pb-[77px] pt-[26px] sm:pb-[115px] sm:pt-[38px]">
        <Reveal>
          <div className="g-banner mx-auto flex max-w-5xl flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <p className="text-[13px] font-bold tracking-[0.1em] text-white/70">COMING SOON</p>
              <h2 className="break-keep mt-2 text-[26px] font-extrabold tracking-[-0.025em] sm:text-[32px]">
                동행 임장 · 반값 정찰 중개
              </h2>
              <p className="mt-2 max-w-md text-[15.5px] leading-relaxed text-white/85">
                서류 확인 다음 단계까지 함께합니다. 전문가 동행 임장과 정찰제
                반값 중개, 지금 사전예약을 받고 있어요.
              </p>
            </div>
            <Link href="/reserve?src=landing" className="g-banner-cta shrink-0 px-6 py-3.5 text-[15px]">
              사전예약 하기
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="px-4 pb-10">
        <p className="text-center text-[12.5px] text-(--faint)">
          © 2026 홈쇼퍼 · 본 페이지는 서비스 검증을 위한 프리토타입입니다
        </p>
      </footer>
      </div>
    </div>
  );
}
