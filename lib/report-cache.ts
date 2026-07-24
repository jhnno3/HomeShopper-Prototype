import type { ApiReport } from './types';

// Lets the analyze flow hand its already-fetched report straight to the
// report page, so /report/[id] doesn't have to run its own GET (and show its
// own brief loading flash) right after the analyze progress screen.
const cache = new Map<string, ApiReport>();

export function stashReport(report: ApiReport) {
  cache.set(report.id, report);
}

export function peekStashedReport(id: string): ApiReport | null {
  return cache.get(id) ?? null;
}

export function clearStashedReport(id: string) {
  cache.delete(id);
}
