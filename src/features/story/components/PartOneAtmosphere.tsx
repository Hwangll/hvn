import { useEffect, useRef } from "react";
import type { StoryMood } from "../data/story";

interface PartOneAtmosphereProps {
  /** One mood per chapter, in reading order. The first is the ground; the rest crossfade in as their chapter arrives. */
  moods: readonly StoryMood[];
  reducedMotion?: boolean;
}

/**
 * The fixed sky behind Part I. It stays in the diary's pinks, but the exact pink follows the chapter being read:
 * usePartTwoScroll crossfades the `data-offline-mood` layers by scroll position, exactly as it does for Part II's
 * blue hour, so the page warms, cools and warms again with the story. A soft glow follows the pointer on desktop.
 */
export function PartOneAtmosphere({ moods, reducedMotion = false }: PartOneAtmosphereProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

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
  }, [reducedMotion]);

  const [ground, ...rest] = moods;

  return (
    <div className="part-one-atmosphere" aria-hidden="true" ref={rootRef}>
      {/* `offline-mood-night` is the engine's name for the always-on ground layer; the colour comes from `blush-mood-*`. */}
      <div className={`offline-mood offline-mood-night blush-mood blush-mood-${ground ?? "spark"}`}>
        <div className="aurora blush-aurora blush-aurora-one" />
        <div className="aurora blush-aurora blush-aurora-two" />
      </div>
      {rest.map((mood, index) => (
        <div className={`offline-mood blush-mood blush-mood-${mood}`} data-offline-mood key={`${mood}-${index}`}>
          <div className="aurora blush-aurora blush-aurora-one" />
          <div className="aurora blush-aurora blush-aurora-two" />
        </div>
      ))}
      <div className="blush-specks" />
      <div className="offline-pointer-glow" />
    </div>
  );
}
