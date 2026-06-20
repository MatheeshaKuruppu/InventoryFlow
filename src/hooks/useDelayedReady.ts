import { useEffect, useState } from 'react';

/**
 * Returns `false` for `delay` ms after mount, then `true`. Used to show
 * skeleton loaders briefly so data-heavy pages settle gracefully.
 */
export function useDelayedReady(delay = 450): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return ready;
}
