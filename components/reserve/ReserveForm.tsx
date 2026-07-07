'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { trackEvent } from '@/lib/analytics';
import { Button } from '@/components/kit/Button';
import { GlassCard } from '@/components/kit/GlassCard';
import type { VisitTiming, ReservationSource } from '@/lib/types';

const VISIT_TIMINGS: VisitTiming[] = ['1주 내', '1개월 내', '미정'];

function SegmentedButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'flex-1 rounded-xl bg-grad px-4 py-2 text-sm font-semibold text-white transition-all duration-150'
          : 'flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-[var(--color-slate)] transition-all duration-150'
      }
    >
      {children}
    </button>
  );
}

export function ReserveForm() {
  const searchParams = useSearchParams();
  const src = (searchParams.get('src') as ReservationSource) ?? 'landing';
  const reportId = searchParams.get('reportId') ?? undefined;
  const reduceMotion = useReducedMotion();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [visitTiming, setVisitTiming] = useState<VisitTiming>('미정');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    trackEvent('reserve_phone_complete', { src, reportId });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <GlassCard className="p-8 text-center">
            <h1 className="text-xl font-bold text-[var(--color-ink)]">사전예약이 완료됐어요</h1>
            <p className="mt-2 text-sm text-[var(--color-slate)]">예약 순번 #128</p>
            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-[#FEE500] px-5 py-3 text-sm font-semibold text-[#1a1a2e] transition-all duration-150 active:scale-95"
            >
              오픈 소식과 임장 일정을 카톡으로
            </button>
          </GlassCard>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="space-y-4"
      >
        <GlassCard className="p-4">
          <p className="text-sm text-[var(--color-slate)]">
            동행 임장·반값 정찰 수수료 중개는 정식 오픈 준비 중입니다. 지금 신청하시면 오픈 시 우선
            배정해드려요.
          </p>
        </GlassCard>
        <p className="text-sm font-medium text-grad">
          사전예약자 전원 프리미엄 AI 권리분석 무료 — 계약 후 등기부 변동 자동 모니터링 + 특약 문구
          추천 포함
        </p>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              aria-label="이름"
              className="w-full rounded-xl border-glass bg-white/50 px-4 py-3 text-[var(--color-ink)] placeholder:text-[var(--color-slate)] focus:outline-none"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="전화번호"
              aria-label="전화번호"
              className="w-full rounded-xl border-glass bg-white/50 px-4 py-3 text-[var(--color-ink)] placeholder:text-[var(--color-slate)] focus:outline-none"
            />
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="희망 지역"
              aria-label="희망 지역"
              className="w-full rounded-xl border-glass bg-white/50 px-4 py-3 text-[var(--color-ink)] placeholder:text-[var(--color-slate)] focus:outline-none"
            />
            <div className="flex gap-1 rounded-xl bg-glass border-glass p-1">
              {VISIT_TIMINGS.map((timing) => (
                <SegmentedButton
                  key={timing}
                  active={visitTiming === timing}
                  onClick={() => setVisitTiming(timing)}
                >
                  {timing}
                </SegmentedButton>
              ))}
            </div>
            <Button type="submit" size="lg" className="w-full">
              사전예약 신청
            </Button>
          </form>
        </GlassCard>
      </motion.div>
    </main>
  );
}
