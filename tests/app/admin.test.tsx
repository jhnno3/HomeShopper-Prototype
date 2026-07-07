import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AdminPage from '@/app/admin/page';

describe('AdminPage', () => {
  it('rejects invalid JSON when sending a report', () => {
    render(<AdminPage />);
    fireEvent.click(screen.getAllByText('작성하기')[0]);
    fireEvent.change(screen.getByLabelText('리포트 JSON'), { target: { value: '{invalid' } });
    fireEvent.click(screen.getByText('발송 처리'));
    expect(screen.getByText('유효한 JSON이 아닙니다')).toBeInTheDocument();
  });

  it('marks a request as sent once valid JSON is submitted', () => {
    render(<AdminPage />);
    fireEvent.click(screen.getAllByText('작성하기')[0]);
    fireEvent.change(screen.getByLabelText('리포트 JSON'), { target: { value: '{"facts": {}}' } });
    fireEvent.click(screen.getByText('발송 처리'));
    expect(screen.getAllByText('sent')).toHaveLength(2);
  });
});
