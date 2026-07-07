'use client';
import { useLayoutEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';

const STEPS = ['실거래가 조회', '건축물대장 확인', '광고 중개사무소 검증'];

interface ProgressAnimationProps {
  onComplete: () => void;
  stepDurationMs?: number;
}

export function ProgressAnimation({ onComplete, stepDurationMs = 700 }: ProgressAnimationProps) {
  const [completedCount, setCompletedCount] = useState(0);
  const reducedMotion = useReducedMotion();

  // useLayoutEffect + flushSync keep this cascade fully synchronous so a single
  // vi.advanceTimersByTime(...) call can drive all steps to completion in one pass,
  // instead of relying on React's scheduler (MessageChannel) to flush across ticks.
  useLayoutEffect(() => {
    if (completedCount >= STEPS.length) {
      const finishTimer = setTimeout(onComplete, stepDurationMs);
      return () => clearTimeout(finishTimer);
    }
    const timer = setTimeout(() => {
      flushSync(() => setCompletedCount((c) => c + 1));
    }, stepDurationMs);
    return () => clearTimeout(timer);
  }, [completedCount, onComplete, stepDurationMs]);

  return (
    <div className="space-y-4" role="status" aria-label="분석 진행 상황">
      {STEPS.map((label, index) => {
        const done = index < completedCount;
        return (
          <motion.div
            key={label}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: done ? 1 : 0.3 }}
            transition={{ ease: 'easeOut', duration: reducedMotion ? 0 : 0.3 }}
            className="flex items-center gap-3 bg-glass border-glass shadow-glass rounded-2xl px-4 py-3 text-sm"
          >
            <motion.span
              initial={false}
              animate={
                reducedMotion
                  ? { opacity: done ? 1 : 0.4 }
                  : { scale: done ? 1 : 0.85, opacity: done ? 1 : 0.4 }
              }
              transition={{ ease: 'easeOut', duration: 0.25 }}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                done ? 'bg-grad text-white' : 'border border-[var(--color-slate)] text-[var(--color-slate)]'
              }`}
            >
              <Check size={14} />
            </motion.span>
            <span className={done ? 'text-[var(--color-ink)]' : 'text-[var(--color-slate)]'}>{label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
