"use client";

import { motion, useReducedMotion } from "motion/react";

/* Floating gradient backdrop for the hero — three blurred blobs drifting
   on transform-only loops (x/y/scale). Colors match the brand blue/
   violet ramp from the connect-analyze-report-api branch's HeroGradient
   (blue #73bbff→#0083ff, purple #2658f0→#4c2ce2, soft violet bridging
   the two #8b76ec→#73bbff) — the same linear-gradient(135deg, #0083FF,
   #4C2CE2) ramp <InkBackground /> uses elsewhere. Rendered inside the
   hero-scoped .ambient-canvas, clipped to the hero's own bounds so it
   scrolls away with the hero instead of sitting on a page-wide fixed
   layer. Respects prefers-reduced-motion (renders static blobs). */
const BLOBS = [
  {
    gradient: "radial-gradient(circle, #8b76ec 10%, #73bbff 40%, transparent 100%)",
    style: { top: "0%", left: "0%" },
    size: "36rem",
    animate: { x: [0, 90, 0], y: [0, 45, 0], scale: [1, 1.18, 1] },
    duration: 6,
  },
  {
    gradient: "radial-gradient(circle, #73bbff 0%, #0083ff 20%, transparent 100%)",
    style: { top: "20%", left: "32%" },
    size: "45rem",
    animate: { x: [0, -75, 0], y: [0, -45, 0], scale: [1, 1.25, 1] },
    duration: 7.5,
  },
  {
    gradient: "radial-gradient(circle, #2658f0 0%, #4c2ce2 5%, transparent 250%)",
    style: { top: "45%", left: "75%" },
    size: "45rem",
    animate: { x: [0, 60, 0], y: [0, 45, 0], scale: [1, 1.15, 1] },
    duration: 9,
  },
];

export function HeroGradient() {
  const reduce = useReducedMotion();

  return (
    <>
      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-45 blur-[96px]"
          style={{ ...blob.style, height: blob.size, width: blob.size, backgroundImage: blob.gradient }}
          animate={reduce ? undefined : blob.animate}
          transition={{ duration: blob.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}
