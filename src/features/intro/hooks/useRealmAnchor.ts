import { useEffect, type RefObject } from "react";

/** Where the sun sits in the bouquet's frame, as a share of its height: low, behind the wrap, setting into the clouds. */
const SUN_HEIGHT = 0.56;

/**
 * Keeps the realm's sun and moon right behind the bouquet: writes where the flowers are, as `--realm-x` / `--realm-y`
 * in px, onto the room's fixed atmosphere. Measured with the room scrolled to the top, so on a phone the sky stays put
 * while the page moves over it.
 */
export function useRealmAnchor(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    const atmosphere = root?.querySelector<HTMLElement>(".memory-atmosphere");
    const frame = root?.querySelector<HTMLElement>(".memory-bouquet-frame");
    if (!root || !atmosphere || !frame) return undefined;
    const place = () => {
      const rect = frame.getBoundingClientRect();
      if (!rect.width) return;
      atmosphere.style.setProperty("--realm-x", `${Math.round(rect.left + rect.width / 2)}px`);
      atmosphere.style.setProperty("--realm-y", `${Math.round(rect.top + root.scrollTop + rect.height * SUN_HEIGHT)}px`);
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(root);
    return () => {
      observer.disconnect();
      atmosphere.style.removeProperty("--realm-x");
      atmosphere.style.removeProperty("--realm-y");
    };
  }, [rootRef]);
}
