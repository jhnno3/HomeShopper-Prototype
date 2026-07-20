import { CardBloom } from '@/components/reserve/ReserveBackdrop';

/**
 * Fractal-noise grain, tiled at low opacity with `mix-blend-overlay` so it
 * reads as paper texture rather than dirt. Encoded inline as an SVG data URI —
 * no network request, no binary asset to track in the repo.
 */
const GRAIN_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>
      <filter id='n'>
        <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch' />
        <feColorMatrix type='saturate' values='0' />
      </filter>
      <rect width='100%' height='100%' filter='url(#n)' />
    </svg>`
  );

function CardGrain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[28px] opacity-[0.05] mix-blend-overlay"
      style={{ backgroundImage: `url("${GRAIN_SVG}")`, backgroundRepeat: 'repeat', backgroundSize: '180px 180px' }}
    />
  );
}

/**
 * The card, with two paper layers fanned out behind it. Each layer is the
 * exact same size as the front card (inset-0, not shrunk or top-shifted) and
 * only rotated around its own center — that's what makes the rotated corners
 * peek out past every edge of the front card, like a dealt stack of pages,
 * instead of only overhanging the top. Both layers rotate the same direction
 * (progressively less as they get closer to the front) so the stack reads as
 * one deck fanned one way, not two cards splayed to opposite sides. The
 * layers are purely decorative and carry no content, so they're hidden from AT.
 *
 * The front card itself is real glass — translucent fill plus backdrop blur
 * and saturation boost, so the bloom behind it tints through — not just the
 * paper layers behind it. Kept at 85% opacity rather than the ~70% the
 * site-wide .bg-glass utility uses, since a form's labels and input text need
 * more contrast than a decorative panel does.
 *
 * Shared by the reserve form and its success card (and the upcoming premium
 * success card) so every 카드 스택 moment in the app reads as one object.
 */
export function CardStack({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <CardBloom />
      <div
        aria-hidden
        className="absolute inset-0 rounded-[28px] bg-white/20 shadow-[0_8px_24px_-18px_rgba(23,31,68,0.35)]"
        style={{ transform: 'rotate(-8deg)' }}
      />
      <div
        aria-hidden
        className="absolute inset-0 rounded-[28px] bg-white/40 shadow-[0_10px_28px_-20px_rgba(23,31,68,0.4)]"
        style={{ transform: 'rotate(-4deg)' }}
      />
      <div className="relative rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_28px_64px_-28px_rgba(23,31,68,0.32),0_2px_6px_rgba(23,31,68,0.04)] backdrop-blur-xl backdrop-saturate-150">
        <CardGrain />
        {children}
      </div>
    </div>
  );
}
