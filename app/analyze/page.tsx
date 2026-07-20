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

function AnalyzeFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // A valid source passed from the landing search box skips the 매물 정보
  // step; an invalid one falls back to the input step with the error shown.
  const initialSource = (searchParams.get('source') ?? '').trim();
  const initialInput = initialSource ? classifyListingInput(initialSource) : null;
  const startsInProgress = initialInput !== null && initialInput.kind === 'link';

  const [step, setStep] = useState<Step>(startsInProgress ? 'progress' : 'input');
  const [sourceValue, setSourceValue] = useState(initialSource);
  const [error, setError] = useState<string | null>(
    initialInput?.kind === 'invalid' ? initialInput.message : null
  );

  useEffect(() => {
    if (startsInProgress) trackEvent('analyze_start', { inputMode: 'link' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    const input = classifyListingInput(sourceValue);
    if (input.kind === 'invalid') {
      setError(input.message);
      return;
    }
    trackEvent('analyze_start', { inputMode: 'link' });
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
            <input
              type="text"
              value={sourceValue}
              onChange={(e) => {
                setSourceValue(e.target.value);
                if (error) setError(null);
              }}
              placeholder="다방 링크를 붙여넣으세요"
              className="w-full rounded-xl border-glass bg-white/50 px-4 py-3 text-[var(--color-ink)] placeholder:text-[var(--color-slate)] focus:outline-none"
              aria-label="다방 매물 링크"
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
