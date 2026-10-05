import { useEffect, useMemo, useState } from "react";

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the target moment has passed (or the target is not a real date). */
  isPast: boolean;
}

/** setTimeout's longest delay (about 24.8 days); later moments are waited for in several hops. */
const MAX_TIMEOUT = 2 ** 31 - 1;

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
 * While `ticking` is false (the countdown is off screen) it rests, and it catches up the moment it resumes.
 */
export function useCountdown(isoTarget: string, ticking = true): Countdown {
  const target = useMemo(() => new Date(isoTarget).getTime(), [isoTarget]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!ticking || Number.isNaN(target) || Date.now() >= target) return undefined;
    const tick = () => {
      const next = Date.now();
      setNow(next);
      if (next >= target) window.clearInterval(id);
    };
    const id = window.setInterval(tick, 1000);
    const catchUp = window.setTimeout(tick, 0);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(catchUp);
    };
  }, [target, ticking]);

  return useMemo(() => (Number.isNaN(target) ? split(0) : split(target - now)), [target, now]);
}

/** Whether an ISO moment has passed. It wakes once, when the moment arrives, instead of every second. */
export function useHasPassed(isoTarget: string): boolean {
  const target = useMemo(() => new Date(isoTarget).getTime(), [isoTarget]);
  const [passed, setPassed] = useState(() => Number.isNaN(target) || Date.now() >= target);

  useEffect(() => {
    if (passed || Number.isNaN(target)) return undefined;
    let id = 0;
    const wait = () => {
      id = window.setTimeout(() => {
        if (Date.now() >= target) setPassed(true);
        else wait();
      }, Math.min(Math.max(target - Date.now(), 0), MAX_TIMEOUT));
    };
    wait();
    return () => window.clearTimeout(id);
  }, [passed, target]);

  return passed;
}
