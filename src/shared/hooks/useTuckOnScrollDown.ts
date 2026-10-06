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
    // The position is read in the scroll event itself (at most once a frame), not in an animation frame: there it would
    // come right after the scroll engine's style writes and make the browser recalculate them early, every frame.
    // Setting the same state again is a no-op, so the chrome only re-renders when it actually tucks or comes back.
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - last;
      if (Math.abs(delta) < 6) return;
      setTucked(delta > 0 && y > threshold);
      last = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return tucked;
}
