"use client";
import { AnimatePresence, motion } from "motion/react";
import { MapPin } from "lucide-react";
import type { AddressSuggestion } from "@/lib/kakaoAddressSearch";

/* Suggestion dropdown for the hero address field. The bar itself never
   moves or resizes for this — the list is absolutely positioned against the
   <form> (which stays `position: relative`, `overflow: visible`) and just
   overlays the page below it, capped at 5 rows by the caller. Row reveal is
   adapted from the staggered fade-in pattern in the Apple Spotlight
   reference, trimmed to this app's flat design language (no glass, no
   per-row shadow) and its existing hover/timing tokens. */
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
          onMouseLeave={() => onHighlight(null)}
          className="absolute inset-x-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-[rgba(14,27,51,0.06)] bg-white py-1.5 shadow-[0_20px_48px_-16px_rgba(11,59,167,0.24)]"
        >
          {suggestions.map((suggestion, index) => (
            <motion.li
              key={suggestion.id}
              role="presentation"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.16, ease: "easeOut" }}
            >
              <button
                id={`hero-address-suggestion-${index}`}
                type="button"
                role="option"
                aria-selected={highlightedIndex === index}
                onMouseEnter={() => onHighlight(index)}
                // Keeps focus on the <input> so a click doesn't blur it —
                // blur is what closes the dropdown, and closing before the
                // click handler runs would drop the selection.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect(suggestion)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 ${
                  highlightedIndex === index ? "bg-[rgba(14,27,51,0.07)]" : ""
                }`}
              >
                <MapPin aria-hidden className="size-4 shrink-0 text-(--faint)" />
                <span className="min-w-0">
                  <span className="block truncate text-[14.5px] font-medium">
                    {suggestion.placeName}
                  </span>
                  <span className="block truncate text-[12.5px] text-(--faint)">
                    {suggestion.addressName}
                  </span>
                </span>
              </button>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );
}
