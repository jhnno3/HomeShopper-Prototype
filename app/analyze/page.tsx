 'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Info } from 'lucide-react';
import { ProgressAnimation } from '@/components/analyze/ProgressAnimation';
import { Button } from '@/components/kit/Button';
import { ErrorCard } from '@/components/kit/ErrorCard';
import { trackEvent } from '@/lib/analytics';
import { apiFetch, ApiError } from '@/lib/api';
import { stashReport } from '@/lib/report-cache';
import type { AnalysisApiResponse, ApiReport } from '@/lib/types';

type Step = 'input' | 'progress';

function AnalyzeFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // An address passed from the landing search box skips the 매물 정보 step;
  // arriving with nothing falls back to the input step.
  const initialSource = (searchParams.get('source') ?? '').trim();
  const startsInProgress = initialSource.length > 0;

  const [step, setStep] = useState<Step>(startsInProgress ? 'progress' : 'input');
  const [sourceValue, setSourceValue] = useState(initialSource);
  const [error, setError] = useState<string | null>(null);

  // Guards the analysis request against a double fire — the effect re-runs on
  // dev strict-mode remounts, and `step` can re-enter 'progress' on retry.
  const analyzingRef = useRef(false);

  // Runs the real analysis whenever we enter the progress step. The request
  // takes ~15–60s (PROTOTYPE_API.md §3), so the loader animates until it
  // resolves rather than on a fixed timer. On failure we drop back to the
  // form with the server's message so the user can retry.
  useEffect(() => {
    if (step !== 'progress' || analyzingRef.current) return;

    const source = sourceValue.trim();
    if (!source) {
      setError('주소를 입력해주세요.');
      setStep('input');
      return;
    }

    analyzingRef.current = true;
    trackEvent('analyze_start', { inputMode: 'address' });

    apiFetch<AnalysisApiResponse>('/analyses', {
      method: 'POST',
      body: JSON.stringify({ inputMode: 'address', source }),
    })
      .then((res) => {
        trackEvent('analyze_complete', { reportId: res.reportId, status: res.status });
        // Fetch the report here, under the same progress screen, and hand it
        // to the report page via the stash — otherwise /report/[id] runs its
        // own GET right after this and flashes its own loading state for a
        // moment before the content is ready. Best-effort: if this fails,
        // just navigate anyway and let the report page fetch it normally.
        return apiFetch<ApiReport>(`/reports/${res.reportId}`)
          .then((report) => stashReport(report))
          .catch(() => {})
          .then(() => {
            // replace, not push: /analyze is a one-shot transition, not a page
            // a user should land back on — pushing it would leave it in
            // history, so back-navigating from the report re-enters
            // 'progress' with the same ?source= and silently re-runs the
            // analysis (see report page's back/forward question). Swapping
            // it out means back goes straight to wherever the user was
            // before starting the analysis.
            router.replace(`/report/${res.reportId}`);
          });
      })
      .catch((err) => {
        analyzingRef.current = false;
        setError(
          err instanceof ApiError ? err.message : '분석에 실패했어요. 잠시 후 다시 시도해주세요.'
        );
        setStep('input');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Bare or hand-typed /analyze (no ?source=) is not a real entry point —
  // only the search box, which always passes an address, should start the
  // analyzer. Anything else bounces home. The retry flow keeps the original
  // ?source= in the URL, so it never triggers this.
  useEffect(() => {
    if (!startsInProgress) router.replace('/');
  }, [startsInProgress, router]);

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sourceValue.trim()) {
      setError('주소를 입력해주세요.');
      return;
    }
    setError(null);
    setStep('progress');
  }

  // Render nothing while the redirect effect above bounces a non-entry-point
  // visit back home (runs after all hooks, so hook order stays stable).
  if (!startsInProgress) return null;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16 md:py-24">
      {step === 'input' && (
        // The input step is only ever reached as a retry after a failed
        // analysis, so it always shows the plain error card — sizing comes
        // from ErrorCard itself, shared with the report error card.
        <ErrorCard>
          <form onSubmit={handleStep1Submit}>
            <h1 className="text-center text-[30px] font-bold text-[var(--color-ink)]">
              매물 정보를 알려주세요
            </h1>
            {/* Separate from the heading's own rhythm (mt-10, not folded into
                the space-y-6 below) — the heading should read as a title
                sitting above the form, not just the first item in its list. */}
            <div className="mt-10 space-y-6">
              <div>
                <input
                  type="text"
                  value={sourceValue}
                  onChange={(e) => {
                    setSourceValue(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="매물 주소를 입력하세요"
                  className="w-full rounded-full border border-[rgba(0,131,255,0.22)] bg-[rgba(0,131,255,0.05)] px-5 py-2.5 text-[var(--color-ink)] placeholder:text-[var(--color-slate)] transition-colors focus:border-[var(--color-blue)] focus:bg-[rgba(0,131,255,0.09)] focus:outline-none"
                  aria-label="매물 주소"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'analyze-source-error' : undefined}
                />
                {/* Tight to the field it describes (mt-2, not the form's
                    space-y-6 rhythm) — a caption hugs its input, it doesn't
                    float evenly between the input and whatever's next. */}
                {error && (
                  <p
                    id="analyze-source-error"
                    role="alert"
                    className="mt-2 px-1 text-[13px] font-semibold text-[var(--color-danger)]"
                  >
                    {error}
                  </p>
                )}
              </div>
              <Button type="submit" size="lg" className="h-11 w-full rounded-full text-sm">
                분석 시작
              </Button>
            </div>
          </form>
          {/* Persistent format hint, not another error — stays visible
              regardless of which validation message fired above, so the
              card never feels like it's just a single bare error line. */}
          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[13px] text-[var(--color-slate)]">
            <Info size={14} aria-hidden />
            도로명 또는 지번 주소를 입력해주세요. 예: 서울특별시 서초구 서초대로 301
          </p>
        </ErrorCard>
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
          <div className="mx-auto mt-3 h-px w-24" style={{ backgroundColor: 'rgba(91,100,114,0.25)' }} />
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
