import Link from "next/link";
import { GlassCard } from "@/components/kit/GlassCard";

export function ReserveBanner() {
  return (
    <section className="px-6 py-16">
      <GlassCard className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <p className="text-base font-semibold text-[var(--color-ink)]">
          동행 임장 · 반값 정찰 중개, 사전예약 진행 중
        </p>
        <Link
          href="/reserve?src=landing"
          className="border-glass shadow-glass inline-flex h-11 items-center justify-center rounded-2xl px-6 text-sm font-semibold text-[var(--color-ink)] transition-all duration-150 active:scale-95 active:opacity-90"
        >
          사전예약하기
        </Link>
      </GlassCard>
    </section>
  );
}
