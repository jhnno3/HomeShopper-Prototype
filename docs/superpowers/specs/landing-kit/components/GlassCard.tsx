import { cn } from "../lib/cn";

type Props = React.HTMLAttributes<HTMLDivElement>;

export function GlassCard({ className, ...rest }: Props) {
  return (
    <div
      className={cn(
        "glass-edge bg-glass border-glass shadow-glass rounded-3xl p-5 text-[var(--color-ink)]",
        className,
      )}
      {...rest}
    />
  );
}
