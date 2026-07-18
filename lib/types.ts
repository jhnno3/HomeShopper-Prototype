// Shape of the analysis API's result_summary payload — field names follow the
// API contract (snake_case), not JS convention.
export interface ResultSummary {
  market_price: {
    deal_count: number;
    avg_deposit_manwon: number;
    avg_deposit_text: string;
    avg_monthly_rent_manwon: number | null;
    avg_monthly_rent_text: string | null;
  };
  building: {
    main_purpose: string;
    use_approval_year: number;
  };
  agency: {
    reg_no_valid: boolean | null;
  };
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

export type ReservationSource = 'basic_report' | 'landing';

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
