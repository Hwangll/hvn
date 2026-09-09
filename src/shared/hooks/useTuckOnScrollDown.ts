import { useEffect, useState } from "react";

/**
 * Tucks floating chrome away while the reader scrolls down, and brings it back
 * on the first upward nudge. Stays put under reduced motion so nothing jumps.
 */
export function useTuckOnScrollDown(threshold = 160): boolean {
  const [tucked, setTucked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const delta = y - last;
        if (Math.abs(delta) < 6) return;
        setTucked(delta > 0 && y > threshold);
        last = y;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return tucked;
}
