import type { CSSProperties } from "react";

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
 * The gradient bloom. Sized off its positioned parent with a generous negative
 * inset so it spills past every edge of the card no matter how tall the card
 * grows — the color must be visible around the card, never trapped under it.
 *
 * Several overlapping radial pools rather than one wash, so the halo has some
 * color variation around the card instead of a flat diagonal — but each pool
 * is wide and blurred with a long, gradual fade (mid-stop pushed to ~55%,
 * transparent past ~90%) and heavily overlapped with its neighbors, so they
 * melt into each other instead of reading as separate blobs with visible seams.
 */
export function CardBloom() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -inset-x-[22%] -top-[14%] -bottom-[10%]"
      style={
        {
          filter: "blur(72px)",
          background: [
            // cool blue high and left, where the light falls on the card
            "radial-gradient(46% 32% at 20% 12%, rgba(96,175,255,0.9) 0%, rgba(96,175,255,0.4) 55%, transparent 90%)",
            // violet down the right side
            "radial-gradient(44% 36% at 88% 38%, rgba(132,109,236,0.75) 0%, rgba(132,109,236,0.3) 58%, transparent 90%)",
            // warm blush low and centered, the quiet counterweight
            "radial-gradient(50% 30% at 54% 92%, rgba(232,160,208,0.85) 0%, rgba(232,160,208,0.35) 55%, transparent 90%)",
            // second blue keeping the top-right from going flat
            "radial-gradient(40% 24% at 74% 6%, rgba(120,196,255,0.6) 0%, transparent 88%)",
            // violet pooling bottom-left so the blush isn't isolated
            "radial-gradient(36% 26% at 14% 80%, rgba(150,130,240,0.5) 0%, transparent 88%)",
          ].join(","),
        } as CSSProperties
      }
    />
  );
}
