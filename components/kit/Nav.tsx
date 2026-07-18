"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/kit/Logo";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky inset-x-0 top-0 z-30 transition-shadow duration-300 ${
        scrolled ? "shadow-[0_8px_24px_-14px_rgba(11,59,167,0.35)]" : ""
      }`}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        background: "var(--nav-glass-fill)",
        backdropFilter: "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",
        borderBottom: "1px solid var(--nav-glass-border)",
      }}
    >
      <div
        className={`mx-auto flex max-w-5xl items-center px-6 transition-[padding] duration-300 ${
          scrolled ? "py-1.5" : "py-3"
        }`}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight text-[var(--color-ink)]"
        >
          <Logo />
          홈쇼퍼
        </Link>
      </div>
    </header>
  );
}
