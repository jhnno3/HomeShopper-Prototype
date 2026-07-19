'use client';
import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { trackEvent } from '@/lib/analytics';
import { KakaoIcon } from '@/components/kit/KakaoIcon';
import { ReserveBackdrop, CardBloom } from '@/components/reserve/ReserveBackdrop';
import type { VisitTiming, ReservationSource } from '@/lib/types';

const VISIT_TIMINGS: VisitTiming[] = ['1주 내', '1개월 내', '미정'];

type FieldKey = 'name' | 'phone' | 'region' | 'visitTiming';
type Values = {
  name: string;
  phone: string;
  region: string;
  visitTiming: VisitTiming | null;
};
type Errors = Partial<Record<FieldKey, string>>;

/** Every field is required — a reservation we can't call back on is worthless. */
function validate(values: Values): Errors {
  const errors: Errors = {};

  if (!values.name.trim()) errors.name = '이름을 입력해주세요.';

  const digits = values.phone.replace(/\D/g, '');
  if (!digits) errors.phone = '연락 가능한 전화번호를 입력해주세요.';
  else if (digits.length < 10 || digits.length > 11)
    errors.phone = '숫자 10~11자리로 입력해주세요. 예: 010-1234-5678';

  if (!values.region.trim()) errors.region = '희망 지역을 입력해주세요. 예: 서울 마포구';
  if (!values.visitTiming) errors.visitTiming = '방문 예정 시기를 하나 골라주세요.';

  return errors;
}

/* ---------------------------------------------------------------- surfaces */

/**
 * The card, with two paper layers peeking out from behind it. The layers are
 * purely decorative depth — they carry no content and are hidden from AT.
 */
function CardStack({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <CardBloom />
      <div
        aria-hidden
        className="absolute inset-x-6 -top-4 h-full rounded-[28px] bg-white/45 shadow-[0_8px_24px_-18px_rgba(23,31,68,0.35)]"
        style={{ transform: 'rotate(-1.6deg)' }}
      />
      <div
        aria-hidden
        className="absolute inset-x-3 -top-2 h-full rounded-[28px] bg-white/70 shadow-[0_10px_28px_-20px_rgba(23,31,68,0.4)]"
        style={{ transform: 'rotate(1deg)' }}
      />
      <div className="relative rounded-[28px] border border-white/80 bg-white p-7 shadow-[0_28px_64px_-28px_rgba(23,31,68,0.32),0_2px_6px_rgba(23,31,68,0.04)] sm:p-8">
        {children}
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate)]">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ fields */

const inputBase =
  'h-12 w-full rounded-2xl border bg-[#F7F8FB] px-4 text-base text-[var(--color-ink)] outline-none transition-colors duration-150 placeholder:text-[#9AA2B1] focus:border-[var(--color-blue)] focus:bg-white focus:ring-2 focus:ring-[rgba(0,131,255,0.16)]';

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--color-ink)]">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[13px] text-[var(--color-danger)]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-[var(--color-slate)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Single-select list styled after a radio group: circle + label, full-row target. */
function TimingOption({
  value,
  checked,
  onSelect,
  inputRef,
}: {
  value: VisitTiming;
  checked: boolean;
  onSelect: () => void;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <label
      className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-2xl border px-4 py-2.5 transition-colors duration-150 ${
        checked
          ? 'border-[var(--color-blue)] bg-[rgba(0,131,255,0.06)]'
          : 'border-[#E7E9F0] bg-white hover:bg-[#F7F8FB]'
      }`}
    >
      <input
        ref={inputRef}
        type="radio"
        name="visitTiming"
        value={value}
        checked={checked}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-[rgba(0,131,255,0.35)] peer-focus-visible:ring-offset-2 ${
          checked ? 'border-[var(--color-blue)] bg-[var(--color-blue)]' : 'border-[#C8CDD8]'
        }`}
      >
        {checked ? (
          <svg viewBox="0 0 20 20" fill="none" className="size-3 text-white">
            <path
              d="M4 10.5 8 14.5 16 6"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      <span className="text-[15px] font-medium text-[var(--color-ink)]">{value}</span>
    </label>
  );
}

/* -------------------------------------------------------------------- page */

export function ReserveForm() {
  const searchParams = useSearchParams();
  const src = (searchParams.get('src') as ReservationSource) ?? 'landing';
  const reportId = searchParams.get('reportId') ?? undefined;
  const reduceMotion = useReducedMotion();

  const [values, setValues] = useState<Values>({
    name: '',
    phone: '',
    region: '',
    visitTiming: null,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const refs = {
    name: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    region: useRef<HTMLInputElement>(null),
    visitTiming: useRef<HTMLInputElement>(null),
  };

  const complete = Object.keys(validate(values)).length === 0;

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    // Only downgrade a visible error while typing; never raise a new one mid-keystroke.
    if (errors[key as FieldKey] && !validate(next)[key as FieldKey]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function handleBlur(key: FieldKey) {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: validate(values)[key] }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, phone: true, region: true, visitTiming: true });

    const firstInvalid = (['name', 'phone', 'region', 'visitTiming'] as FieldKey[]).find(
      (key) => found[key]
    );
    if (firstInvalid) {
      refs[firstInvalid].current?.focus();
      return;
    }

    trackEvent('reserve_phone_complete', { src, reportId });
    setSubmitted(true);
  }

  const enter = {
    initial: reduceMotion ? false : ({ opacity: 0, y: 14 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.28, ease: 'easeOut' as const },
  };

  if (submitted) {
    return (
      <main className="relative flex flex-1 items-center justify-center px-5 py-16">
        <ReserveBackdrop />
        <motion.div {...enter} className="relative w-full max-w-[420px]">
          <CardStack>
            <div className="text-center">
              <span
                aria-hidden
                className="mx-auto flex size-12 items-center justify-center rounded-full bg-[rgba(31,181,122,0.12)]"
              >
                <svg viewBox="0 0 24 24" fill="none" className="size-6 text-[var(--color-success)]">
                  <path
                    d="m5 12.5 4.5 4.5L19 7"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h1 className="mt-4 text-[22px] font-bold tracking-tight text-[var(--color-ink)]">
                사전예약이 완료됐어요
              </h1>
              <p className="mt-2 text-sm text-[var(--color-slate)]">
                오픈하면 {values.region.trim()} 지역 동행 임장을 우선 배정해드릴게요.
              </p>
              <p className="mt-4 inline-flex rounded-full bg-[#F2F4F9] px-3.5 py-1.5 text-[13px] font-semibold tabular-nums text-[var(--color-ink)]">
                예약 순번 #128
              </p>
            </div>

            <button
              type="button"
              className="mt-7 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#FEE500] text-[15px] font-semibold text-black/85 transition-all duration-150 hover:brightness-95 active:scale-[0.98]"
            >
              <KakaoIcon className="size-[18px]" />
              카톡으로 오픈 소식 받기
            </button>
          </CardStack>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative flex flex-1 items-center justify-center px-5 py-14">
      <ReserveBackdrop />
      <motion.div {...enter} className="relative w-full max-w-[420px]">
        <CardStack>
          <Eyebrow>사전예약</Eyebrow>
          <h1 className="mt-2 text-[24px] font-bold leading-snug tracking-tight text-[var(--color-ink)]">
            동행 임장, 오픈하면
            <br />
            가장 먼저 배정해드려요
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-slate)]">
            반값 정찰 수수료 중개는 정식 오픈을 준비하고 있어요. 지금 신청하신 분께는{' '}
            <span className="font-semibold text-[var(--color-ink)]">
              프리미엄 AI 권리분석을 무료로
            </span>{' '}
            드리고, 계약 후 등기부 변동 모니터링과 특약 문구 추천까지 함께 챙겨드립니다.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
            <Field id="name" label="이름" error={touched.name ? errors.name : undefined}>
              <input
                ref={refs.name}
                id="name"
                value={values.name}
                onChange={(e) => set('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="김민지"
                autoComplete="name"
                aria-required="true"
                aria-invalid={touched.name && Boolean(errors.name)}
                aria-describedby={touched.name && errors.name ? 'name-error' : undefined}
                className={`${inputBase} ${
                  touched.name && errors.name ? 'border-[var(--color-danger)]' : 'border-[#E7E9F0]'
                }`}
              />
            </Field>

            <Field id="phone" label="전화번호" error={touched.phone ? errors.phone : undefined}>
              <input
                ref={refs.phone}
                id="phone"
                type="tel"
                inputMode="tel"
                value={values.phone}
                onChange={(e) => set('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                placeholder="010-1234-5678"
                autoComplete="tel"
                aria-required="true"
                aria-invalid={touched.phone && Boolean(errors.phone)}
                aria-describedby={touched.phone && errors.phone ? 'phone-error' : undefined}
                className={`${inputBase} tabular-nums ${
                  touched.phone && errors.phone ? 'border-[var(--color-danger)]' : 'border-[#E7E9F0]'
                }`}
              />
            </Field>

            <Field
              id="region"
              label="희망 지역"
              hint="구·동 단위까지 적어주시면 배정이 빨라요."
              error={touched.region ? errors.region : undefined}
            >
              <input
                ref={refs.region}
                id="region"
                value={values.region}
                onChange={(e) => set('region', e.target.value)}
                onBlur={() => handleBlur('region')}
                placeholder="서울 마포구 연남동"
                aria-required="true"
                aria-invalid={touched.region && Boolean(errors.region)}
                aria-describedby={
                  touched.region && errors.region ? 'region-error' : 'region-hint'
                }
                className={`${inputBase} ${
                  touched.region && errors.region
                    ? 'border-[var(--color-danger)]'
                    : 'border-[#E7E9F0]'
                }`}
              />
            </Field>

            <fieldset>
              <legend className="text-sm font-medium text-[var(--color-ink)]">
                방문 예정 시기
              </legend>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate)]">
                하나만 선택
              </p>
              <div className="mt-2.5 space-y-2">
                {VISIT_TIMINGS.map((timing, i) => (
                  <TimingOption
                    key={timing}
                    value={timing}
                    checked={values.visitTiming === timing}
                    onSelect={() => {
                      set('visitTiming', timing);
                      setTouched((prev) => ({ ...prev, visitTiming: true }));
                      setErrors((prev) => ({ ...prev, visitTiming: undefined }));
                    }}
                    inputRef={i === 0 ? refs.visitTiming : undefined}
                  />
                ))}
              </div>
              {touched.visitTiming && errors.visitTiming ? (
                <p role="alert" className="mt-1.5 text-[13px] text-[var(--color-danger)]">
                  {errors.visitTiming}
                </p>
              ) : null}
            </fieldset>

            {/* Kept clickable while incomplete so pressing it surfaces what's missing
                rather than leaving the user staring at a dead button. */}
            <button
              type="submit"
              aria-disabled={!complete}
              className={`flex h-[52px] w-full cursor-pointer items-center justify-center rounded-2xl text-[15px] font-semibold text-white transition-all duration-150 active:scale-[0.98] ${
                complete
                  ? 'bg-[var(--color-ink)] shadow-[0_10px_24px_-12px_rgba(26,26,46,0.7)] hover:bg-[#24243f]'
                  : 'bg-[#B8BDC9]'
              }`}
            >
              사전예약 신청
            </button>
            {complete ? null : (
              <p className="text-center text-[13px] text-[var(--color-slate)]">
                모든 항목을 입력해야 신청이 접수돼요.
              </p>
            )}
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#E7E9F0]" />
            <span className="text-[12px] text-[var(--color-slate)]">또는</span>
            <span className="h-px flex-1 bg-[#E7E9F0]" />
          </div>

          <button
            type="button"
            onClick={() => trackEvent('login_complete', { src, reportId, provider: 'kakao' })}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#FEE500] text-[15px] font-semibold text-black/85 transition-all duration-150 hover:brightness-95 active:scale-[0.98]"
          >
            <KakaoIcon className="size-[18px]" />
            카카오로 로그인하고 자동 입력
          </button>
        </CardStack>
      </motion.div>
    </main>
  );
}
