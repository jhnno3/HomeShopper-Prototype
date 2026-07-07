"use client";
import * as React from "react";
import { cn } from "../lib/cn";

type Variant = "primary" | "secondary";
type Size = "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "lg",
  className,
  children,
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-150 active:scale-95 active:opacity-90 disabled:opacity-40 disabled:active:scale-100";
  const sizeCls = size === "lg" ? "h-14 px-6 text-base" : "h-11 px-4 text-sm";
  const variantCls =
    variant === "primary"
      ? "bg-grad text-white shadow-glass"
      : "bg-glass border-glass shadow-glass text-[var(--color-ink)]";
  return (
    <button className={cn(base, sizeCls, variantCls, className)} {...rest}>
      {children}
    </button>
  );
}
