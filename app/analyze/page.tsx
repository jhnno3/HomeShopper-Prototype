'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProgressAnimation } from '@/components/analyze/ProgressAnimation';
import { Button } from '@/components/kit/Button';
import { CardStack } from '@/components/reserve/CardStack';
import { ErrorCard } from '@/components/kit/ErrorCard';
import { trackEvent } from '@/lib/analytics';
import { apiFetch, ApiError } from '@/lib/api';
import { classifyListingInput } from '@/lib/listing-input';
import type { AnalysisApiResponse } from '@/lib/types';

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
  // 도로명주소 fallback: some 다방 detail responses don't carry a road address,
  // and the backend then rejects the analysis with a "도로명 주소를 찾지 못했습니다"
  // error. When that happens we reveal an extra field so the user can supply it
  // directly; it's sent as the optional camelCase `roadAddress` (≤300 chars,
  // FRONTEND_INTEGRATION.md §매물 분석), which the backend prefers over the
  // listing's own address.
  const [roadAddress, setRoadAddress] = useState('');
  const [needsRoadAddress, setNeedsRoadAddress] = useState(false);

  // Guards the analysis request against a double fire — the effect re-runs on
  // dev strict-mode remounts, and `step` can re-enter 'progress' on retry.
  const analyzingRef = useRef(false);

  // Runs the real analysis whenever we enter the progress step. The request
  // takes ~15–60s (PROTOTYPE_API.md §3), so the loader animates until it
  // resolves rather than on a fixed timer. On failure we drop back to the
  // form with the server's message so the user can retry.
  useEffect(() => {
    if (step !== 'progress' || analyzingRef.current) return;

    const input = classifyListingInput(sourceValue);
    if (input.kind !== 'link') {
      setError(input.kind === 'invalid' ? input.message : '다방 링크를 다시 확인해주세요.');
      setStep('input');
      return;
    }

    analyzingRef.current = true;
    trackEvent('analyze_start', { inputMode: 'link' });

    const trimmedRoad = roadAddress.trim();

    apiFetch<AnalysisApiResponse>('/analyses', {
      method: 'POST',
      body: JSON.stringify({
        inputMode: 'link',
        source: input.source,
        ...(trimmedRoad ? { roadAddress: trimmedRoad } : {}),
      }),
    })
      .then((res) => {
        trackEvent('analyze_complete', { reportId: res.reportId, status: res.status });
        router.push(`/report/${res.reportId}`);
      })
      .catch((err) => {
        analyzingRef.current = false;
        const message =
          err instanceof ApiError ? err.message : '분석에 실패했어요. 잠시 후 다시 시도해주세요.';
        // The backend couldn't extract a road address from the listing —
        // reveal the manual 도로명주소 field and prompt a retry with it.
        if (/도로명\s*주소/.test(message)) {
          setNeedsRoadAddress(true);
          setError('매물 링크에서 도로명주소를 찾지 못했어요. 아래에 도로명주소를 입력한 뒤 다시 시도해주세요.');
        } else {
          setError(message);
        }
        setStep('input');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    const input = classifyListingInput(sourceValue);
    if (input.kind === 'invalid') {
      setError(input.message);
      return;
    }
    // Once the road-address field is showing, a retry without it would just
    // fail the same way — require it before re-running.
    if (needsRoadAddress && !roadAddress.trim()) {
      setError('도로명주소를 입력해주세요.');
      return;
    }
    setError(null);
    setStep('progress');
  }

  // A real search/analysis failure gets the plain, undecorated error surface
  // instead of the fanned success-card look — a failure shouldn't read as
  // the same polished moment as a clean form.
  const Step1Card = error ? ErrorCard : CardStack;

  return (
    <main className="mx-auto max-w-lg px-6 py-16 md:py-24">
      {step === 'input' && (
        <Step1Card>
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
              className="w-full rounded-xl border border-[rgba(0,131,255,0.22)] bg-[rgba(0,131,255,0.05)] px-4 py-3 text-[var(--color-ink)] placeholder:text-[var(--color-slate)] transition-colors focus:border-[var(--color-blue)] focus:bg-[rgba(0,131,255,0.09)] focus:outline-none"
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
            {needsRoadAddress && (
              <div className="space-y-2">
                <label
                  htmlFor="analyze-road-address"
                  className="block text-sm font-semibold text-[var(--color-ink)]"
                >
                  도로명주소
                </label>
                <input
                  id="analyze-road-address"
                  type="text"
                  value={roadAddress}
                  onChange={(e) => {
                    setRoadAddress(e.target.value);
                    if (error) setError(null);
                  }}
                  maxLength={300}
                  placeholder="예: 서울특별시 서초구 서초대로 301"
                  className="w-full rounded-xl border border-[rgba(0,131,255,0.22)] bg-[rgba(0,131,255,0.05)] px-4 py-3 text-[var(--color-ink)] placeholder:text-[var(--color-slate)] transition-colors focus:border-[var(--color-blue)] focus:bg-[rgba(0,131,255,0.09)] focus:outline-none"
                  aria-label="도로명주소"
                />
              </div>
            )}
            <Button type="submit" size="lg" className="w-full">
              분석 시작
            </Button>
          </form>
        </Step1Card>
      )}

      {step === 'progress' && (
        // No card here — the loader sits directly on the ambient background,
        // centered so it reads as a full-screen loading state.
        <div className="flex min-h-[60vh] flex-col justify-center space-y-3 px-2">
          <ProgressAnimation />
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
