import { cn } from '@/lib/cn';

/** Plain, flat card for error/not-found states — deliberately undecorated
 *  (no CardStack fan, no glass blur) so a failure never reads as a polished,
 *  "designed" moment the way the success surfaces do.
 *
 *  Size lives here, not at each call site: every error surface (report
 *  load failure, analyze retry, ...) should read as the same object at the
 *  same scale. Call sites only add layout/alignment classes (e.g.
 *  `text-center`), never width or padding — otherwise they drift apart the
 *  way `/report` and `/analyze` did before this was centralized.
 *
 *  Height is intentionally NOT fixed — a min-height forced a short message
 *  (report-not-found: title + one line + a button) to stretch into a mostly
 *  empty box. Generous py instead lets the card size to whatever content is
 *  actually there. `mx-auto` here (not left to the parent) so it stays
 *  centered regardless of the parent container's own width. */
export function ErrorCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-md rounded-[32px] bg-white px-8 pt-8 pb-14 shadow-2xl sm:px-10 sm:pt-10 sm:pb-16',
        className
      )}
    >
      {/* Short centered dash, not a full-width edge bar — a quiet "alert"
          mark above the content rather than a banner. */}
      <div aria-hidden className="mx-auto mb-6 h-1 w-16 rounded-full bg-[var(--color-danger)]" />
      {children}
    </div>
  );
}
