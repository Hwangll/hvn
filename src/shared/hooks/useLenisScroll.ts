import Lenis from "lenis";
import { useEffect } from "react";

export function useLenisScroll(disabled: boolean): void {
  useEffect(() => {
    if (disabled) {
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (value: number) => Math.min(1, 1.001 - Math.pow(2, -10 * value)),
      smoothWheel: true,
    });

    let frameId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frameId = window.requestAnimationFrame(raf);
    };

    frameId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [disabled]);
}
