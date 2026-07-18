import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AnalyzePage from '@/app/analyze/page';

const pushMock = vi.fn();
let searchParamsValue = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams(searchParamsValue),
}));

describe('AnalyzePage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    pushMock.mockClear();
    searchParamsValue = '';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('submits the link step and redirects to the report after progress completes', () => {
    render(<AnalyzePage />);

    fireEvent.change(screen.getByLabelText('매물 링크'), {
      target: { value: 'https://land.naver.com/article/1' },
    });
    fireEvent.click(screen.getByText('분석 시작'));

    expect(screen.getByText('서류를 확인하고 있어요')).toBeInTheDocument();
    expect(screen.queryByText('거래 정보를 알려주세요')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(pushMock).toHaveBeenCalledWith('/report/demo-1');
  });

  it('skips straight to the progress step when a source is passed in the query string', () => {
    searchParamsValue = 'source=https://land.naver.com/article/1';
    render(<AnalyzePage />);

    expect(screen.getByText('서류를 확인하고 있어요')).toBeInTheDocument();
  });
});
