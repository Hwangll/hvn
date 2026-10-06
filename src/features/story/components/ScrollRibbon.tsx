import { Fragment, useEffect, useRef } from "react";
import { onScrollVelocity, wakeScrollVelocity } from "../../../shared/motion/scrollVelocity";
import { nextRibbonOffset } from "../utils/scrollInertia";

interface ScrollRibbonProps {
  /** The words on the front band, which runs against the scroll. */
  front: readonly string[];
  /** The words on the band behind it, which runs the other way. */
  back: readonly string[];
  tone: "rose" | "night";
  /** Which gap it crosses; the stylesheet nudges each clear of the words either side (scroll-life.css). */
  placement: "opening" | "recap" | "stops" | "closing";
  reducedMotion: boolean;
}

/** Enough runs of the words to cover the widest screen with one run to spare. */
const RUNS = 6;

function Band({ words, side }: { words: readonly string[]; side: "front" | "back" }) {
  return (
    <div className={`scroll-ribbon-band is-${side}`}>
      <div className="scroll-ribbon-track">
        {Array.from({ length: RUNS }, (_, run) => (
          <span className="scroll-ribbon-run" key={run}>
            {words.map((word, index) => (
              <Fragment key={`${word}-${index}`}>
                <span className="scroll-ribbon-word">{word}</span>
                <i className="scroll-ribbon-mark" />
              </Fragment>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Two bands of words crossing the gap between two sections, like tape across a scrapbook page (or, by night, a strip
 * of film). Their words run sideways at an unhurried pace, faster while the page scrolls and always the way the reader
 * last scrolled, the band behind running the other way. The ribbon takes no room of its own: it straddles the edge
 * between the sections, over their padding. It only moves while on screen, and stands still for reduced motion.
 */
export function ScrollRibbon({ front, back, tone, placement, reducedMotion }: ScrollRibbonProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion || typeof IntersectionObserver === "undefined") return undefined;
    const runOf = (track: HTMLElement) => (track.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
    // The front band runs against the scroll (its words go left as the page goes down), the back band with it.
    const bands = (["front", "back"] as const).flatMap((side) => {
      const track = root.querySelector<HTMLElement>(`.scroll-ribbon-band.is-${side} .scroll-ribbon-track`);
      return track ? [{ track, front: side === "front", run: runOf(track), offset: 0 }] : [];
    });
    let direction = 1;
    let skew = 0;
    // Leaning the letters changes how the band would be rasterised; phones keep them upright and save that work.
    const leans = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const listener = (velocity: number, deltaMs: number) => {
      if (Math.abs(velocity) > 0.02) direction = Math.sign(velocity);
      // A quick scroll leans the letters into it, a little, and they straighten as it eases off.
      if (leans) skew += (Math.max(-9, Math.min(9, -velocity * 3.2)) - skew) * 0.16;
      for (const band of bands) {
        band.offset = nextRibbonOffset(band.offset, direction, velocity, deltaMs / 1000, band.run);
        const x = band.front ? -band.offset : band.offset - band.run;
        const lean = band.front ? skew : -skew * 0.7;
        band.track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0) skewX(${lean.toFixed(2)}deg)`;
      }
      return true;
    };
    let stop: (() => void) | null = null;
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !stop) {
        stop = onScrollVelocity(listener);
        wakeScrollVelocity();
      } else if (!entry.isIntersecting && stop) {
        stop();
        stop = null;
      }
    }, { rootMargin: "15% 0px" });
    visibility.observe(root);
    // The words' width changes when the display face arrives or the window changes size.
    const measure = new ResizeObserver(() => {
      for (const band of bands) band.run = runOf(band.track);
    });
    bands.forEach((band) => {
      if (band.track.firstElementChild) measure.observe(band.track.firstElementChild);
    });
    return () => {
      stop?.();
      visibility.disconnect();
      measure.disconnect();
      bands.forEach((band) => band.track.style.removeProperty("transform"));
    };
  }, [reducedMotion]);

  return (
    <div className={`scroll-ribbon is-${tone} at-${placement}`} ref={rootRef} aria-hidden="true">
      <Band words={back} side="back" />
      <Band words={front} side="front" />
    </div>
  );
}
