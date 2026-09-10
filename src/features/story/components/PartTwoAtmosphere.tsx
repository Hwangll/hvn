import { useEffect, useRef } from "react";

interface PartTwoAtmosphereProps {
  reducedMotion?: boolean;
}

/**
 * The fixed sky behind Part II. Each mood is a full-bleed layer that usePartTwoScroll crossfades by scroll position;
 * the slow drifts (aurora, stars, caustics, dust) are time-based so the page breathes while the reader pauses.
 * A soft pointer glow follows the cursor on desktop, like a torch moving across a dark page.
 */
export function PartTwoAtmosphere({ reducedMotion = false }: PartTwoAtmosphereProps) {
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

  return (
    <div className="part-two-atmosphere" aria-hidden="true" ref={rootRef}>
      <div className="offline-mood offline-mood-night">
        <div className="sky-stars sky-stars-far" data-water-depth="0.35" />
        <div className="sky-stars sky-stars-near" data-water-depth="0.7" />
        <div className="aurora aurora-night-one" />
        <div className="aurora aurora-night-two" />
        <div className="night-lights" data-water-depth="0.6" />
      </div>
      <div className="offline-mood offline-mood-park" data-offline-mood>
        <div className="sky-stars sky-stars-far" data-water-depth="0.3" />
        <div className="aurora aurora-park-one" />
        <div className="aurora aurora-park-two" />
        <div className="park-shadows" data-water-depth="0.25" />
      </div>
      <div className="offline-mood offline-mood-aquarium" data-offline-mood>
        <div className="water-surface" data-water-depth="0.4" />
        <div className="water-rays" data-water-depth="1" />
        <div className="water-caustics" data-water-depth="1.5">
          <svg viewBox="0 0 1200 400" preserveAspectRatio="none">
            <path d="M-60 95 C120 15 180 190 370 84 S650 180 850 64 S1090 155 1280 30" />
            <path d="M-80 112 C100 42 215 204 395 99 S690 191 875 86 S1100 182 1280 58" />
            <path d="M-60 250 C130 168 210 305 410 202 S700 283 925 172 S1150 215 1280 115" />
            <path d="M-40 300 C160 230 240 350 440 262 S720 330 940 240 S1160 280 1280 190" />
          </svg>
        </div>
        <div className="water-specks" />
        <div className="water-specks water-specks-two" />
      </div>
      <div className="offline-mood offline-mood-cafe" data-offline-mood>
        <div className="aurora aurora-cafe" />
        <div className="cafe-window-light" data-water-depth="0.3" />
        <div className="cafe-motes" />
      </div>
      <div className="offline-mood offline-mood-sunset" data-offline-mood>
        <div className="sky-stars sky-stars-far" data-water-depth="0.3" />
        <div className="aurora aurora-sunset-one" />
        <div className="aurora aurora-sunset-two" />
        <div className="sunset-horizon" data-water-depth="0.2" />
      </div>
      <div className="offline-pointer-glow" />
      <div className="offline-reading-shade" />
    </div>
  );
}
