"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
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

function GlassSkyline() {
  return (
    <svg
      className="g-skyline h-28 w-full sm:h-36"
      viewBox="0 0 1200 150"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
    >
      {/* far row */}
      <rect className="g-tower-far" x="40" y="70" width="70" height="80" rx="6" />
      <rect className="g-tower-far" x="240" y="55" width="56" height="95" rx="6" />
      <rect className="g-tower-far" x="500" y="78" width="80" height="72" rx="6" />
      <rect className="g-tower-far" x="760" y="50" width="60" height="100" rx="6" />
      <rect className="g-tower-far" x="1020" y="72" width="72" height="78" rx="6" />
      {/* near row */}
      <rect x="120" y="40" width="72" height="110" rx="8" />
      <rect x="330" y="18" width="86" height="132" rx="8" />
      <rect x="610" y="34" width="76" height="116" rx="8" />
      <rect x="860" y="10" width="92" height="140" rx="8" />
      <rect x="1090" y="46" width="70" height="104" rx="8" />
      {/* lit windows */}
      <rect className="g-win" x="352" y="40" width="12" height="12" rx="2" />
      <rect className="g-win" x="374" y="64" width="12" height="12" rx="2" />
      <rect className="g-win" x="884" y="34" width="12" height="12" rx="2" />
      <rect className="g-win" x="906" y="58" width="12" height="12" rx="2" />
      <rect className="g-win" x="884" y="82" width="12" height="12" rx="2" />
      <rect className="g-win" x="140" y="64" width="11" height="11" rx="2" />
      <rect className="g-win" x="630" y="56" width="11" height="11" rx="2" />
    </svg>
  );
}

function CommandBar() {
  const router = useRouter();
  const [mode, setMode] = useState<"link" | "addr">("link");
  const reduce = useReducedMotion();

  return (
    <form
      className="g-panel g-bar flex w-full flex-col gap-3 p-3 sm:flex-row sm:items-center"
      onSubmit={(e) => {
        e.preventDefault();
        router.push("/analyze");
      }}
    >
      <div className="g-seg self-start sm:self-auto" role="group" aria-label="입력 방식">
        {(["link", "addr"] as const).map((m) => (
          <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>
            {mode === m && (
              <motion.span
                layoutId="seg-thumb"
                className="g-seg-thumb inset-x-0"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }}
                aria-hidden
              />
            )}
            <span className="relative z-10">{m === "link" ? "링크 붙여넣기" : "주소 입력"}</span>
          </button>
        ))}
      </div>
      <input
        type={mode === "link" ? "url" : "text"}
        inputMode={mode === "link" ? "url" : "text"}
        aria-label={mode === "link" ? "매물 링크" : "매물 주소"}
        placeholder={
          mode === "link"
            ? "네이버부동산·직방·다방 매물 링크를 붙여넣으세요"
            : "예) 수원시 영통구 매탄동 000-0"
        }
        className="min-h-11 flex-1 px-2"
      />
      <button type="submit" className="g-cta min-h-12 px-6 text-[15px]">
        무료로 확인하기
      </button>
    </form>
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
          <Link href="/" className="text-[17px] font-extrabold tracking-tight">
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
      <section className="relative px-4 pt-16 pb-36 sm:pt-24 sm:pb-48">
        <motion.div
          className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 text-center"
          initial={reduce ? false : "hide"}
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.09 } } }}
        >
          {[
            <span key="pill" className="g-chip inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-semibold text-(--royal-deep)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 6L9 17l-5-5" />
              </svg>
              가입 없이 무료 · 30초
            </span>,
            <h1 key="h1" className="text-[30px] leading-[1.22] font-extrabold tracking-[-0.03em] text-balance break-keep sm:text-[46px]">
              그 매물, 임장 가기 전에
              <br />
              <span className="text-(--royal)">30초 만에 서류부터</span> 확인하세요
            </h1>,
            <p key="sub" className="max-w-md break-keep text-[15.5px] leading-relaxed text-(--muted) sm:text-[17px]">
              링크 하나만 붙여넣으면 등기부등본부터 실거래가까지, 계약 전에 꼭
              봐야 할 서류를 대신 읽어드립니다.
            </p>,
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
              className={i === 3 ? "w-full max-w-xl" : undefined}
              variants={{
                hide: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              {node}
            </motion.div>
          ))}
        </motion.div>

        <GlassSkyline />
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
