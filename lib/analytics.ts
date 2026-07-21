import { API_BASE_URL } from './api';

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

/**
 * Records a conversion event (PROTOTYPE_API.md §7 — `POST /api/v1/analytics/
 * events`, returns 204). Deliberately fire-and-forget: analytics must never
 * block, delay, or break a user flow, so every failure (network, CORS, non-2xx)
 * is swallowed. Note: FRONTEND_INTEGRATION.md does not re-list this endpoint,
 * so it's wired per the PROTOTYPE_API contract and treated as best-effort.
 */
export function trackEvent(name: AnalyticsEvent, payload?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  void fetch(`${API_BASE_URL}/api/v1/analytics/events`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, payload: payload ?? {} }),
    // Let the event flush even if the page is navigating away.
    keepalive: true,
  }).catch(() => {
    // Best-effort — never surface analytics failures to the user.
  });
}
