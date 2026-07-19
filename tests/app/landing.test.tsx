import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LandingPage from '@/app/page';

describe('LandingPage', () => {
  it('renders the hero headline and a link into the analyze flow', () => {
    render(<LandingPage />);
    expect(
      screen.getByText('매물 주소만 입력하세요 반값 수수료로, 계약까지 다 해드립니다')
    ).toBeInTheDocument();
    expect(screen.getByText('무료로 서류 확인하기').closest('a')).toHaveAttribute('href', '/analyze');
  });

  it('expands an FAQ answer on click', () => {
    render(<LandingPage />);
    expect(
      screen.queryByText('베이직 리포트는 로그인 없이 무료로 확인할 수 있어요.')
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('정말 무료인가요?'));
    expect(
      screen.getByText('베이직 리포트는 로그인 없이 무료로 확인할 수 있어요.')
    ).toBeInTheDocument();
  });

  it('links the reserve banner to the reserve page with a landing source', () => {
    render(<LandingPage />);
    expect(screen.getByText('사전예약하기').closest('a')).toHaveAttribute('href', '/reserve?src=landing');
  });
});
