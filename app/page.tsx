"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
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
    // ~28%-deep notch on whichever side it lands
    viewBox: "1402.4 1407.91 561.56 561.56",
    transform: "rotate(180 1683.178 1688.691)",
    from: "#4f93ff",
    to: "#0a5cff",
    padClass: "p-7 pb-24 lg:pb-7 lg:pr-24",
    d: "M1483.751,1407.911h118.52c11.554,0,18.418,13.025,11.766,22.473c-9.901,14.06-15.621,31.277-15.353,49.842c0.652,45.14,37.302,82.156,82.435,83.229c47.618,1.133,86.563-37.129,86.563-84.479c0-18.096-5.685-34.864-15.37-48.611c-6.648-9.437,0.238-22.454,11.781-22.454h118.512c44.93,0,81.354,36.423,81.354,81.354v398.842c0,44.936-36.428,81.364-81.364,81.364h-398.833c-44.936,0-81.364-36.428-81.364-81.364v-398.842c0-44.93,36.423-81.354,81.354-81.354z",
  },
  {
    // rounded square with a tab out the top (into piece 1's notch) and a
    // tab out the bottom (into piece 3's notch); body edges stay clean
    viewBox: "1402.4 386.1 561.56 561.56",
    from: "#0a5cff",
    to: "#0b3ba7",
    padClass: "p-7",
    d: "M1483.762,386.098H1602.271C1613.825,386.098,1620.689,373.073,1614.037,363.625C1604.136,349.565,1598.416,332.348,1598.684,313.782C1599.336,268.642,1635.986,231.626,1681.119,230.553C1728.737,229.42,1767.682,267.682,1767.682,315.032C1767.682,333.128,1761.997,349.896,1752.312,363.643C1745.664,373.08,1752.55,386.098,1764.093,386.098H1882.605C1927.535,386.098,1963.959,422.521,1963.959,467.452V866.304C1963.959,911.234,1927.536,947.658,1882.605,947.658H1764.083C1752.526,947.658,1745.667,960.686,1752.321,970.136C1762.207,984.175,1767.924,1001.363,1767.674,1019.901C1767.065,1065.038,1730.46,1102.088,1685.332,1103.211C1637.682,1104.397,1598.675,1066.116,1598.675,1018.734C1598.675,1000.632,1604.364,983.862,1614.052,970.114C1620.702,960.677,1613.816,947.658,1602.272,947.658H1483.763C1438.827,947.658,1402.399,911.23,1402.399,866.294V467.462C1402.398,422.526,1438.826,386.098,1483.762,386.098Z",
  },
  {
    // same artwork as piece 1, unrotated — notch on the top edge
    // (left edge in the horizontal row); padding clears it
    viewBox: "1402.4 1407.91 561.56 561.56",
    from: "#0b3ba7",
    to: "#0a2f80",
    padClass: "p-7 pt-24 lg:pt-7 lg:pl-24",
    d: "M1483.751,1407.911h118.52c11.554,0,18.418,13.025,11.766,22.473c-9.901,14.06-15.621,31.277-15.353,49.842c0.652,45.14,37.302,82.156,82.435,83.229c47.618,1.133,86.563-37.129,86.563-84.479c0-18.096-5.685-34.864-15.37-48.611c-6.648-9.437,0.238-22.454,11.781-22.454h118.512c44.93,0,81.354,36.423,81.354,81.354v398.842c0,44.936-36.428,81.364-81.364,81.364h-398.833c-44.936,0-81.364-36.428-81.364-81.364v-398.842c0-44.93,36.423-81.354,81.354-81.354z",
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

function Logo() {
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
      {/* window chrome */}
      <div className="flex items-center gap-1.5 border-b border-white/70 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#f26d63]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-[#f5be4f]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-[#58c26a]" aria-hidden />
        <span className="ml-3 truncate text-[12px] font-semibold text-(--faint)">
          homeshopper.report
        </span>
      </div>

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
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const reduce = useReducedMotion();

  return (
    <div className="v3 min-h-dvh">
      {/* nav */}
      <header className="g-navbar sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
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
      <section className="relative px-4 pt-12 pb-16 sm:pt-16 sm:pb-20">
        <div className="relative z-10 mx-auto w-full max-w-5xl">
          {/*
            Grid areas keep the DOM order (heading, image, search) identical
            for mobile stacking, while desktop remaps the same three areas
            into a 2-column layout: heading+search on the left, image on the
            right spanning both rows.
          */}
          <div
            className="grid gap-y-9 [grid-template-areas:'heading'_'image'_'search'] sm:gap-y-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-x-16 lg:gap-y-9 lg:[grid-template-areas:'heading_image'_'search_image']"
          >
            <motion.div
              className="flex w-full max-w-xl flex-col items-center gap-6 text-center [grid-area:heading] lg:items-start lg:text-left"
              initial={reduce ? false : "hide"}
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.09 } } }}
            >
              {[
                <h1 key="h1" className="text-[30px] leading-[1.22] font-extrabold tracking-[-0.03em] text-balance break-keep sm:text-[46px]">
                  그 매물, 임장 가기 전에
                  <br />
                  <span className="text-grad">30초 만에 서류부터</span> 확인하세요
                </h1>,
                <p key="sub" className="max-w-md break-keep text-[15.5px] leading-relaxed text-(--muted) sm:text-[17px]">
                  링크 하나만 붙여넣으면 등기부등본부터 실거래가까지, 계약 전에 꼭
                  봐야 할 서류를 대신 읽어드립니다.
                </p>,
                <ul key="docs" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13.5px] font-medium text-(--muted) lg:justify-start">
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
              className="shrink-0 justify-self-center [grid-area:image] lg:justify-self-end lg:self-center"
              initial={reduce ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src="/hero-docs-v2.png"
                alt="돋보기로 부동산 서류와 평면도를 살펴보는 일러스트"
                width={1792}
                height={2400}
                priority
                className="h-auto w-[230px] sm:w-[290px] lg:w-[360px] [filter:drop-shadow(0_24px_44px_rgba(11,59,167,0.2))]"
              />
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

          {/* sample report preview */}
          <motion.div
            className="mx-auto mt-12 w-full max-w-2xl sm:mt-14"
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-5 text-center">
              <p className="text-[13px] font-bold tracking-[0.12em] text-(--royal)">SAMPLE REPORT</p>
              <h2 className="mt-1.5 break-keep text-[20px] font-extrabold tracking-[-0.02em] sm:text-[24px]">
                분석이 끝나면 이런 리포트를 받아요
              </h2>
            </div>
            <SampleReport />
          </motion.div>
        </div>
      </section>

      {/* how it works — centered header while the puzzle stacks vertically
          (below lg), left-aligned once it becomes a horizontal row (lg+) */}
      <section id="how" className="scroll-mt-24 px-4 py-16 sm:py-24">
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
                  viewport={{ once: true, margin: "-60px" }}
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
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="text-center text-[13px] font-bold tracking-[0.12em] text-(--royal)">WHAT WE CHECK</p>
            <h2 className="break-keep mt-2 text-center text-[24px] font-extrabold tracking-[-0.02em] sm:text-[32px]">
              분석기가 확인하고 검증하는 것들
            </h2>
            <p className="mx-auto mt-4 max-w-lg break-keep text-center text-[15px] leading-relaxed text-(--muted)">
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
                  <h3 className="mt-5 text-[18px] font-bold">{c.doc}</h3>
                  <p className="mt-1.5 text-[14px] font-semibold text-(--royal-deep)">{c.desc}</p>
                  <ul className="mt-4 space-y-2.5">
                    {c.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[14px] leading-snug text-(--muted)">
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
              <p className="break-keep text-[15px] leading-relaxed text-(--muted)">
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
      <section id="faq" className="scroll-mt-24 px-4 py-16 sm:py-24">
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
            <h2 className="break-keep mt-14 text-center text-[24px] font-extrabold tracking-[-0.02em] sm:text-[30px]">
              자주 묻는 질문
            </h2>
            <FaqAccordion />
          </Reveal>
        </div>
      </section>

      {/* reserve banner */}
      <section className="px-4 pb-20 pt-4 sm:pb-28">
        <Reveal>
          <div className="g-banner mx-auto flex max-w-5xl flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <p className="text-[13px] font-bold tracking-[0.1em] text-white/70">COMING SOON</p>
              <h2 className="break-keep mt-2 text-[22px] font-extrabold tracking-[-0.02em] sm:text-[26px]">
                동행 임장 · 반값 정찰 중개
              </h2>
              <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-white/85">
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
