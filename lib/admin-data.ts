import type { PremiumRequest } from './types';

// Mock queue for the operator-only /admin screen — no real data source yet.
export const mockPremiumRequests: PremiumRequest[] = [
  {
    id: 'pr-1',
    reportId: 'demo-1',
    userId: 'user-1',
    provider: 'kakao',
    status: 'queued',
    requestedAt: '2026-07-01T09:10:00Z',
  },
  {
    id: 'pr-2',
    reportId: 'demo-3',
    userId: 'user-2',
    provider: 'naver',
    status: 'sent',
    requestedAt: '2026-06-28T11:00:00Z',
    sentAt: '2026-06-29T10:00:00Z',
  },
];
