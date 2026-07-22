import { BarChart3, Building2, BadgeCheck, HelpCircle, AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/kit/GlassCard';
import type { ApiReport, ApiStatus } from '@/lib/types';

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

/** Neutral "couldn't confirm this" state — used whenever a section's data is
 *  missing, failed, or still pending, so unavailable info never reads as a
 *  silent zero or blank. */
function UnavailableNote({ status }: { status: ApiStatus }) {
  const message = status === 'pending' ? '확인하는 중이에요' : '공개 데이터에서 확인하지 못했어요';
  return <p className="py-2 text-sm text-[var(--color-slate)]">{message}</p>;
}

function StatusBadge({
  tone,
  icon,
  children,
}: {
  tone: 'success' | 'danger' | 'neutral';
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const toneClass = {
    success: 'bg-[rgba(31,181,122,0.12)] text-[var(--color-success)]',
    danger: 'bg-[rgba(229,72,77,0.12)] text-[var(--color-danger)]',
    neutral: 'bg-[rgba(91,100,114,0.12)] text-[var(--color-slate)]',
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {icon}
      {children}
    </span>
  );
}

function placeholderBadge() {
  return (
    <StatusBadge tone="neutral" icon={<HelpCircle size={13} aria-hidden />}>
      —
    </StatusBadge>
  );
}

function agencyBadge(isValid: boolean | undefined) {
  if (isValid === true) {
    return (
      <StatusBadge tone="success" icon={<BadgeCheck size={13} aria-hidden />}>
        정상 등록
      </StatusBadge>
    );
  }
  if (isValid === false) {
    return (
      <StatusBadge tone="danger" icon={<AlertTriangle size={13} aria-hidden />}>
        등록 확인 안 됨
      </StatusBadge>
    );
  }
  return (
    <StatusBadge tone="neutral" icon={<HelpCircle size={13} aria-hidden />}>
      확인 불가
    </StatusBadge>
  );
}

/**
 * `hasViolation` is frequently `null` (the analysis server doesn't always
 * provide it) — that must never be shown as a safe "위반 없음" result, so
 * `null` gets its own neutral badge rather than falling through to `false`'s
 * styling.
 */
function violationBadge(hasViolation: boolean | null) {
  if (hasViolation === true) {
    return (
      <StatusBadge tone="danger" icon={<AlertTriangle size={13} aria-hidden />}>
        위반건축물
      </StatusBadge>
    );
  }
  if (hasViolation === false) {
    return (
      <StatusBadge tone="success" icon={<BadgeCheck size={13} aria-hidden />}>
        위반건축물 아님
      </StatusBadge>
    );
  }
  return (
    <StatusBadge tone="neutral" icon={<HelpCircle size={13} aria-hidden />}>
      확인 불가
    </StatusBadge>
  );
}

export function ReportSummary({
  report,
  compact = false,
  placeholder = false,
}: {
  report: ApiReport;
  compact?: boolean;
  /** Renders every criterion's value as "—" instead of the report's actual
   *  data — used for the landing page's sample card, which mirrors the real
   *  report's layout but must never present made-up figures as real. */
  placeholder?: boolean;
}) {
  const { facts, apiStatus } = report;
  const iconSize = compact ? 17 : 20;
  const tx = facts.recentTransactions;
  const building = facts.buildingRegistry;
  const agency = facts.agencyValidity;
  const buildingAge = building ? new Date().getFullYear() - building.approvalYear : null;
  const dash = '—';
  // 근린생활시설은 국토부 실거래가 공개 데이터의 집계 대상이 아니라 시세 비교
  // 자체가 불가능한 매물 — 이 경우 흔한 "확인하지 못했어요" 문구를 그대로 쓰면
  // 조회 실패로 오해할 수 있어 별도 안내를 보여준다.
  const isNeighborhoodFacility = Boolean(building?.mainUse.includes('근린생활시설'));

  return (
    // Container query, not a viewport breakpoint: this renders both full
    // width on the report page and inside the landing hero's narrow column,
    // so the two-up row must key off its own width.
    <div className={compact ? '@container space-y-3' : '@container space-y-4'}>
      <GlassCard className={compact ? 'p-4' : undefined}>
        <CardHeader icon={<BarChart3 size={iconSize} aria-hidden />} title="시세 정보" compact={compact} />
        {tx && apiStatus.transactions === 'ok' ? (
          <dl className="divide-y divide-[var(--glass-border)]">
            <Row label="인근 거래 요약" value={placeholder ? dash : tx.summary} compact={compact} />
            <Row
              label="비교 거래 수"
              value={placeholder ? dash : `${tx.count.toLocaleString()}건`}
              compact={compact}
            />
          </dl>
        ) : isNeighborhoodFacility ? (
          <p className="py-2 text-sm text-[var(--color-slate)]">
            근린생활시설은 국토부 실거래가 공개 데이터에 집계되지 않아 시세 정보를 제공하지 않아요.
          </p>
        ) : (
          <UnavailableNote status={apiStatus.transactions} />
        )}
        {!compact && tx && apiStatus.transactions === 'ok' && (
          <p className="mt-3 text-xs text-[var(--color-slate)]">
            인근 동일 유형 실거래, 국토부 실거래가 공개 데이터 기준
          </p>
        )}
      </GlassCard>

      <div className={compact ? 'grid gap-3 @lg:grid-cols-2' : 'grid gap-4 @lg:grid-cols-2'}>
        <GlassCard className={compact ? 'p-4' : undefined}>
          <CardHeader icon={<Building2 size={iconSize} aria-hidden />} title="건물 정보" compact={compact} />
          {building && apiStatus.registry === 'ok' ? (
            <dl className="divide-y divide-[var(--glass-border)]">
              <Row label="주용도" value={placeholder ? dash : building.mainUse} compact={compact} />
              <Row
                label="사용승인"
                value={placeholder ? dash : `${building.approvalYear}년`}
                compact={compact}
              />
              <Row
                label="건물 연식"
                value={placeholder ? dash : `${buildingAge}년차`}
                compact={compact}
              />
              <Row
                label="위반건축물"
                value={placeholder ? placeholderBadge() : violationBadge(building.hasViolation)}
                compact={compact}
              />
            </dl>
          ) : (
            <UnavailableNote status={apiStatus.registry} />
          )}
        </GlassCard>

        <GlassCard className={compact ? 'p-4' : undefined}>
          <CardHeader icon={<BadgeCheck size={iconSize} aria-hidden />} title="중개업소" compact={compact} />
          {agency && apiStatus.agency === 'ok' ? (
            <dl className="divide-y divide-[var(--glass-border)]">
              <Row
                label="등록번호"
                value={placeholder ? placeholderBadge() : agencyBadge(agency.isValid)}
                compact={compact}
              />
              <Row
                label="확인 기준"
                value={placeholder ? dash : '공인중개사 표준데이터'}
                compact={compact}
              />
            </dl>
          ) : (
            <UnavailableNote status={apiStatus.agency} />
          )}
          {!compact && agency && apiStatus.agency === 'ok' && (
            <p className="mt-3 text-xs text-[var(--color-slate)]">
              최근 개업한 중개사무소는 정부 데이터 갱신이 늦어 아직 반영되지 않았을 수 있어요.
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
