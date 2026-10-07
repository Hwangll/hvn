import { memo, useRef, type CSSProperties } from "react";
import { usePointerGlow } from "../hooks/usePointerGlow";
import { Cloud } from "./StoryArt";

/** Night clouds crossing the first sky, slower the further away; `offset` starts each one part-way across. */
const nightClouds = {
  far: [
    { top: 10, size: 180, variant: 2, loop: 200, offset: -60 },
    { top: 22, size: 220, variant: 1, loop: 180, offset: -140 },
  ],
  mid: [
    { top: 44, size: 300, variant: 0, loop: 140, offset: -40 },
    { top: 60, size: 260, variant: 2, loop: 125, offset: -95 },
  ],
  near: [{ top: 82, size: 460, variant: 1, loop: 95, offset: -30 }],
} as const;

interface PartTwoAtmosphereProps {
  reducedMotion?: boolean;
}

/**
 * The fixed sky behind Part II. Each mood is a full-bleed layer that usePartTwoScroll crossfades by scroll position;
 * the slow drifts (aurora, stars, caustics, dust) are time-based so the page breathes while the reader pauses. The first
 * sky also holds a full moon that climbs out of sight as the reader leaves the title page, and three rows of night clouds
 * drifting across; they fade with it when the chapters move indoors and under water.
 * A soft pointer glow follows the cursor on desktop, like a torch moving across a dark page.
 */
export const PartTwoAtmosphere = memo(function PartTwoAtmosphere({ reducedMotion = false }: PartTwoAtmosphereProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  usePointerGlow(rootRef, reducedMotion);

  return (
    <div className="part-two-atmosphere" aria-hidden="true" ref={rootRef}>
      <div className="offline-mood offline-mood-night">
        <div className="sky-stars sky-stars-far" data-water-depth="0.35" />
        <div className="sky-stars sky-stars-near" data-water-depth="0.7" />
        <div className="aurora aurora-night-one" />
        <div className="aurora aurora-night-two" />
        <div className="night-lights" data-water-depth="0.6" />
        <div className="sky-moon" data-scroll-path><i className="sky-moon-halo" /><i className="sky-moon-disc" /></div>
        {(["far", "mid", "near"] as const).map((row) => (
          <div className={`sky-clouds sky-clouds-${row}`} data-scroll-drift key={row}>
            {nightClouds[row].map((cloud) => (
              <Cloud
                key={`${row}-${cloud.top}`}
                variant={cloud.variant}
                className="sky-cloud"
                style={{
                  top: `${cloud.top}%`,
                  width: `${cloud.size}px`,
                  "--loop": `${cloud.loop}s`,
                  "--offset": `${cloud.offset}s`,
                  "--x": `${(-30 + (-cloud.offset / cloud.loop) * 145).toFixed(1)}vw`,
                } as CSSProperties}
              />
            ))}
          </div>
        ))}
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
});
