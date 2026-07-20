'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { trackEvent } from '@/lib/analytics';
import { apiFetch, ApiError } from '@/lib/api';
import { startKakaoLogin, stashPending, takePending } from '@/lib/oauth';
import { KakaoIcon } from '@/components/kit/KakaoIcon';
import { ErrorPopup } from '@/components/kit/ErrorPopup';
import { ReserveBackdrop } from '@/components/reserve/ReserveBackdrop';
import { CardStack } from '@/components/reserve/CardStack';
import { SuccessCard } from '@/components/reserve/SuccessCard';
import { demoReportId } from '@/lib/report-data';
import type { VisitTiming, ReservationSource, ReservationApiResponse } from '@/lib/types';

const VISIT_TIMINGS: VisitTiming[] = ['1주 내', '1개월 내', '미정'];
const PENDING_KEY = 'hs_pending_reservation';

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
  // Server accepts 9~11 digits (PROTOTYPE_API.md §5) — 9 covers 02-xxx-xxxx
  // Seoul landlines without an area-code prefix.
  else if (digits.length < 9 || digits.length > 11)
    errors.phone = '숫자 9~11자리로 입력해주세요. 예: 010-1234-5678';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const src = (searchParams.get('src') as ReservationSource) ?? 'landing';
  const reportId = searchParams.get('reportId') ?? undefined;
  // The success card is URL-addressable (`?done=1`) so flows that re-enter
  // the app via a full page load — like the Kakao OAuth redirect — can land
  // on it directly. `queue` and `region` carry the values the card shows.
  const doneFromUrl = searchParams.get('done') === '1';
  const queueFromUrl = searchParams.get('queue');
  const regionFromUrl = searchParams.get('region') ?? '';
  // The premium request flow (UpgradeCard) also lands on this same success
  // card after its own OAuth round trip completes — see `variant`/`requestId`.
  const previewVariant = searchParams.get('variant');
  const requestIdFromUrl = searchParams.get('requestId') ?? undefined;
  // Set by the backend when it redirects back from Kakao login
  // (PROTOTYPE_API.md §2) — handled once in the effect below.
  const oauthResult = searchParams.get('oauth');
  const reduceMotion = useReducedMotion();

  const [values, setValues] = useState<Values>({
    name: '',
    phone: '',
    region: '',
    visitTiming: null,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const processedOAuthRef = useRef(false);

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

  // The single Kakao button both logs the user in and submits this form —
  // there is no separate submit button. It validates locally, stashes the
  // values (a full-page OAuth redirect destroys React state), then starts
  // the Kakao login. `oauth=success` on return resumes and posts them.
  function beginKakaoSubmit() {
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
    stashPending(PENDING_KEY, values);
    startKakaoLogin(`${window.location.pathname}${window.location.search}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    beginKakaoSubmit();
  }

  // Resumes the stashed form values after the Kakao redirect returns, then
  // submits the reservation exactly once (PROTOTYPE_API.md §2, §6).
  useEffect(() => {
    if (!oauthResult || processedOAuthRef.current) return;
    processedOAuthRef.current = true;

    if (oauthResult === 'error') {
      const pending = takePending<Values>(PENDING_KEY);
      if (pending) setValues(pending);
      setApiError('카카오 로그인에 실패했어요. 다시 시도해주세요.');
      return;
    }

    const pending = takePending<Values>(PENDING_KEY);
    if (!pending) {
      setApiError('입력한 정보를 찾을 수 없어요. 다시 입력해주세요.');
      return;
    }

    setValues(pending);
    trackEvent('login_complete', { src, reportId, provider: 'kakao' });
    setIsSubmitting(true);
    apiFetch<ReservationApiResponse>('/reservations', {
      method: 'POST',
      body: JSON.stringify({
        reportId,
        name: pending.name,
        phone: pending.phone,
        region: pending.region,
        visitTiming: pending.visitTiming,
        src,
      }),
    })
      .then((response) => {
        router.replace(
          `/reserve?done=1&queue=${response.queueNumber}&region=${encodeURIComponent(response.region)}`
        );
      })
      .catch((err) => {
        setIsSubmitting(false);
        setApiError(err instanceof ApiError ? err.message : '예약 접수에 실패했어요. 다시 시도해주세요.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oauthResult]);

  const enter = {
    initial: reduceMotion ? false : ({ opacity: 0, y: 14 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.28, ease: 'easeOut' as const },
  };

  if (doneFromUrl && previewVariant === 'premium') {
    return <SuccessCard variant="premium" requestId={requestIdFromUrl} reportId={reportId ?? demoReportId} />;
  }

  if (doneFromUrl) {
    return (
      <SuccessCard
        variant="reservation"
        queueNumber={queueFromUrl ?? undefined}
        region={values.region.trim() || regionFromUrl || undefined}
      />
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
          </form>

          <button
            type="button"
            onClick={beginKakaoSubmit}
            disabled={isSubmitting}
            className="mt-2 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-[14px] font-semibold text-black/85 transition-all duration-150 hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <KakaoIcon className="size-[17px]" />
            {isSubmitting ? '접수 처리 중...' : '카카오로 사전예약 하기'}
          </button>
        </CardStack>
      </motion.div>
      {apiError ? (
        <ErrorPopup
          message={apiError}
          onRetry={() => {
            setApiError(null);
            beginKakaoSubmit();
          }}
          onDismiss={() => setApiError(null)}
        />
      ) : null}
    </main>
  );
}
