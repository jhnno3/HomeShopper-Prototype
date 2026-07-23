"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * The reserve page's backdrop, in two parts.
 *
 * Deliberately *not* the site-wide <InkBackground /> — that one is an ambient,
 * full-page atmosphere. Here the page is a flat off-white field and the only
 * color is one soft bloom haloing the card, so the card reads as the single
 * object on screen. InkBackground opts out of /reserve for this reason.
 */

/** Flat field behind everything. */
export function ReserveBackdrop() {
  return <div className="pointer-events-none absolute inset-0 bg-[#F1F2F5]" aria-hidden />;
}

/**
 * The gradient bloom, as five discrete drifting blobs — same transform-only
 * x/y loop technique as <HeroGradient />, so the reserve card's halo moves
 * with the same rhythm as the hero's ambient blobs instead of sitting inert.
 * Each blob keeps its original color/alpha/position from the old single-
 * layer version (so the halo's shape and balance around the card don't
 * change), just split into its own positioned, independently-drifting div.
 * Long, offset durations keep the drift from ever reading as synchronized.
 */
const BLOBS = [
  // cool blue on the left, sunk down into the card's body rather than its header
  {
    gradient: "radial-gradient(circle, rgba(96,175,255,0.62) 0%, rgba(96,175,255,0.26) 55%, transparent 90%)",
    style: { top: "26%", left: "-4%" },
    size: "26rem",
    animate: { x: [0, 26, 0], y: [0, 18, 0] },
    duration: 16,
  },
  // violet down the right side
  {
    gradient: "radial-gradient(circle, rgba(132,109,236,0.5) 0%, rgba(132,109,236,0.19) 58%, transparent 90%)",
    style: { top: "22%", left: "68%" },
    size: "25rem",
    animate: { x: [0, -22, 0], y: [0, 20, 0] },
    duration: 19,
  },
  // warm blush low and centered, the quiet counterweight
  {
    gradient: "radial-gradient(circle, rgba(232,160,208,0.56) 0%, rgba(232,160,208,0.22) 56%, transparent 90%)",
    style: { top: "74%", left: "32%" },
    size: "27rem",
    animate: { x: [0, 24, 0], y: [0, -16, 0] },
    duration: 21,
  },
  // second blue, a subtle top accent so the header isn't left toneless
  {
    gradient: "radial-gradient(circle, rgba(120,196,255,0.28) 0%, transparent 85%)",
    style: { top: "6%", left: "60%" },
    size: "16rem",
    animate: { x: [0, 18, 0], y: [0, 14, 0] },
    duration: 14,
  },
  // violet pooling bottom-left so the blush isn't isolated
  {
    gradient: "radial-gradient(circle, rgba(150,130,240,0.32) 0%, transparent 85%)",
    style: { top: "62%", left: "0%" },
    size: "17rem",
    animate: { x: [0, -16, 0], y: [0, -14, 0] },
    duration: 17,
  },
];

export function CardBloom() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute -inset-x-[22%] -top-[14%] -bottom-[10%]">
      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[84px] will-change-transform"
          style={{ ...blob.style, height: blob.size, width: blob.size, backgroundImage: blob.gradient }}
          animate={reduce ? undefined : blob.animate}
          transition={{ duration: blob.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
