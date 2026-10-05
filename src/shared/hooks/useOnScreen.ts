import { useEffect, useState, type RefObject } from "react";

/**
 * Whether the element is on screen (within `rootMargin` of it), kept up to date as the reader scrolls. Browsers
 * without IntersectionObserver (and tests) report it as always on screen.
 */
export function useOnScreen(ref: RefObject<Element | null>, rootMargin = "160px 0px"): boolean {
  const [onScreen, setOnScreen] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry) setOnScreen(entry.isIntersecting);
    }, { rootMargin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return onScreen;
}
