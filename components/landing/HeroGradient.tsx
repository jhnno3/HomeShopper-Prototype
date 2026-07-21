"use client";

import { motion, useReducedMotion } from "motion/react";

/* Floating gradient backdrop for the hero — the original shadcn
   floating-gradient blob pattern (fixed h-96 w-96 blobs, opacity-20,
   blur-3xl, Tailwind's own blue/slate, pink/red, and green/cyan mix)
   rather than a brand-recolored variant. Rendered inside the hero-scoped
   .ambient-canvas, clipped to the hero's own bounds so it scrolls away
   with the hero instead of sitting on a page-wide fixed layer. Respects
   prefers-reduced-motion (renders static blobs). */
const BLOBS = [
  {
    className: "bg-gradient-to-r from-blue-500 to-slate-500",
    style: { top: "10%", left: "10%" },
    animate: { x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.2, 1] },
    duration: 8,
  },
  {
    className: "bg-gradient-to-r from-pink-500 to-red-500",
    style: { bottom: "10%", right: "10%" },
    animate: { x: [0, -100, 0], y: [0, -50, 0], scale: [1, 1.3, 1] },
    duration: 10,
  },
  {
    className: "bg-gradient-to-r from-green-500 to-cyan-500",
    style: { top: "50%", left: "50%" },
    animate: { x: [0, 50, 0], y: [0, -100, 0], scale: [1, 1.1, 1] },
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
          className={`absolute h-96 w-96 rounded-full opacity-20 blur-3xl ${blob.className}`}
          style={blob.style}
          animate={reduce ? undefined : blob.animate}
          transition={{ duration: blob.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}
