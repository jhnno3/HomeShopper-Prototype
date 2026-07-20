'use client';
import { Suspense, use, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { demoReport } from '@/lib/report-data';
import { ReportSummary } from '@/components/report/ReportSummary';
import { UpgradeCard } from '@/components/report/UpgradeCard';
import { VisitCta } from '@/components/report/VisitCta';
import { ReportBackdrop } from '@/components/report/ReportBackdrop';
import { SurveyCard } from '@/components/report/SurveyCard';
import { Disclaimer } from '@/components/report/Disclaimer';
import { trackEvent } from '@/lib/analytics';

function ReportContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // Set by the backend when it redirects back from Kakao login, consumed by
  // UpgradeCard's premium-request flow (PROTOTYPE_API.md §2).
  const oauthResult = useSearchParams().get('oauth');
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    trackEvent('report_view', { reportId: id });
  }, [id]);

  const sections = [
    <header key="header">
      <h1 className="text-xl font-bold text-[var(--color-ink)]">매물 확인 리포트</h1>
      <p className="mt-1 text-sm text-[var(--color-slate)]">
        공개 데이터로 확인한 결과를 정리했어요
      </p>
    </header>,
    <ReportSummary key="summary" report={demoReport} />,
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
