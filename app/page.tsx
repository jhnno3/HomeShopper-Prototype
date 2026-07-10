"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { demoReportId } from "@/lib/mock-data";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import "./landing.css";

const DOCS = ["등기부등본", "건축물대장", "실거래가"];

const STEPS = [
  {
    n: "1",
    title: "링크 붙여넣기",
    body: "보고 있는 매물 링크나 주소를 그대로 붙여넣으세요. 가입도, 앱 설치도 없습니다.",
  },
  {
    n: "2",
    title: "30초 자동 분석",
    body: "등기부등본·건축물대장·실거래가를 자동으로 대조해 위험 신호를 찾습니다.",
  },
  {
    n: "3",
    title: "리포트 확인",
    body: "근저당·가압류 같은 항목을 신호등 색으로 정리한 리포트를 바로 받습니다.",
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
        router.push("/analyze");
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

function HeroReportSnippet() {
  const reduce = useReducedMotion();
  const rows: [string, string, string][] = [
    ["근저당권", "#0f9d58", "안전"],
    ["위반건축물", "#0f9d58", "안전"],
    ["실거래가 대비 보증금", "#e8a13a", "주의"],
  ];

  return (
    <motion.div
      className="g-panel w-full max-w-xs shrink-0 overflow-hidden rounded-2xl text-left lg:w-[272px]"
      animate={reduce ? undefined : { y: [0, -7, 0] }}
      transition={reduce ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="flex items-center gap-1.5 border-b border-white/70 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-[#f26d63]" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-[#f5be4f]" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-[#58c26a]" aria-hidden />
        <span className="ml-2 truncate text-[11px] font-semibold text-(--faint)">
          매탄동 ○○아파트
        </span>
      </div>
      <div className="space-y-2 p-3.5">
        {rows.map(([label, color, tag]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 rounded-lg bg-white/70 px-3 py-2"
          >
            <span className="text-[12.5px] font-semibold text-(--ink)">{label}</span>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold text-white"
              style={{ background: color }}
            >
              {tag}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
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
            <Link href="/analyze" className="g-cta px-4 py-2 text-sm">
              무료 분석
            </Link>
          </nav>
        </div>
      </header>

      {/* hero */}
      <section className="v3-hero relative flex flex-col justify-center px-4 py-10 sm:py-12">
        <div className="relative z-10 mx-auto w-full max-w-5xl">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
            <motion.div
              className="flex w-full max-w-xl flex-col items-center gap-6 text-center lg:items-start lg:text-left"
              initial={reduce ? false : "hide"}
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.09 } } }}
            >
              {[
                <h1 key="h1" className="text-[30px] leading-[1.22] font-extrabold tracking-[-0.03em] text-balance break-keep sm:text-[46px]">
                  그 매물, 임장 가기 전에
                  <br />
                  <span className="text-(--royal)">30초 만에 서류부터</span> 확인하세요
                </h1>,
                <p key="sub" className="max-w-md break-keep text-[15.5px] leading-relaxed text-(--muted) sm:text-[17px]">
                  링크 하나만 붙여넣으면 등기부등본부터 실거래가까지, 계약 전에 꼭
                  봐야 할 서류를 대신 읽어드립니다.
                </p>,
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
              className="w-full max-w-xs lg:mt-3 lg:w-[272px] lg:max-w-none lg:shrink-0"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <HeroReportSnippet />
            </motion.div>
          </div>

          <motion.div
            className="mx-auto mt-10 flex w-full max-w-xl flex-col items-center gap-6 text-center lg:mt-16"
            initial={reduce ? false : "hide"}
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } } }}
          >
            {[
              <div key="bar" className="w-full max-w-xl">
                <CommandBar />
              </div>,
              <ul key="docs" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-medium text-(--faint)">
                {DOCS.map((d) => (
                  <li key={d} className="flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--royal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {d} 자동 확인
                  </li>
                ))}
              </ul>,
            ].map((node, i) => (
              <motion.div
                key={i}
                className={i === 0 ? "w-full max-w-xl" : undefined}
                variants={{
                  hide: { opacity: 0, y: 18 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                {node}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="scroll-mt-24 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="text-center text-[13px] font-bold tracking-[0.12em] text-(--royal)">
              HOW IT WORKS
            </p>
            <h2 className="break-keep mt-2 text-center text-[24px] font-extrabold tracking-[-0.02em] sm:text-[32px]">
              세 걸음이면 끝납니다
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <article className="g-panel h-full rounded-3xl p-6">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-[15px] font-extrabold text-white"
                    style={{ background: "linear-gradient(180deg,#2f79ff,var(--royal))" }}
                    aria-hidden
                  >
                    {s.n}
                  </span>
                  <h3 className="mt-4 text-[17px] font-bold">{s.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-(--muted)">{s.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* report preview */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <p className="text-[13px] font-bold tracking-[0.12em] text-(--royal)">SAMPLE REPORT</p>
            <h2 className="break-keep mt-2 text-[24px] font-extrabold tracking-[-0.02em] sm:text-[32px]">
              서류 용어를 몰라도
              <br />
              신호등만 보면 됩니다
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-(--muted)">
              근저당권, 가압류, 위반건축물 — 어려운 항목마다 안전·주의·위험
              신호를 붙여 한 장으로 정리합니다. 링크를 붙여넣으면 이 리포트가
              실제 매물 기준으로 열립니다.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="g-panel g-window relative">
              <div className="flex items-center gap-1.5 border-b border-white/70 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f26d63]" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-full bg-[#f5be4f]" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-full bg-[#58c26a]" aria-hidden />
                <span className="ml-3 text-[12px] font-semibold text-(--faint)">
                  homeshopper.report — 매탄동 ○○아파트
                </span>
              </div>
              <div className="g-blurred space-y-3 p-5" aria-hidden>
                {[
                  ["등기부등본 · 근저당권", "#0f9d58", "안전"],
                  ["등기부등본 · 가압류", "#e8a13a", "주의"],
                  ["건축물대장 · 위반건축물", "#0f9d58", "안전"],
                  ["실거래가 대비 보증금", "#e8a13a", "주의"],
                ].map(([label, color, tag]) => (
                  <div key={label as string} className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3">
                    <div className="space-y-1.5">
                      <p className="text-[13px] font-bold">{label}</p>
                      <div className="g-skel h-2 w-40" />
                    </div>
                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
                      style={{ background: color as string }}
                    >
                      {tag}
                    </span>
                  </div>
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-0 top-11 flex items-center justify-center">
                <Link
                  href={`/report/${demoReportId}`}
                  className="g-chip flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-bold text-(--royal-deep)"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  샘플 리포트 열어보기
                </Link>
              </div>
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
