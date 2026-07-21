'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReducedMotion } from 'motion/react';
import { BadgeCheck } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { apiFetch, ApiError } from '@/lib/api';
import { startKakaoLogin, stashPending, takePending } from '@/lib/oauth';
import { GlassCard } from '@/components/kit/GlassCard';
import { KakaoIcon } from '@/components/kit/KakaoIcon';
import { AddressPanel } from '@/components/kit/AddressPanel';
import { ErrorPopup } from '@/components/kit/ErrorPopup';
import type { LoginProvider, PremiumRequestApiResponse } from '@/lib/types';

const FEATURES = ['소유자 · 근저당 현황', '선순위 보증금 계산', '등기부 변동 모니터링'];

type PendingPremium = { dong: string; ho: string };

/** Scoped per report so a stale stash from a different report can't leak in. */
function pendingKey(reportId: string) {
  return `hs_pending_premium_${reportId}`;
}

export function UpgradeCard({
  reportId,
  oauthResult,
}: {
  reportId: string;
  /** `?oauth=success|error` from the Kakao redirect (PROTOTYPE_API.md §2), read
   *  by the report page so this component doesn't need its own Suspense boundary. */
  oauthResult: string | null;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [addressOpen, setAddressOpen] = useState(false);
  const [dong, setDong] = useState('');
  const [ho, setHo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const addressComplete = dong.trim().length > 0 && ho.trim().length > 0;
  const processedOAuthRef = useRef(false);

  // The single Kakao button both logs the user in and submits 동/호수 — a
  // full-page OAuth redirect destroys React state, so the values are stashed
  // first and resumed by the effect below on `oauth=success`.
  function beginKakaoSubmit(provider: LoginProvider) {
    if (!addressComplete) return;
    trackEvent('premium_cta_click', { reportId, provider });
    stashPending<PendingPremium>(pendingKey(reportId), { dong: dong.trim(), ho: ho.trim() });
    startKakaoLogin(`${window.location.pathname}${window.location.search}`);
  }

  useEffect(() => {
    if (!oauthResult || processedOAuthRef.current) return;
    processedOAuthRef.current = true;

    if (oauthResult === 'error') {
      const pending = takePending<PendingPremium>(pendingKey(reportId));
      if (pending) {
        setDong(pending.dong);
        setHo(pending.ho);
        setAddressOpen(true);
      }
      setApiError('카카오 로그인에 실패했어요. 다시 시도해주세요.');
      return;
    }

    const pending = takePending<PendingPremium>(pendingKey(reportId));
    if (!pending) {
      setApiError('입력한 동·호수 정보를 찾을 수 없어요. 다시 입력해주세요.');
      return;
    }

    setDong(pending.dong);
    setHo(pending.ho);
    setAddressOpen(true);
    trackEvent('login_complete', { reportId, provider: 'kakao', dong: pending.dong, ho: pending.ho });
    setIsSubmitting(true);
    // encodeURIComponent guards against reportId containing path separators
    // that would collapse this into a request to a different endpoint —
    // see SECURITY_NOTES.md.
    apiFetch<PremiumRequestApiResponse>(`/reports/${encodeURIComponent(reportId)}/premium-requests`, {
      method: 'POST',
      body: JSON.stringify({ dong: pending.dong, ho: pending.ho }),
    })
      .then((response) => {
        trackEvent('premium_sent', { reportId, requestId: response.id });
        // Only add requestId when there's a real value — see the matching
        // comment in ReserveForm for why (avoids baking the literal text
        // "undefined" into the URL if the API response were missing it).
        const requestIdPart = response.id != null ? `&requestId=${response.id}` : '';
        router.push(`/reserve?done=1&variant=premium${requestIdPart}&reportId=${reportId}`);
      })
      .catch((err) => {
        setIsSubmitting(false);
        setApiError(
          err instanceof ApiError ? err.message : '정밀 리포트 신청에 실패했어요. 다시 시도해주세요.'
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oauthResult]);

  return (
    <GlassCard className="relative overflow-hidden">
      <div className="relative">
        <span className="inline-flex items-center rounded-full bg-[rgba(76,44,226,0.1)] px-2.5 py-1 text-[12px] font-semibold text-[var(--color-purple)]">
          프리미엄 리포트
        </span>

        <h2 className="mt-2.5 text-[17px] font-bold tracking-tight text-[var(--color-ink)]">
          더 자세한 리포트가 필요하신가요?
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-[var(--color-slate)]">
          소유자·근저당·선순위 보증금까지 확인하는 정밀 리포트를 지금은 무료로 받아보세요.
        </p>

        <ul className="mt-3.5 space-y-2">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-[13px] text-[var(--color-ink)]">
              <BadgeCheck
                aria-hidden
                className="size-4 shrink-0 text-[var(--color-success)]"
                strokeWidth={2.25}
              />
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <AddressPanel
            idPrefix="report"
            open={addressOpen}
            onToggle={() => setAddressOpen((prev) => !prev)}
            dong={dong}
            ho={ho}
            onDongChange={setDong}
            onHoChange={setHo}
            reduceMotion={Boolean(reduceMotion)}
          />
        </div>

        <button
          disabled={!addressComplete || isSubmitting}
          aria-disabled={!addressComplete || isSubmitting}
          onClick={() => beginKakaoSubmit('kakao')}
          className={`mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-[14px] font-semibold text-black/85 transition-all duration-150 ${
            addressComplete && !isSubmitting
              ? 'cursor-pointer hover:brightness-95 active:scale-[0.98]'
              : 'cursor-not-allowed opacity-40'
          }`}
        >
          <KakaoIcon className="size-[17px]" />
          {isSubmitting ? '신청 처리 중...' : '카카오 로그인하고 무료로 받기'}
        </button>
        {!addressComplete ? (
          <p className="mt-1.5 text-center text-[12px] text-[var(--color-slate)]">
            동·호수를 입력하면 카카오 로그인을 이용할 수 있어요.
          </p>
        ) : null}
      </div>
      {apiError ? (
        <ErrorPopup
          message={apiError}
          onRetry={
            addressComplete
              ? () => {
                  setApiError(null);
                  beginKakaoSubmit('kakao');
                }
              : undefined
          }
          onDismiss={() => setApiError(null)}
        />
      ) : null}
    </GlassCard>
  );
}
