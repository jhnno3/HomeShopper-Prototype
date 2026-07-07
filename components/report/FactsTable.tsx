import type { ReportFacts, ApiSourceStatus } from '@/lib/types';
import { GlassCard } from '@/components/kit/GlassCard';

interface FactsTableProps {
  facts: ReportFacts;
  apiStatus: Record<'transactions' | 'registry' | 'agency', ApiSourceStatus>;
}

function pendingMessage(status: ApiSourceStatus) {
  return status === 'failed' || status === 'pending'
    ? '확인이 지연되고 있어요. 완료되면 알려드릴까요?'
    : null;
}

export function FactsTable({ facts, apiStatus }: FactsTableProps) {
  const rows = [
    { label: '실거래가', value: pendingMessage(apiStatus.transactions) ?? facts.recentTransactions.summary },
    { label: '건축물대장', value: pendingMessage(apiStatus.registry) ?? facts.buildingRegistry.summary },
    {
      label: '중개업소',
      value: facts.agencyValidity
        ? facts.agencyValidity.summary
        : pendingMessage(apiStatus.agency) ?? '링크 제출 시 확인됩니다',
    },
  ];

  return (
    <section aria-label="확인 결과">
      <h2 className="mb-3 text-lg font-semibold text-[var(--color-ink)]">확인 결과</h2>
      <GlassCard className="p-0">
        <dl className="divide-y divide-[var(--glass-border)]">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4 px-5 py-4 text-sm">
              <dt className="font-medium text-[var(--color-slate)]">{row.label}</dt>
              <dd className="text-right text-[var(--color-ink)]">{row.value}</dd>
            </div>
          ))}
        </dl>
      </GlassCard>
    </section>
  );
}
