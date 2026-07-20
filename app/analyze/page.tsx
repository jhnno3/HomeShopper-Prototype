'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProgressAnimation } from '@/components/analyze/ProgressAnimation';
import { Button } from '@/components/kit/Button';
import { GlassCard } from '@/components/kit/GlassCard';
import { trackEvent } from '@/lib/analytics';
import { demoReportId } from '@/lib/report-data';
import { classifyListingInput } from '@/lib/listing-input';

type Step = 'input' | 'progress';

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
  // A valid source passed from the landing search box skips the 매물 정보
  // step; an invalid one falls back to the input step with the error shown.
  const initialSource = (searchParams.get('source') ?? '').trim();
  const initialInput = initialSource ? classifyListingInput(initialSource) : null;
  const startsInProgress = initialInput !== null && initialInput.kind !== 'invalid';

  const [step, setStep] = useState<Step>(startsInProgress ? 'progress' : 'input');
  const [inputMode, setInputMode] = useState<'link' | 'address'>(
    initialInput && initialInput.kind !== 'invalid' ? initialInput.kind : 'link'
  );
  const [sourceValue, setSourceValue] = useState(initialSource);
  const [error, setError] = useState<string | null>(
    initialInput?.kind === 'invalid' ? initialInput.message : null
  );

  useEffect(() => {
    if (startsInProgress) trackEvent('analyze_start', { inputMode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSourceChange(value: string) {
    setSourceValue(value);
    if (error) setError(null);
    // Auto-detect: pasting a link flips to 링크 mode and vice versa, so the
    // segmented control reflects what will actually be sent.
    const detected = classifyListingInput(value);
    if (detected.kind !== 'invalid') setInputMode(detected.kind);
  }

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    const input = classifyListingInput(sourceValue);
    if (input.kind === 'invalid') {
      setError(input.message);
      return;
    }
    setInputMode(input.kind);
    trackEvent('analyze_start', { inputMode: input.kind });
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
              onChange={(e) => handleSourceChange(e.target.value)}
              placeholder={inputMode === 'link' ? '다방 링크를 붙여넣으세요' : '도로명 주소를 입력하세요'}
              className="w-full rounded-xl border-glass bg-white/50 px-4 py-3 text-[var(--color-ink)] placeholder:text-[var(--color-slate)] focus:outline-none"
              aria-label={inputMode === 'link' ? '매물 링크' : '매물 주소'}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'analyze-source-error' : undefined}
            />
            {error && (
              <p
                id="analyze-source-error"
                role="alert"
                className="text-[13px] font-semibold text-[var(--color-danger)]"
              >
                {error}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full">
              분석 시작
            </Button>
          </form>
        </GlassCard>
      )}

      {step === 'progress' && (
        // No card here — the loader sits directly on the ambient background,
        // centered so it reads as a full-screen loading state.
        <div className="flex min-h-[60vh] flex-col justify-center space-y-3 px-2">
          <ProgressAnimation onComplete={handleProgressComplete} />
          {/* Placeholder copy — replace with real benefit messaging */}
          <p className="mx-auto max-w-sm text-center text-base leading-relaxed text-[var(--color-slate)]">
            등기부등본부터 실거래가까지, 계약 전 꼭 확인해야 할 서류를 홈쇼퍼가 대신 확인하고 있어요.
          </p>
          <div className="mx-auto h-px w-24" style={{ backgroundColor: 'rgba(91,100,114,0.25)' }} />
        </div>
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
