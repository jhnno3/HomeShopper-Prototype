"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import type { AddressSuggestion } from "@/lib/kakaoAddressSearch";
import { SuggestionRow } from "./AddressSuggestions";

/* Small-screen search mode. On a phone the hero's pill bar is too cramped
   to type an address into and read a dropdown under at the same time, so
   focusing it swaps the whole viewport for a page dedicated to searching —
   the pattern every Korean map/portal app uses. The bar itself stays
   untouched underneath; this is a separate surface layered over it, and
   picking a result closes it and leaves the chosen address in the bar. */
export function MobileSearchOverlay({
  open,
  value,
  onValueChange,
  suggestions,
  error,
  onSelect,
  onSubmit,
  onClose,
}: {
  open: boolean;
  value: string;
  onValueChange: (next: string) => void;
  suggestions: AddressSuggestion[];
  error: string | null;
  onSelect: (suggestion: AddressSuggestion) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  /* Portaled to <body> rather than rendered in place. The hero wraps its
     content in a `relative z-10` box (and animates it under `hero-pull`),
     both of which open a stacking context — a `fixed inset-0` child of
     that box is trapped inside it, so the sticky `z-40` navbar at the root
     painted straight over this overlay's header. */

  /* Autofocus can't live on the <input> itself: the element mounts with
     the overlay, and focusing it in the same frame as the entrance
     transform makes mobile Safari scroll the still-moving element into
     view, leaving the page offset by a few px once it settles. */
  React.useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open]);

  /* The overlay is the whole viewport, so the hero behind it must not
     scroll under the keyboard or the rubber-band bounce shows the page
     sliding around behind a fixed surface. */
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // No document to portal into on the server pass. The portal itself adds
  // no DOM while closed, so the hydration render still matches.
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="주소 검색"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
          }}
          /* `v3` re-enters the token scope: --royal/--ink/--faint are
             declared on `.v3` in landing.css, and portaling to <body>
             leaves that subtree, so without it every token resolves to
             nothing and the surface falls back to UA defaults. */
          className="v3 fixed inset-0 z-50 flex flex-col bg-white sm:hidden"
          // `.v3` also sets `position: relative`, and landing.css loads
          // after the utility layer, so the class would win over `fixed`
          // and drop the overlay back into page flow. Inline style outranks
          // both.
          style={{ position: "fixed" }}
        >
          <div className="flex items-center gap-2 px-3 pt-3 pb-2">
            <button
              type="button"
              aria-label="검색 닫기"
              onClick={onClose}
              className="grid size-10 shrink-0 place-items-center rounded-full text-(--ink) transition-colors duration-150 active:bg-[rgba(14,27,51,0.07)]"
            >
              <svg
                className="size-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>

            <form
              className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-full bg-[rgba(14,27,51,0.05)] pl-4 pr-2"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-label="매물 주소"
                aria-expanded={suggestions.length > 0}
                aria-controls="mobile-address-suggestions"
                aria-autocomplete="list"
                placeholder="매물 주소를 입력하세요"
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                className="search-page-input h-full min-w-0 flex-1 bg-transparent text-[16px]"
              />
              <button
                type="submit"
                aria-label="분석하기"
                className="grid size-9 shrink-0 place-items-center rounded-full text-(--royal) transition-colors duration-150 active:bg-[rgba(14,27,51,0.07)]"
              >
                <svg
                  className="size-[22px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </form>
          </div>

          {error && (
            <p
              role="alert"
              className="px-5 pb-1 text-[13px] font-semibold text-[var(--color-danger)]"
            >
              {error}
            </p>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8">
            {suggestions.length > 0 ? (
              <ul
                id="mobile-address-suggestions"
                role="listbox"
                aria-label="주소 추천 목록"
                className="pt-1"
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
                      suggestion={suggestion}
                      selected={false}
                      size="roomy"
                      onSelect={() => onSelect(suggestion)}
                    />
                  </motion.li>
                ))}
              </ul>
            ) : (
              /* Stands in for the recent-searches list this pattern
                 normally opens onto. Nothing is stored between visits, so
                 rather than leave the page blank it says so plainly and
                 points at what to do next. */
              <div className="flex flex-col items-center gap-2 px-8 pt-24 text-center">
                <p className="text-[15px] font-bold">최근 검색어 내역이 없습니다.</p>
                <p className="text-[13.5px] leading-relaxed text-(--faint)">
                  분석할 매물의 주소나 건물 이름을 입력하면
                  <br />
                  추천 목록이 나타납니다.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
