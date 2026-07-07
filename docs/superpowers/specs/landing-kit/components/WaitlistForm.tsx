"use client";
import * as React from "react";
import { Check } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { Button } from "./Button";

type Props = {
  title?: string;
  placeholder?: string;
  ctaLabel?: string;
  successMessage?: string;
  onSubmit?: (email: string) => void | Promise<void>;
};

export function WaitlistForm({
  title = "출시 알림 받기",
  placeholder = "이메일 주소",
  ctaLabel = "알림 신청",
  successMessage = "신청 완료! 출시 소식을 가장 먼저 전해드릴게요.",
  onSubmit,
}: Props) {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit?.(email);
    setSubmitted(true);
  }

  return (
    <GlassCard className="mx-auto flex max-w-md flex-col gap-4">
      {submitted ? (
        <div className="flex items-center gap-3 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)]">
            <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          <p className="text-sm font-medium text-[var(--color-ink)]">
            {successMessage}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <h3 className="sr-only">{title}</h3>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="border-glass h-12 flex-1 rounded-2xl bg-white/60 px-4 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-slate)]"
          />
          <Button type="submit" variant="primary" size="md">
            {ctaLabel}
          </Button>
        </form>
      )}
    </GlassCard>
  );
}
