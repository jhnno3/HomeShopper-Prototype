'use client';
import { useState } from 'react';
import { mockPremiumRequests } from '@/lib/mock-data';
import type { PremiumRequest } from '@/lib/types';
import { GlassCard } from '@/components/kit/GlassCard';
import { Button } from '@/components/kit/Button';
import { trackEvent } from '@/lib/analytics';

export default function AdminPage() {
  const [requests, setRequests] = useState<PremiumRequest[]>(mockPremiumRequests);
  const [jsonInput, setJsonInput] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    try {
      JSON.parse(jsonInput || '{}');
    } catch {
      setError('유효한 JSON이 아닙니다');
      return;
    }
    setError(null);
    setRequests((prev) =>
      prev.map((req) =>
        req.id === selectedId ? { ...req, status: 'sent', sentAt: new Date().toISOString() } : req
      )
    );
    trackEvent('premium_sent', { requestId: selectedId });
    setJsonInput('');
    setSelectedId(null);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <h1 className="text-xl font-bold text-[var(--color-ink)]">정밀 리포트 요청 큐</h1>

      <GlassCard className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--glass-border)] text-[var(--color-slate)]">
              <th className="px-5 py-3 font-medium">리포트 ID</th>
              <th className="px-5 py-3 font-medium">제공자</th>
              <th className="px-5 py-3 font-medium">상태</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b border-[var(--glass-border)] last:border-0">
                <td className="px-5 py-3 text-[var(--color-ink)]">{req.reportId}</td>
                <td className="px-5 py-3 text-[var(--color-ink)]">{req.provider}</td>
                <td className="px-5 py-3 text-[var(--color-ink)]">{req.status}</td>
                <td className="px-5 py-3">
                  {req.status !== 'sent' && (
                    <button
                      onClick={() => setSelectedId(req.id)}
                      className="font-medium text-[var(--color-ink)] underline underline-offset-2"
                    >
                      작성하기
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {selectedId && (
        <form onSubmit={handleSend}>
          <GlassCard className="space-y-3">
            <h2 className="font-semibold text-[var(--color-ink)]">리포트 JSON 입력 — {selectedId}</h2>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              aria-label="리포트 JSON"
              rows={6}
              className="w-full rounded-2xl border-glass bg-glass px-4 py-3 font-mono text-xs text-[var(--color-ink)]"
            />
            {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
            <Button type="submit" size="md">
              발송 처리
            </Button>
          </GlassCard>
        </form>
      )}
    </main>
  );
}
