import { useEffect, useMemo, useState } from "react";

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the target moment has passed (or the target is not a real date). */
  isPast: boolean;
}

function split(remaining: number): Countdown {
  if (remaining <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  const total = Math.floor(remaining / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    isPast: false,
  };
}

/**
 * Counts down to an ISO moment, ticking once a second and stopping for good once it arrives.
 * An unparseable target reads as already past, so a broken date never hides content forever.
 */
export function useCountdown(isoTarget: string): Countdown {
  const target = useMemo(() => new Date(isoTarget).getTime(), [isoTarget]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (Number.isNaN(target) || Date.now() >= target) return undefined;
    const id = window.setInterval(() => {
      const next = Date.now();
      setNow(next);
      if (next >= target) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return useMemo(() => (Number.isNaN(target) ? split(0) : split(target - now)), [target, now]);
}
