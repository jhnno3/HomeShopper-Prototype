import { Suspense } from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PremiumReportPage from '@/app/report/[id]/premium/page';

describe('PremiumReportPage', () => {
  it('renders the registry section for a premium report', async () => {
    await act(async () => {
      render(
        <Suspense>
          <PremiumReportPage params={Promise.resolve({ id: 'demo-3' })} />
        </Suspense>
      );
    });

    expect(screen.getByText('등기부 분석')).toBeInTheDocument();
    expect(screen.getByText('선순위 근저당 1건 존재')).toBeInTheDocument();
  });

  it('links the visit CTA to the reserve page with the premium_report source', async () => {
    await act(async () => {
      render(
        <Suspense>
          <PremiumReportPage params={Promise.resolve({ id: 'demo-3' })} />
        </Suspense>
      );
    });
    const link = screen.getByText('이 매물, 전문가와 동행 임장하기').closest('a');
    expect(link).toHaveAttribute('href', '/reserve?src=premium_report&reportId=demo-3');
  });
});
