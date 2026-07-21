import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { CardStack } from '@/components/reserve/CardStack';
import { ReserveBackdrop } from '@/components/reserve/ReserveBackdrop';

type SuccessCardProps =
  | {
      variant: 'reservation';
      /** The real `queueNumber` from the reservation API response. */
      queueNumber?: string;
      region?: string;
    }
  | {
      variant: 'premium';
      /** The real `id` from the premium-request API response. */
      requestId?: string;
      reportId: string;
    };

/**
 * Shared post-submit screen for both Kakao-gated flows — sole differences are
 * copy and where the single CTA below sends the user back to. There used to
 * be a second "카카오톡으로 오픈 소식 받기" button here, but since the user
 * just finished Kakao login+consent to reach this screen, a second Kakao CTA
 * was dead weight; the one button below now covers "go home" for both.
 */
export function SuccessCard(props: SuccessCardProps) {
  const reduceMotion = useReducedMotion();

  const enter = {
    initial: reduceMotion ? false : ({ opacity: 0, y: 14 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.28, ease: 'easeOut' as const },
  };

  const heading =
    props.variant === 'reservation' ? '사전예약이 완료됐어요' : '정밀 리포트 신청이 완료됐어요';

  const body =
    props.variant === 'reservation' ? (
      props.region ? (
        <>
          오픈하면 <span className="font-semibold text-[var(--color-ink)]">{props.region}</span>{' '}
          지역 동행 임장을 우선 배정해드릴게요.
        </>
      ) : (
        <>오픈하면 동행 임장을 우선 배정해드릴게요.</>
      )
    ) : (
      <>작성이 끝나면 카카오톡으로 정밀 리포트를 보내드릴게요.</>
    );

  // The real submission flow always supplies this (it comes straight from
  // the API response); a missing value only happens if this screen is
  // reached some other way (e.g. a bare `?done=1` link), so show an honest
  // "확인 중" rather than inventing a number that would look real.
  const pillLabel =
    props.variant === 'reservation'
      ? `예약 순번 #${props.queueNumber ?? '확인 중'}`
      : `접수번호 #${props.requestId ?? '확인 중'}`;

  const ctaHref = props.variant === 'reservation' ? '/' : `/report/${props.reportId}`;
  const ctaLabel = props.variant === 'reservation' ? '홈으로 돌아가기' : '리포트로 돌아가기';

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-16">
      <ReserveBackdrop />
      <motion.div {...enter} className="relative w-full max-w-[420px]">
        <CardStack>
          <div className="text-center">
            <svg aria-hidden viewBox="0 0 24 24" fill="none" className="mx-auto size-9 text-[var(--color-success)]">
              <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M8 12.4l2.6 2.6L16.3 9"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1 className="mt-3 text-[21px] font-bold tracking-tight text-[var(--color-ink)]">{heading}</h1>
            <p className="mt-2 text-[13.5px] leading-snug text-[var(--color-slate)]">{body}</p>
            <p className="mt-3.5 inline-flex rounded-full bg-[rgba(0,131,255,0.1)] px-3.5 py-1.5 text-[13px] font-semibold tabular-nums text-[var(--color-blue)]">
              {pillLabel}
            </p>
          </div>

          <Link
            href={ctaHref}
            className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-[var(--color-blue)] text-[14px] font-semibold text-white transition-all duration-150 hover:bg-[#0072e0] active:scale-[0.98]"
          >
            {ctaLabel}
          </Link>
        </CardStack>
      </motion.div>
    </main>
  );
}
