"use client";
import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

type Props<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  /** Width of a single option in px. Fixed rather than measured because the
   * collapse animates width to 0 — `auto` has nothing to tween toward. */
  optionWidth?: number;
  className?: string;
};

/** Collapsed it shows only the selected option as a highlighted chip; hover,
 * focus, or a tap expands it in place to reveal the rest (전세 | 월세) as
 * separately clickable segments, then it shrinks back around whatever was
 * picked. Same idea as the width-transition icon menus — the container grows
 * and the hidden content scales in behind it — but driven by Motion so the
 * expand and the surrounding reflow are one motion. */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  optionWidth = 48,
  className,
}: Props<T>) {
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = React.useState(false);

  const transition = reduce
    ? { duration: 0.12 }
    : { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      // Hover is the primary affordance on pointer devices; focus mirrors it
      // for keyboard, and the click handler below covers touch, where the
      // first tap on the collapsed chip expands instead of re-selecting.
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocusCapture={() => setExpanded(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setExpanded(false);
      }}
      className={cn("relative flex shrink-0 items-center", className)}
    >
      {/* Track behind the segments — only earns its keep once there is more
          than one segment to group, so it fades in with the expansion. */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full bg-[rgba(14,27,51,0.04)]"
        animate={{ opacity: expanded ? 1 : 0 }}
        transition={transition}
      />

      {options.map((option, i) => {
        const selected = option === value;
        const shown = expanded || selected;
        return (
          <React.Fragment key={option}>
            {i > 0 && (
              <motion.span
                aria-hidden
                className="h-3.5 shrink-0 bg-[rgba(14,27,51,0.14)]"
                animate={{ width: expanded ? 1 : 0, opacity: expanded ? 1 : 0 }}
                transition={transition}
              />
            )}
            <motion.button
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected || expanded ? 0 : -1}
              onClick={() => {
                // A tap on the collapsed chip is a request to see the other
                // options, not to re-pick the one already selected.
                if (!expanded) {
                  setExpanded(true);
                  return;
                }
                onChange(option);
                setExpanded(false);
              }}
              className={cn(
                "relative z-10 overflow-hidden whitespace-nowrap rounded-full py-1.5 text-center text-[14px] transition-colors",
                selected
                  ? "font-medium text-(--royal)"
                  : "font-normal text-(--muted) hover:text-(--ink)"
              )}
              animate={{ width: shown ? optionWidth : 0, opacity: shown ? 1 : 0 }}
              transition={transition}
            >
              {option}
            </motion.button>
          </React.Fragment>
        );
      })}

      {/* Highlight pill tracking the selected segment. Separate from the
          button's own background so it slides between segments when the
          choice changes instead of cross-fading. Collapsed it always sits at
          0 — the unselected segments have zero width, so the selected one is
          flush against the left edge whichever one it is. Expanded, the edge
          facing the other segments squares off instead of staying rounded,
          so the pill reads as "this one, out of the group" rather than a
          free-floating chip that happens to be next to them. */}
      <motion.span
        aria-hidden
        className="absolute inset-y-0 bg-[rgba(10,92,255,0.1)]"
        style={{ width: optionWidth }}
        animate={{
          left: expanded ? options.indexOf(value) * (optionWidth + 1) : 0,
          borderTopLeftRadius: !expanded || options.indexOf(value) === 0 ? 999 : 0,
          borderBottomLeftRadius: !expanded || options.indexOf(value) === 0 ? 999 : 0,
          borderTopRightRadius: !expanded || options.indexOf(value) === options.length - 1 ? 999 : 0,
          borderBottomRightRadius: !expanded || options.indexOf(value) === options.length - 1 ? 999 : 0,
        }}
        transition={transition}
      />
    </div>
  );
}
