'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProgressAnimation } from '@/components/analyze/ProgressAnimation';
import { Button } from '@/components/kit/Button';
import { GlassCard } from '@/components/kit/GlassCard';
import { trackEvent } from '@/lib/analytics';
import { demoReportId } from '@/lib/mock-data';
import type { DealType } from '@/lib/types';

type Step = 'input' | 'details' | 'progress';

function looksLikeUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

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

function AnalyzeFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // A source passed from the landing search box skips the 매물 정보 step.
  const initialSource = (searchParams.get('source') ?? '').trim();
  const [step, setStep] = useState<Step>(initialSource ? 'details' : 'input');
  const [inputMode, setInputMode] = useState<'link' | 'address'>(
    initialSource && !looksLikeUrl(initialSource) ? 'address' : 'link'
  );
  const [sourceValue, setSourceValue] = useState(initialSource);
  const [dealType, setDealType] = useState<DealType>('전세');
  const [deposit, setDeposit] = useState('');

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sourceValue.trim()) return;
    setStep('details');
  }

  function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault();
    trackEvent('analyze_start', { inputMode, dealType });
    setStep('progress');
  }

  function handleProgressComplete() {
    trackEvent('analyze_complete', { reportId: demoReportId });
    router.push(`/report/${demoReportId}`);
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16 md:py-24">
      {step === 'input' && (
        <GlassCard className="p-8">
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <h1 className="text-2xl font-bold text-[var(--color-ink)]">매물 정보를 알려주세요</h1>
            <div className="flex gap-1 rounded-xl bg-glass border-glass p-1">
              <SegmentedButton active={inputMode === 'link'} onClick={() => setInputMode('link')}>
                링크로 입력
              </SegmentedButton>
              <SegmentedButton active={inputMode === 'address'} onClick={() => setInputMode('address')}>
                주소로 입력
              </SegmentedButton>
            </div>
            <input
              type="text"
              value={sourceValue}
              onChange={(e) => setSourceValue(e.target.value)}
              placeholder={inputMode === 'link' ? '매물 링크를 붙여넣으세요' : '주소를 입력하세요'}
              className="w-full rounded-xl border-glass bg-white/50 px-4 py-3 text-[var(--color-ink)] placeholder:text-[var(--color-slate)] focus:outline-none"
              aria-label={inputMode === 'link' ? '매물 링크' : '매물 주소'}
            />
            <Button type="submit" size="lg" className="w-full">
              다음
            </Button>
          </form>
        </GlassCard>
      )}

      {step === 'details' && (
        <GlassCard className="p-8">
          <form onSubmit={handleStep2Submit} className="space-y-6">
            <h1 className="text-2xl font-bold text-[var(--color-ink)]">거래 정보를 알려주세요</h1>
            <div className="flex gap-1 rounded-xl bg-glass border-glass p-1">
              <SegmentedButton active={dealType === '전세'} onClick={() => setDealType('전세')}>
                전세
              </SegmentedButton>
              <SegmentedButton active={dealType === '월세'} onClick={() => setDealType('월세')}>
                월세
              </SegmentedButton>
            </div>
            <input
              type="number"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              placeholder="보증금 (선택, 단위: 만원)"
              className="w-full rounded-xl border-glass bg-white/50 px-4 py-3 text-[var(--color-ink)] placeholder:text-[var(--color-slate)] focus:outline-none"
              aria-label="보증금"
            />
            <Button type="submit" size="lg" className="w-full">
              분석 시작
            </Button>
          </form>
        </GlassCard>
      )}

      {step === 'progress' && (
        <GlassCard className="p-8">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[var(--color-ink)]">서류를 확인하고 있어요</h1>
            <ProgressAnimation onComplete={handleProgressComplete} />
          </div>
        </GlassCard>
      )}
    </main>
  );
}

export default function AnalyzePage() {
  // useSearchParams requires a Suspense boundary for prerendering (Next docs).
  return (
    <Suspense fallback={null}>
      <AnalyzeFlow />
    </Suspense>
  );
}
