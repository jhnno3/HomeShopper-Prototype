import type { CSSProperties } from "react";

/**
 * Page-wide ambient background: varied, edge-blended color blooms derived from
 * the brand gradient (linear-gradient(135deg, #0083FF, #4C2CE2)). Rendered once
 * in the root layout so every route shares the same atmosphere. Colors reference
 * the --ink-* tokens defined in theme.css.
 */
const INK_BLOOMS = [
  { top: "-10%", left: "-22vmax", w: "64vmax", h: "78vmax", rot: -8, color: "var(--ink-blue)", opacity: 0.38, drift: "ink-drift-a" },
  { top: "4%", left: "38vmax", w: "34vmax", h: "26vmax", rot: 14, color: "var(--ink-violet-soft)", opacity: 0.26, drift: "ink-drift-b" },
  { top: "18%", right: "-32vmax", w: "72vmax", h: "48vmax", rot: 6, color: "var(--ink-violet)", opacity: 0.32, drift: "ink-drift-a" },
  { top: "38%", left: "-16vmax", w: "44vmax", h: "62vmax", rot: -16, color: "var(--ink-mid)", opacity: 0.26, drift: "ink-drift-b" },
  { top: "50%", left: "22vmax", w: "30vmax", h: "38vmax", rot: 4, color: "var(--ink-blue-soft)", opacity: 0.24, drift: "ink-drift-a" },
  { top: "62%", right: "-24vmax", w: "56vmax", h: "40vmax", rot: -10, color: "var(--ink-blue)", opacity: 0.28, drift: "ink-drift-b" },
  { top: "76%", left: "-36vmax", w: "68vmax", h: "54vmax", rot: 10, color: "var(--ink-violet-soft)", opacity: 0.3, drift: "ink-drift-a" },
  { top: "92%", right: "-16vmax", w: "42vmax", h: "58vmax", rot: -5, color: "var(--ink-violet)", opacity: 0.3, drift: "ink-drift-b" },
] as const;

export function InkBackground() {
  return (
    <div className="ink-bg" aria-hidden>
      {INK_BLOOMS.map((b, i) => (
        <div
          key={i}
          className={`ink-bloom ${b.drift}`}
          style={
            {
              top: b.top,
              left: "left" in b ? b.left : undefined,
              right: "right" in b ? b.right : undefined,
              width: b.w,
              height: b.h,
              "--rot": `${b.rot}deg`,
              background: `radial-gradient(circle, ${b.color} 0%, ${b.color} 20%, transparent 70%)`,
              opacity: b.opacity,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
