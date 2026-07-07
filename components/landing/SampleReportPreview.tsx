import { GlassCard } from "@/components/kit/GlassCard";

export function SampleReportPreview() {
  return (
    <section className="px-6 py-16">
      <h2 className="text-center text-2xl font-bold text-[var(--color-ink)]">
        리포트 샘플 미리보기
      </h2>
      <GlassCard className="relative mx-auto mt-8 max-w-2xl overflow-hidden">
        <div className="pointer-events-none select-none space-y-3 blur-sm" aria-hidden="true">
          <p className="font-semibold text-[var(--color-ink)]">서울 마포구 연남동 OO번지 인근</p>
          <p className="text-sm text-[var(--color-slate)]">
            인근 동일 유형 최근 전세 실거래 6건, 2.8억~3.4억
          </p>
          <p className="text-sm text-[var(--color-slate)]">위반건축물 등재 없음, 사용승인 2016년</p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/40">
          <span className="bg-grad rounded-full px-4 py-2 text-sm font-semibold text-white shadow-glass">
            샘플입니다
          </span>
        </div>
      </GlassCard>
    </section>
  );
}
