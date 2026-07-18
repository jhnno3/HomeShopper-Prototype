import type { ResultSummary } from './types';

export const demoReportId = 'demo-1';

// Sample result_summary payload — replaced by the analysis API once connected.
export const resultSummary: ResultSummary = {
  market_price: {
    deal_count: 403,
    avg_deposit_manwon: 75670,
    avg_deposit_text: '7억 5,670만원',
    avg_monthly_rent_manwon: null,
    avg_monthly_rent_text: null,
  },
  building: {
    main_purpose: '공동주택',
    use_approval_year: 1992,
  },
  agency: {
    reg_no_valid: true,
  },
};
