'use client';
import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { GlassCard } from '@/components/kit/GlassCard';
import { KakaoIcon } from '@/components/kit/KakaoIcon';
import type { LoginProvider } from '@/lib/types';

export function UpgradeCard({ reportId }: { reportId: string }) {
  const [loggedInAs, setLoggedInAs] = useState<LoginProvider | null>(null);

  function completeLoginStub(provider: LoginProvider) {
    trackEvent('premium_cta_click', { reportId, provider });
    setLoggedInAs(provider);
    trackEvent('login_complete', { reportId, provider });
  }

  return (
    <GlassCard>
      <h2 className="font-semibold text-[var(--color-ink)]">더 자세한 리포트가 필요하신가요?</h2>
      <p className="mt-1 text-sm text-[var(--color-slate)]">
        소유자·근저당·선순위 보증금까지 확인하는 정밀 리포트를 받으시려면 카카오톡으로 로그인해주세요.
        지금은 무료.
      </p>

      {loggedInAs ? (
        <p className="mt-4 text-sm font-medium text-[var(--color-ink)]">접수 완료 · 접수번호 #HS-0041</p>
      ) : (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => completeLoginStub('kakao')}
            className="flex items-center gap-2 rounded-xl bg-[#FEE500] px-4 py-2.5 text-sm font-semibold text-black/85 transition-all duration-150 active:scale-95"
          >
            <KakaoIcon className="size-[18px]" />
            카카오 로그인
          </button>
        </div>
      )}
    </GlassCard>
  );
}
