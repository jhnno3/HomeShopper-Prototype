"use client";
import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { MapPin } from "lucide-react";
import type { AddressSuggestion } from "@/lib/kakaoAddressSearch";

/* Suggestion dropdown for the hero address field, desktop/tablet only — the
   mobile equivalent is the full-screen MobileSearchOverlay. The bar itself
   never moves or resizes for this — the list is absolutely positioned
   against the <form> (which stays `position: relative`, `overflow:
   visible`) and just overlays the page below it, capped to 4 rows by the
   caller since a floating dropdown only has so much room below it before
   running past the fold. Row reveal is adapted from the staggered fade-in
   pattern in the Apple Spotlight reference, trimmed to this app's flat
   design language (no glass, no per-row shadow) and its existing
   hover/timing tokens. */
export function AddressSuggestions({
  open,
  suggestions,
  highlightedIndex,
  onHighlight,
  onSelect,
}: {
  open: boolean;
  suggestions: AddressSuggestion[];
  highlightedIndex: number | null;
  onHighlight: (index: number | null) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
}) {
  const listRef = React.useRef<HTMLUListElement>(null);
  const [maxHeight, setMaxHeight] = React.useState<number>();

  /* The hero is sized so all four rows normally fit under the bar, but a
     short window (or a zoomed-in one) can still leave less room than the
     list needs. Rather than let it run past the fold where the last rows
     are unreachable, cap it to whatever space is actually below the bar and
     let it scroll. Re-measured on resize and on scroll, since the hero
     shifts under its own scroll animation while the list is open. */
  React.useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const el = listRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      setMaxHeight(Math.max(140, window.innerHeight - top - 16));
    };
    measure();
    // Again next frame: the first pass can land before the entrance
    // transform settles, which reads as a lower top edge and would clamp
    // the list shorter than the space actually allows.
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, suggestions]);

  return (
    <AnimatePresence>
      {open && suggestions.length > 0 && (
        <motion.ul
          id="hero-address-suggestions"
          role="listbox"
          aria-label="주소 추천 목록"
          initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          ref={listRef}
          onMouseLeave={() => onHighlight(null)}
          style={{ maxHeight }}
          className="absolute inset-x-0 top-[calc(100%+8px)] z-30 overflow-y-auto overscroll-contain rounded-2xl border border-[rgba(14,27,51,0.06)] bg-white py-1.5 shadow-[0_20px_48px_-16px_rgba(11,59,167,0.24)]"
        >
          {suggestions.map((suggestion, index) => (
            <motion.li
              key={suggestion.id}
              role="presentation"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.16, ease: "easeOut" }}
            >
              <SuggestionRow
                id={`hero-address-suggestion-${index}`}
                suggestion={suggestion}
                selected={highlightedIndex === index}
                onMouseEnter={() => onHighlight(index)}
                onSelect={() => onSelect(suggestion)}
              />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );
}

/* One suggestion row, shared by the desktop dropdown above and the
   small-screen full-screen search page (MobileSearchOverlay) — the two
   containers differ (floating card vs. flat full-bleed list) but a row
   reads identically in both, and the padding is generous enough to stay a
   comfortable touch target. `size` bumps the type and spacing for the
   full-screen list, where rows are the whole page rather than a dropdown. */
export function SuggestionRow({
  id,
  suggestion,
  selected,
  size = "compact",
  onMouseEnter,
  onSelect,
}: {
  id?: string;
  suggestion: AddressSuggestion;
  selected: boolean;
  size?: "compact" | "roomy";
  onMouseEnter?: () => void;
  onSelect: () => void;
}) {
  const roomy = size === "roomy";
  return (
    <button
      id={id}
      type="button"
      role="option"
      aria-selected={selected}
      onMouseEnter={onMouseEnter}
      // Keeps focus on the <input> so a click doesn't blur it — blur is
      // what closes the dropdown, and closing before the click handler
      // runs would drop the selection.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 text-left transition-colors duration-150 ${
        roomy ? "px-5 py-3.5" : "px-4 py-2.5"
      } ${selected ? "bg-[rgba(14,27,51,0.07)]" : ""}`}
    >
      <MapPin
        aria-hidden
        className={`shrink-0 text-(--royal) ${roomy ? "size-[18px]" : "size-4"}`}
      />
      <span className="min-w-0 flex-1">
        {/* Name and category share a line, category pushed right by
            ml-auto. min-w-0 on the name lets it truncate first so a long
            name never squeezes the category out. */}
        <span className="flex items-baseline gap-3">
          <span
            className={`min-w-0 truncate font-medium ${
              roomy ? "text-[16px]" : "text-[14.5px]"
            }`}
          >
            {suggestion.placeName}
          </span>
          {suggestion.category && (
            <span
              className={`ml-auto shrink-0 text-(--faint) ${
                roomy ? "text-[12.5px]" : "text-[11.5px]"
              }`}
            >
              {suggestion.category}
            </span>
          )}
        </span>
        <span
          className={`block truncate text-(--faint) ${
            roomy ? "mt-0.5 text-[13.5px]" : "text-[12.5px]"
          }`}
        >
          {suggestion.addressName}
        </span>
      </span>
    </button>
  );
}
