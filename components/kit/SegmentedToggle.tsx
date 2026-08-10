"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

type Props<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  /** Dimmed and non-interactive — used when link mode owns the search bar. */
  disabled?: boolean;
  /** Width of a single option in px. Fixed rather than measured because the
   * options are absolutely positioned into slots at multiples of it. */
  optionWidth?: number;
  className?: string;
};

/** Collapsed it shows only the selected option as a highlighted chip; hover,
 * focus, or a tap expands it in place to reveal the rest as separately
 * clickable segments, then it shrinks back around whatever was picked. The
 * selected option always occupies the leftmost slot, so picking the other
 * one slides the labels past each other into their new slots.
 *
 * Animation is plain CSS transitions (`transition-all duration-[335ms]` plus a
 * `scale`/`opacity` reveal delayed behind the container's own widening),
 * not a JS animation library — the container grows first and the newly
 * revealed label pops in behind it. Options are absolutely positioned and
 * moved with `translateX` rather than reordered in the DOM, because CSS
 * can't transition a DOM reorder but can transition a transform. */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  disabled = false,
  optionWidth = 48,
  className,
}: Props<T>) {
  const [expanded, setExpanded] = React.useState(false);

  // Selected option owns slot 0; the rest trail off to the right in their
  // original order. Slot index drives translateX, so a change here reads as
  // a slide rather than a swap.
  const slotOf = (option: T) =>
    option === value ? 0 : options.filter((o) => o !== value).indexOf(option) + 1;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      // Hover is the primary affordance on pointer devices; focus mirrors it
      // for keyboard, and the click handler below covers touch, where the
      // first tap on the collapsed chip expands instead of re-selecting.
      onMouseEnter={() => !disabled && setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocusCapture={() => !disabled && setExpanded(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setExpanded(false);
      }}
      className={cn(
        "relative shrink-0 transition-all duration-[335ms] motion-reduce:transition-none",
        disabled && "pointer-events-none opacity-40",
        className
      )}
      style={{ width: expanded ? options.length * optionWidth : optionWidth }}
    >
      {/* Sets the row's height from the real label metrics, since every
          option below is absolutely positioned and contributes none. */}
      <span aria-hidden className="invisible block py-1.5 text-center text-[14px]">
        {value}
      </span>

      {/* Track behind the segments — only earns its keep once there is more
          than one segment to group, so it fades in with the expansion. */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-full bg-[rgba(14,27,51,0.04)] transition-all duration-[335ms] motion-reduce:transition-none",
          expanded ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Highlight pill for the selected segment — always docked at the left
          edge and fully round, since the selected option always holds slot 0
          and so never needs an edge squared off against a neighbor. */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 rounded-full bg-white shadow-[0_1px_4px_rgba(14,27,51,0.12)]"
        style={{ width: optionWidth }}
      />

      {options.map((option) => {
        const selected = option === value;
        const shown = expanded || selected;
        return (
          <button
            key={option}
            type="button"
            disabled={disabled}
            role="radio"
            aria-checked={selected}
            tabIndex={disabled || !shown ? -1 : 0}
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
              "absolute inset-y-0 left-0 z-10 whitespace-nowrap rounded-full text-center text-[14px] transition-all duration-[335ms] motion-reduce:transition-none",
              selected
                ? "font-medium text-(--royal)"
                : "font-normal text-(--faint) hover:text-(--muted)"
            )}
            style={{
              width: optionWidth,
              // translateX places the option in its slot; scale is the
              // reveal itself, so a hidden option collapses to a point at
              // its own slot instead of leaving a clickable dead zone.
              transform: `translateX(${slotOf(option) * optionWidth}px) scale(${shown ? 1 : 0})`,
              opacity: shown ? 1 : 0,
              // Revealing waits for the container to widen; hiding leads, so
              // the label is gone before the container closes over it.
              transitionDelay: shown && expanded ? "70ms" : "0ms",
            }}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
