"use client";
import { ClipboardPaste, Timer, FileCheck2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { GlassCard } from "@/components/kit/GlassCard";

const STEPS = [
  { icon: ClipboardPaste, title: "붙여넣기", desc: "매물 링크나 주소를 입력하세요" },
  { icon: Timer, title: "30초 분석", desc: "공공 데이터로 서류를 자동 확인해요" },
  { icon: FileCheck2, title: "리포트", desc: "실거래가·건축물대장·중개업소 확인 결과를 받아보세요" },
];

export function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="px-6 py-16">
      <h2 className="text-center text-2xl font-bold text-[var(--color-ink)]">
        이렇게 확인해요
      </h2>
      <div className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <motion.div
            key={step.title}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut", delay: index * 0.04 }}
          >
            <GlassCard className="flex h-full flex-col items-center gap-3 text-center">
              <span className="bg-grad flex h-10 w-10 items-center justify-center rounded-xl">
                <step.icon className="h-5 w-5 text-white" strokeWidth={1.8} />
              </span>
              <p className="text-sm font-semibold text-[var(--color-blue)]">
                STEP {index + 1}
              </p>
              <p className="font-bold text-[var(--color-ink)]">{step.title}</p>
              <p className="text-sm text-[var(--color-slate)]">{step.desc}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
