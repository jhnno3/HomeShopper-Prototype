'use client';
import { trackEvent } from '@/lib/analytics';
import { GlassCard } from '@/components/kit/GlassCard';
import { Button } from '@/components/kit/Button';
import type { ReservationSource } from '@/lib/types';

export function VisitCta({ reportId, src }: { reportId: string; src: ReservationSource }) {
  return (
    <GlassCard>
      <h2 className="text-[19px] font-bold tracking-tight text-[var(--color-ink)]">
        <span className="text-[var(--color-blue)]">4단계.</span> 전문가와 함께 매물 하자
        뜯어보기
      </h2>
      <p className="mt-2 text-sm text-[var(--color-slate)]">
        서류로 확인할 수 없는 누수·곰팡이·소음·실측 등을 전문가와 함께 점검해보세요
      </p>
      <Button
        variant="primary"
        size="lg"
        href={`/reserve?src=${src}&reportId=${reportId}`}
        onClick={() => trackEvent('visit_cta_click', { reportId })}
        className="mt-4 w-full"
      >
        원하는 전문가 선택하기
      </Button>
    </GlassCard>
  );
}
