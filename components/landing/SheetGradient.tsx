"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/* Ambient gradient blobs riding the white main-sheet — everything from the
   "how it works" section down. Kept deliberately faint: low opacity, wide
   blur, and a radial fade to transparent, so they only tint the sheet and
   never compete with the content on top. Colors come from the brand ramp
   (linear-gradient(135deg, #0083FF, #4C2CE2)) via the --ink-* tokens in
   theme.css, so the sheet reads as the same system as the hero above.

   Each blob drifts slowly on its own (sheet-drift keyframes) and, on
   pointer devices, nudges toward the cursor with a proximity glow — the
   same cursor parallax the page-wide <InkBackground /> uses, brought back
   here at a lighter touch. Respects prefers-reduced-motion (static). */
const BLOBS = [
  { top: "1%", side: "left", offset: "-6%", color: "var(--ink-blue)", opacity: 0.3, depth: 0.6, drift: "sheet-drift-a" },
  { top: "28%", side: "right", offset: "-8%", color: "var(--ink-violet-soft)", opacity: 0.26, depth: 1.1, drift: "sheet-drift-b" },
  { top: "54%", side: "left", offset: "-8%", color: "var(--ink-mid)", opacity: 0.27, depth: 0.8, drift: "sheet-drift-a" },
  { top: "80%", side: "right", offset: "-6%", color: "var(--ink-violet)", opacity: 0.3, depth: 1.0, drift: "sheet-drift-b" },
] as const;

const MAX_PARALLAX_PX = 22;
const PROXIMITY_RADIUS_PX = 460;
const OPACITY_BOOST = 0.1;

export function SheetGradient() {
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const resetOpacity = () => {
      wrapRefs.current.forEach((el, i) => {
        const inner = el?.firstElementChild as HTMLElement | null;
        if (inner) inner.style.opacity = String(BLOBS[i].opacity);
      });
    };

    const handleMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        wrapRefs.current.forEach((el, i) => {
          if (!el) return;
          const blob = BLOBS[i];
          const x = nx * MAX_PARALLAX_PX * blob.depth;
          const y = ny * MAX_PARALLAX_PX * blob.depth;
          el.style.transform = `translate3d(${x}px, ${y}px, 0)`;

          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
          const proximity = Math.max(0, 1 - dist / PROXIMITY_RADIUS_PX);
          const inner = el.firstElementChild as HTMLElement | null;
          if (inner) inner.style.opacity = String(blob.opacity + OPACITY_BOOST * proximity);
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
    <>
      {BLOBS.map((b, i) => (
        <div
          key={i}
          ref={(el) => {
            wrapRefs.current[i] = el;
          }}
          className="sheet-bloom-wrap"
          style={
            {
              top: b.top,
              [b.side]: b.offset,
            } as CSSProperties
          }
        >
          <div
            className={`sheet-bloom ${b.drift}`}
            style={{
              background: `radial-gradient(circle, ${b.color} 0%, transparent 68%)`,
              opacity: b.opacity,
            }}
          />
        </div>
      ))}
    </>
  );
}
