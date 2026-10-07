import { useEffect, type RefObject } from "react";

/**
 * A soft glow that follows the cursor across a night sky, like a torch over a dark page: writes --gx/--gy (px) on the
 * sky once a frame while the pointer moves. Only for a fine pointer that can hover, and never for reduced motion.
 */
export function usePointerGlow(rootRef: RefObject<HTMLElement | null>, reducedMotion: boolean) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion || typeof window === "undefined") return undefined;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;
    let frame = 0;
    let x = window.innerWidth * 0.5;
    let y = window.innerHeight * 0.4;
    const paint = () => {
      frame = 0;
      root.style.setProperty("--gx", `${x.toFixed(0)}px`);
      root.style.setProperty("--gy", `${y.toFixed(0)}px`);
    };
    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion, rootRef]);
}
