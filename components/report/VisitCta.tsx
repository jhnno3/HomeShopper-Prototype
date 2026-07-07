'use client';
import { trackEvent } from '@/lib/analytics';
import { GlassCard } from '@/components/kit/GlassCard';
import { Button } from '@/components/kit/Button';
import type { ReservationSource } from '@/lib/types';

export function VisitCta({
  reportId,
  tier,
  src,
}: {
  reportId: string;
  tier: 'basic' | 'premium';
  src: ReservationSource;
}) {
  return (
    <GlassCard className="text-center">
      <p className="text-sm text-[var(--color-slate)]">
        서류로 확인할 수 없는 것들: 누수 · 곰팡이 · 소음 · 실측 — 임장에서 확인합니다
      </p>
      <Button
        variant="primary"
        size="lg"
        href={`/reserve?src=${src}&reportId=${reportId}`}
        onClick={() => trackEvent('visit_cta_click', { reportId, tier })}
        className="mt-4 w-full"
      >
        이 매물, 전문가와 동행 임장하기
      </Button>
    </GlassCard>
  );
}
