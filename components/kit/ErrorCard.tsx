import { cn } from '@/lib/cn';

/** Plain, flat card for error/not-found states — deliberately undecorated
 *  (no CardStack fan, no glass blur) so a failure never reads as a polished,
 *  "designed" moment the way the success surfaces do.
 *
 *  Size lives here, not at each call site: every error surface (report
 *  load failure, analyze retry, ...) should read as the same object at the
 *  same scale. Call sites only add layout/alignment classes (e.g.
 *  `text-center`), never width or padding — otherwise they drift apart the
 *  way `/report` and `/analyze` did before this was centralized. */
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
        'w-full max-w-lg rounded-[28px] border border-[#E7E9F0] bg-white p-10 shadow-2xl sm:p-14',
        className
      )}
    >
      {children}
    </div>
  );
}
