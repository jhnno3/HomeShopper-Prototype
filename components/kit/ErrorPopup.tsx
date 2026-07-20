'use client';
import { AlertTriangle } from 'lucide-react';

/** Shared failure surface for OAuth/API errors — the reserve and premium
 *  request flows both hit real network calls now, so both need a way to
 *  show "it didn't work" without silently pretending it succeeded. */
export function ErrorPopup({
  message,
  onRetry,
  onDismiss,
}: {
  message: string;
  onRetry?: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5"
    >
      <div className="w-full max-w-[340px] rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center gap-2.5">
          <AlertTriangle aria-hidden className="size-5 shrink-0 text-[var(--color-danger)]" />
          <p className="text-[15px] font-bold text-[var(--color-ink)]">문제가 발생했어요</p>
        </div>
        <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-slate)]">{message}</p>
        <div className="mt-4 flex gap-2">
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="h-10 flex-1 cursor-pointer rounded-xl bg-[var(--color-blue)] text-[13.5px] font-semibold text-white transition-colors duration-150 hover:brightness-95"
            >
              다시 시도
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDismiss}
            className="h-10 flex-1 cursor-pointer rounded-xl border border-[#E7E9F0] text-[13.5px] font-semibold text-[var(--color-ink)] transition-colors duration-150 hover:bg-[#F7F8FB]"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
