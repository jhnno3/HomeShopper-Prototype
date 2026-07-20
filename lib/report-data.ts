import type { ApiReport } from './types';

export const demoReportId = 'demo-1';

// Sample GET /api/v1/reports/{reportId} payload — replaced by the real API
// response once connected. Shape follows PROTOTYPE_API.md §3.
export const demoReport: ApiReport = {
  id: demoReportId,
  submissionId: demoReportId,
  tier: 'basic',
  addressMasked: '서울 마포구 연남동 OO번지 인근',
  dealType: '전세',
  deposit: 75670,
  price: { deposit: 75670, monthly_rent: null },
  sourceUrl: null,
  roomId: null,
  regId: '가3691-공2001',
  facts: {
    recentTransactions: {
      summary: '인근 전세 실거래 403건, 보정 평균 7억 5,670만원',
      count: 403,
      priceRangeLow: 70000,
      priceRangeHigh: 80000,
    },
    buildingRegistry: {
      summary: '주용도: 공동주택, 사용승인연도: 1992년',
      hasViolation: false,
      mainUse: '공동주택',
      approvalYear: 1992,
    },
    agencyValidity: {
      summary: '등록 상태 정상',
      isValid: true,
      registrationNumber: '가3691-공2001',
    },
  },
  concerns: [],
  apiStatus: {
    transactions: 'ok',
    registry: 'ok',
    agency: 'ok',
  },
  shareCount: 0,
  viewedAt: new Date().toISOString(),
};
