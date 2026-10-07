import { memo, type CSSProperties } from "react";
import { HeartSprite } from "./atoms/SceneSprites";
import { LotusSprite } from "./atoms/PartThreeSprites";
import { LilySprite } from "./atoms/PartThreeAutumnSprites";

/**
 * Part III's depth of field, for an autumn in red: warm out-of-focus lights far behind the story; red petals, lotus
 * petals and, in the last two chapters, red lilies drifting nearer; small hearts and gold motes nearer still; words from
 * the chapters, film frames and ticket stubs in the margins; and big soft lights passing in front at the edges. The
 * planes and their speeds are shared with the other parts (depth-field.css); the pieces' colours are in
 * story-part-three.css.
 *
 * Only the title page and the chapters show what is behind the story (the credits paint their own ground), so the back
 * planes stop at about 86% of the page, where the chapters end; the plane in front runs to the end.
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

type Tone = "gold" | "rose" | "wine";

/* ---------- Far ---------- */
const lights: Array<Piece & { tone: Tone }> = [
  { tone: "gold", top: 1, left: 7, size: 10 },
  { tone: "rose", top: 3, left: 78, size: 8 },
  { tone: "wine", top: 6, left: 30, size: 12, wide: true },
  { tone: "gold", top: 10, right: 2, size: 9 },
  { tone: "rose", top: 15, left: 4, size: 10, wide: true },
  { tone: "wine", top: 20, right: 6, size: 8 },
  { tone: "gold", top: 25, left: 2, size: 11 },
  { tone: "rose", top: 30, right: 3, size: 9, wide: true },
  { tone: "wine", top: 35, left: 6, size: 10 },
  { tone: "gold", top: 40, right: 4, size: 12 },
  { tone: "wine", top: 45, left: 3, size: 11, wide: true },
  { tone: "rose", top: 50, right: 5, size: 9 },
  { tone: "wine", top: 56, left: 5, size: 12 },
  { tone: "gold", top: 61, right: 3, size: 10, wide: true },
  { tone: "rose", top: 66, left: 3, size: 9 },
  { tone: "wine", top: 71, right: 4, size: 12 },
  { tone: "gold", top: 76, left: 6, size: 10, wide: true },
  { tone: "wine", top: 81, right: 5, size: 11 },
  { tone: "rose", top: 85, left: 4, size: 12 },
];

/* ---------- Drift ---------- */
/** Petals: red ones from the red room, pink ones from the lotus pond, then whole red lilies for the birthday month;
 * `spin` turns them slowly. */
const petals: Array<Piece & { kind: "red" | "lotus" | "lily"; spin?: boolean }> = [
  { kind: "red", top: 1.2, left: 22, size: 22, spin: true, wide: true },
  { kind: "red", top: 3, right: 16, size: 18, tilt: 30, wide: true },
  { kind: "red", top: 6.4, left: 4, size: 20, tilt: -20 },
  { kind: "red", top: 10, right: 3, size: 18, spin: true, wide: true },
  { kind: "red", top: 14, left: 3, size: 22, tilt: 40 },
  { kind: "lotus", top: 19, right: 4, size: 20, spin: true },
  { kind: "lotus", top: 23, left: 4, size: 22, tilt: -30, wide: true },
  { kind: "lotus", top: 28, right: 3.6, size: 20 },
  { kind: "lotus", top: 33, left: 3, size: 22, spin: true },
  { kind: "red", top: 38, right: 3, size: 20, tilt: 24 },
  { kind: "red", top: 43, left: 3.4, size: 18, spin: true, wide: true },
  { kind: "red", top: 48, right: 4, size: 22, tilt: -36 },
  { kind: "red", top: 53, left: 4, size: 20, spin: true },
  { kind: "red", top: 58, right: 3.2, size: 18, tilt: 18, wide: true },
  { kind: "lily", top: 63, left: 3, size: 34, spin: true },
  { kind: "lily", top: 68, right: 3.4, size: 30, tilt: 20, wide: true },
  { kind: "lily", top: 73, left: 4, size: 32, tilt: -16 },
  { kind: "lily", top: 78, right: 4, size: 36, spin: true },
  { kind: "lily", top: 83, left: 3.2, size: 30, tilt: 28, wide: true },
];

/* ---------- Flight ---------- */
/** Small hearts wander in loops (px loop sizes, seconds per loop), like the ones the two of them send each other. */
const hearts: Array<Piece & { fx: number; fy: number; loop: number }> = [
  { top: 0.8, left: 30, size: 14, fx: 40, fy: 26, loop: 11 },
  { top: 2, left: 70, size: 12, fx: -36, fy: 30, loop: 13 },
  { top: 4.4, left: 24, size: 12, fx: -28, fy: 22, loop: 12, wide: true },
  { top: 9, right: 4, size: 12, fx: -20, fy: 34, loop: 12 },
  { top: 13, left: 2.5, size: 14, fx: 22, fy: -30, loop: 13, wide: true },
  { top: 19, right: 3, size: 12, fx: -18, fy: 28, loop: 11 },
  { top: 25, left: 3, size: 14, fx: 20, fy: 30, loop: 14, wide: true },
  { top: 30, right: 4, size: 12, fx: -24, fy: -26, loop: 12 },
  { top: 36, left: 3.5, size: 12, fx: 18, fy: 24, loop: 13 },
  { top: 42, right: 3, size: 14, fx: -22, fy: 26, loop: 12, wide: true },
  { top: 49, left: 3, size: 12, fx: 24, fy: -22, loop: 11 },
  { top: 55, right: 4, size: 14, fx: -18, fy: 30, loop: 13 },
  { top: 62, left: 2.8, size: 12, fx: 20, fy: 26, loop: 12, wide: true },
  { top: 70, right: 3, size: 14, fx: -26, fy: -24, loop: 14 },
  { top: 77, left: 3.4, size: 12, fx: 22, fy: 28, loop: 11, wide: true },
  { top: 84, right: 4, size: 16, fx: -20, fy: 24, loop: 12 },
];

/** Gold motes in the projector's light, then in the lanterns' and the candles', drifting in small loops and pulsing. */
const motes: Array<Piece & { fx: number; fy: number; loop: number }> = [
  { top: 1.6, left: 46, size: 7, fx: 30, fy: -24, loop: 10 },
  { top: 5, left: 82, size: 6, fx: 34, fy: -28, loop: 9 },
  { top: 16, left: 2, size: 6, fx: 18, fy: 22, loop: 10 },
  { top: 22, right: 2.5, size: 7, fx: -22, fy: 20, loop: 11, wide: true },
  { top: 32, left: 2.4, size: 6, fx: 20, fy: -18, loop: 9 },
  { top: 46, right: 2.6, size: 6, fx: -20, fy: 22, loop: 10, wide: true },
  { top: 59, left: 2.2, size: 7, fx: 22, fy: -20, loop: 11 },
  { top: 72, right: 2.4, size: 6, fx: -18, fy: 24, loop: 9 },
  { top: 80, left: 2.6, size: 7, fx: 20, fy: 20, loop: 10, wide: true },
];

/* ---------- Near ---------- */
/** Words from the chapters, whole and inside the right margin, each beside the paragraph it comes from and clear of the
 * chapter numerals above them (measured on a 1440px page, where the margin is wide enough to show them). */
const words: Array<Piece & { text: string }> = [
  { text: "thuyền", top: 8.8, right: 1.2, size: 3.6, wide: true },
  { text: "Bi & Bơ", top: 15.4, right: 1.2, size: 3.4, wide: true },
  { text: "lén lút", top: 21.8, right: 1.2, size: 3.4, wide: true },
  { text: "ước", top: 31.5, right: 1.6, size: 4.6, wide: true },
  { text: "chiều tà", top: 36.3, right: 1.2, size: 3.4, wide: true },
  { text: "sư tử", top: 43.1, right: 1.2, size: 3.6, wide: true },
  { text: "ha hả", top: 53, right: 1.2, size: 3.6, wide: true },
  { text: "Cúc cu", top: 63.8, right: 1.2, size: 3.4, wide: true },
  { text: "trung thu", top: 74, right: 1.2, size: 3.2, wide: true },
  { text: "Tadaaaa", top: 83.6, right: 1.2, size: 3.2, wide: true },
];
/** Frames of film, ticket stubs and prints peeking in from the edges: on the right only in the gaps between the words,
 * and on the left only dark film, since the sticky stage's light labels pass in front of whatever peeks in there. */
const keepsakes: Array<Piece & { kind: "film" | "ticket" | "polaroid" }> = [
  { kind: "film", top: 5.5, left: -2.4, size: 140, tilt: -9, wide: true },
  { kind: "ticket", top: 11.2, right: -2.2, size: 120, tilt: 8 },
  { kind: "film", top: 14, left: -2.2, size: 128, tilt: 8, wide: true },
  { kind: "polaroid", top: 18, right: -2, size: 92, tilt: -8 },
  { kind: "film", top: 23.4, left: -2.4, size: 136, tilt: -10, wide: true },
  { kind: "ticket", top: 28.6, right: -2.2, size: 116, tilt: 7, wide: true },
  { kind: "polaroid", top: 33.4, right: -2, size: 90, tilt: 9, wide: true },
  { kind: "film", top: 39, left: -2.2, size: 132, tilt: 9, wide: true },
  { kind: "ticket", top: 47.6, right: -2.2, size: 118, tilt: -7 },
  { kind: "film", top: 51, left: -2.4, size: 136, tilt: -8, wide: true },
  { kind: "polaroid", top: 58, right: -2, size: 92, tilt: 8, wide: true },
  { kind: "film", top: 64, left: -2.2, size: 128, tilt: 10, wide: true },
  { kind: "ticket", top: 69, right: -2.2, size: 116, tilt: -8, wide: true },
  { kind: "film", top: 76, left: -2.4, size: 140, tilt: -9, wide: true },
  { kind: "polaroid", top: 79, right: -2, size: 94, tilt: -9 },
];

/* ---------- In front ---------- */
/** Mostly off the page: about 4vw of each shows, inside the margin. */
const frontLights: Array<Piece & { tone: Tone }> = [
  { tone: "rose", top: 6, left: -11, size: 15 },
  { tone: "gold", top: 17, right: -13, size: 17 },
  { tone: "wine", top: 28, left: -10, size: 14 },
  { tone: "rose", top: 39, right: -12, size: 16 },
  { tone: "wine", top: 50, left: -11, size: 15 },
  { tone: "rose", top: 61, right: -12, size: 16 },
  { tone: "wine", top: 72, left: -10, size: 14 },
  { tone: "gold", top: 83, right: -13, size: 17 },
  { tone: "wine", top: 95, left: -10, size: 14 },
];

function place({ top, left, right, size, tilt = 0 }: Piece, unit: "px" | "vw", extra?: Record<string, string>): CSSProperties {
  const style: Record<string, string> = { "--at": String(top), "--size": `${size}${unit}`, "--tilt": `${tilt}deg`, ...extra };
  if (right === undefined) style.left = `${left ?? 0}%`;
  else style.right = `${right}%`;
  return style as CSSProperties;
}

const loop = (piece: { fx: number; fy: number; loop: number }, index: number) => ({
  "--fx": `${piece.fx}px`, "--fy": `${piece.fy}px`, "--loop": `${piece.loop}s`, "--offset": `${-((index * 1.9) % piece.loop).toFixed(1)}s`,
});

export const PartThreeDepth = memo(function PartThreeDepth() {
  return (
    <>
      <div className="depth-field" aria-hidden="true">
        <div className="depth-plane depth-plane-far">
          {lights.map((light) => (
            <span className={`depth-item p3-depth-light is-${light.tone}`} data-wide={light.wide || undefined} style={place(light, "vw")} key={`light-${light.top}`} />
          ))}
        </div>
        <div className="depth-plane depth-plane-drift">
          {/* Still petals first, the turning ones last, so none of the still ones has to become a layer of its own. */}
          {[...petals].sort((a, b) => Number(Boolean(a.spin)) - Number(Boolean(b.spin))).map((petal) => (
            <span
              className={`depth-item p3-depth-petal is-${petal.kind} ${petal.spin ? "is-turning" : ""}`.trim()}
              data-wide={petal.wide || undefined}
              data-idle-zone={petal.spin || undefined}
              style={place(petal, "px")}
              key={`petal-${petal.top}`}
            >
              {petal.kind === "lotus" ? <LotusSprite /> : petal.kind === "lily" ? <LilySprite /> : <i />}
            </span>
          ))}
        </div>
        <div className="depth-plane depth-plane-flight">
          {hearts.map((heart, index) => (
            <span className="depth-item p3-depth-heart" data-wide={heart.wide || undefined} data-idle-zone style={place(heart, "px", loop(heart, index))} key={`heart-${heart.top}`}>
              <HeartSprite />
            </span>
          ))}
          {motes.map((mote, index) => (
            <span className="depth-item p3-depth-mote" data-wide={mote.wide || undefined} data-idle-zone style={place(mote, "px", loop(mote, index))} key={`mote-${mote.top}`} />
          ))}
        </div>
        <div className="depth-plane depth-plane-near">
          {words.map((word) => (
            <span className="depth-item depth-word p3-depth-word" data-wide={word.wide || undefined} style={place(word, "vw")} key={word.text}>{word.text}</span>
          ))}
          {keepsakes.map((keepsake) => (
            <span
              className={`depth-item p3-depth-keepsake is-${keepsake.kind}`}
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
            <span className={`depth-item p3-depth-front-light is-${light.tone}`} style={place(light, "vw")} key={`front-light-${light.top}`} />
          ))}
        </div>
      </div>
    </>
  );
});
