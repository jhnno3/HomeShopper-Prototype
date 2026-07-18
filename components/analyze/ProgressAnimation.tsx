'use client';
import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface ProgressAnimationProps {
  onComplete: () => void;
  durationMs?: number;
}

export function ProgressAnimation({ onComplete, durationMs = 3000 }: ProgressAnimationProps) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(onComplete, durationMs);
    return () => clearTimeout(timer);
  }, [onComplete, durationMs]);

  return (
    <div
      className="flex flex-col-reverse items-center justify-center gap-8"
      role="status"
      aria-live="polite"
    >
      <span className="text-lg font-semibold tracking-tight" style={{ color: 'var(--color-blue)' }}>
        리포트를 준비하고 있어요
      </span>
      <motion.div
        className="bg-grad h-14 w-14"
        animate={
          reducedMotion
            ? { opacity: 1 }
            : { borderRadius: ['20%', '50%', '20%'], rotate: [0, 180, 360] }
        }
        transition={
          reducedMotion ? { duration: 0 } : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
        }
      />
    </div>
  );
}
