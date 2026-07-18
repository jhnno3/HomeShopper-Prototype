import { BarChart3, Building2, BadgeCheck, HelpCircle, AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/kit/GlassCard';
import type { ResultSummary } from '@/lib/types';

function CardHeader({
  icon,
  title,
  compact,
}: {
  icon: React.ReactNode;
  title: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'mb-3 flex items-center gap-2.5' : 'mb-4 flex items-center gap-3'}>
      <div
        className={
          compact
            ? 'flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(0,131,255,0.1)] text-[var(--color-blue)]'
            : 'flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(0,131,255,0.1)] text-[var(--color-blue)]'
        }
      >
        {icon}
      </div>
      <h2 className="font-semibold text-[var(--color-ink)]">{title}</h2>
    </div>
  );
}

function Row({
  label,
  value,
  compact,
}: {
  label: string;
  value: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? 'flex items-center justify-between gap-3 py-2 text-[13px]'
          : 'flex items-center justify-between gap-4 py-2 text-sm'
      }
    >
      <dt className="text-[var(--color-slate)]">{label}</dt>
      <dd className="text-right font-medium text-[var(--color-ink)]">{value}</dd>
    </div>
  );
}

function agencyBadge(regNoValid: boolean | null) {
  if (regNoValid === true) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(31,181,122,0.12)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]">
        <BadgeCheck size={13} aria-hidden />
        정상 등록
      </span>
    );
  }
  if (regNoValid === false) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(229,72,77,0.12)] px-3 py-1 text-xs font-semibold text-[var(--color-danger)]">
        <AlertTriangle size={13} aria-hidden />
        등록 확인 안 됨
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(91,100,114,0.12)] px-3 py-1 text-xs font-semibold text-[var(--color-slate)]">
      <HelpCircle size={13} aria-hidden />
      확인 불가
    </span>
  );
}

export function ReportSummary({
  summary,
  compact = false,
}: {
  summary: ResultSummary;
  compact?: boolean;
}) {
  const { market_price, building, agency } = summary;
  const buildingAge = new Date().getFullYear() - building.use_approval_year;
  const iconSize = compact ? 17 : 20;

  return (
    // Container query, not a viewport breakpoint: this renders both full
    // width on the report page and inside the landing hero's narrow column,
    // so the two-up row must key off its own width.
    <div className={compact ? '@container space-y-3' : '@container space-y-4'}>
      <GlassCard className={compact ? 'p-4' : undefined}>
        <CardHeader icon={<BarChart3 size={iconSize} aria-hidden />} title="시세 정보" compact={compact} />
        <dl className="divide-y divide-[var(--glass-border)]">
          <Row label="인근 평균 보증금" value={market_price.avg_deposit_text} compact={compact} />
          {market_price.avg_monthly_rent_text && (
            <Row label="인근 평균 월세" value={market_price.avg_monthly_rent_text} compact={compact} />
          )}
          <Row label="비교 거래 수" value={`${market_price.deal_count.toLocaleString()}건`} compact={compact} />
        </dl>
        {!compact && (
          <p className="mt-3 text-xs text-[var(--color-slate)]">
            인근 동일 유형 실거래, 국토부 실거래가 공개 데이터 기준
          </p>
        )}
      </GlassCard>

      <div className={compact ? 'grid gap-3 @lg:grid-cols-2' : 'grid gap-4 @lg:grid-cols-2'}>
        <GlassCard className={compact ? 'p-4' : undefined}>
          <CardHeader icon={<Building2 size={iconSize} aria-hidden />} title="건물 정보" compact={compact} />
          <dl className="divide-y divide-[var(--glass-border)]">
            <Row label="주용도" value={building.main_purpose} compact={compact} />
            <Row label="사용승인" value={`${building.use_approval_year}년`} compact={compact} />
            <Row label="건물 연식" value={`${buildingAge}년차`} compact={compact} />
          </dl>
        </GlassCard>

        <GlassCard className={compact ? 'p-4' : undefined}>
          <CardHeader icon={<BadgeCheck size={iconSize} aria-hidden />} title="중개업소" compact={compact} />
          <dl className="divide-y divide-[var(--glass-border)]">
            <Row label="등록번호" value={agencyBadge(agency.reg_no_valid)} compact={compact} />
            <Row label="확인 기준" value="공인중개사 표준데이터" compact={compact} />
          </dl>
        </GlassCard>
      </div>
    </div>
  );
}
