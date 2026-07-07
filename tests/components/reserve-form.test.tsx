import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReserveForm } from '@/components/reserve/ReserveForm';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('src=basic_report&reportId=demo-1'),
}));

describe('ReserveForm', () => {
  it('does not submit without a phone number', () => {
    render(<ReserveForm />);
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '김민지' } });
    fireEvent.click(screen.getByText('사전예약 신청'));
    expect(screen.queryByText('사전예약이 완료됐어요')).not.toBeInTheDocument();
  });

  it('shows a confirmation screen once name and phone are filled in', () => {
    render(<ReserveForm />);
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '김민지' } });
    fireEvent.change(screen.getByLabelText('전화번호'), { target: { value: '010-1111-2222' } });
    fireEvent.click(screen.getByText('사전예약 신청'));
    expect(screen.getByText('사전예약이 완료됐어요')).toBeInTheDocument();
  });
});
