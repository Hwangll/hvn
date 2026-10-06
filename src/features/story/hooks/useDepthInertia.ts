import { useEffect, type RefObject } from "react";
import { onScrollVelocity } from "../../../shared/motion/scrollVelocity";
import { stepSpring, type Spring } from "../utils/scrollInertia";

/** How much of the lag each plane takes: the far sky hardly any, the pieces passing in front the most. */
const PLANE_LAG: Record<string, number> = { far: 0.2, drift: 0.45, flight: 0.75, near: 1, front: 1.6 };
/** px of lag per px/ms of scroll speed, and the most a plane ever lags. */
const LAG_GAIN = 12;
const LAG_REACH = 46;

/**
 * The layers behind (and in front of) the story have weight: while the page moves they trail it a little, the nearer
 * the more, and when it stops they catch up on a soft spring and settle. Each plane's scroll-driven slide owns its
 * `transform` (depth-field.css, or useDepthParallaxFallback), so the lag lives in `translate`: one write per plane per
 * frame, only while the page moves or a plane is still settling.
 */
export function useDepthInertia(rootRef: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return undefined;
    const planes = Array.from(root.querySelectorAll<HTMLElement>(".depth-plane"), (element) => {
      const name = Array.from(element.classList).find((token) => token.startsWith("depth-plane-"))?.slice("depth-plane-".length) ?? "";
      return { element, share: PLANE_LAG[name] ?? 0, shown: 0 };
    }).filter((plane) => plane.share > 0);
    if (!planes.length) return undefined;
    const spring: Spring = { value: 0, speed: 0 };
    const stop = onScrollVelocity((velocity, deltaMs) => {
      const moving = stepSpring(spring, Math.max(-LAG_REACH, Math.min(LAG_REACH, velocity * LAG_GAIN)), deltaMs / 1000);
      for (const plane of planes) {
        const offset = Math.round(spring.value * plane.share * 10) / 10;
        if (offset === plane.shown) continue;
        plane.shown = offset;
        if (offset) plane.element.style.translate = `0 ${offset}px`;
        else plane.element.style.removeProperty("translate");
      }
      return moving;
    });
    return () => {
      stop();
      planes.forEach((plane) => plane.element.style.removeProperty("translate"));
    };
  }, [rootRef, enabled]);
}
