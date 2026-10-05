import { useEffect, type RefObject } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
/** Reads a length custom property written in vh or vw (as part-one-depth.css writes them) in px. */
const lengthOf = (element: Element, name: string) => {
  const value = getComputedStyle(element).getPropertyValue(name).trim();
  const amount = Number.parseFloat(value) || 0;
  return value.endsWith("vw") ? (amount * window.innerWidth) / 100 : (amount * window.innerHeight) / 100;
};

/**
 * The story's layered backgrounds move on scroll timelines (depth-field.css and each part's stylesheet). Browsers without
 * them (Safari before 26, Firefox) get the same movement from here: one passive scroll listener, at most one write per
 * frame, transforms only. The stylesheets stay the source of every number, read once and again on resize: each plane's
 * --k, the drifting sky parts' --sky ([data-scroll-drift]), the travelling ones' --path-x / --path-y ([data-scroll-path],
 * over the whole page or, given --path-end, over that much scroll),
 * and on Part I the hero's --hero-rise and the scrapbook's --drift. [data-scroll-fallback] tells the stylesheets to lay
 * the planes out for moving.
 */
export function useDepthParallaxFallback(rootRef: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const root = rootRef.current;
    // Without CSS.supports (very old browsers, test DOMs) there is no telling what would run, so nothing moves.
    if (!enabled || !root || typeof CSS === "undefined" || typeof CSS.supports !== "function") return undefined;
    if (CSS.supports("animation-timeline: scroll()")) return undefined;
    root.dataset.scrollFallback = "";

    type Mover = { element: HTMLElement; write: (scrollY: number, progress: number) => void };
    let movers: Mover[] = [];
    let maxScroll = 1;
    let frame = 0;

    const measure = () => {
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const viewport = window.innerHeight;
      const next: Mover[] = [];
      for (const element of root.querySelectorAll<HTMLElement>(".depth-plane")) {
        const k = Number.parseFloat(getComputedStyle(element).getPropertyValue("--k")) || 0;
        next.push({ element, write: (scrollY) => { element.style.transform = `translate3d(0, ${(k * scrollY).toFixed(1)}px, 0)`; } });
      }
      for (const element of root.querySelectorAll<HTMLElement>("[data-scroll-drift]")) {
        const sky = lengthOf(element, "--sky");
        next.push({ element, write: (_, progress) => { element.style.translate = `0 ${(sky * progress).toFixed(1)}px`; } });
      }
      for (const element of root.querySelectorAll<HTMLElement>("[data-scroll-path]")) {
        const x = lengthOf(element, "--path-x");
        const y = lengthOf(element, "--path-y");
        const end = lengthOf(element, "--path-end");
        next.push({
          element,
          write: (scrollY, progress) => {
            const along = end > 0 ? clamp(scrollY / end) : progress;
            element.style.translate = `${(x * along).toFixed(1)}px ${(y * along).toFixed(1)}px`;
          },
        });
      }
      const hero = root.querySelector<HTMLElement>(".story-intro");
      if (hero) {
        const height = Math.max(1, hero.offsetHeight);
        for (const element of hero.querySelectorAll<HTMLElement>(".intro-copy, .booth-photo, .booth-sticker, .diary-photo-note, .intro-blossom")) {
          const rise = lengthOf(element, "--hero-rise");
          const fades = element.classList.contains("intro-copy");
          next.push({
            element,
            write: (scrollY) => {
              const progress = clamp(scrollY / height);
              element.style.translate = `0 ${(rise * progress).toFixed(1)}px`;
              if (fades) element.style.opacity = (1 - 0.75 * clamp((progress - 0.1) / 0.8)).toFixed(3);
            },
          });
        }
      }
      for (const element of root.querySelectorAll<HTMLElement>(".mood-photo, .keepsake-flower")) {
        const section = element.closest<HTMLElement>(".mood-setup, .keepsake-playground");
        if (!section) continue;
        const drift = lengthOf(element, "--drift");
        const top = section.getBoundingClientRect().top + window.scrollY;
        const span = viewport + section.offsetHeight;
        next.push({
          element,
          write: (scrollY) => {
            const progress = clamp((scrollY + viewport - top) / span);
            element.style.translate = `0 ${(drift * (progress * 2 - 1)).toFixed(1)}px`;
          },
        });
      }
      movers = next;
    };

    const paint = () => {
      frame = 0;
      const scrollY = window.scrollY;
      const progress = clamp(scrollY / maxScroll);
      for (const mover of movers) mover.write(scrollY, progress);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    const remeasure = () => {
      measure();
      schedule();
    };

    remeasure();
    // The page grows as photos load; measure again once it has settled.
    const settle = window.setTimeout(remeasure, 1500);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    return () => {
      window.clearTimeout(settle);
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      delete root.dataset.scrollFallback;
      for (const { element } of movers) {
        element.style.removeProperty("transform");
        element.style.removeProperty("translate");
        element.style.removeProperty("opacity");
      }
    };
  }, [enabled, rootRef]);
}
