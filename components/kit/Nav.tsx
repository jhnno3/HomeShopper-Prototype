import Link from "next/link";
import { Logo } from "@/components/kit/Logo";

export function Nav() {
  return (
    <header
      className="bg-glass sticky inset-x-0 top-0 z-30"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        borderBottom: "1px solid var(--glass-border)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-[17px] font-bold tracking-[-0.3px] text-[var(--color-ink)]"
        >
          <Logo />
          홈쇼퍼
        </Link>
      </div>
    </header>
  );
}
