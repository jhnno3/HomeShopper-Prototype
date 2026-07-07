import type { RegistryFacts } from '@/lib/types';
import { GlassCard } from '@/components/kit/GlassCard';

export function RegistrySection({ registry }: { registry: RegistryFacts }) {
  const rows = [
    {
      label: '소유자–임대인 일치',
      value: registry.ownerMatchesLandlord ? (
        '일치'
      ) : (
        <span className="text-[var(--color-caution)]">불일치 — 확인 필요</span>
      ),
    },
    { label: '근저당 채권최고액', value: `${registry.maxClaimAmount.toLocaleString()}만원` },
    { label: '선순위 관계', value: registry.priorLienSummary },
    { label: '선순위 보증금 정보', value: registry.priorDepositInfo },
  ];

  return (
    <section aria-label="등기부 분석">
      <h2 className="mb-3 text-lg font-semibold text-[var(--color-ink)]">등기부 분석</h2>
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
