'use client';
import { Suspense } from 'react';
import { useAdminList } from '@/lib/useAdminList';
import { AdminHeader, StatTile, StatusBadge, AdminStateNotice } from '@/components/admin/AdminUI';
import { GlassCard } from '@/components/kit/GlassCard';
import type { PremiumRequestApiResponse } from '@/lib/types';

const STATUSES: PremiumRequestApiResponse['status'][] = ['queued', 'writing', 'sent'];

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('ko-KR');
}

function PremiumRequestsView() {
  const { state, data, reload } = useAdminList<PremiumRequestApiResponse>('/admin/premium-requests');

  const items = data?.items ?? [];
  const countBy = (s: string) => items.filter((r) => r.status === s).length;

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <AdminHeader title="정밀 리포트 요청" subtitle="접수된 정밀 리포트 신청 (조회 전용)" />

      {state !== 'ready' ? (
        <AdminStateNotice state={state} onRetry={reload} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="전체" value={data?.total ?? items.length} />
            {STATUSES.map((s) => (
              <StatTile key={s} label={s} value={countBy(s)} />
            ))}
          </div>

          {items.length === 0 ? (
            <GlassCard className="p-8 text-center text-sm text-[var(--color-slate)]">
              아직 접수된 정밀 리포트 요청이 없어요.
            </GlassCard>
          ) : (
            <GlassCard className="overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--glass-border)] text-[var(--color-slate)]">
                    <th className="px-4 py-3 font-medium">신청번호</th>
                    <th className="px-4 py-3 font-medium">리포트 ID</th>
                    <th className="px-4 py-3 font-medium">동 · 호수</th>
                    <th className="px-4 py-3 font-medium">제공자</th>
                    <th className="px-4 py-3 font-medium">상태</th>
                    <th className="px-4 py-3 font-medium">신청 시각</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id} className="border-b border-[var(--glass-border)] last:border-0">
                      <td className="px-4 py-3 tabular-nums text-[var(--color-ink)]">{r.id}</td>
                      <td className="px-4 py-3 tabular-nums text-[var(--color-ink)]">{r.reportId}</td>
                      <td className="px-4 py-3 text-[var(--color-ink)]">
                        {r.dong} {r.ho}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-ink)]">{r.provider}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-[var(--color-slate)]">
                        {formatDateTime(r.requestedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          )}
        </>
      )}
    </main>
  );
}

export default function PremiumRequestsPage() {
  return (
    <Suspense fallback={null}>
      <PremiumRequestsView />
    </Suspense>
  );
}
