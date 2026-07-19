'use client';
import { useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { BadgeCheck } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { GlassCard } from '@/components/kit/GlassCard';
import { KakaoIcon } from '@/components/kit/KakaoIcon';
import { AddressPanel } from '@/components/kit/AddressPanel';
import type { LoginProvider } from '@/lib/types';

const FEATURES = ['소유자 · 근저당 현황', '선순위 보증금 계산', '등기부 변동 모니터링'];

export function UpgradeCard({ reportId }: { reportId: string }) {
  const reduceMotion = useReducedMotion();
  const [loggedInAs, setLoggedInAs] = useState<LoginProvider | null>(null);
  const [addressOpen, setAddressOpen] = useState(false);
  const [dong, setDong] = useState('');
  const [ho, setHo] = useState('');
  const addressComplete = dong.trim().length > 0 && ho.trim().length > 0;

  function completeLoginStub(provider: LoginProvider) {
    if (!addressComplete) return;
    trackEvent('premium_cta_click', { reportId, provider });
    setLoggedInAs(provider);
    trackEvent('login_complete', { reportId, provider, dong, ho });
  }

  return (
    <GlassCard className="relative overflow-hidden">
      {/* Soft brand-gradient bloom, tucked behind the eyebrow — the card's
          only hit of color, so it reads as "premium" without a heavy fill. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-16 size-44 rounded-full bg-[radial-gradient(closest-side,rgba(76,44,226,0.22),transparent)] blur-2xl"
      />

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

        {loggedInAs ? (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-[rgba(31,181,122,0.09)] px-3.5 py-3">
            <BadgeCheck
              aria-hidden
              className="size-5 shrink-0 text-[var(--color-success)]"
              strokeWidth={2.25}
            />
            <div className="leading-snug">
              <p className="text-[13.5px] font-semibold text-[var(--color-ink)]">접수 완료</p>
              <p className="text-[12px] text-[var(--color-slate)]">
                접수번호 #HS-0041 · 카카오톡으로 곧 보내드릴게요
              </p>
            </div>
          </div>
        ) : (
          <>
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
              disabled={!addressComplete}
              aria-disabled={!addressComplete}
              onClick={() => completeLoginStub('kakao')}
              className={`mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-[14px] font-semibold text-black/85 transition-all duration-150 ${
                addressComplete
                  ? 'cursor-pointer hover:brightness-95 active:scale-[0.98]'
                  : 'cursor-not-allowed opacity-40'
              }`}
            >
              <KakaoIcon className="size-[17px]" />
              카카오 로그인하고 무료로 받기
            </button>
            {!addressComplete ? (
              <p className="mt-1.5 text-center text-[12px] text-[var(--color-slate)]">
                동·호수를 입력하면 카카오 로그인을 이용할 수 있어요.
              </p>
            ) : null}
          </>
        )}
      </div>
    </GlassCard>
  );
}
