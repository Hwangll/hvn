import { useEffect, type RefObject } from "react";

/** Where the sun sits in the bouquet's frame, as a share of its height: low, behind the wrap, setting into the clouds. */
const SUN_HEIGHT = 0.56;

/**
 * Keeps the realm's sun and moon right behind the bouquet: writes where the flowers are, as `--realm-x` / `--realm-y`
 * in px, onto the room's fixed atmosphere, measured with the room scrolled to the top. On a phone the room scrolls
 * under that fixed sky and the sun or moon rises with the bouquet on the room's scroll timeline (memory-fairyland.css),
 * so this also writes how far the room scrolls, `--room-travel`.
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
      atmosphere.style.setProperty("--room-travel", `${Math.max(0, root.scrollHeight - root.clientHeight)}px`);
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(root);
    // The room's content settles as its type and the bouquet arrive, which changes how far it scrolls.
    for (const child of root.children) observer.observe(child);
    return () => {
      observer.disconnect();
      atmosphere.style.removeProperty("--realm-x");
      atmosphere.style.removeProperty("--realm-y");
      atmosphere.style.removeProperty("--room-travel");
    };
  }, [rootRef]);
}
