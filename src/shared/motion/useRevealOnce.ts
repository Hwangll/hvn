import { useEffect, useState, type RefObject } from "react";

/**
 * True from the moment the element is first seen, and for good. Browsers without IntersectionObserver (and tests)
 * start revealed, so an entrance can never keep content hidden.
 */
export function useRevealOnce(ref: RefObject<Element | null>, threshold = 0.35): boolean {
  const [revealed, setRevealed] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const element = ref.current;
    if (revealed || !element) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setRevealed(true);
    }, { threshold });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, revealed, threshold]);

  return revealed;
}
