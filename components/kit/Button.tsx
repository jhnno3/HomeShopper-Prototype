"use client";
import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary";
type Size = "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: React.ReactNode;
};

type ButtonAsButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLinkProps = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & {
    href: string;
  };

type Props = ButtonAsButtonProps | ButtonAsLinkProps;

function useButtonClasses(variant: Variant, size: Size, className?: string) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-150 active:scale-95 active:opacity-90 disabled:opacity-40 disabled:active:scale-100";
  const sizeCls = size === "lg" ? "h-14 px-6 text-base" : "h-11 px-4 text-sm";
  const variantCls =
    variant === "primary"
      ? "bg-grad text-white shadow-glass"
      : "bg-glass border-glass shadow-glass text-[var(--color-ink)]";
  return cn(base, sizeCls, variantCls, className);
}

export function Button({ variant = "primary", size = "lg", className, children, ...rest }: Props) {
  const classes = useButtonClasses(variant, size, className);

  if ("href" in rest && rest.href) {
    const { href, ...anchorRest } = rest as Omit<ButtonAsLinkProps, keyof CommonProps>;
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {children}
      </Link>
    );
  }

  const buttonRest = rest as Omit<ButtonAsButtonProps, keyof CommonProps>;
  return (
    <button className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
