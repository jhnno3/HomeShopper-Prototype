// Thin client for the Spring backend (PROTOTYPE_API.md §1). Frontend and
// backend run on different origins in dev, so every request needs
// `credentials: "include"` to carry the `homeshopper_session` cookie.

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...init?.headers },
  });

  if (!res.ok) {
    // Error body shape is `{ message: string }` per PROTOTYPE_API.md §1.
    const body: { message?: string } | null = await res.json().catch(() => null);
    throw new ApiError(body?.message ?? '요청을 처리하지 못했어요.', res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
