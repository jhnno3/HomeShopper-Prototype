import { GlassCard } from '@/components/kit/GlassCard';

const SURVEY_URL = 'https://docs.google.com/forms/d/1KmXCs34vgo7nYW-BfsXKn_kc1HhFzV-mCvmsOrZWF1I/viewform';

export function SurveyCard() {
  return (
    <GlassCard className="text-center">
      <h2 className="break-keep text-[15px] font-bold tracking-tight text-[var(--color-ink)]">
        참여만 하면 커피 기프티콘 주는 2분 설문조사 참여하기
      </h2>
      <p className="mt-1.5 break-keep text-[13px] leading-snug text-[var(--color-slate)]">
        지금 쓰는 부동산 앱에서 불편했던 점을 알려주시면, 감사의 의미로 커피
        기프티콘을 보내드려요.
      </p>
      <a
        href={SURVEY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex h-11 w-full items-center justify-center rounded-full border border-[#E7E9F0] bg-white text-[14px] font-semibold text-[var(--color-blue)] transition-all duration-150 hover:bg-[#F7F8FB] active:scale-[0.98]"
      >
        설문하기
      </a>
    </GlassCard>
  );
}
