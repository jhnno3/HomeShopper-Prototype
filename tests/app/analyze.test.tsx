import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AnalyzePage from '@/app/analyze/page';
import { trackEvent } from '@/lib/analytics';

const pushMock = vi.fn();
let searchParamsValue = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams(searchParamsValue),
}));

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

describe('AnalyzePage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    pushMock.mockClear();
    vi.mocked(trackEvent).mockClear();
    searchParamsValue = '';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('submits the address step and redirects to the report after progress completes', () => {
    render(<AnalyzePage />);

    fireEvent.change(screen.getByLabelText('매물 주소'), {
      target: { value: '서울특별시 강남구 테헤란로 123' },
    });
    fireEvent.click(screen.getByText('분석 시작'));

    expect(screen.getByText('리포트를 준비하고 있어요')).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledWith('analyze_start', { inputMode: 'address' });
    expect(trackEvent).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(pushMock).toHaveBeenCalledWith('/report/demo-1');
  });

  it('skips straight to the progress step when a source is passed in the query string', () => {
    searchParamsValue = 'source=서울특별시 강남구 테헤란로 123';
    render(<AnalyzePage />);

    expect(screen.getByText('리포트를 준비하고 있어요')).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledWith('analyze_start', { inputMode: 'address' });
    expect(trackEvent).toHaveBeenCalledTimes(1);
  });
});
