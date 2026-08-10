import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AnalyzePage from '@/app/analyze/page';
import { trackEvent } from '@/lib/analytics';
import { apiFetch } from '@/lib/api';

const pushMock = vi.fn();
const replaceMock = vi.fn();
let searchParamsValue = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(searchParamsValue),
}));

vi.mock('@/lib/analytics', () => ({ trackEvent: vi.fn() }));

vi.mock('@/lib/report-cache', () => ({ stashReport: vi.fn() }));

// ApiError is used with `instanceof`, so the mock must export a real class.
vi.mock('@/lib/api', () => {
  class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  }
  return { apiFetch: vi.fn(), ApiError };
});

const apiFetchMock = vi.mocked(apiFetch);

/** POST /analyses resolves, then GET /reports/:id resolves. */
function mockAnalysisSuccess(reportId = 'r1') {
  apiFetchMock.mockImplementation((path: string) => {
    if (path === '/analyses') {
      return Promise.resolve({ submissionId: reportId, reportId, status: 'completed' });
    }
    return Promise.resolve({ id: reportId });
  });
}

describe('AnalyzePage', () => {
  beforeEach(() => {
    pushMock.mockClear();
    replaceMock.mockClear();
    vi.mocked(trackEvent).mockClear();
    apiFetchMock.mockReset();
    searchParamsValue = '';
  });

  it('redirects home when no source is present', () => {
    render(<AnalyzePage />);
    expect(replaceMock).toHaveBeenCalledWith('/');
  });

  it('analyzes an address source and navigates to the report', async () => {
    mockAnalysisSuccess('r1');
    searchParamsValue = 'source=서울특별시 강남구 테헤란로 123&dealType=전세';
    render(<AnalyzePage />);

    expect(screen.getByText('리포트를 준비하고 있어요')).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledWith('analyze_start', { inputMode: 'address' });

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/report/r1'));

    expect(apiFetchMock).toHaveBeenCalledWith(
      '/analyses',
      expect.objectContaining({
        body: JSON.stringify({
          inputMode: 'address',
          source: '서울특별시 강남구 테헤란로 123',
          dealType: '전세',
        }),
      })
    );
  });

  it('analyzes a link source with inputMode link and no dealType', async () => {
    mockAnalysisSuccess('r2');
    searchParamsValue = 'source=https://dabangapp.com/room/1&mode=link';
    render(<AnalyzePage />);

    expect(trackEvent).toHaveBeenCalledWith('analyze_start', { inputMode: 'link' });

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/report/r2'));

    expect(apiFetchMock).toHaveBeenCalledWith(
      '/analyses',
      expect.objectContaining({
        body: JSON.stringify({ inputMode: 'link', source: 'https://dabangapp.com/room/1' }),
      })
    );
  });

  it('shows the input step with a message for an invalid link, without redirecting', () => {
    searchParamsValue = 'source=https://zigbang.com/items/1&mode=link';
    render(<AnalyzePage />);

    expect(
      screen.getByText('지금은 다방(dabangapp.com) 매물 링크만 분석할 수 있어요.')
    ).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalledWith('/');
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it('reveals the 도로명주소 field when a link analysis cannot resolve one', async () => {
    const { ApiError } = await import('@/lib/api');
    apiFetchMock.mockRejectedValue(new ApiError('도로명 주소를 찾지 못했습니다.', 400));
    searchParamsValue = 'source=https://dabangapp.com/room/1&mode=link';
    render(<AnalyzePage />);

    expect(await screen.findByLabelText('도로명주소')).toBeInTheDocument();
    expect(
      screen.getByText(
        '매물 링크에서 도로명주소를 찾지 못했어요. 아래에 도로명주소를 입력한 뒤 다시 시도해주세요.'
      )
    ).toBeInTheDocument();
  });

  it('does not reveal the 도로명주소 field in address mode', async () => {
    const { ApiError } = await import('@/lib/api');
    apiFetchMock.mockRejectedValue(new ApiError('도로명 주소를 찾지 못했습니다.', 400));
    searchParamsValue = 'source=서울특별시 강남구 테헤란로 123&dealType=전세';
    render(<AnalyzePage />);

    expect(await screen.findByText('도로명 주소를 찾지 못했습니다.')).toBeInTheDocument();
    expect(screen.queryByLabelText('도로명주소')).not.toBeInTheDocument();
  });
});
