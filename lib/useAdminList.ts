'use client';
import { useCallback, useEffect, useState } from 'react';
import { apiFetch, ApiError } from './api';
import type { AdminListResponse } from './types';

export type AdminListState = 'loading' | 'ready' | 'unauthorized' | 'error';

/**
 * Loads an admin list endpoint (`GET /admin/...`, PROTOTYPE_API.md §8) and
 * tracks its state. `401`/`403` become a distinct `unauthorized` state (the
 * caller shows a login prompt) rather than a generic error, since the admin
 * screens are AGENT-only and a missing session is the expected first hit.
 */
export function useAdminList<T>(path: string) {
  const [state, setState] = useState<AdminListState>('loading');
  const [data, setData] = useState<AdminListResponse<T> | null>(null);

  const load = useCallback(() => {
    let active = true;
    setState('loading');
    apiFetch<AdminListResponse<T>>(path)
      .then((res) => {
        if (!active) return;
        setData(res);
        setState('ready');
      })
      .catch((err) => {
        if (!active) return;
        const unauth = err instanceof ApiError && (err.status === 401 || err.status === 403);
        setState(unauth ? 'unauthorized' : 'error');
      });
    return () => {
      active = false;
    };
  }, [path]);

  useEffect(() => load(), [load]);

  return { state, data, reload: load };
}
