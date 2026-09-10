import { useEffect, type RefObject } from "react";

/**
 * Writes the pointer's position over an element as `--mx` / `--my` in [-1, 1] so CSS layers can lean
 * toward the cursor. Frames are coalesced with requestAnimationFrame; the values ease back to 0 on leave.
 * Touch-only and reduced-motion readers never get the effect.
 */
export function usePointerParallax(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element || typeof window === "undefined") return undefined;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;

    let frame = 0;
    let nextX = 0;
    let nextY = 0;
    const paint = () => {
      frame = 0;
      element.style.setProperty("--mx", nextX.toFixed(3));
      element.style.setProperty("--my", nextY.toFixed(3));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      nextX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
      nextY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
      schedule();
    };
    const onLeave = () => {
      nextX = 0;
      nextY = 0;
      schedule();
    };
    element.addEventListener("pointermove", onMove, { passive: true });
    element.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      window.cancelAnimationFrame(frame);
      element.style.removeProperty("--mx");
      element.style.removeProperty("--my");
    };
  }, [enabled, ref]);
}
