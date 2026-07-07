"use client";
import { Button } from "./Button";

type Props = {
  wordmark?: string;
  ctaLabel: string;
  onCtaClick?: () => void;
  ctaHref?: string;
};

export function Nav({ wordmark = "홈쇼퍼", ctaLabel, onCtaClick, ctaHref }: Props) {
  return (
    <header
      className="bg-glass sticky inset-x-0 top-0 z-30"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        borderBottom: "1px solid var(--glass-border)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <span className="text-[17px] font-bold tracking-[-0.3px] text-[var(--color-ink)]">
          {wordmark}
        </span>
        {ctaHref ? (
          <Button variant="primary" size="md" href={ctaHref}>
            {ctaLabel}
          </Button>
        ) : (
          <Button variant="primary" size="md" onClick={onCtaClick}>
            {ctaLabel}
          </Button>
        )}
      </div>
    </header>
  );
}
