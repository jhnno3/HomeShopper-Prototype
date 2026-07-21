"use client";

import { motion, useReducedMotion } from "motion/react";

/* Floating gradient backdrop for the hero — three blurred blobs drifting
   on transform-only loops (x/y/scale). Colors restore the original
   commit's shadcn palette (22eaf7d: Tailwind's blue-500→slate-500,
   pink-500→red-500, green-500→cyan-500) rather than the brand blue/
   violet ramp tried after it. Each blob holds its color pair at full
   strength out to 40% before fading to transparent — a wider solid core
   than a plain center-to-edge fade — so the blobs read as vivid rather
   than washed out. Rendered inside the hero-scoped .ambient-canvas,
   clipped to the hero's own bounds so it scrolls away with the hero
   instead of sitting on a page-wide fixed layer. Respects
   prefers-reduced-motion (renders static blobs). */
const BLOBS = [
  {
    gradient: "radial-gradient(circle, #3b82f6 0%, #64748b 40%, transparent 85%)",
    style: { top: "18%", left: "6%" },
    size: "36rem",
    animate: { x: [0, 90, 0], y: [0, 45, 0], scale: [1, 1.18, 1] },
    duration: 6,
  },
  {
    gradient: "radial-gradient(circle, #ec4899 0%, #ef4444 40%, transparent 85%)",
    style: { top: "34%", left: "40%" },
    size: "32rem",
    animate: { x: [0, -75, 0], y: [0, -45, 0], scale: [1, 1.25, 1] },
    duration: 7.5,
  },
  {
    gradient: "radial-gradient(circle, #22c55e 0%, #06b6d4 40%, transparent 85%)",
    style: { top: "10%", left: "66%" },
    size: "32rem",
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
