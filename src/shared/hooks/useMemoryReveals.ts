import { useEffect, useRef } from "react";

const revealSelector = "[data-memory-reveal], .story-part-1 [data-step-reveal], .story-part-1 .story-step-year-tab";

/** Entrance effects never gate visibility: quick jumps and unsupported browsers stay readable. */
export function observeMemoryReveals(root: HTMLElement, mobile: boolean): () => void {
  if (typeof IntersectionObserver === "undefined" || !Element.prototype.animate) return () => {};
  const seen = new WeakSet<Element>();
  const registered = new WeakSet<Element>();
  const animations = new Set<Animation>();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || seen.has(entry.target)) continue;
      const element = entry.target as HTMLElement;
      seen.add(element);
      observer.unobserve(element);
      const order = Math.min(3, Math.max(0, Number(element.dataset.memoryOrder) || 0));
      const animation = element.animate(
        { opacity: [0.25, 1], translate: [`0 ${mobile ? 12 : 24}px`, "0 0"] },
        { duration: mobile ? 480 : 760, delay: order * 55, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" },
      );
      animations.add(animation);
      animation.onfinish = () => animations.delete(animation);
    }
  }, { threshold: 0.08, rootMargin: "0px 0px -3% 0px" });

  const register = (node: Element) => {
    const elements = [...(node.matches(revealSelector) ? [node] : []), ...node.querySelectorAll(revealSelector)];
    for (const element of elements) {
      if (registered.has(element)) continue;
      registered.add(element);
      observer.observe(element);
    }
  };
  register(root);
  const mutations = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) if (node instanceof Element) register(node);
    }
  });
  mutations.observe(root, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    mutations.disconnect();
    animations.forEach((animation) => animation.cancel());
    animations.clear();
  };
}

export function useMemoryReveals(reducedMotion: boolean, mobile: boolean) {
  const scope = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!scope.current || reducedMotion) return;
    return observeMemoryReveals(scope.current, mobile);
  }, [reducedMotion, mobile]);
  return scope;
}
