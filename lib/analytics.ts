export type AnalyticsEvent =
  | 'analyze_start'
  | 'analyze_complete'
  | 'report_view'
  | 'premium_cta_click'
  | 'login_complete'
  | 'premium_sent'
  | 'premium_view'
  | 'visit_cta_click'
  | 'reserve_phone_complete';

export function trackEvent(name: AnalyticsEvent, payload?: Record<string, unknown>): void {
  console.log(`[analytics] ${name}`, payload ?? {});
}
