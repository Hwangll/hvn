import { useEffect, type RefObject } from "react";

const zoneSelector = "[data-idle-zone]";

/**
 * Sections marked `data-idle-zone` hold their idle CSS loops (twinkling stars, shimmer, floating polaroids) while
 * they are well off screen. Chrome cannot composite several of those loops and keeps restyling them every frame
 * even when nothing of them is visible, which the scroll engine pays for on phones. The marker is a data attribute,
 * not a class, so React re-rendering a section's className never drops it.
 */
export function observeIdleZones(root: HTMLElement): () => void {
  if (typeof IntersectionObserver === "undefined") return () => {};
  // A small margin: loops resume just before their section scrolls in, and entrance animations play as it arrives.
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) entry.target.toggleAttribute("data-offscreen", !entry.isIntersecting);
  }, { rootMargin: "10% 0px" });
  const registered = new WeakSet<Element>();
  const register = (node: Element) => {
    const zones = [...(node.matches(zoneSelector) ? [node] : []), ...node.querySelectorAll(zoneSelector)];
    for (const zone of zones) {
      if (registered.has(zone)) continue;
      registered.add(zone);
      observer.observe(zone);
    }
  };
  register(root);
  // Layout switches (phone ↔ desktop, motion preference) rebuild whole sections; pick their zones up as they land.
  const mutations = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) if (node instanceof Element) register(node);
    }
  });
  mutations.observe(root, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    mutations.disconnect();
    root.querySelectorAll(`${zoneSelector}[data-offscreen]`).forEach((zone) => zone.removeAttribute("data-offscreen"));
  };
}

export function useIdleZones(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!scope.current) return undefined;
    return observeIdleZones(scope.current);
  }, [scope]);
}
