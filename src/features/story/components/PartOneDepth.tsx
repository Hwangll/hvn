import type { CSSProperties, ReactElement } from "react";
import { Blossom, Butterfly, Cloud, Sprig, type ButterflyTheme } from "./StoryArt";

/**
 * Part I's depth of field. The page reads like a scrapbook in a sunny garden: sunbeams and soft light far behind the
 * story, clouds, doodles and blossoms drifting nearer, butterflies and cherry twigs nearer still, big words in the open
 * ground between sections and paper keepsakes peeking in from the margins, and big out-of-focus flowers and butterflies
 * passing in front at the edges.
 *
 * Each group lives on one page-long plane and each plane slides against the page at its own speed as the page scrolls
 * (depth-field.css and part-one-depth.css, or useDepthParallaxFallback where scroll timelines are missing), which is
 * what reads as layers. A piece's `top` is where it sits as it crosses the middle of the screen. The things that move
 * on their own (wings, flight, swaying twigs, turning blossoms) are idle zones, so they rest while off screen. All of
 * it is decorative.
 */

type Doodle = "heart" | "sparkle" | "notes" | "airplane" | "bubble" | "ring" | "flower" | "envelope" | "swirl";
type Keepsake = "tape" | "note" | "stamp" | "polaroid" | "ticket";

interface Piece {
  /** Where on the page the piece sits as it crosses the middle of the screen, in % of the page height. */
  top: number;
  /** Distance from the left edge in % of the page width; pieces held by the right margin set `right` instead. */
  left?: number;
  right?: number;
  /** Width: px for small pieces, vw for the large soft ones (glows, words, beams, the pieces in front). */
  size: number;
  /** Resting tilt, in degrees. */
  tilt?: number;
  /** Only on wide screens, where the margins are wide enough to hold it. */
  wide?: boolean;
}

interface Flight extends Piece {
  theme: ButterflyTheme;
  /** The loop it flies, in px, and how long one loop takes, in seconds. */
  fx: number;
  fy: number;
  loop: number;
}

/* ---------- Far plane ---------- */
const glows: Piece[] = [
  { top: 2, left: 58, size: 9 },
  { top: 10.5, left: 12, size: 12 },
  { top: 17, left: 70, size: 8, wide: true },
  { top: 26, left: 38, size: 11 },
  { top: 33, left: 8, size: 9 },
  { top: 40, left: 62, size: 12 },
  { top: 47, left: 22, size: 8, wide: true },
  { top: 55, left: 76, size: 10 },
  { top: 62, left: 34, size: 12 },
  { top: 69, left: 6, size: 9 },
  { top: 76, left: 58, size: 11 },
  { top: 84, left: 26, size: 8, wide: true },
  { top: 91, left: 72, size: 10 },
];

/** Long shafts of afternoon sun falling across the page. */
const beams: Piece[] = [
  { top: 1.5, left: 38, size: 16, tilt: 30 },
  { top: 11, left: 56, size: 13, tilt: 26, wide: true },
  { top: 25, left: 18, size: 17, tilt: 32 },
  { top: 44, left: 64, size: 12, tilt: 28, wide: true },
  { top: 60, left: 40, size: 15, tilt: 30, wide: true },
  { top: 78, left: 70, size: 12, tilt: 27, wide: true },
  { top: 92, left: 28, size: 17, tilt: 31 },
];

/* ---------- Drift plane ---------- */
const clouds: Array<Piece & { variant: number; billow?: boolean }> = [
  { variant: 0, top: -1.1, left: 24, size: 230, billow: true },
  { variant: 2, top: 6.8, left: 47, size: 170, billow: true },
  { variant: 1, top: 9.8, right: 3, size: 270 },
  { variant: 2, top: 14.6, left: 40, size: 200, wide: true },
  { variant: 0, top: 23.8, right: 7, size: 290 },
  { variant: 1, top: 34, left: -2, size: 220, wide: true },
  { variant: 2, top: 47, right: -1, size: 210, wide: true },
  { variant: 0, top: 61, left: -3, size: 230, wide: true },
  { variant: 1, top: 74, right: -2, size: 250, wide: true },
  { variant: 2, top: 88.5, left: 12, size: 250 },
  { variant: 0, top: 97, right: 14, size: 230 },
];

const doodles: Array<Piece & { kind: Doodle }> = [
  { kind: "sparkle", top: 1.8, left: 47, size: 23, tilt: 8 },
  { kind: "notes", top: 3.4, left: 2.5, size: 31, tilt: -10, wide: true },
  { kind: "heart", top: 6.4, left: 41, size: 26, tilt: -12 },
  { kind: "airplane", top: 9.4, left: 52, size: 34, tilt: 6 },
  { kind: "sparkle", top: 12.6, left: 3, size: 21 },
  { kind: "heart", top: 14.2, right: 3, size: 23, tilt: 14 },
  { kind: "bubble", top: 16.4, left: 2, size: 31, tilt: -6, wide: true },
  { kind: "ring", top: 19.8, right: 2.5, size: 26 },
  { kind: "flower", top: 22.6, left: 3.5, size: 31, tilt: 10 },
  { kind: "sparkle", top: 25.5, right: 4, size: 21, tilt: -8 },
  { kind: "notes", top: 28, left: 2, size: 31, tilt: 8, wide: true },
  { kind: "heart", top: 31.5, right: 2.5, size: 26, tilt: -10 },
  { kind: "envelope", top: 35, left: 2.5, size: 31, tilt: -8, wide: true },
  { kind: "sparkle", top: 38.5, right: 3, size: 21 },
  { kind: "swirl", top: 42, left: 1.8, size: 39, tilt: -14, wide: true },
  { kind: "airplane", top: 45.5, right: 2.2, size: 34, tilt: -12 },
  { kind: "heart", top: 49, left: 2.4, size: 26, tilt: 12 },
  { kind: "ring", top: 52.5, right: 3.5, size: 23, wide: true },
  { kind: "flower", top: 56, left: 3, size: 31, tilt: -6 },
  { kind: "sparkle", top: 59.5, right: 2.8, size: 21, tilt: 10 },
  { kind: "bubble", top: 63, left: 2.2, size: 31, tilt: 6, wide: true },
  { kind: "notes", top: 66.5, right: 3, size: 31, tilt: -8 },
  { kind: "heart", top: 70, left: 3, size: 26, tilt: -14 },
  { kind: "sparkle", top: 73.5, right: 2.5, size: 21, wide: true },
  { kind: "envelope", top: 77, left: 2.4, size: 31, tilt: 8 },
  { kind: "flower", top: 80.5, right: 3.2, size: 31, tilt: 12, wide: true },
  { kind: "heart", top: 84, left: 2.8, size: 26, tilt: 10 },
  { kind: "sparkle", top: 87.5, right: 3, size: 21, tilt: -6 },
  { kind: "notes", top: 92, left: 6, size: 31, tilt: -10 },
  { kind: "heart", top: 96, right: 8, size: 26, tilt: 8 },
  { kind: "sparkle", top: 98, left: 30, size: 21, wide: true },
];

/** Single blossoms; the ones with `spin` turn slowly as they drift. */
const blossoms: Array<Piece & { spin?: boolean }> = [
  { top: 3.6, left: 44, size: 26, spin: true },
  { top: 7.6, left: 8, size: 22, tilt: 20 },
  { top: 10.8, left: 36, size: 30, spin: true },
  { top: 13.6, right: 6, size: 24, tilt: -15 },
  { top: 20.4, right: 2.6, size: 22, wide: true },
  { top: 24.6, left: 47, size: 28, spin: true },
  { top: 30, right: 4.5, size: 22, tilt: 30 },
  { top: 41, left: 4, size: 24, wide: true },
  { top: 54, right: 3.8, size: 26, spin: true },
  { top: 67, left: 3.6, size: 22, wide: true },
  { top: 79, right: 4, size: 26, tilt: 10 },
  { top: 98.5, left: 40, size: 28, spin: true },
];

/* ---------- Flight plane ---------- */
const butterflies: Flight[] = [
  { theme: "rose", top: 2.4, left: 46, size: 50, fx: 80, fy: 30, loop: 11 },
  { theme: "gold", top: 6.2, left: 30, size: 40, fx: -64, fy: 34, loop: 13 },
  { theme: "lilac", top: 9.6, left: 62, size: 46, fx: 90, fy: -30, loop: 12, wide: true },
  { theme: "peach", top: 14, left: 18, size: 40, fx: 70, fy: 26, loop: 14, wide: true },
  { theme: "rose", top: 24.2, left: 72, size: 48, fx: -80, fy: 30, loop: 12 },
  { theme: "gold", top: 31, left: 50, size: 38, fx: 24, fy: 60, loop: 15, wide: true },
  { theme: "gold", top: 36, right: 3, size: 36, fx: -26, fy: 40, loop: 10, wide: true },
  { theme: "peach", top: 49, left: 50.5, size: 36, fx: -22, fy: 64, loop: 14, wide: true },
  { theme: "lilac", top: 60, left: 2.5, size: 36, fx: 26, fy: -36, loop: 11, wide: true },
  { theme: "rose", top: 72, left: 50, size: 38, fx: 24, fy: -60, loop: 13, wide: true },
  { theme: "peach", top: 89.6, left: 62, size: 50, fx: -76, fy: 34, loop: 13 },
  { theme: "rose", top: 96.5, left: 20, size: 44, fx: 70, fy: -28, loop: 12 },
];

/** Cherry twigs growing in from the margins; `flip` grows them from the right. */
const sprigs: Array<Piece & { flip?: boolean }> = [
  { top: 3.8, right: -1, size: 170, flip: true, tilt: -6 },
  { top: 8.6, left: -1, size: 150, tilt: 4 },
  { top: 16.2, right: -1.5, size: 160, flip: true, tilt: 8, wide: true },
  { top: 26.5, left: -1.2, size: 170, tilt: -4, wide: true },
  { top: 43, right: -1.4, size: 150, flip: true, tilt: 6, wide: true },
  { top: 57, left: -1, size: 160, tilt: 6, wide: true },
  { top: 71, right: -1.2, size: 170, flip: true, tilt: -8, wide: true },
  { top: 85, left: -1.4, size: 150, tilt: -6 },
  { top: 95, right: -1, size: 160, flip: true, tilt: 4 },
];

/* ---------- Near plane ---------- */
/** Big words in the open ground between sections, whole and clear of the photos and cards. They ride the near plane,
 * so they keep to the gap they rest in: "nhớ" above the scrapbook's opening words, "gặp" and "thương" either side of
 * the gap between the keepsake box and the chapters. */
const words: Array<Piece & { text: string }> = [
  { text: "nhớ", top: 8.6, left: 22, size: 12 },
  { text: "gặp", top: 24, left: 3, size: 13 },
  { text: "thương", top: 23.5, right: 3, size: 8 },
];
const keepsakes: Array<Piece & { kind: Keepsake }> = [
  { kind: "tape", top: 1.4, left: -1.5, size: 130, tilt: -18, wide: true },
  { kind: "polaroid", top: 11.5, left: -2, size: 96, tilt: 9 },
  { kind: "stamp", top: 18.5, right: -1, size: 68, tilt: 12 },
  { kind: "note", top: 27, left: -2.5, size: 120, tilt: -8, wide: true },
  { kind: "ticket", top: 36, right: -2.5, size: 130, tilt: 10 },
  { kind: "tape", top: 44, left: -1.8, size: 120, tilt: 14, wide: true },
  { kind: "polaroid", top: 51, right: -2.2, size: 92, tilt: -7 },
  { kind: "stamp", top: 60, left: -1, size: 66, tilt: -12, wide: true },
  { kind: "note", top: 68.5, right: -2.5, size: 118, tilt: 7 },
  { kind: "ticket", top: 76, left: -2.2, size: 124, tilt: -9, wide: true },
  { kind: "tape", top: 84.5, right: -1.6, size: 128, tilt: -16 },
  { kind: "polaroid", top: 93, left: 4, size: 96, tilt: -10, wide: true },
];

/* ---------- In front ---------- */
/** Mostly off the page: about 4vw of each shows, inside the margin. */
const frontBlossoms: Piece[] = [
  { top: 6, left: -10, size: 14, tilt: -20 },
  { top: 22, right: -12, size: 16, tilt: 35 },
  { top: 40, left: -9, size: 13, tilt: 10 },
  { top: 58, right: -11, size: 15, tilt: -30 },
  { top: 76, left: -10, size: 14, tilt: 25 },
  { top: 95, right: -9, size: 13, tilt: -10 },
];

const frontButterflies: Flight[] = [
  { theme: "rose", top: 31, left: 0.4, size: 4.2, fx: 18, fy: -40, loop: 9 },
  { theme: "peach", top: 70, right: 0.4, size: 4.2, fx: -18, fy: 40, loop: 10 },
];

const glyphs: Record<Doodle, ReactElement> = {
  heart: <path d="M12 20.5s-7.5-4.6-7.5-10.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 2.5c0 5.8-7.5 10.4-7.5 10.4z" />,
  sparkle: <path className="is-filled" d="M12 2.5c.7 4.9 4.6 8.8 9.5 9.5-4.9.7-8.8 4.6-9.5 9.5-.7-4.9-4.6-8.8-9.5-9.5 4.9-.7 8.8-4.6 9.5-9.5z" />,
  notes: (
    <>
      <path d="M9 17.5V5.5l10-2v11.5" />
      <circle cx="6.5" cy="17.5" r="2.5" />
      <circle cx="16.5" cy="15" r="2.5" />
    </>
  ),
  airplane: (
    <>
      <path d="M3 11.5 21 4l-6 16-3.2-6.3L3 11.5z" />
      <path d="M11.8 13.7 21 4" />
    </>
  ),
  bubble: <path d="M5 5h14a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 16h-8l-4.5 3.5V16H5a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 5 5z" />,
  ring: <circle cx="12" cy="12" r="7" strokeDasharray="2 3" />,
  flower: (
    <>
      {[0, 72, 144, 216, 288].map((turn) => <ellipse key={turn} cx="12" cy="7" rx="2.6" ry="4" transform={`rotate(${turn} 12 12)`} />)}
      <circle className="is-filled" cx="12" cy="12" r="1.8" />
    </>
  ),
  envelope: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="1.5" />
      <path d="m3.5 7 8.5 6.5L20.5 7" />
    </>
  ),
  swirl: <path d="M2.5 14c3-6 6 2 9.5-4s6 2 9.5-4" />,
};

function place({ top, left, right, size, tilt = 0 }: Piece, unit: "px" | "vw", extra?: Record<string, string>): CSSProperties {
  const style: Record<string, string> = { "--at": String(top), "--size": `${size}${unit}`, "--tilt": `${tilt}deg`, ...extra };
  if (right === undefined) style.left = `${left ?? 0}%`;
  else style.right = `${right}%`;
  return style as CSSProperties;
}

function fly(flight: Flight, unit: "px" | "vw", index: number) {
  return place(flight, unit, {
    "--fx": `${flight.fx}px`,
    "--fy": `${flight.fy}px`,
    "--loop": `${flight.loop}s`,
    // Start each loop somewhere different, so no two butterflies beat in step.
    "--offset": `${-((index * 2.7) % flight.loop).toFixed(1)}s`,
  });
}

export function PartOneDepth() {
  return (
    <>
      <div className="depth-field" aria-hidden="true">
        <div className="depth-plane depth-plane-far">
          {beams.map((beam) => <span className="depth-item depth-beam" data-wide={beam.wide || undefined} style={place(beam, "vw")} key={`beam-${beam.top}`} />)}
          {glows.map((glow) => <span className="depth-item depth-glow" data-wide={glow.wide || undefined} style={place(glow, "vw")} key={`glow-${glow.top}`} />)}
        </div>
        <div className="depth-plane depth-plane-drift">
          {clouds.map((cloud) => (
            <span
              className={`depth-item depth-cloud ${cloud.billow ? "is-billowing" : ""}`.trim()}
              data-wide={cloud.wide || undefined}
              data-idle-zone
              style={place(cloud, "px")}
              key={`cloud-${cloud.top}`}
            >
              <Cloud variant={cloud.variant} />
            </span>
          ))}
          {doodles.map((doodle) => (
            <svg
              className={`depth-item depth-doodle depth-${doodle.kind}`}
              data-wide={doodle.wide || undefined}
              style={place(doodle, "px")}
              viewBox="0 0 24 24"
              key={`${doodle.kind}-${doodle.top}`}
            >
              {glyphs[doodle.kind]}
            </svg>
          ))}
          {[...blossoms].sort((a, b) => Number(Boolean(a.spin)) - Number(Boolean(b.spin))).map((blossom) => (
            <span
              className={`depth-item depth-blossom ${blossom.spin ? "is-turning" : ""}`.trim()}
              data-wide={blossom.wide || undefined}
              data-idle-zone={blossom.spin || undefined}
              style={place(blossom, "px")}
              key={`blossom-${blossom.top}`}
            >
              <Blossom />
            </span>
          ))}
        </div>
        <div className="depth-plane depth-plane-flight">
          {sprigs.map((sprig) => (
            <span
              className={`depth-item depth-sprig ${sprig.flip ? "is-flipped" : ""}`.trim()}
              data-wide={sprig.wide || undefined}
              data-idle-zone
              style={place(sprig, "px")}
              key={`sprig-${sprig.top}`}
            >
              <Sprig flip={sprig.flip} />
            </span>
          ))}
          {butterflies.map((flight, index) => (
            <span className="depth-item depth-butterfly" data-wide={flight.wide || undefined} data-idle-zone style={fly(flight, "px", index)} key={`butterfly-${flight.top}`}>
              <Butterfly theme={flight.theme} />
            </span>
          ))}
        </div>
        <div className="depth-plane depth-plane-near">
          {words.map((word) => (
            <span className="depth-item depth-word" data-wide={word.wide || undefined} style={place(word, "vw")} key={word.text}>
              {word.text}
            </span>
          ))}
          {keepsakes.map((keepsake) => (
            <span
              className={`depth-item depth-keepsake depth-${keepsake.kind}`}
              data-wide={keepsake.wide || undefined}
              style={place(keepsake, "px")}
              key={`${keepsake.kind}-${keepsake.top}`}
            />
          ))}
        </div>
      </div>
      {/* In front of the story: only ever at the very edges, so they pass the reader without covering a word. */}
      <div className="depth-front" aria-hidden="true">
        <div className="depth-plane depth-plane-front">
          {frontBlossoms.map((blossom) => (
            <span className="depth-item depth-front-blossom" style={place(blossom, "vw")} key={`front-${blossom.top}`}>
              <Blossom />
            </span>
          ))}
          {frontButterflies.map((flight, index) => (
            <span className="depth-item depth-butterfly depth-front-butterfly" data-idle-zone style={fly(flight, "vw", index + 3)} key={`front-butterfly-${flight.top}`}>
              <Butterfly theme={flight.theme} />
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
