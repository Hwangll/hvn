import { memo, useEffect, useRef, type CSSProperties } from "react";
import type { StoryMood } from "../data/story";
import { Bird, Cloud } from "./StoryArt";

/** Three rows of clouds crossing the sky, slower the further away; `offset` starts each one part-way across. */
const skyClouds = {
  far: [
    { top: 7, size: 170, variant: 2, loop: 190, offset: -40 },
    { top: 15, size: 210, variant: 1, loop: 170, offset: -118 },
    { top: 24, size: 150, variant: 2, loop: 205, offset: -150 },
    { top: 31, size: 190, variant: 0, loop: 180, offset: -75 },
  ],
  mid: [
    { top: 40, size: 300, variant: 0, loop: 135, offset: -30 },
    { top: 53, size: 260, variant: 1, loop: 120, offset: -86 },
    { top: 64, size: 340, variant: 2, loop: 145, offset: -112 },
  ],
  near: [
    { top: 78, size: 480, variant: 1, loop: 96, offset: -22 },
    { top: 90, size: 420, variant: 0, loop: 88, offset: -64 },
  ],
} as const;

/** Small flocks crossing the sky, each bird a little out of step with the others. */
const flocks = [
  { y: "16%", life: 46, delay: -8, span: "11rem", bird: "1.5rem", birds: [[0, 30], [26, 8], [48, 38], [70, 16]] },
  { y: "34%", life: 58, delay: -36, span: "9rem", bird: "1.2rem", birds: [[0, 20], [30, 0], [56, 26]] },
] as const;

interface PartOneAtmosphereProps {
  /** One mood per chapter, in reading order. The first is the ground; the rest crossfade in as their chapter arrives. */
  moods: readonly StoryMood[];
  reducedMotion?: boolean;
}

/**
 * The fixed sky behind Part I. It stays in the diary's pinks, but the exact pink follows the chapter being read:
 * usePartTwoScroll crossfades the `data-offline-mood` layers by scroll position, exactly as it does for Part II's
 * blue hour, so the page warms, cools and warms again with the story. Over it hangs an afternoon: a sun with slow
 * turning rays that sinks a little as the story goes on, and three rows of clouds drifting across at three speeds.
 * A soft glow follows the pointer on desktop.
 */
export const PartOneAtmosphere = memo(function PartOneAtmosphere({ moods, reducedMotion = false }: PartOneAtmosphereProps) {
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
        <div className="aurora blush-aurora blush-aurora-one" data-scroll-drift />
        <div className="aurora blush-aurora blush-aurora-two" data-scroll-drift />
      </div>
      {rest.map((mood, index) => (
        <div className={`offline-mood blush-mood blush-mood-${mood}`} data-offline-mood key={`${mood}-${index}`}>
          <div className="aurora blush-aurora blush-aurora-one" data-scroll-drift />
          <div className="aurora blush-aurora blush-aurora-two" data-scroll-drift />
        </div>
      ))}
      <div className="sky-sun" data-scroll-path />
      <div className="sky-rays" data-scroll-path />
      {(["far", "mid", "near"] as const).map((row) => (
        <div className={`sky-clouds sky-clouds-${row}`} data-scroll-drift key={row}>
          {skyClouds[row].map((cloud) => (
            <Cloud
              key={`${row}-${cloud.top}`}
              variant={cloud.variant}
              className="sky-cloud"
              style={{
                top: `${cloud.top}%`,
                width: `${cloud.size}px`,
                "--loop": `${cloud.loop}s`,
                "--offset": `${cloud.offset}s`,
                // Where the same phase of its crossing puts it, for skies that hold still.
                "--x": `${(-30 + (-cloud.offset / cloud.loop) * 145).toFixed(1)}vw`,
              } as CSSProperties}
            />
          ))}
        </div>
      ))}
      <div className="sky-birds">
        {flocks.map((flock) => (
          <div className="flock" key={flock.y} style={{ "--y": flock.y, "--life": `${flock.life}s`, "--delay": `${flock.delay}s`, "--span": flock.span, "--bird": flock.bird } as CSSProperties}>
            {flock.birds.map(([x, y], index) => (
              <Bird key={`${x}-${y}`} style={{ left: `${x}%`, top: `${y}%`, "--beat": `${0.38 + index * 0.06}s` } as CSSProperties} />
            ))}
          </div>
        ))}
      </div>
      <div className="blush-specks" />
      <div className="offline-pointer-glow" />
    </div>
  );
});
