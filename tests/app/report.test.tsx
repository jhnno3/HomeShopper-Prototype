import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ReportPage from '@/app/report/[id]/page';

describe('ReportPage', () => {
  it('shows a pending message for facts whose API call failed', () => {
    render(<ReportPage params={{ id: 'demo-2' }} />);
    expect(
      screen.getAllByText('확인이 지연되고 있어요. 완료되면 알려드릴까요?').length
    ).toBeGreaterThan(0);
  });

  it('renders concerns and lets the user complete the login stub', () => {
    render(<ReportPage params={{ id: 'demo-1' }} />);

    expect(
      screen.getByText('해당 매물의 보증금은 인근 실거래 평균 대비 다소 낮은 편입니다.')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('카카오로 3초 만에 받기'));
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } });
    fireEvent.click(screen.getByText('카카오로 계속하기'));

    expect(screen.getByText('접수 완료 · 접수번호 #HS-0041')).toBeInTheDocument();
  });

  it('links the visit CTA to the reserve page with the basic_report source', () => {
    render(<ReportPage params={{ id: 'demo-1' }} />);
    const link = screen.getByText('이 매물, 전문가와 동행 임장하기').closest('a');
    expect(link).toHaveAttribute('href', '/reserve?src=basic_report&reportId=demo-1');
  });
});
