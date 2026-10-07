import { memo, type CSSProperties } from "react";
import { Cloud, Floret, Lantern } from "./StoryArt";

/**
 * Part II's depth of field, for its blue hour: city lights out of focus and faint stars far behind the story; night clouds
 * and hydrangea florets drifting nearer; fireflies and paper lanterns nearer still; words from the chapters, tickets and
 * photos in the margins; and big soft lights and florets passing in front at the edges. The machinery (planes,
 * speeds, fallback) is shared with Part I in depth-field.css; the night palette is in part-two-depth.css.
 *
 * Only the title page and the chapters show what is behind the story (the keepsake box and the ending paint their own
 * ground), so the back planes stop at about 70% of the page; the plane in front runs to the end.
 */

interface Piece {
  /** Where on the page the piece sits as it crosses the middle of the screen, in % of the page height. */
  top: number;
  left?: number;
  right?: number;
  /** Width: px for small pieces, vw for the large soft ones. */
  size: number;
  tilt?: number;
  /** Only on wide screens. */
  wide?: boolean;
}

/* ---------- Far ---------- */
const lights: Array<Piece & { tone: "teal" | "peach" | "lilac" }> = [
  { tone: "teal", top: 1.5, left: 8, size: 10 },
  { tone: "peach", top: 4.5, left: 78, size: 8 },
  { tone: "lilac", top: 9, left: 30, size: 12, wide: true },
  { tone: "teal", top: 15, right: 2, size: 9 },
  { tone: "peach", top: 22, left: 4, size: 10, wide: true },
  { tone: "lilac", top: 30, right: 6, size: 8 },
  { tone: "teal", top: 38, left: 2, size: 11 },
  { tone: "peach", top: 46, right: 3, size: 9, wide: true },
  { tone: "lilac", top: 54, left: 6, size: 10 },
  { tone: "teal", top: 62, right: 4, size: 12 },
];

/** Stars; the ones with `twinkle` breathe (they are idle zones). */
const stars: Array<Piece & { twinkle?: boolean }> = [
  { top: 0.8, left: 22, size: 10 },
  { top: 2.2, left: 64, size: 14, twinkle: true },
  { top: 3.6, left: 88, size: 9 },
  { top: 5.4, left: 12, size: 12, twinkle: true },
  { top: 7.2, left: 52, size: 9, wide: true },
  { top: 11, right: 4, size: 12, twinkle: true },
  { top: 18, left: 3, size: 10 },
  { top: 26, right: 8, size: 13, twinkle: true },
  { top: 34, left: 4.5, size: 9, wide: true },
  { top: 42, right: 5, size: 12 },
  { top: 50, left: 3.5, size: 11, twinkle: true },
  { top: 58, right: 7, size: 9, wide: true },
  { top: 66, left: 5, size: 12, twinkle: true },
];

/* ---------- Drift ---------- */
const clouds: Array<Piece & { variant: number }> = [
  { variant: 0, top: 0.4, left: 4, size: 260 },
  { variant: 2, top: 3.2, right: 6, size: 200 },
  { variant: 1, top: 7.6, left: 60, size: 300 },
  { variant: 2, top: 13, right: -2, size: 210 },
  { variant: 0, top: 21, left: -3, size: 240, wide: true },
  { variant: 1, top: 29, right: -2, size: 260 },
  { variant: 2, top: 40, left: -2, size: 200, wide: true },
  { variant: 0, top: 51, right: -3, size: 250 },
  { variant: 1, top: 62, left: -2, size: 230, wide: true },
];

/** Hydrangea florets; `spin` turns them slowly. The first three sit around the title page, which on a phone has no room. */
const florets: Array<Piece & { spin?: boolean }> = [
  { top: 1.6, left: 24, size: 26, spin: true, wide: true },
  { top: 4.8, left: 18, size: 22, tilt: 20, wide: true },
  { top: 6.2, right: 14, size: 30, spin: true, wide: true },
  { top: 12, left: 4, size: 24 },
  { top: 19, right: 3, size: 22, tilt: -15, wide: true },
  { top: 27, left: 3, size: 26, spin: true },
  { top: 36, right: 4, size: 22 },
  { top: 44, left: 4, size: 24, tilt: 30, wide: true },
  { top: 53, right: 3.6, size: 26, spin: true },
  { top: 64, left: 3, size: 22 },
];

/* ---------- Flight ---------- */
/** Fireflies wander in small loops and pulse; px loop sizes, seconds per loop. */
const fireflies: Array<Piece & { fx: number; fy: number; loop: number }> = [
  { top: 1.2, left: 30, size: 7, fx: 40, fy: 26, loop: 9 },
  { top: 2.8, left: 70, size: 6, fx: -36, fy: 30, loop: 11 },
  { top: 4.4, left: 46, size: 8, fx: 30, fy: -24, loop: 10 },
  { top: 6.6, left: 24, size: 6, fx: -28, fy: 22, loop: 12 },
  { top: 8, left: 82, size: 7, fx: 34, fy: -28, loop: 9 },
  { top: 16, right: 4, size: 6, fx: -20, fy: 34, loop: 10 },
  { top: 24, left: 2.5, size: 7, fx: 22, fy: -30, loop: 11, wide: true },
  { top: 35, right: 3, size: 6, fx: -18, fy: 28, loop: 9 },
  { top: 47, left: 3, size: 7, fx: 20, fy: 30, loop: 12, wide: true },
  { top: 57, right: 4, size: 8, fx: -24, fy: -26, loop: 10 },
  { top: 68, left: 3.5, size: 6, fx: 18, fy: 24, loop: 11 },
];

/** Paper lanterns, rising a little and swaying as they go. */
const lanterns: Piece[] = [
  { top: 2, left: 2.5, size: 34, tilt: -6 },
  { top: 5, right: 22, size: 26, tilt: 5, wide: true },
  { top: 9.5, left: 72, size: 30, tilt: -4, wide: true },
  { top: 20, right: 2.5, size: 28, tilt: 6, wide: true },
  { top: 42, left: 2, size: 26, tilt: -5 },
  { top: 60, right: 2.6, size: 30, tilt: 4, wide: true },
];

/* ---------- Near ---------- */
/** Words from the chapters, whole and inside the right margin (sized in vw to fit it; screens too narrow to have one
 * leave them out). They ride the near plane, so they stay beside the paragraphs they rest by, in the gaps between the
 * chapter numerals, the aquarium's photo strip and the long sunset quote that reach into the margin. */
const words: Array<Piece & { text: string }> = [
  { text: "hẹn", top: 30, right: 1.6, size: 5, wide: true },
  { text: "cạnh", top: 40.5, right: 1.3, size: 4.2, wide: true },
  { text: "mãi", top: 59.4, right: 1.6, size: 5, wide: true },
];
const keepsakes: Array<Piece & { kind: "tape" | "polaroid" | "ticket" }> = [
  { kind: "ticket", top: 10.5, left: -2.4, size: 130, tilt: -9, wide: true },
  { kind: "polaroid", top: 18, right: -2.2, size: 96, tilt: 8 },
  { kind: "tape", top: 26, left: -1.6, size: 124, tilt: 14, wide: true },
  { kind: "ticket", top: 37, right: -2.6, size: 128, tilt: -10 },
  { kind: "polaroid", top: 48, left: -2.2, size: 92, tilt: -8, wide: true },
  { kind: "tape", top: 57, right: -1.8, size: 120, tilt: -14 },
  { kind: "polaroid", top: 66, right: -2, size: 90, tilt: 6, wide: true },
];

/* ---------- In front ---------- */
/** Mostly off the page: about 4vw of each shows, inside the margin. */
const frontLights: Array<Piece & { tone: "teal" | "peach" | "lilac" }> = [
  { tone: "teal", top: 8, left: -11, size: 15 },
  { tone: "peach", top: 24, right: -13, size: 17 },
  { tone: "lilac", top: 41, left: -10, size: 14 },
  { tone: "teal", top: 59, right: -12, size: 16 },
  { tone: "peach", top: 77, left: -11, size: 15 },
  { tone: "lilac", top: 95, right: -10, size: 14 },
];
const frontFlorets: Piece[] = [
  { top: 15, left: -9, size: 11, tilt: 20 },
  { top: 50, right: -9, size: 12, tilt: -25 },
  { top: 86, left: -8, size: 11, tilt: 10 },
];

function place({ top, left, right, size, tilt = 0 }: Piece, unit: "px" | "vw", extra?: Record<string, string>): CSSProperties {
  const style: Record<string, string> = { "--at": String(top), "--size": `${size}${unit}`, "--tilt": `${tilt}deg`, ...extra };
  if (right === undefined) style.left = `${left ?? 0}%`;
  else style.right = `${right}%`;
  return style as CSSProperties;
}

export const PartTwoDepth = memo(function PartTwoDepth() {
  return (
    <>
      <div className="depth-field" aria-hidden="true">
        <div className="depth-plane depth-plane-far">
          {lights.map((light) => (
            <span className={`depth-item depth-light is-${light.tone}`} data-wide={light.wide || undefined} style={place(light, "vw")} key={`light-${light.top}`} />
          ))}
          {/* Still stars first, the breathing ones last, so none of the still ones has to become a layer of its own. */}
          {[...stars].sort((a, b) => Number(Boolean(a.twinkle)) - Number(Boolean(b.twinkle))).map((star) => (
            <span
              className={`depth-item depth-star ${star.twinkle ? "is-twinkling" : ""}`.trim()}
              data-wide={star.wide || undefined}
              data-idle-zone={star.twinkle || undefined}
              style={place(star, "px")}
              key={`star-${star.top}`}
            />
          ))}
        </div>
        <div className="depth-plane depth-plane-drift">
          {clouds.map((cloud) => (
            <span className="depth-item depth-cloud" data-wide={cloud.wide || undefined} data-idle-zone style={place(cloud, "px")} key={`cloud-${cloud.top}`}>
              <Cloud variant={cloud.variant} />
            </span>
          ))}
          {[...florets].sort((a, b) => Number(Boolean(a.spin)) - Number(Boolean(b.spin))).map((floret) => (
            <span
              className={`depth-item depth-floret ${floret.spin ? "is-turning" : ""}`.trim()}
              data-wide={floret.wide || undefined}
              data-idle-zone={floret.spin || undefined}
              style={place(floret, "px")}
              key={`floret-${floret.top}`}
            >
              <Floret />
            </span>
          ))}
        </div>
        <div className="depth-plane depth-plane-flight">
          {lanterns.map((lantern, index) => (
            <span
              className="depth-item depth-lantern"
              data-wide={lantern.wide || undefined}
              data-idle-zone
              style={place(lantern, "px", { "--offset": `${-(index * 3.1).toFixed(1)}s` })}
              key={`lantern-${lantern.top}`}
            >
              <Lantern />
            </span>
          ))}
          {fireflies.map((firefly, index) => (
            <span
              className="depth-item depth-firefly"
              data-wide={firefly.wide || undefined}
              data-idle-zone
              style={place(firefly, "px", { "--fx": `${firefly.fx}px`, "--fy": `${firefly.fy}px`, "--loop": `${firefly.loop}s`, "--offset": `${-((index * 1.9) % firefly.loop).toFixed(1)}s` })}
              key={`firefly-${firefly.top}`}
            />
          ))}
        </div>
        <div className="depth-plane depth-plane-near">
          {words.map((word) => (
            <span className="depth-item depth-word" data-wide={word.wide || undefined} style={place(word, "vw")} key={word.text}>{word.text}</span>
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
          {frontLights.map((light) => (
            <span className={`depth-item depth-front-light is-${light.tone}`} style={place(light, "vw")} key={`front-light-${light.top}`} />
          ))}
          {frontFlorets.map((floret) => (
            <span className="depth-item depth-front-floret" style={place(floret, "vw")} key={`front-floret-${floret.top}`}>
              <Floret />
            </span>
          ))}
        </div>
      </div>
    </>
  );
});
