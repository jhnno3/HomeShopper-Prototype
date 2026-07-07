import type { Report, Submission, PremiumRequest } from './types';

export const demoReportId = 'demo-1';

export const mockSubmission: Submission = {
  id: 'sub-1',
  createdAt: '2026-07-01T09:00:00Z',
  sourceUrl: 'https://land.naver.com/article/12345',
  addressNorm: '서울특별시 마포구 연남동 123-45',
  region: '서울 마포구',
  dealType: '전세',
  deposit: 32000,
  reportId: demoReportId,
};

export const mockReports: Report[] = [
  {
    id: demoReportId,
    submissionId: 'sub-1',
    tier: 'basic',
    addressMasked: '서울 마포구 연남동 OO번지 인근',
    dealType: '전세',
    deposit: 32000,
    facts: {
      recentTransactions: {
        summary: '인근 동일 유형 최근 전세 실거래 6건, 2.8억~3.4억',
        count: 6,
        priceRangeLow: 28000,
        priceRangeHigh: 34000,
      },
      buildingRegistry: {
        summary: '위반건축물 등재 없음, 주용도 다세대주택, 사용승인 2016년',
        hasViolation: false,
        mainUse: '다세대주택',
        approvalYear: 2016,
      },
      agencyValidity: {
        summary: '광고 게시 사무소 등록번호 정상',
        isValid: true,
        registrationNumber: '서울마포-2021-00123',
      },
    },
    concerns: [
      {
        id: 'concern-1',
        fact: '해당 매물의 보증금은 인근 실거래 평균 대비 다소 낮은 편입니다.',
        reason: '시세보다 낮은 보증금은 임대인의 자금 상황과 관련이 있을 수 있어 확인이 필요합니다.',
        howToCheck: '임대인에게 근저당 설정 여부와 대출 상환 계획을 직접 문의해보세요.',
      },
    ],
    apiStatus: { transactions: 'ok', registry: 'ok', agency: 'ok' },
    shareCount: 3,
    viewedAt: '2026-07-01T09:05:00Z',
  },
  {
    id: 'demo-2',
    submissionId: 'sub-2',
    tier: 'basic',
    addressMasked: '경기 성남시 분당구 OO번지 인근',
    dealType: '월세',
    deposit: 5000,
    facts: {
      recentTransactions: {
        summary: '확인이 지연되고 있어요. 완료되면 알려드릴까요?',
        count: 0,
        priceRangeLow: 0,
        priceRangeHigh: 0,
      },
      buildingRegistry: {
        summary: '위반건축물 등재 없음, 주용도 오피스텔, 사용승인 2019년',
        hasViolation: false,
        mainUse: '오피스텔',
        approvalYear: 2019,
      },
      agencyValidity: null,
    },
    concerns: [],
    apiStatus: { transactions: 'failed', registry: 'ok', agency: 'pending' },
    shareCount: 0,
  },
  {
    id: 'demo-3',
    submissionId: 'sub-3',
    tier: 'premium',
    addressMasked: '인천 부평구 OO번지 인근',
    dealType: '전세',
    deposit: 22000,
    facts: {
      recentTransactions: {
        summary: '인근 동일 유형 최근 전세 실거래 4건, 2.0억~2.5억',
        count: 4,
        priceRangeLow: 20000,
        priceRangeHigh: 25000,
      },
      buildingRegistry: {
        summary: '위반건축물 등재 없음, 주용도 다가구주택, 사용승인 2011년',
        hasViolation: false,
        mainUse: '다가구주택',
        approvalYear: 2011,
      },
      agencyValidity: {
        summary: '광고 게시 사무소 등록번호 정상',
        isValid: true,
        registrationNumber: '인천부평-2019-00456',
      },
    },
    registryFacts: {
      ownerMatchesLandlord: true,
      maxClaimAmount: 18000,
      priorLienSummary: '선순위 근저당 1건 존재',
      priorDepositInfo: '채권최고액과 보증금 합계가 시세의 약 92%',
    },
    concerns: [
      {
        id: 'concern-2',
        fact: '채권최고액과 보증금 합계가 시세의 약 92%에 해당합니다.',
        reason: '경매 등 상황 발생 시 보증금 전액을 회수하지 못할 가능성이 있어 확인이 필요합니다.',
        howToCheck: '등기부등본상 선순위 채권 내역을 등기소에서 다시 확인하고 전문가와 상담해보세요.',
      },
    ],
    apiStatus: { transactions: 'ok', registry: 'ok', agency: 'ok' },
    shareCount: 12,
    viewedAt: '2026-07-03T14:20:00Z',
  },
];

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

export function getReportById(id: string): Report | undefined {
  return mockReports.find((r) => r.id === id);
}
