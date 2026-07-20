import { API_BASE_URL } from './api';

// Kakao login is a full browser redirect (PROTOTYPE_API.md §2) — the backend
// owns the Kakao consent screen and, on return, redirects to `redirect` with
// an `oauth=success|error` query param merged in.
export function startKakaoLogin(returnPath: string) {
  const url = new URL('/oauth2/authorization/kakao', API_BASE_URL);
  url.searchParams.set('redirect', returnPath);
  window.location.href = url.toString();
}

/** Survives the full-page OAuth redirect, which destroys React state. */
export function stashPending<T>(key: string, data: T) {
  sessionStorage.setItem(key, JSON.stringify(data));
}

/** Reads and clears in one step so a duplicate effect run can't double-submit. */
export function takePending<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  sessionStorage.removeItem(key);
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
