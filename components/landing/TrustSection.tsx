"use client";
import { useState } from "react";
import { GlassCard } from "@/components/kit/GlassCard";

const FAQS = [
  { q: "정말 무료인가요?", a: "베이직 리포트는 로그인 없이 무료로 확인할 수 있어요." },
  { q: "전국 어디서나 되나요?", a: "자동 분석은 공공 API 기반으로 전국에서 동작해요." },
  { q: "실제 매물 추천도 해주나요?", a: "아니요, 사용자가 가져온 매물의 공부상 사실만 정리해 제공해요." },
];

export function TrustSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="px-6 py-16">
      <p className="text-center text-sm text-[var(--color-slate)]">
        하나 소셜벤처 선정 · 경기도 공공데이터 활용 수상
      </p>

      <h2 className="mt-10 text-center text-2xl font-bold text-[var(--color-ink)]">
        자주 묻는 질문
      </h2>
      <div className="mx-auto mt-6 max-w-2xl space-y-3">
        {FAQS.map((faq, index) => (
          <GlassCard key={faq.q} className="p-0">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[var(--color-ink)]"
            >
              {faq.q}
            </button>
            {openIndex === index && (
              <p id={`faq-answer-${index}`} className="px-4 pb-3 text-sm text-[var(--color-slate)]">
                {faq.a}
              </p>
            )}
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
