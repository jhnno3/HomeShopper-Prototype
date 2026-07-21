'use client';
import { Suspense } from 'react';
import { useAdminList } from '@/lib/useAdminList';
import { AdminHeader, StatTile, StatusBadge, AdminStateNotice } from '@/components/admin/AdminUI';
import { GlassCard } from '@/components/kit/GlassCard';
import type { ReservationApiResponse } from '@/lib/types';

const STATUSES: ReservationApiResponse['status'][] = [
  'received',
  'contacted',
  'confirmed',
  'cancelled',
];

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('ko-KR');
}

function ReservationsView() {
  const { state, data, reload } = useAdminList<ReservationApiResponse>('/admin/reservations');

  const items = data?.items ?? [];
  const countBy = (s: string) => items.filter((r) => r.status === s).length;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-12">
      <AdminHeader
        title="예약 · 방문 로그"
        subtitle="사전예약(동행 임장) 신청 내역 (조회 전용)"
      />

      {state !== 'ready' ? (
        <AdminStateNotice state={state} onRetry={reload} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <StatTile label="전체" value={data?.total ?? items.length} />
            {STATUSES.map((s) => (
              <StatTile key={s} label={s} value={countBy(s)} />
            ))}
          </div>

          {items.length === 0 ? (
            <GlassCard className="p-8 text-center text-sm text-[var(--color-slate)]">
              아직 접수된 예약이 없어요.
            </GlassCard>
          ) : (
            <GlassCard className="overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--glass-border)] text-[var(--color-slate)]">
                    <th className="px-4 py-3 font-medium">순번</th>
                    <th className="px-4 py-3 font-medium">이름</th>
                    <th className="px-4 py-3 font-medium">연락처</th>
                    <th className="px-4 py-3 font-medium">희망 지역</th>
                    <th className="px-4 py-3 font-medium">방문 시기</th>
                    <th className="px-4 py-3 font-medium">유입</th>
                    <th className="px-4 py-3 font-medium">상태</th>
                    <th className="px-4 py-3 font-medium">접수 시각</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id} className="border-b border-[var(--glass-border)] last:border-0">
                      <td className="px-4 py-3 tabular-nums text-[var(--color-ink)]">
                        {r.queueNumber}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-ink)]">{r.name}</td>
                      <td className="px-4 py-3 tabular-nums text-[var(--color-slate)]">{r.phone}</td>
                      <td className="px-4 py-3 text-[var(--color-ink)]">{r.region}</td>
                      <td className="px-4 py-3 text-[var(--color-ink)]">{r.visitTiming}</td>
                      <td className="px-4 py-3 text-[var(--color-slate)]">{r.src}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-[var(--color-slate)]">
                        {formatDateTime(r.createdAt)}
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

export default function ReservationsPage() {
  return (
    <Suspense fallback={null}>
      <ReservationsView />
    </Suspense>
  );
}
