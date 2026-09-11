import Lenis from "lenis";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** The running smooth scroller, so programmatic jumps land in the same coordinate space as the wheel. */
let activeScroller: Lenis | null = null;

/** Jumps straight to an element through the smooth scroller when one is running, else natively. */
export function scrollStoryTo(target: HTMLElement) {
  if (activeScroller) {
    activeScroller.scrollTo(target, { immediate: true });
    return;
  }
  target.scrollIntoView({ behavior: "auto", block: "start" });
}

/**
 * Smooth wheel scrolling for the whole story, including Part II.
 *
 * Lenis and ScrollTrigger have to share one clock or the scene motion trails the page: Lenis is stepped
 * from GSAP's ticker rather than its own rAF loop, and every Lenis scroll pushes ScrollTrigger forward in
 * the same frame. Touch keeps the platform's own momentum; only the wheel is smoothed.
 */
export function useLenisScroll(disabled: boolean): void {
  useEffect(() => {
    if (disabled) return undefined;

    const lenis = new Lenis({
      // A continuous lerp reads as weight rather than as a delay, which is what makes long scroll scenes feel considered.
      lerp: 0.085,
      wheelMultiplier: 0.95,
      smoothWheel: true,
    });
    activeScroller = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    // GSAP's ticker is in seconds; Lenis wants milliseconds.
    const step = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(step);
    // Without this GSAP drops frames it thinks are late, which shows up as a stutter mid-scene.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(step);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      if (activeScroller === lenis) activeScroller = null;
    };
  }, [disabled]);
}
