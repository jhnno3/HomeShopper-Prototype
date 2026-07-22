import { cn } from '@/lib/cn';

/** Plain, flat card for error/not-found states — deliberately undecorated
 *  (no CardStack fan, no glass blur) so a failure never reads as a polished,
 *  "designed" moment the way the success surfaces do. */
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
        'rounded-[28px] border border-[#E7E9F0] bg-white p-6 shadow-2xl',
        className
      )}
    >
      {children}
    </div>
  );
}
