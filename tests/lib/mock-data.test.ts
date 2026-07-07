import { describe, it, expect } from 'vitest';
import { getReportById, mockReports, demoReportId } from '@/lib/mock-data';

describe('mock-data', () => {
  it('returns the demo report by id', () => {
    const report = getReportById(demoReportId);
    expect(report?.id).toBe(demoReportId);
    expect(report?.tier).toBe('basic');
  });

  it('returns undefined for an unknown id', () => {
    expect(getReportById('does-not-exist')).toBeUndefined();
  });

  it('includes a report with a failed API status to exercise the partial-failure UI', () => {
    const failed = mockReports.find((r) => r.apiStatus.transactions === 'failed');
    expect(failed).toBeDefined();
  });

  it('includes a premium report with registry facts', () => {
    const premium = mockReports.find((r) => r.tier === 'premium');
    expect(premium?.registryFacts).toBeDefined();
  });
});
