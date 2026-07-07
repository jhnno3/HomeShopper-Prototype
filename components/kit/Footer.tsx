type Props = {
  wordmark?: string;
  year?: number;
};

export function Footer({ wordmark = "홈쇼퍼", year = new Date().getFullYear() }: Props) {
  return (
    <footer
      className="bg-glass inset-x-0 bottom-0"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        borderTop: "1px solid var(--glass-border)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <span className="text-[15px] font-semibold text-[var(--color-ink)]">
          {wordmark}
        </span>
        <span className="text-[13px] text-[var(--color-slate)]">
          © {year} {wordmark}
        </span>
      </div>
    </footer>
  );
}
