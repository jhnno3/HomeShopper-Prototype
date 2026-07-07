"use client";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "./Button";

type Props = {
  headline: string;
  subcopy: string;
  ctaLabel: string;
  onCtaClick?: () => void;
  ctaHref?: string;
};

export function Hero({ headline, subcopy, ctaLabel, onCtaClick, ctaHref }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-6 py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-60 blur-[90px]"
        style={{ background: "var(--grad-primary)" }}
      />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 text-center"
      >
        <h1 className="text-[32px] leading-tight font-bold tracking-[-0.5px] text-[var(--color-ink)] sm:text-[40px]">
          {headline}
        </h1>
        <p className="text-base text-[var(--color-slate)] sm:text-lg">
          {subcopy}
        </p>
        {ctaHref ? (
          <Button variant="primary" size="lg" href={ctaHref}>
            {ctaLabel}
          </Button>
        ) : (
          <Button variant="primary" size="lg" onClick={onCtaClick}>
            {ctaLabel}
          </Button>
        )}
      </motion.div>
    </section>
  );
}
