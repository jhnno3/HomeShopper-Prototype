'use client';
import { Suspense, use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { ReportSummary } from '@/components/report/ReportSummary';
import { UpgradeCard } from '@/components/report/UpgradeCard';
import { VisitCta } from '@/components/report/VisitCta';
import { ReportBackdrop } from '@/components/report/ReportBackdrop';
import { SurveyCard } from '@/components/report/SurveyCard';
import { Disclaimer } from '@/components/report/Disclaimer';
import { ProgressAnimation } from '@/components/analyze/ProgressAnimation';
import { GlassCard } from '@/components/kit/GlassCard';
import { trackEvent } from '@/lib/analytics';
import { apiFetch, ApiError } from '@/lib/api';
import type { ApiReport } from '@/lib/types';

type LoadState = 'loading' | 'ready' | 'notFound' | 'error';

/** Full-height centered wrapper shared by the loading and message states, so
 *  they sit on the same ambient backdrop as the report itself. */
function ReportShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex-1">
      <ReportBackdrop />
      <div className="relative mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-6 py-12">
        {children}
      </div>
    </main>
  );
}

function ReportMessage({ title, body }: { title: string; body: string }) {
  return (
    <GlassCard className="w-full max-w-md p-8 text-center">
      <h1 className="text-lg font-bold text-[var(--color-ink)]">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-slate)]">{body}</p>
      <Link
        href="/"
        className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[var(--color-blue)] px-5 text-[14px] font-semibold text-white transition-colors duration-150 hover:brightness-95"
      >
        홈으로 돌아가기
      </Link>
    </GlassCard>
  );
}

function ReportContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // Set by the backend when it redirects back from Kakao login, consumed by
  // UpgradeCard's premium-request flow (FRONTEND_INTEGRATION.md §카카오 로그인).
  const oauthResult = useSearchParams().get('oauth');
  const reduceMotion = useReducedMotion();

  const [report, setReport] = useState<ApiReport | null>(null);
  const [state, setState] = useState<LoadState>('loading');

  // Fetches the report (FRONTEND_INTEGRATION.md §정밀 리포트 / 오류 처리).
  // The backend returns 400 ("리포트를 찾을 수 없습니다") for a missing report,
  // not the 404 the error table implies — so both 400 and 404 map to "not
  // found" here, since the report page's only input is the id in the URL.
  // `active` guards against a resolved fetch calling setState after the id
  // changed or the component unmounted.
  useEffect(() => {
    let active = true;
    setState('loading');
    apiFetch<ApiReport>(`/reports/${id}`)
      .then((data) => {
        if (!active) return;
        setReport(data);
        setState('ready');
        trackEvent('report_view', { reportId: id });
      })
      .catch((err) => {
        if (!active) return;
        const missing = err instanceof ApiError && (err.status === 404 || err.status === 400);
        setState(missing ? 'notFound' : 'error');
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (state === 'loading') {
    return (
      <ReportShell>
        <ProgressAnimation />
      </ReportShell>
    );
  }

  if (state === 'notFound') {
    return (
      <ReportShell>
        <ReportMessage
          title="리포트를 찾을 수 없어요"
          body="주소가 잘못됐거나 만료된 리포트일 수 있어요. 다방 링크로 다시 분석해보세요."
        />
      </ReportShell>
    );
  }

  if (state === 'error' || !report) {
    return (
      <ReportShell>
        <ReportMessage
          title="리포트를 불러오지 못했어요"
          body="일시적인 문제일 수 있어요. 잠시 후 다시 시도해주세요."
        />
      </ReportShell>
    );
  }

  const sections = [
    <header key="header">
      <h1 className="text-xl font-bold text-[var(--color-ink)]">매물 확인 리포트</h1>
      <p className="mt-1 text-sm text-[var(--color-slate)]">
        공개 데이터로 확인한 결과를 정리했어요
      </p>
    </header>,
    <ReportSummary key="summary" report={report} />,
    <UpgradeCard key="upgrade" reportId={id} oauthResult={oauthResult} />,
    <VisitCta key="visit" reportId={id} src="basic_report" />,
    <SurveyCard key="survey" />,
    <Disclaimer key="disclaimer" />,
  ];

  return (
    <main className="relative flex-1">
      <ReportBackdrop />
      <div className="relative mx-auto max-w-2xl space-y-8 px-6 py-12">
        {sections.map((section, i) => (
          <motion.div
            key={section.key}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut', delay: i * 0.04 }}
          >
            {section}
          </motion.div>
        ))}
      </div>
    </main>
  );
}

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  // useSearchParams requires a Suspense boundary for prerendering (Next docs).
  return (
    <Suspense fallback={null}>
      <ReportContent params={params} />
    </Suspense>
  );
}
