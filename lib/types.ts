// Shape of `GET /api/v1/reports/{reportId}` (PROTOTYPE_API.md §3). Each
// `facts.*` section can independently be missing (address input has no
// agencyValidity at all) or fail (`apiStatus` per section), so every field
// that isn't guaranteed is nullable — components must render a fallback
// rather than assume presence.
export type ApiStatus = 'ok' | 'failed' | 'pending';

export interface ReportFacts {
  recentTransactions: {
    summary: string;
    count: number;
    priceRangeLow: number;
    priceRangeHigh: number;
  } | null;
  buildingRegistry: {
    summary: string;
    /**
     * Whether the building is a registered violation (위반건축물). The
     * Python analysis server doesn't provide this for every listing, so it
     * is frequently `null` — that must render as "확인 불가", never as a
     * safe/no-violation result (PROTOTYPE_API.md §3).
     */
    hasViolation: boolean | null;
    mainUse: string;
    approvalYear: number;
  } | null;
  agencyValidity: {
    summary: string;
    isValid: boolean;
    registrationNumber: string;
  } | null;
}

export interface RegistryFacts {
  ownerMatchesLandlord: boolean;
  maxClaimAmount: number;
  priorLienSummary: string;
  priorDepositInfo: string;
}

export interface ApiReport {
  id: string;
  submissionId: string;
  tier: 'basic' | 'premium';
  addressMasked: string;
  dealType: '전세' | '월세' | '매매';
  deposit: number | null;
  price: { deposit: number | null; monthly_rent: number | null };
  sourceUrl: string | null;
  roomId: string | null;
  regId: string | null;
  facts: ReportFacts;
  registryFacts?: RegistryFacts;
  concerns: string[];
  apiStatus: {
    transactions: ApiStatus;
    registry: ApiStatus;
    agency: ApiStatus;
  };
  shareCount: number;
  viewedAt: string;
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

export type ReservationSource = 'basic_report' | 'premium_report' | 'premium_upsell' | 'landing';

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

// Response of `POST /api/v1/analyses` (PROTOTYPE_API.md §3). `completed` means
// every section resolved; `partial` means some did — both are 201, and both
// yield a viewable report at `reportId`. Analysis failure comes back as an
// error status code instead, not one of these values.
export interface AnalysisApiResponse {
  submissionId: string;
  reportId: string;
  status: 'completed' | 'partial';
}

// Response shapes for the OAuth-gated submission calls (PROTOTYPE_API.md §5, §6).

export interface ReservationApiResponse extends Reservation {
  queueNumber: number;
  status: 'received' | 'contacted' | 'confirmed' | 'cancelled';
}

export interface PremiumRequestApiResponse {
  id: string;
  reportId: string;
  userId: string;
  provider: LoginProvider;
  dong: string;
  ho: string;
  status: 'queued' | 'writing' | 'sent';
  requestedAt: string;
  sentAt: string | null;
}

// Admin list endpoints (PROTOTYPE_API.md §8) wrap their rows in this envelope:
// `{ items, total }`. AGENT-only — an unauthenticated call returns 401. The
// row shapes below are inferred from the documented reservation/premium
// response bodies (the spec shows `items: []` empty), so they're unverified
// against a real AGENT session — see API_INTEGRATION_STATUS.md problem 9.
export interface AdminListResponse<T> {
  items: T[];
  total: number;
}
