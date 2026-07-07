import type { ReportConcern } from '@/lib/types';
import { GlassCard } from '@/components/kit/GlassCard';

export function ConcernsList({ concerns }: { concerns: ReportConcern[] }) {
  if (concerns.length === 0) return null;

  return (
    <section aria-label="함께 확인해보시면 좋은 부분">
      <h2 className="mb-3 text-lg font-semibold text-[var(--color-ink)]">함께 확인해보시면 좋은 부분</h2>
      <ul className="space-y-4">
        {concerns.map((concern) => (
          <li key={concern.id}>
            <GlassCard className="text-sm text-[var(--color-ink)]">
              <p>{concern.fact}</p>
              <p className="mt-1 text-[var(--color-slate)]">{concern.reason}</p>
              <p className="mt-1 font-medium text-[var(--color-caution)]">{concern.howToCheck}</p>
            </GlassCard>
          </li>
        ))}
      </ul>
    </section>
  );
}
