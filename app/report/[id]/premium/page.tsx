'use client';
import { use, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { getReportById, mockReports } from '@/lib/mock-data';
import { FactsTable } from '@/components/report/FactsTable';
import { ConcernsList } from '@/components/report/ConcernsList';
import { RegistrySection } from '@/components/report/RegistrySection';
import { VisitCta } from '@/components/report/VisitCta';
import { Disclaimer } from '@/components/report/Disclaimer';
import { trackEvent } from '@/lib/analytics';

export default function PremiumReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const report =
    getReportById(id) ?? mockReports.find((r) => r.tier === 'premium') ?? mockReports[0];
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    trackEvent('premium_view', { reportId: report.id });
  }, [report.id]);

  const sections = [
    <header key="header">
      <p className="text-sm text-[var(--color-slate)]">
        {report.dealType} · 보증금 {report.deposit?.toLocaleString()}만원
      </p>
      <h1 className="text-xl font-bold text-[var(--color-ink)]">{report.addressMasked}</h1>
      <span className="bg-grad mt-2 inline-block rounded-full px-4 py-1 text-xs font-semibold text-white">
        정밀 리포트
      </span>
    </header>,
    <FactsTable key="facts" facts={report.facts} apiStatus={report.apiStatus} />,
    ...(report.registryFacts
      ? [<RegistrySection key="registry" registry={report.registryFacts} />]
      : []),
    <ConcernsList key="concerns" concerns={report.concerns} />,
    <VisitCta key="visit" reportId={report.id} tier={report.tier} src="premium_report" />,
    <Disclaimer key="disclaimer" />,
  ];

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-6 py-12">
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
    </main>
  );
}
