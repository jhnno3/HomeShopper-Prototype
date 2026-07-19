import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReserveForm } from '@/components/reserve/ReserveForm';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('src=basic_report&reportId=demo-1'),
}));

function fillEverything() {
  fireEvent.change(screen.getByLabelText('이름'), { target: { value: '김민지' } });
  fireEvent.change(screen.getByLabelText('전화번호'), { target: { value: '010-1111-2222' } });
  fireEvent.change(screen.getByLabelText('희망 지역'), { target: { value: '서울 마포구' } });
  fireEvent.click(screen.getByLabelText('1주 내'));
}

describe('ReserveForm', () => {
  it('does not submit without a phone number', () => {
    render(<ReserveForm />);
    fillEverything();
    fireEvent.change(screen.getByLabelText('전화번호'), { target: { value: '' } });
    fireEvent.click(screen.getByText('사전예약 신청'));
    expect(screen.queryByText('사전예약이 완료됐어요')).not.toBeInTheDocument();
    expect(screen.getByText('연락 가능한 전화번호를 입력해주세요.')).toBeInTheDocument();
  });

  it('does not submit without a region', () => {
    render(<ReserveForm />);
    fillEverything();
    fireEvent.change(screen.getByLabelText('희망 지역'), { target: { value: '' } });
    fireEvent.click(screen.getByText('사전예약 신청'));
    expect(screen.queryByText('사전예약이 완료됐어요')).not.toBeInTheDocument();
  });

  it('does not submit without a visit timing', () => {
    render(<ReserveForm />);
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '김민지' } });
    fireEvent.change(screen.getByLabelText('전화번호'), { target: { value: '010-1111-2222' } });
    fireEvent.change(screen.getByLabelText('희망 지역'), { target: { value: '서울 마포구' } });
    fireEvent.click(screen.getByText('사전예약 신청'));
    expect(screen.queryByText('사전예약이 완료됐어요')).not.toBeInTheDocument();
    expect(screen.getByText('방문 예정 시기를 하나 골라주세요.')).toBeInTheDocument();
  });

  it('rejects a phone number that is too short', () => {
    render(<ReserveForm />);
    fillEverything();
    fireEvent.change(screen.getByLabelText('전화번호'), { target: { value: '010-111' } });
    fireEvent.click(screen.getByText('사전예약 신청'));
    expect(screen.getByText('숫자 10~11자리로 입력해주세요. 예: 010-1234-5678')).toBeInTheDocument();
  });

  it('shows a confirmation screen once every field is filled in', () => {
    render(<ReserveForm />);
    fillEverything();
    fireEvent.click(screen.getByText('사전예약 신청'));
    expect(screen.getByText('사전예약이 완료됐어요')).toBeInTheDocument();
  });
});
