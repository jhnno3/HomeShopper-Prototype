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
 * focus, or a tap expands it in place to reveal the rest as separately
 * clickable segments, then it shrinks back around whatever was picked. The
 * selected option always renders in the leftmost slot — picking the other
 * one reorders the row (via `layout`, so it slides rather than snaps)
 * instead of leaving labels pinned to fixed positions and only the
 * highlight moving between them. */
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

  // Selected option first, so it always occupies the left (highlighted)
  // slot and the rest trail off to the right in their original order.
  const orderedOptions = React.useMemo(
    () => [value, ...options.filter((o) => o !== value)],
    [options, value]
  );

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

      {orderedOptions.map((option) => {
        const selected = option === value;
        const shown = expanded || selected;
        return (
          <motion.button
            key={option}
            // Only the position is layout-animated, not the size — width is
            // already driven by the `animate` prop below, and a full
            // `layout` would try to own that too and fight it. With this,
            // reordering (selected moving to the left slot) slides the
            // labels across on the same curve as everything else instead of
            // swapping them between slots in a single frame.
            layout="position"
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
                : "font-normal text-(--faint) hover:text-(--muted)"
            )}
            animate={{ width: shown ? optionWidth : 0, opacity: shown ? 1 : 0 }}
            transition={transition}
          >
            {option}
          </motion.button>
        );
      })}

      {/* Highlight pill for the selected segment. Always docked at the left
          edge and fully round — the selected option is always ordered
          first, so there's no "which slot is it in" calculation left to
          do, and no need to square off an inner edge against a neighbor. */}
      <motion.span
        aria-hidden
        className="absolute inset-y-0 left-0 rounded-full bg-white shadow-[0_1px_4px_rgba(14,27,51,0.12)]"
        style={{ width: optionWidth }}
        transition={transition}
      />
    </div>
  );
}
