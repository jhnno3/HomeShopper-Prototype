"use client";
import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

type Option = {
  label: string;
  onClick: () => void;
  active?: boolean;
};

type Props = {
  options: Option[];
  children: React.ReactNode;
  ariaLabel: string;
  className?: string;
  menuClassName?: string;
};

/** Small glassy select-style menu — trigger label + chevron, spring-animated
 * panel with staggered option reveal. Closes on outside click or Escape. */
export function DropdownMenu({ options, children, ariaLabel, className, menuClassName }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setIsOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        // Smaller and lighter than the plain --ink/font-medium used
        // elsewhere in the bar — at that weight this label read heavier
        // and larger than the placeholder text next to it instead of
        // blending in as a secondary control.
        className="flex items-center gap-1 rounded-full py-1.5 pl-2 pr-1.5 text-[14px] font-normal text-(--muted) transition-colors hover:bg-[rgba(14,27,51,0.05)]"
      >
        {children}
        <motion.span
          className="grid place-items-center"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown className="size-3.5 text-(--faint)" aria-hidden />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="listbox"
            aria-label={ariaLabel}
            initial={{ y: -5, scale: 0.95, opacity: 0, filter: "blur(10px)" }}
            animate={{ y: 0, scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -5, scale: 0.95, opacity: 0, filter: "blur(10px)" }}
            // Plain tween, not a spring — a spring transition on a `filter`
            // (blur) animation can leave Motion unable to detect the exit as
            // "finished", which stalls AnimatePresence and leaves the panel
            // stuck in the DOM after close (aria-expanded flips to false but
            // the element itself never unmounts).
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={cn(
              "absolute left-0 top-[calc(100%+8px)] z-10 flex w-28 flex-col gap-0.5 rounded-2xl border border-[rgba(255,255,255,0.6)] bg-white/90 p-1 text-[15px] shadow-[0_18px_40px_-14px_rgba(11,59,167,0.32)] backdrop-blur-xl",
              menuClassName
            )}
          >
            {/* Plain buttons, not motion.button — a per-item transform
                animation promotes each label to its own compositing layer
                while it plays, which drops text out of subpixel
                anti-aliasing and made 전세/월세 render visibly thinner than
                the rest of the UI. The panel's own entrance animation is
                enough; the options just fade in with it via CSS. */}
            {options.map((option) => (
              <button
                key={option.label}
                type="button"
                role="option"
                aria-selected={option.active}
                onClick={() => {
                  option.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-left transition-colors active:scale-[0.98]",
                  option.active
                    ? "bg-[rgba(10,92,255,0.08)] font-semibold text-(--royal)"
                    : "text-(--ink) hover:bg-[rgba(14,27,51,0.05)]"
                )}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
