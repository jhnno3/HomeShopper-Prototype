import { describe, it, expect, vi, afterEach } from 'vitest';
import { trackEvent } from '@/lib/analytics';

describe('trackEvent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs the event name and payload to the console', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    trackEvent('report_view', { reportId: 'demo-1' });
    expect(logSpy).toHaveBeenCalledWith('[analytics] report_view', { reportId: 'demo-1' });
  });
});
