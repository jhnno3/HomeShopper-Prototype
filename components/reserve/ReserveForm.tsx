'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
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

/**
 * Inserts hyphens as the user types, capped at 11 digits (010-1234-5678).
 * Re-derives from the digits alone each keystroke, so pasting a raw or
 * already-punctuated number formats the same way as typing it.
 */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/* ---------------------------------------------------------------- surfaces */

/**
 * Fractal-noise grain, tiled at low opacity with `mix-blend-overlay` so it
 * reads as paper texture rather than dirt. Encoded inline as an SVG data URI —
 * no network request, no binary asset to track in the repo.
 */
const GRAIN_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>
      <filter id='n'>
        <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch' />
        <feColorMatrix type='saturate' values='0' />
      </filter>
      <rect width='100%' height='100%' filter='url(#n)' />
    </svg>`
  );

function CardGrain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[28px] opacity-[0.05] mix-blend-overlay"
      style={{ backgroundImage: `url("${GRAIN_SVG}")`, backgroundRepeat: 'repeat', backgroundSize: '180px 180px' }}
    />
  );
}

/**
 * The card, with two paper layers fanned out behind it. Each layer is the
 * exact same size as the front card (inset-0, not shrunk or top-shifted) and
 * only rotated around its own center — that's what makes the rotated corners
 * peek out past every edge of the front card, like a dealt stack of pages,
 * instead of only overhanging the top. Both layers rotate the same direction
 * (progressively less as they get closer to the front) so the stack reads as
 * one deck fanned one way, not two cards splayed to opposite sides. The
 * layers are purely decorative and carry no content, so they're hidden from AT.
 *
 * The front card itself is real glass — translucent fill plus backdrop blur
 * and saturation boost, so the bloom behind it tints through — not just the
 * paper layers behind it. Kept at 85% opacity rather than the ~70% the
 * site-wide .bg-glass utility uses, since a form's labels and input text need
 * more contrast than a decorative panel does.
 */
function CardStack({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <CardBloom />
      <div
        aria-hidden
        className="absolute inset-0 rounded-[28px] bg-white/20 shadow-[0_8px_24px_-18px_rgba(23,31,68,0.35)]"
        style={{ transform: 'rotate(-8deg)' }}
      />
      <div
        aria-hidden
        className="absolute inset-0 rounded-[28px] bg-white/40 shadow-[0_10px_28px_-20px_rgba(23,31,68,0.4)]"
        style={{ transform: 'rotate(-4deg)' }}
      />
      <div className="relative rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_28px_64px_-28px_rgba(23,31,68,0.32),0_2px_6px_rgba(23,31,68,0.04)] backdrop-blur-xl backdrop-saturate-150">
        <CardGrain />
        {children}
      </div>
    </div>
  );
}

/** Brand-tinted status pill — the page's first hit of color. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[rgba(0,131,255,0.1)] px-2.5 py-1 text-[12px] font-semibold text-[var(--color-blue)]">
      {children}
    </span>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8M3 7h18v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7ZM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7ZM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ fields */

const inputBase =
  'h-11 w-full rounded-xl border bg-[#F7F8FB] px-3.5 text-base text-[var(--color-ink)] outline-none transition-colors duration-150 placeholder:text-[#9AA2B1] focus:border-[var(--color-blue)] focus:bg-white focus:ring-2 focus:ring-[rgba(0,131,255,0.16)]';

function RequiredMark() {
  return (
    <span aria-hidden className="text-[13px] font-semibold text-[var(--color-blue)]">
      *
    </span>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* The asterisk sits outside <label> on purpose: required-ness is already
          announced via aria-required, and keeping it out leaves the accessible
          name clean instead of "이름 별표". */}
      <div className="flex items-baseline gap-0.5">
        <label htmlFor={id} className="text-[13px] font-semibold text-[var(--color-ink)]">
          {label}
        </label>
        <RequiredMark />
      </div>
      <div className="mt-1">{children}</div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-[12px] text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Single-select timing, as one segmented row rather than three stacked rows —
 * three short mutually-exclusive options don't earn 160px of card height. Still
 * a real radio group underneath, so keyboard and screen readers are unaffected.
 *
 * The selected pill is a single `motion.span` shared across all three options
 * via `layoutId` — when the checked option changes, Motion projects the pill
 * from its old bounding box to the new one instead of cross-fading two
 * separately-colored buttons in place, so selection reads as one pill sliding
 * over rather than a color swap.
 */
function TimingOption({
  value,
  checked,
  onSelect,
  inputRef,
  reduceMotion,
  alreadyRevealed,
}: {
  value: VisitTiming;
  checked: boolean;
  onSelect: () => void;
  inputRef?: React.Ref<HTMLInputElement>;
  reduceMotion: boolean;
  /** Has any timing option ever been picked before? Suppresses the fade-in
   *  after the first pick, so switching between options only slides. */
  alreadyRevealed: boolean;
}) {
  return (
    <label className="relative flex-1 cursor-pointer">
      <input
        ref={inputRef}
        type="radio"
        name="visitTiming"
        value={value}
        checked={checked}
        onChange={onSelect}
        className="peer sr-only"
      />
      {checked ? (
        <motion.span
          layoutId="timing-highlight"
          // `initial={false}` would also switch off the layoutId FLIP slide on
          // mount, not just the fade — so on repeat selections we give initial
          // the *same* values as animate (a no-op fade) rather than `false`,
          // which keeps layout tracking live while skipping the visible flash.
          initial={
            reduceMotion || alreadyRevealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }
          }
          animate={{ opacity: 1, scale: 1 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
          className="bg-grad absolute inset-0 rounded-lg shadow-[0_6px_14px_-8px_rgba(38,88,240,0.9)]"
        />
      ) : null}
      <span
        className={`relative z-10 flex h-11 items-center justify-center rounded-lg text-[14px] font-semibold transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-[rgba(0,131,255,0.4)] peer-focus-visible:ring-offset-1 ${
          checked ? 'text-white' : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
        }`}
      >
        {value}
      </span>
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

  // Tracks whether the timing pill has appeared at least once, so the fade-in
  // entrance only plays the very first time a user picks an option — not on
  // every subsequent switch, which read as a flash since a new instance mounts
  // per click. Set from an effect (not inline in the click handler) so the
  // render that actually shows the first pill still sees `false`.
  const timingRevealedRef = useRef(false);
  useEffect(() => {
    if (values.visitTiming) timingRevealedRef.current = true;
  }, [values.visitTiming]);

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
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-16">
        <ReserveBackdrop />
        <motion.div {...enter} className="relative w-full max-w-[420px]">
          <CardStack>
            <div className="text-center">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                className="mx-auto size-9 text-[var(--color-success)]"
              >
                <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M8 12.4l2.6 2.6L16.3 9"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h1 className="mt-3 text-[21px] font-bold tracking-tight text-[var(--color-ink)]">
                사전예약이 완료됐어요
              </h1>
              <p className="mt-2 text-[13.5px] leading-snug text-[var(--color-slate)]">
                오픈하면{' '}
                <span className="font-semibold text-[var(--color-ink)]">
                  {values.region.trim()}
                </span>{' '}
                지역 동행 임장을 우선 배정해드릴게요.
              </p>
              <p className="mt-3.5 inline-flex rounded-full bg-[rgba(0,131,255,0.1)] px-3.5 py-1.5 text-[13px] font-semibold tabular-nums text-[var(--color-blue)]">
                예약 순번 #128
              </p>
            </div>

            <Link
              href="/"
              className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-[var(--color-blue)] text-[14px] font-semibold text-white transition-all duration-150 hover:bg-[#0072e0] active:scale-[0.98]"
            >
              홈으로 돌아가기
            </Link>

            <button
              type="button"
              className="mt-2.5 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-[14px] font-semibold text-black/85 transition-all duration-150 hover:brightness-95 active:scale-[0.98]"
            >
              <KakaoIcon className="size-[18px]" />
              카카오톡으로 오픈 소식 받기
            </button>
          </CardStack>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-14">
      <ReserveBackdrop />
      <motion.div {...enter} className="relative w-full max-w-[420px]">
        <CardStack>
          <Eyebrow>사전예약 접수 중</Eyebrow>
          <h1 className="mt-2.5 text-[21px] font-bold leading-snug tracking-tight text-[var(--color-ink)]">
            동행 임장, <span className="text-grad">가장 먼저</span> 배정해드려요
          </h1>

          <div className="mt-3 flex items-center gap-2.5 rounded-2xl bg-[linear-gradient(100deg,rgba(0,131,255,0.09),rgba(76,44,226,0.09))] px-3.5 py-2.5">
            <GiftIcon className="size-[18px] shrink-0 text-[var(--color-purple)]" />
            <div className="leading-snug">
              <p className="text-[13px] font-semibold text-[var(--color-ink)]">
                프리미엄 AI 권리분석 무료
              </p>
              <p className="text-[12px] text-[var(--color-slate)]">
                등기부 변동 모니터링 · 특약 문구 추천 포함
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-3.5">
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
                onChange={(e) => set('phone', formatPhone(e.target.value))}
                onBlur={() => handleBlur('phone')}
                placeholder="010-1234-5678"
                autoComplete="tel"
                maxLength={13}
                aria-required="true"
                aria-invalid={touched.phone && Boolean(errors.phone)}
                aria-describedby={touched.phone && errors.phone ? 'phone-error' : undefined}
                className={`${inputBase} tabular-nums ${
                  touched.phone && errors.phone ? 'border-[var(--color-danger)]' : 'border-[#E7E9F0]'
                }`}
              />
            </Field>

            <Field id="region" label="희망 지역" error={touched.region ? errors.region : undefined}>
              <input
                ref={refs.region}
                id="region"
                value={values.region}
                onChange={(e) => set('region', e.target.value)}
                onBlur={() => handleBlur('region')}
                placeholder="서울 마포구 연남동"
                aria-required="true"
                aria-invalid={touched.region && Boolean(errors.region)}
                aria-describedby={touched.region && errors.region ? 'region-error' : undefined}
                className={`${inputBase} ${
                  touched.region && errors.region
                    ? 'border-[var(--color-danger)]'
                    : 'border-[#E7E9F0]'
                }`}
              />
            </Field>

            <fieldset>
              <legend className="flex items-baseline gap-0.5 text-[13px] font-semibold text-[var(--color-ink)]">
                방문 예정 시기
                <RequiredMark />
              </legend>
              <div className="mt-1 flex gap-1 rounded-xl border border-[#E7E9F0] bg-[#F7F8FB] p-1">
                {VISIT_TIMINGS.map((timing, i) => (
                  <TimingOption
                    key={timing}
                    value={timing}
                    checked={values.visitTiming === timing}
                    reduceMotion={Boolean(reduceMotion)}
                    alreadyRevealed={timingRevealedRef.current}
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
                <p role="alert" className="mt-1 text-[12px] text-[var(--color-danger)]">
                  {errors.visitTiming}
                </p>
              ) : null}
            </fieldset>

            <p className="mt-3 text-center text-[12px] text-[var(--color-slate)]">
            <span aria-hidden className="text-[var(--color-blue)]">
              *
            </span>{' '}
            표시된 항목을 모두 입력해야 접수돼요.
          </p>

            {/* Kept clickable while incomplete so pressing it surfaces what's missing
                rather than leaving the user staring at a dead button. */}
            <button
              type="submit"
              aria-disabled={!complete}
              className={`mt-1 flex h-[50px] w-full cursor-pointer items-center justify-center rounded-xl text-[15px] font-semibold text-white transition-all duration-150 active:scale-[0.98] ${
                complete
                  ? 'bg-[var(--color-blue)] shadow-[0_10px_24px_-12px_rgba(0,131,255,0.55)] hover:bg-[#0072e0]'
                  : 'bg-[#B8BDC9]'
              }`}
            >
              사전예약 신청
            </button>
          </form>

          <button
            type="button"
            onClick={() => trackEvent('login_complete', { src, reportId, provider: 'kakao' })}
            className="mt-2 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-[14px] font-semibold text-black/85 transition-all duration-150 hover:brightness-95 active:scale-[0.98]"
          >
            <KakaoIcon className="size-[17px]" />
            카카오 로그인
          </button>
        </CardStack>
      </motion.div>
    </main>
  );
}
