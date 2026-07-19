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
 */
export function CardBloom() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -inset-x-[22%] -top-[14%] -bottom-[10%]"
      style={
        {
          filter: "blur(48px)",
          background: [
            // cool blue high and left, where the light falls on the card
            "radial-gradient(40% 26% at 20% 12%, rgba(96,175,255,0.95) 0%, rgba(96,175,255,0.45) 45%, transparent 76%)",
            // violet down the right side
            "radial-gradient(38% 30% at 90% 40%, rgba(132,109,236,0.8) 0%, rgba(132,109,236,0.34) 48%, transparent 78%)",
            // warm blush low and centered, the quiet counterweight
            "radial-gradient(44% 24% at 54% 94%, rgba(232,160,208,0.9) 0%, rgba(232,160,208,0.4) 46%, transparent 78%)",
            // second blue keeping the top-right from going flat
            "radial-gradient(34% 18% at 74% 4%, rgba(120,196,255,0.7) 0%, transparent 76%)",
            // violet pooling bottom-left so the blush isn't isolated
            "radial-gradient(30% 20% at 14% 82%, rgba(150,130,240,0.6) 0%, transparent 78%)",
          ].join(","),
        } as CSSProperties
      }
    />
  );
}
