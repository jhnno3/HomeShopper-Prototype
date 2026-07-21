'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { GlassCard } from '@/components/kit/GlassCard';
import { startKakaoLogin } from '@/lib/oauth';
import type { AdminListState } from '@/lib/useAdminList';

/** Page header with a back-to-hub link. */
export function AdminHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="space-y-2">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-slate)] transition-colors hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={14} aria-hidden />
        관리자 홈
      </Link>
      <h1 className="text-xl font-bold text-[var(--color-ink)]">{title}</h1>
      {subtitle ? <p className="text-sm text-[var(--color-slate)]">{subtitle}</p> : null}
    </header>
  );
}

/** One summary statistic — a count under a label. */
export function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <GlassCard className="p-4">
      <p className="text-[12px] font-medium text-[var(--color-slate)]">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--color-ink)]">{value}</p>
    </GlassCard>
  );
}

const STATUS_TONES: Record<string, string> = {
  // premium-request statuses
  queued: 'bg-[rgba(91,100,114,0.12)] text-[var(--color-slate)]',
  writing: 'bg-[rgba(0,131,255,0.12)] text-[var(--color-blue)]',
  sent: 'bg-[rgba(31,181,122,0.12)] text-[var(--color-success)]',
  // reservation statuses
  received: 'bg-[rgba(91,100,114,0.12)] text-[var(--color-slate)]',
  contacted: 'bg-[rgba(0,131,255,0.12)] text-[var(--color-blue)]',
  confirmed: 'bg-[rgba(31,181,122,0.12)] text-[var(--color-success)]',
  cancelled: 'bg-[rgba(229,72,77,0.12)] text-[var(--color-danger)]',
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status] ?? 'bg-[rgba(91,100,114,0.12)] text-[var(--color-slate)]';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {status}
    </span>
  );
}

/**
 * Renders the non-ready states shared by every admin list screen. `unauthorized`
 * offers a Kakao login (the screens are AGENT-only); a successful login returns
 * to this same path and the list re-fetches on the fresh page load.
 */
export function AdminStateNotice({
  state,
  onRetry,
}: {
  state: Exclude<AdminListState, 'ready'>;
  onRetry: () => void;
}) {
  if (state === 'loading') {
    return <p className="py-16 text-center text-sm text-[var(--color-slate)]">불러오는 중...</p>;
  }

  if (state === 'unauthorized') {
    return (
      <GlassCard className="p-8 text-center">
        <h2 className="text-base font-bold text-[var(--color-ink)]">관리자 로그인이 필요해요</h2>
        <p className="mt-2 text-sm text-[var(--color-slate)]">
          AGENT 권한이 있는 계정으로 로그인하면 데이터를 볼 수 있어요.
        </p>
        <button
          type="button"
          onClick={() => startKakaoLogin(`${window.location.pathname}${window.location.search}`)}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#FEE500] px-5 text-[14px] font-semibold text-black/85 transition-all hover:brightness-95 active:scale-[0.98]"
        >
          카카오로 로그인
        </button>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8 text-center">
      <h2 className="text-base font-bold text-[var(--color-ink)]">데이터를 불러오지 못했어요</h2>
      <p className="mt-2 text-sm text-[var(--color-slate)]">잠시 후 다시 시도해주세요.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[var(--color-blue)] px-5 text-[14px] font-semibold text-white transition-colors hover:brightness-95"
      >
        다시 시도
      </button>
    </GlassCard>
  );
}
