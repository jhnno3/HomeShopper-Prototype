import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AnalyzePage from '@/app/analyze/page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('AnalyzePage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    pushMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('walks through both steps and redirects to the report after progress completes', () => {
    render(<AnalyzePage />);

    fireEvent.change(screen.getByLabelText('매물 링크'), {
      target: { value: 'https://land.naver.com/article/1' },
    });
    fireEvent.click(screen.getByText('다음'));

    expect(screen.getByText('거래 정보를 알려주세요')).toBeInTheDocument();

    fireEvent.click(screen.getByText('분석 시작'));

    expect(screen.getByText('서류를 확인하고 있어요')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(pushMock).toHaveBeenCalledWith('/report/demo-1');
  });
});
