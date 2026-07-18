import { Suspense } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ReportPage from '@/app/report/[id]/page';

function renderReport() {
  return act(async () => {
    render(
      <Suspense>
        <ReportPage params={Promise.resolve({ id: 'demo-1' })} />
      </Suspense>
    );
  });
}

describe('ReportPage', () => {
  it('renders the summary cards from the result_summary data', async () => {
    await renderReport();

    expect(screen.getByText('7억 5,670만원')).toBeInTheDocument();
    expect(screen.getByText('403건')).toBeInTheDocument();
    expect(screen.getByText('공동주택')).toBeInTheDocument();
    expect(screen.getByText('1992년')).toBeInTheDocument();
    expect(screen.getByText('정상 등록')).toBeInTheDocument();
  });

  it('lets the user complete the login stub', async () => {
    await renderReport();

    fireEvent.click(screen.getByText('카카오 로그인'));

    expect(screen.getByText('접수 완료 · 접수번호 #HS-0041')).toBeInTheDocument();
  });

  it('links the visit CTA to the reserve page with the basic_report source', async () => {
    await renderReport();

    const link = screen.getByText('이 매물, 전문가와 동행 임장하기').closest('a');
    expect(link).toHaveAttribute('href', '/reserve?src=basic_report&reportId=demo-1');
  });
});
