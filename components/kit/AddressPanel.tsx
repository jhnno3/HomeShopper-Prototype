'use client';
import { motion } from 'motion/react';
import { ChevronDown, MapPin } from 'lucide-react';

// Panel open/close motion — lifted verbatim from <FaqAccordion /> so every
// disclosure moment in the app shares one motion language.
const PANEL_EASE = [0.16, 1, 0.3, 1] as const;
const EXPAND_SPRING = { type: 'spring' as const, stiffness: 150, damping: 26, mass: 1.05 };
const COLLAPSE_SPRING = { type: 'spring' as const, stiffness: 190, damping: 30, mass: 1.1 };

const fieldInputBase =
  'h-11 w-full rounded-xl border border-[#E7E9F0] bg-white px-3.5 text-base text-[var(--color-ink)] outline-none transition-colors duration-150 placeholder:text-[#9AA2B1] focus:border-[var(--color-blue)] focus:bg-white focus:ring-2 focus:ring-[rgba(0,131,255,0.16)]';

/**
 * Toggle button + disclosure panel for 동/호수, shared by the reserve form
 * and the report page's upgrade card — both gate their Kakao login button
 * on these two fields being filled in.
 */
export function AddressPanel({
  idPrefix,
  open,
  onToggle,
  dong,
  ho,
  onDongChange,
  onHoChange,
  reduceMotion,
}: {
  /** Keeps element ids unique when the panel appears more than once in the app. */
  idPrefix: string;
  open: boolean;
  onToggle: () => void;
  dong: string;
  ho: string;
  onDongChange: (value: string) => void;
  onHoChange: (value: string) => void;
  reduceMotion: boolean;
}) {
  const panelId = `${idPrefix}-address-panel`;
  const triggerId = `${idPrefix}-address-trigger`;
  const dongId = `${idPrefix}-dong`;
  const hoId = `${idPrefix}-ho`;

  return (
    <div className="rounded-xl border border-[#E7E9F0] bg-[#F7F8FB]">
      <button
        id={triggerId}
        type="button"
        aria-controls={panelId}
        aria-expanded={open}
        onClick={onToggle}
        className="flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3.5 text-[13.5px] font-semibold text-[var(--color-ink)] transition-colors duration-150"
      >
        <span className="flex items-center gap-1.5">
          <MapPin aria-hidden className="size-4 text-[var(--color-blue)]" strokeWidth={2} />
          정확한 동·호수 입력하기
        </span>
        <ChevronDown
          aria-hidden
          className={`size-4 shrink-0 text-[#9AA2B1] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? 'rotate-180 text-[var(--color-blue)]' : ''
          }`}
        />
      </button>

      <motion.div
        animate={{ height: open ? 'auto' : 0 }}
        aria-labelledby={triggerId}
        className="overflow-hidden"
        id={panelId}
        initial={false}
        role="region"
        transition={{ height: reduceMotion ? { duration: 0 } : open ? EXPAND_SPRING : COLLAPSE_SPRING }}
      >
        <motion.div
          animate={{ opacity: open ? 1 : 0, y: open ? 0 : -6 }}
          aria-hidden={!open}
          className="grid grid-cols-2 gap-2.5 px-3.5 pb-3.5"
          initial={false}
          inert={open ? undefined : true}
          transition={{
            opacity: {
              duration: reduceMotion ? 0 : open ? 0.38 : 0.2,
              ease: PANEL_EASE,
              delay: reduceMotion ? 0 : open ? 0.06 : 0,
            },
            y: reduceMotion ? { duration: 0 } : open ? EXPAND_SPRING : COLLAPSE_SPRING,
          }}
        >
          <div>
            <label htmlFor={dongId} className="text-[13px] font-semibold text-[var(--color-ink)]">
              동
            </label>
            <div className="mt-1">
              <input
                id={dongId}
                value={dong}
                onChange={(e) => onDongChange(e.target.value)}
                placeholder="101동"
                tabIndex={open ? 0 : -1}
                className={fieldInputBase}
              />
            </div>
          </div>
          <div>
            <label htmlFor={hoId} className="text-[13px] font-semibold text-[var(--color-ink)]">
              호수
            </label>
            <div className="mt-1">
              <input
                id={hoId}
                value={ho}
                onChange={(e) => onHoChange(e.target.value)}
                placeholder="1502호"
                tabIndex={open ? 0 : -1}
                className={fieldInputBase}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
