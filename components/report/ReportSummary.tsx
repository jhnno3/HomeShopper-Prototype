'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import { BarChart3, Building2, BadgeCheck, HelpCircle, AlertTriangle } from 'lucide-react';
import type { ApiReport, ApiStatus } from '@/lib/types';

/** Section = heading row sitting above its own card, so the icon+title reads
 *  as a label for the card rather than content inside it. */
function Section({
  icon,
  title,
  compact,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className={compact ? 'mb-2.5 flex items-center gap-2.5' : 'mb-3 flex items-center gap-3'}>
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
      <div
        className={
          compact
            ? 'rounded-2xl border border-white/70 bg-white/70 p-4 shadow-[0_1px_2px_rgba(26,26,46,0.05)]'
            : 'rounded-2xl border border-white/70 bg-white/70 p-5 shadow-[0_1px_2px_rgba(26,26,46,0.05)]'
        }
      >
        {children}
      </div>
    </section>
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
          ? 'flex items-start justify-between gap-3 py-2 text-[13px]'
          : 'flex items-start justify-between gap-4 py-2 text-sm'
      }
    >
      <dt className="shrink-0 whitespace-nowrap text-[var(--color-slate)]">{label}</dt>
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

/** `tx.summary` packs its clauses into one API string (거래 건수, 보정 평균가, …) —
 *  split on ", " rather than every comma, since the price itself has a
 *  thousands-separator comma with no trailing space ("5,670만원"). */
function summaryLines(summary: string): string[] {
  return summary.split(', ');
}

/** Inline form: each clause on its own line, right-aligned alongside the
 *  label — used while the value is short enough to sit in the row's
 *  right-hand column. */
function SummaryLines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </>
  );
}

/** Stacked form: rendered as a left-aligned bullet list below the label —
 *  used once the value actually renders past two lines, since a right-hand
 *  column reads poorly at that point. */
function SummaryBullets({ lines }: { lines: string[] }) {
  return (
    <ul className="space-y-0.5">
      {lines.map((line) => (
        <li key={line} className="flex gap-1.5">
          <span aria-hidden className="text-[var(--color-slate)]">
            &bull;
          </span>
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

/** The 인근 거래 요약 row: layout depends on *rendered* line count, not clause
 *  count — a single long clause can wrap to 3+ lines in the narrow right
 *  column just as easily as three short clauses can, so counting commas is
 *  not a reliable proxy for "did this overflow two lines". Instead this
 *  renders the inline (right-aligned) form first, measures it, and — if its
 *  height exceeds two lines — swaps to the stacked/bulleted form. The swap
 *  happens in useLayoutEffect, before the browser paints, so there's no
 *  visible flash of the wrong layout. */
function SummaryRow({ label, lines, compact }: { label: string; lines: string[]; compact?: boolean }) {
  const measureRef = useRef<HTMLElement>(null);
  const [stacked, setStacked] = useState(false);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    // +1px slack for subpixel rounding in the two-line height comparison.
    const twoLineHeight = lineHeight * 2 + 1;
    setStacked(el.scrollHeight > twoLineHeight);
  }, [lines, compact]);

  if (stacked) {
    return (
      <div className={compact ? 'py-2 text-[13px]' : 'py-2 text-sm'}>
        <dt className="text-[var(--color-slate)]">{label}</dt>
        <dd className="mt-1 text-left font-medium text-[var(--color-ink)]">
          <SummaryBullets lines={lines} />
        </dd>
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? 'flex items-start justify-between gap-3 py-2 text-[13px]'
          : 'flex items-start justify-between gap-4 py-2 text-sm'
      }
    >
      <dt className="shrink-0 whitespace-nowrap text-[var(--color-slate)]">{label}</dt>
      <dd ref={measureRef} className="text-right font-medium text-[var(--color-ink)]">
        <SummaryLines lines={lines} />
      </dd>
    </div>
  );
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
  // 근린생활시설은 주로 상업용으로 거래돼 주거용 시세와 비교할 실거래 기준이
  // 없는 매물 — 이 경우 흔한 "확인하지 못했어요" 문구를 그대로 쓰면 조회
  // 실패로 오해할 수 있어 별도 안내를 보여준다.
  const isNeighborhoodFacility = Boolean(building?.mainUse.includes('근린생활시설'));

  return (
    <div className={compact ? 'space-y-5' : 'space-y-7'}>
      <Section icon={<BarChart3 size={iconSize} aria-hidden />} title="시세 정보" compact={compact}>
        {tx && apiStatus.transactions === 'ok' ? (
          <dl>
            {placeholder ? (
              <Row label="인근 거래 요약" value={dash} compact={compact} />
            ) : (
              <SummaryRow label="인근 거래 요약" lines={summaryLines(tx.summary)} compact={compact} />
            )}
            <Row
              label="비교 거래 수"
              value={placeholder ? dash : `${tx.count.toLocaleString()}건`}
              compact={compact}
            />
          </dl>
        ) : isNeighborhoodFacility ? (
          <p className="py-2 text-sm text-[var(--color-slate)]">
            근린생활시설은 주로 상업용으로 거래되기 때문에, 정확한 주거용 시세 파악을 위해 실거래가 정보를 제공하지 않아요.
          </p>
        ) : (
          <UnavailableNote status={apiStatus.transactions} />
        )}
        {!compact && tx && apiStatus.transactions === 'ok' && (
          <p className="mt-3 text-xs text-[var(--color-slate)]">
            ※ 인근 동일 유형 실거래, 국토부 실거래가 공개 데이터 기준
          </p>
        )}
      </Section>

      <Section icon={<Building2 size={iconSize} aria-hidden />} title="건물 정보" compact={compact}>
        {building && apiStatus.registry === 'ok' ? (
          <dl>
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
          </dl>
        ) : (
          <UnavailableNote status={apiStatus.registry} />
        )}
      </Section>

      <Section icon={<BadgeCheck size={iconSize} aria-hidden />} title="중개업소" compact={compact}>
        {agency && apiStatus.agency === 'ok' ? (
          <dl>
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
            ※ 최근 개업한 중개사무소는 정부 데이터 갱신이 늦어 아직 반영되지 않았을 수 있어요.
          </p>
        )}
      </Section>
    </div>
  );
}
