'use client';
import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { GlassCard } from '@/components/kit/GlassCard';
import type { LoginProvider } from '@/lib/types';

export function UpgradeCard({ reportId }: { reportId: string }) {
  const [loggedInAs, setLoggedInAs] = useState<{ provider: LoginProvider; name: string } | null>(null);
  const [pendingProvider, setPendingProvider] = useState<LoginProvider | null>(null);
  const [nameInput, setNameInput] = useState('');

  function openLoginStub(provider: LoginProvider) {
    trackEvent('premium_cta_click', { reportId, provider });
    setPendingProvider(provider);
  }

  function confirmLoginStub(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingProvider || !nameInput.trim()) return;
    setLoggedInAs({ provider: pendingProvider, name: nameInput.trim() });
    trackEvent('login_complete', { reportId, provider: pendingProvider });
    setPendingProvider(null);
  }

  return (
    <GlassCard>
      <h2 className="font-semibold text-[var(--color-ink)]">등기부 분석은 정밀 리포트에서</h2>
      <p className="mt-1 text-sm text-[var(--color-slate)]">
        소유자·근저당·선순위 보증금까지 전문가가 직접 확인해 24시간 내 보내드립니다. 지금은 무료.
      </p>

      {loggedInAs ? (
        <p className="mt-4 text-sm font-medium text-[var(--color-ink)]">접수 완료 · 접수번호 #HS-0041</p>
      ) : pendingProvider ? (
        <form onSubmit={confirmLoginStub} className="mt-4 flex gap-2">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="이름"
            aria-label="이름"
            className="rounded-xl border-glass bg-white/50 px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-slate)] focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#FEE500] px-3 py-2 text-sm font-semibold text-[#1a1a2e] transition-all duration-150 active:scale-95"
          >
            카카오로 계속하기
          </button>
        </form>
      ) : (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => openLoginStub('kakao')}
            className="rounded-xl bg-[#FEE500] px-4 py-2 text-sm font-semibold text-[#1a1a2e] transition-all duration-150 active:scale-95"
          >
            카카오로 3초 만에 받기
          </button>
        </div>
      )}
    </GlassCard>
  );
}
