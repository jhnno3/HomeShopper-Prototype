"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { Logo } from "@/components/kit/Logo";
import "./landing.css";

const DOCS = ["등기부등본", "건축물대장", "실거래가"];

const STEPS = [
  {
    n: "1",
    title: "링크 붙여넣기",
    body: "보고 있는 매물 링크나 주소를 그대로 붙여넣으세요. 가입도, 앱 설치도 없습니다.",
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
const CHECKS = [
  {
    doc: "등기부등본",
    desc: "권리관계의 위험 신호를 찾습니다",
    items: ["근저당권 · 채권최고액 규모", "가압류 · 가처분 · 경매개시 여부", "등기상 소유자와 임대인 일치"],
    tint: "rgba(10,92,255,0.1)",
    fg: "var(--royal)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8M8 17h5" />
      </svg>
    ),
  },
  {
    doc: "건축물대장",
    desc: "건물 자체의 하자를 확인합니다",
    items: ["위반건축물 등재 여부", "주용도 · 전용면적 대조", "사용승인 연도"],
    tint: "rgba(11,59,167,0.08)",
    fg: "var(--royal-deep)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h6" />
      </svg>
    ),
  },
  {
    doc: "실거래가",
    desc: "가격의 적정성을 검증합니다",
    items: ["최근 국토부 실거래 이력", "시세 대비 보증금 비율", "역전세 · 깡통전세 위험 신호"],
    tint: "rgba(15,157,88,0.12)",
    fg: "var(--ok)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 3 3 5-6" />
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

function CommandBar() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [value, setValue] = useState("");
  const hasText = value.trim().length > 0;

  return (
    <form
      className="g-panel g-bar flex w-full items-center gap-2.5 py-1.5 pl-4 pr-2"
      onSubmit={(e) => {
        e.preventDefault();
        const source = value.trim();
        if (!source) return;
        router.push(`/analyze?source=${encodeURIComponent(source)}`);
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
        aria-label="매물 링크 또는 주소"
        placeholder="매물 링크나 주소를 붙여넣으세요"
        value={value}
        onChange={(e) => setValue(e.target.value)}
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
  );
}

function StatusTag({ level }: { level: "safe" | "caution" }) {
  const safe = level === "safe";
  return (
    <span
      className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
      style={{ background: safe ? "var(--ok)" : "var(--warn)" }}
    >
      {safe ? "안전" : "주의"}
    </span>
  );
}

const REPORT_SECTIONS: {
  doc: string;
  rows: { item: string; value: string; level: "safe" | "caution" }[];
}[] = [
  {
    doc: "등기부등본",
    rows: [
      { item: "근저당권", value: "채권최고액 3억 6,000만 원 · 시세 대비 42%", level: "safe" },
      { item: "가압류 · 가처분", value: "해당 없음", level: "safe" },
      { item: "소유자 확인", value: "등기상 소유자 1인 · 임대인과 일치", level: "safe" },
    ],
  },
  {
    doc: "건축물대장",
    rows: [
      { item: "위반건축물", value: "등재 이력 없음", level: "safe" },
      { item: "주용도 · 면적", value: "공동주택(아파트) · 전용 84.9㎡", level: "safe" },
    ],
  },
  {
    doc: "실거래가",
    rows: [
      { item: "시세 대비 보증금", value: "보증금 5.4억 / 최근 실거래 6.2억 · 87%", level: "caution" },
    ],
  },
];

function SampleReport() {
  return (
    <div className="g-panel g-window mx-auto w-full max-w-2xl text-left">
      {/* report head */}
      <div className="border-b border-(--blue-edge) px-5 py-4 sm:px-7 sm:py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Logo />
            <div>
              <p className="text-[15px] font-extrabold tracking-tight">홈쇼퍼 안심 리포트</p>
              <p className="text-[11.5px] font-medium text-(--faint)">발급일 2026.07.11 · 등기사항전부증명서 기준</p>
            </div>
          </div>
          <span className="rounded-full border border-(--warn) px-3 py-1 text-[12px] font-bold" style={{ color: "var(--warn)" }}>
            종합 판정 · 주의 1건
          </span>
        </div>
        <p className="mt-3 text-[14px] font-bold sm:text-[15px]">
          경기 수원시 영통구 매탄동 ○○아파트 101동 1203호
        </p>
        <div className="mt-2 flex items-center gap-4 text-[12px] font-semibold">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "var(--ok)" }} aria-hidden />안전 5</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "var(--warn)" }} aria-hidden />주의 1</span>
          <span className="flex items-center gap-1.5 text-(--faint)"><span className="h-2 w-2 rounded-full bg-[#e5484d]" aria-hidden />위험 0</span>
        </div>
      </div>

      {/* report body */}
      <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
        {REPORT_SECTIONS.map((sec) => (
          <div key={sec.doc}>
            <p className="text-[11.5px] font-bold tracking-[0.08em] text-(--royal)">{sec.doc}</p>
            <div className="mt-2 space-y-1.5">
              {sec.rows.map((row) => (
                <div key={row.item} className="flex items-center justify-between gap-3 rounded-xl bg-white/70 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold">{row.item}</p>
                    <p className="truncate text-[12px] text-(--muted)">{row.value}</p>
                  </div>
                  <StatusTag level={row.level} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className="text-[11px] leading-relaxed text-(--faint)">
          자동 분석 결과는 공부상 기재 사항 기준이며, 계약 판단의 참고 자료로만 사용하세요.
        </p>
      </div>
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

      {/* hero */}
      <section className="relative px-4 pt-12 pb-20 sm:pt-16 sm:pb-28">
        <div className="relative z-10 mx-auto w-full max-w-5xl">
          {/*
            Grid areas keep the DOM order (heading, image, search) identical
            for mobile stacking, while desktop remaps the same three areas
            into a 2-column layout: heading+search on the left, image on the
            right spanning both rows.
          */}
          <div
            className="grid grid-cols-1 gap-y-9 [grid-template-areas:'heading'_'report'_'search'] sm:gap-y-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-x-12 lg:gap-y-9 lg:[grid-template-areas:'heading_report'_'search_report']"
          >
            <motion.div
              className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 text-center [grid-area:heading] lg:mx-0 lg:items-start lg:text-left"
              initial={reduce ? false : "hide"}
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.09 } } }}
            >
              {[
                <h1 key="h1" className="text-[34px] leading-[1.25] font-extrabold tracking-[-0.035em] text-balance break-keep sm:text-[60px]">
                  그 매물, 임장 가기 전에
                  <br />
                  <span className="text-grad">30초 만에 서류부터</span> 확인하세요
                </h1>,
                <p key="sub" className="max-w-lg break-keep text-[16.5px] leading-relaxed text-(--muted) sm:text-[19px]">
                  링크 하나만 붙여넣으면 등기부등본부터 실거래가까지, 계약 전에 꼭
                  봐야 할 서류를 대신 읽어드립니다.
                </p>,
                <ul key="docs" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[14.5px] font-medium text-(--muted) lg:justify-start">
                  {DOCS.map((d) => (
                    <li key={d} className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--royal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {d} 자동 확인
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
              className="mx-auto w-full max-w-md shrink-0 [grid-area:report] lg:mx-0 lg:w-[380px] lg:max-w-none lg:justify-self-end lg:self-center"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mb-3 text-center text-[12px] font-bold tracking-[0.12em] text-(--royal) lg:text-left">
                SAMPLE REPORT
              </p>
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
      </section>

      {/* how it works — centered header while the puzzle stacks vertically
          (below lg), left-aligned once it becomes a horizontal row (lg+) */}
      <section id="how" className="scroll-mt-24 px-4 py-20 sm:py-32">
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
      <section className="px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="text-center text-[14px] font-bold tracking-[0.12em] text-(--royal)">WHAT WE CHECK</p>
            <h2 className="break-keep mt-3 text-center text-[28px] font-extrabold tracking-[-0.025em] sm:text-[42px]">
              분석기가 확인하고 검증하는 것들
            </h2>
            <p className="mx-auto mt-4 max-w-lg break-keep text-center text-[16px] leading-relaxed text-(--muted) sm:text-[17px]">
              공공 데이터에 등록된 서류 세 가지를 항목별로 대조해, 계약 전에
              놓치기 쉬운 위험 신호를 찾아냅니다.
            </p>
          </Reveal>

          <div className="mt-14 grid justify-center gap-5 sm:mt-16 sm:gap-6 sm:grid-cols-3">
            {CHECKS.map((c, i) => (
              <Reveal key={c.doc} delay={i * 0.1}>
                <article className="g-panel g-check-card h-full rounded-3xl p-7">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: c.tint, color: c.fg }}
                    aria-hidden
                  >
                    {c.icon}
                  </span>
                  <h3 className="mt-4 text-[19px] font-bold">{c.doc}</h3>
                  <p className="mt-1 text-[14px] font-semibold text-(--royal-deep)">{c.desc}</p>
                  <ul className="mt-4 space-y-2.5">
                    {c.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[15px] leading-snug text-(--muted)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <div className="mx-auto mt-16 flex max-w-lg flex-col items-center gap-5 text-center sm:mt-20">
              <p className="break-keep text-[16px] leading-relaxed text-(--muted)">
                보고 있는 매물도 같은 기준으로 확인할 수 있어요. 링크를
                붙여넣으면 위 항목 전부를 실제 서류 기준으로 검증한 상세
                리포트를 30초 안에 보여드립니다.
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
      <section id="faq" className="scroll-mt-24 px-4 py-20 sm:py-32">
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
      <section className="px-4 pb-24 pt-8 sm:pb-36 sm:pt-12">
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
  );
}
