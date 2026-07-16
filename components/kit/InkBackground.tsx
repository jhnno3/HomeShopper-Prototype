"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Page-wide ambient background: varied, edge-blended color blooms derived from
 * the brand gradient (linear-gradient(135deg, #0083FF, #4C2CE2)). Rendered once
 * in the root layout so every route shares the same atmosphere. Colors reference
 * the --ink-* tokens defined in theme.css.
 *
 * Each bloom drifts a little toward the cursor (depth-scaled parallax, kept
 * small) and turns up its own opacity the closer the cursor gets to it — the
 * auto drift keyframes stay on the inner element so none of these three
 * transforms/opacity changes ever fight over the same style property.
 */
const INK_BLOOMS = [
  // first two blooms sit in the hero's range — blue-only there, on purpose
  { top: "-11.5%", left: "-23.5vmax", w: "61vmax", h: "75vmax", rot: -11, color: "var(--ink-blue)", opacity: 0.38, drift: "ink-drift-a", depth: 0.5 },
  { top: "6.5%", left: "40vmax", w: "31vmax", h: "27vmax", rot: 9, color: "var(--ink-blue-soft)", opacity: 0.26, drift: "ink-drift-b", depth: 1.2 },
  { top: "18%", right: "-32vmax", w: "72vmax", h: "48vmax", rot: 6, color: "var(--ink-violet)", opacity: 0.32, drift: "ink-drift-a", depth: 0.5 },
  { top: "38%", left: "-16vmax", w: "44vmax", h: "62vmax", rot: -16, color: "var(--ink-mid)", opacity: 0.26, drift: "ink-drift-b", depth: 1.0 },
  { top: "50%", left: "22vmax", w: "30vmax", h: "38vmax", rot: 4, color: "var(--ink-blue-soft)", opacity: 0.24, drift: "ink-drift-a", depth: 1.4 },
  { top: "62%", right: "-24vmax", w: "56vmax", h: "40vmax", rot: -10, color: "var(--ink-blue)", opacity: 0.28, drift: "ink-drift-b", depth: 0.7 },
  { top: "76%", left: "-36vmax", w: "68vmax", h: "54vmax", rot: 10, color: "var(--ink-violet-soft)", opacity: 0.3, drift: "ink-drift-a", depth: 0.9 },
  { top: "92%", right: "-16vmax", w: "42vmax", h: "58vmax", rot: -5, color: "var(--ink-violet)", opacity: 0.3, drift: "ink-drift-b", depth: 1.1 },
] as const;

const MAX_PARALLAX_PX = 30;
const PROXIMITY_RADIUS_PX = 480;
const OPACITY_BOOST = 0.28;

export function InkBackground() {
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const resetOpacity = () => {
      wrapRefs.current.forEach((el, i) => {
        const inner = el?.firstElementChild as HTMLElement | null;
        if (inner) inner.style.opacity = String(INK_BLOOMS[i].opacity);
      });
    };

    const handleMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        wrapRefs.current.forEach((el, i) => {
          if (!el) return;
          const bloom = INK_BLOOMS[i];
          const x = nx * MAX_PARALLAX_PX * bloom.depth;
          const y = ny * MAX_PARALLAX_PX * bloom.depth;
          el.style.transform = `translate3d(${x}px, ${y}px, 0)`;

          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
          const proximity = Math.max(0, 1 - dist / PROXIMITY_RADIUS_PX);
          const inner = el.firstElementChild as HTMLElement | null;
          if (inner) inner.style.opacity = String(bloom.opacity + OPACITY_BOOST * proximity);
        });
      });
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    document.addEventListener("mouseleave", resetOpacity);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", resetOpacity);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="ink-bg" aria-hidden>
      {INK_BLOOMS.map((b, i) => (
        <div
          key={i}
          ref={(el) => {
            wrapRefs.current[i] = el;
          }}
          className="ink-bloom-wrap"
          style={
            {
              top: b.top,
              left: "left" in b ? b.left : undefined,
              right: "right" in b ? b.right : undefined,
              width: b.w,
              height: b.h,
            } as CSSProperties
          }
        >
          <div
            className={`ink-bloom ${b.drift}`}
            style={
              {
                "--rot": `${b.rot}deg`,
                background: `radial-gradient(circle, ${b.color} 0%, ${b.color} 20%, transparent 70%)`,
                opacity: b.opacity,
              } as CSSProperties
            }
          />
        </div>
      ))}
    </div>
  );
}
