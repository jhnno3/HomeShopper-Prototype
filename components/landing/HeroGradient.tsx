"use client";

import { motion, useReducedMotion } from "motion/react";

/* Floating gradient backdrop for the hero. Three large, blurred blobs
   drifting on transform-only loops (x/y/scale) so the animation stays on
   the compositor. Adapted from a shadcn floating-gradient pattern,
   recolored from its blue/pink/green mix to the site's actual brand
   ramp — linear-gradient(135deg, #0083FF, #4C2CE2), the same blue→purple
   gradient <InkBackground /> uses elsewhere (see --grad-primary and the
   --ink-* stops in theme.css) — so the hero reads as one consistent
   system with the rest of the site instead of introducing a new palette.
   Rendered inside the hero-scoped .ambient-canvas, clipped to the hero's
   own bounds so it scrolls away with the hero instead of sitting on a
   page-wide fixed layer. Respects prefers-reduced-motion (renders static
   blobs). */

/* Three anchors arranged in a loose triangle around the hero's center —
   not pushed out to the corners/edges (that read as blobs scattered
   "side to side"), but each pair's centers still sit farther apart than
   one blob's radius, so they graze and blend at the edges without
   stacking directly on top of each other. */
const BLOBS = [
  {
    // blue end of the ramp — upper
    gradient: "linear-gradient(90deg, #73bbff, #0083ff)",
    position: { top: "8%", left: "32%" },
    animate: { x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] },
    duration: 8,
  },
  {
    // purple end of the ramp — lower right
    gradient: "linear-gradient(90deg, #2658f0, #4c2ce2)",
    position: { top: "42%", left: "50%" },
    animate: { x: [0, -50, 0], y: [0, -40, 0], scale: [1, 1.2, 1] },
    duration: 10,
  },
  {
    // soft violet, bridges blue and purple — lower left
    gradient: "linear-gradient(90deg, #8b76ec, #73bbff)",
    position: { top: "42%", left: "12%" },
    animate: { x: [0, 40, 0], y: [0, -50, 0], scale: [1, 1.1, 1] },
    duration: 12,
  },
];

export function HeroGradient() {
  const reduce = useReducedMotion();

  return (
    <>
      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute h-[36vw] min-h-[340px] w-[36vw] min-w-[340px] rounded-full opacity-30 blur-[90px]"
          style={{ ...blob.position, backgroundImage: blob.gradient }}
          animate={reduce ? undefined : blob.animate}
          transition={{ duration: blob.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}
