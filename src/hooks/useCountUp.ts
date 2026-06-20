import { useEffect, useRef, useState } from 'react';

interface CountUpOptions {
  duration?: number;
  decimals?: number;
}

/**
 * Animates a number from 0 to `target` using an ease-out curve.
 * Powers the animated KPI counters on the dashboard.
 */
export function useCountUp(target: number, { duration = 900, decimals = 0 }: CountUpOptions = {}): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const factor = 10 ** decimals;

    const tick = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic for a confident, decelerating finish.
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased * factor) / factor);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, decimals]);

  return value;
}
