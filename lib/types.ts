export type DealType = '전세' | '월세';

export type ApiSourceStatus = 'ok' | 'failed' | 'pending';

export interface Submission {
  id: string;
  createdAt: string;
  sourceUrl?: string;
  addressNorm: string;
  region: string;
  dealType: DealType;
  deposit?: number;
  reportId: string;
}

export interface ReportFacts {
  recentTransactions: {
    summary: string;
    count: number;
    priceRangeLow: number;
    priceRangeHigh: number;
  };
  buildingRegistry: {
    summary: string;
    hasViolation: boolean;
    mainUse: string;
    approvalYear: number;
  };
  agencyValidity: {
    summary: string;
    isValid: boolean;
    registrationNumber?: string;
  } | null;
}

export interface ReportConcern {
  id: string;
  fact: string;
  reason: string;
  howToCheck: string;
}

export interface RegistryFacts {
  ownerMatchesLandlord: boolean;
  maxClaimAmount: number;
  priorLienSummary: string;
  priorDepositInfo: string;
}

export interface Report {
  id: string;
  submissionId: string;
  tier: 'basic' | 'premium';
  addressMasked: string;
  dealType: DealType;
  deposit?: number;
  facts: ReportFacts;
  registryFacts?: RegistryFacts;
  concerns: ReportConcern[];
  apiStatus: Record<'transactions' | 'registry' | 'agency', ApiSourceStatus>;
  shareCount: number;
  viewedAt?: string;
}

export type LoginProvider = 'kakao' | 'naver';

export interface PremiumRequest {
  id: string;
  reportId: string;
  userId: string;
  provider: LoginProvider;
  status: 'queued' | 'writing' | 'sent';
  requestedAt: string;
  sentAt?: string;
}

export type VisitTiming = '1주 내' | '1개월 내' | '미정';

export type ReservationSource = 'basic_report' | 'premium_report' | 'landing';

export interface Reservation {
  id: string;
  createdAt: string;
  reportId?: string;
  userId?: string;
  name: string;
  phone: string;
  region: string;
  visitTiming: VisitTiming;
  src: ReservationSource;
}
