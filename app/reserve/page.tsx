import { Suspense } from 'react';
import { ReserveForm } from '@/components/reserve/ReserveForm';

export default function ReservePage() {
  return (
    <Suspense
      fallback={<p className="px-6 py-16 text-center text-sm text-[var(--color-slate)]">불러오는 중...</p>}
    >
      <ReserveForm />
    </Suspense>
  );
}
