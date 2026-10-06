import { useEffect, useId, useRef, type CSSProperties } from "react";
import { Bird, Lantern } from "../../story/components/StoryArt";
import { puffPath, seeded, type Puff } from "../utils/realmShapes";
import { FairyCorners } from "./FairyCorners";

/**
 * The memory room as a fairyland above the clouds, one realm for each part: a sun going down behind the sunflowers for
 * Phần I, a full moon over the hydrangeas for Phần II. Karst towers with pines on their crowns rise out of a sea of
 * clouds, mist winds round them, cranes cross the dusk and sky lanterns drift up into the night, and flowers frame the
 * four corners (FairyCorners). Switching parts sets the sun into the clouds while the moon comes up (memory-fairyland.css).
 *
 * Everything here is drawn once: the drift of the clouds, the turning light and the twinkling stars are transform and
 * opacity animations, and the light rays are a small canvas the compositor scales up. Layers marked `data-depth` lean
 * with the pointer (FairyDust moves them), the far ones least.
 */

type RealmName = "dusk" | "night";

interface Palette {
  peaks: { farTop: string; farMid: string; mist: string; nearTop: string; nearMid: string; rim: string };
  clouds: Record<"back" | "front", { lit: string; body: string; deep: string; shade: string }>;
  rays: string;
}

const palettes: Record<RealmName, Palette> = {
  dusk: {
    peaks: { farTop: "#b4668a", farMid: "#7a3b6c", mist: "#f3ab9c", nearTop: "#40194a", nearMid: "#1f0c2b", rim: "#ffb08a" },
    clouds: {
      back: { lit: "#ffe0c6", body: "#e1a0aa", deep: "#a8628a", shade: "#764277" },
      front: { lit: "#ffeadb", body: "#d394a6", deep: "#94557f", shade: "#4f2a5c" },
    },
    rays: "255, 214, 160",
  },
  night: {
    peaks: { farTop: "#5a82b3", farMid: "#2b4878", mist: "#a2c2e8", nearTop: "#16294d", nearMid: "#08132b", rim: "#cfe4ff" },
    clouds: {
      back: { lit: "#e2edff", body: "#94afd6", deep: "#5673a3", shade: "#2e4874" },
      front: { lit: "#eff5ff", body: "#839fca", deep: "#456292", shade: "#1c3159" },
    },
    rays: "205, 228, 255",
  },
};

/* ---------- Shapes, worked out once ---------- */

/** A bank of cloud across a 1600 × 360 band: rows of overlapping puffs, each row nearer the reader and bigger. */
function cloudBank(seed: number, rows: Array<{ y: number; r: [number, number]; step: number }>): Puff[][] {
  const random = seeded(seed);
  return rows.map((row) => {
    const puffs: Puff[] = [];
    for (let x = -160 + random() * row.step; x < 1760; x += row.step * (0.55 + random() * 0.6)) {
      puffs.push({ x, y: row.y + (random() - 0.5) * row.r[0] * 0.7, r: row.r[0] + random() * (row.r[1] - row.r[0]) });
    }
    return puffs;
  });
}

/** Each row also fills down to the band's foot from a little below its puffs' middles, so only its billows show on top. */
function rowPath(puffs: Puff[]): string {
  const middle = puffs.reduce((sum, puff) => sum + puff.y + puff.r * 0.2, 0) / puffs.length;
  return `${puffPath(puffs, 0.94, 0)}M-200 ${middle.toFixed(1)}H1800V420H-200z`;
}

const banks = {
  back: cloudBank(11, [
    { y: 70, r: [22, 40], step: 40 },
    { y: 128, r: [34, 58], step: 56 },
    { y: 196, r: [46, 78], step: 72 },
    { y: 276, r: [60, 100], step: 92 },
  ]),
  front: cloudBank(29, [
    { y: 86, r: [34, 60], step: 58 },
    { y: 168, r: [50, 86], step: 80 },
    { y: 262, r: [70, 116], step: 104 },
  ]),
};

/** Karst towers in the far range and near, as they stand on the left; the right keeps its own skyline. */
const peaks = {
  left: {
    far: "M0 420V250c30-12 52-44 78-40 22 4 30 26 50 22 22-26 44-64 72-56 26 8 32 50 52 60 22-22 48-36 74-22 22 12 26 38 48 44 24-12 50-20 74-8 26 12 42 34 72 42 36 10 80 14 120 20v108z",
    near: [
      "M18 420c4-90 8-184 22-250 8-38 22-68 44-72 20-2 32 20 38 52 10 56 12 150 16 270z",
      "M112 420c6-80 14-158 32-206 10-26 26-42 44-38 18 4 26 28 30 60 6 54 8 124 12 184z",
      "M246 420c6-60 14-108 28-136 10-18 26-26 40-18 14 10 18 38 22 70 4 34 6 60 8 84z",
    ],
    pines: [
      [84, 98, 1],
      [70, 104, 0.7],
      [188, 176, 0.8],
    ],
  },
  right: {
    far: "M0 300c40-8 80-16 110-30s46-38 74-42c26-4 38 22 62 16s34-44 60-52c28-8 40 26 62 30 24 4 34-26 60-34 28-8 42 24 66 22 26-2 42-24 68-20 28 4 50 24 78 32v198H0z",
    near: [
      "M500 420c6-90 10-180 24-244 10-48 28-84 50-90 24-4 38 24 44 64 8 60 10 170 14 270z",
      "M392 420c4-70 12-140 26-184 10-30 26-46 44-44 18 2 26 28 30 60 6 48 8 118 10 168z",
      "M296 420c4-50 10-94 22-120 8-16 22-22 34-14 12 10 14 36 16 64 2 30 4 52 4 70z",
    ],
    pines: [
      [574, 86, 1],
      [590, 94, 0.65],
      [462, 192, 0.8],
    ],
  },
};

/** A pine standing on a crown of rock, its trunk's foot at (x, y), drawn in three tiers. */
function pinePath(x: number, y: number, scale: number): string {
  const s = (value: number) => (value * scale).toFixed(1);
  return `M${x} ${(y - 38 * scale).toFixed(1)}l${s(7)} ${s(11)}h${s(-3)}l${s(8)} ${s(10)}h${s(-4)}l${s(9)} ${s(11)}h${s(-16)}v${s(6)}h${s(-2)}v${s(-6)}h${s(-16)}l${s(9)} ${s(-11)}h${s(-4)}l${s(8)} ${s(-10)}h${s(-3)}z`;
}

interface Star {
  x: string;
  y: string;
  size: number;
  life: number;
  delay: number;
  /** Shown in the dusk sky too, not only at night. */
  dusk: boolean;
}

const stars: Star[] = (() => {
  const random = seeded(47);
  return Array.from({ length: 16 }, (_, index) => ({
    x: `${(4 + random() * 92).toFixed(1)}%`,
    y: `${(3 + random() * (index < 7 ? 26 : 50)).toFixed(1)}%`,
    size: Math.round(10 + random() * 14),
    life: Math.round(30 + random() * 40) / 10,
    delay: -Math.round(random() * 60) / 10,
    dusk: index < 7,
  }));
})();

/** Sky lanterns keep to the gaps between the words, the bouquet and the cards; on a phone, to the screen's edges. */
const lanterns = [
  { x: "33%", narrow: "7%", size: 1.2, life: 48, delay: -8 },
  { x: "36.5%", narrow: "91%", size: 0.85, life: 60, delay: -33 },
  { x: "65%", narrow: "13%", size: 1.35, life: 52, delay: -20 },
  { x: "68.5%", narrow: "86%", size: 0.95, life: 62, delay: -45 },
  { x: "97%", narrow: "3%", size: 0.9, life: 56, delay: -2 },
];

const cranes = [
  [0, 46],
  [30, 14],
  [58, 58],
  [86, 28],
];

/* ---------- Pieces ---------- */

/** Light rays fanning out of the sun or moon: a small canvas painted once, turned slowly by the stylesheet. */
function Rays({ tint, seed }: { tint: string; seed: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const size = 384;
    canvas.width = size;
    canvas.height = size;
    const half = size / 2;
    const random = seeded(seed);
    context.translate(half, half);
    const beams = 22;
    for (let index = 0; index < beams; index += 1) {
      const angle = (index / beams) * Math.PI * 2 + random() * 0.12;
      const spread = 0.035 + random() * 0.07;
      const strength = 0.22 + random() * 0.5;
      const fill = context.createRadialGradient(0, 0, size * 0.04, 0, 0, half);
      fill.addColorStop(0, `rgba(${tint}, ${strength})`);
      fill.addColorStop(0.55, `rgba(${tint}, ${strength * 0.35})`);
      fill.addColorStop(1, `rgba(${tint}, 0)`);
      context.fillStyle = fill;
      context.beginPath();
      context.moveTo(0, 0);
      context.arc(0, 0, half, angle - spread, angle + spread);
      context.closePath();
      context.fill();
    }
  }, [seed, tint]);

  return <canvas className="realm-rays" ref={ref} />;
}

function Peaks({ side, palette }: { side: "left" | "right"; palette: Palette["peaks"] }) {
  const id = useId().replace(/[^\w-]/g, "");
  const shape = peaks[side];
  const inward = side === "left" ? ["0", "1"] : ["1", "0"];
  return (
    <span className={`realm-peaks is-${side}`} data-depth="10">
      <svg viewBox="0 0 640 420" preserveAspectRatio={side === "left" ? "xMinYMax meet" : "xMaxYMax meet"} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${id}-far`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={palette.farTop} />
            <stop offset="0.5" stopColor={palette.farMid} />
            <stop offset="1" stopColor={palette.mist} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-near`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={palette.nearTop} />
            <stop offset="0.62" stopColor={palette.nearMid} />
            <stop offset="1" stopColor={palette.nearMid} stopOpacity="0.2" />
          </linearGradient>
          {/* The flank facing the light catches it. */}
          <linearGradient id={`${id}-rim`} x1={inward[0]} y1="0" x2={inward[1]} y2="0.35">
            <stop offset="0.5" stopColor={palette.rim} stopOpacity="0" />
            <stop offset="1" stopColor={palette.rim} stopOpacity="0.55" />
          </linearGradient>
          <radialGradient id={`${id}-mist`}>
            <stop offset="0" stopColor={palette.mist} stopOpacity="0.55" />
            <stop offset="1" stopColor={palette.mist} stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d={shape.far} fill={`url(#${id}-far)`} />
        <ellipse cx={side === "left" ? 330 : 310} cy="300" rx="300" ry="34" fill={`url(#${id}-mist)`} />
        {shape.near.map((path) => (
          <g key={path}>
            <path d={path} fill={`url(#${id}-near)`} />
            <path d={path} fill={`url(#${id}-rim)`} />
          </g>
        ))}
        <path d={shape.pines.map(([x, y, scale]) => pinePath(x, y, scale)).join("")} fill={palette.nearMid} />
        <ellipse cx={side === "left" ? 150 : 490} cy="352" rx="240" ry="30" fill={`url(#${id}-mist)`} />
      </svg>
    </span>
  );
}

function CloudSea({ layer, palette }: { layer: "back" | "front"; palette: Palette["clouds"]["back"] }) {
  const id = useId().replace(/[^\w-]/g, "");
  const rows = banks[layer];
  return (
    <span className={`realm-clouds is-${layer}`} data-depth={layer === "back" ? "8" : "16"}>
      {/* The drift moves this HTML box, not the <svg> itself, which Chrome would paint again every frame. */}
      <span className="realm-clouds-drift">
        <svg viewBox="0 0 1600 360" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id={`${id}-body`} gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="0" y2="380">
              <stop offset="0" stopColor={palette.body} />
              <stop offset="1" stopColor={palette.deep} />
            </linearGradient>
            {/* The tops catch the most light right under the sun or moon, and less toward the edges. */}
            <radialGradient id={`${id}-lit`} gradientUnits="userSpaceOnUse" cx="800" cy="0" r="1000">
              <stop offset="0" stopColor="#fffaf2" />
              <stop offset="0.4" stopColor={palette.lit} />
              <stop offset="1" stopColor={palette.body} />
            </radialGradient>
            <linearGradient id={`${id}-depth`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0.35" stopColor={palette.shade} stopOpacity="0" />
              <stop offset="1" stopColor={palette.shade} stopOpacity={layer === "front" ? "0.75" : "0.4"} />
            </linearGradient>
            <filter id={`${id}-soft`} x="-5%" y="-30%" width="110%" height="160%">
              <feGaussianBlur stdDeviation={layer === "front" ? 4.5 : 5.5} />
            </filter>
          </defs>
          <g filter={`url(#${id}-soft)`}>
            {rows.map((puffs, index) => (
              // Far rows first; each nearer row covers the foot of the one behind it, leaving its shadow on it.
              <g key={index}>
                <path d={puffPath(puffs, 1.02, -0.18)} fill={palette.shade} opacity="0.4" />
                <path d={rowPath(puffs)} fill={`url(#${id}-body)`} />
                <path d={puffPath(puffs, 0.7, 0.26)} fill={`url(#${id}-lit)`} opacity="0.85" />
              </g>
            ))}
          </g>
          <rect x="0" y="0" width="1600" height="360" fill={`url(#${id}-depth)`} />
        </svg>
      </span>
    </span>
  );
}

function Realm({ name }: { name: RealmName }) {
  const palette = palettes[name];
  return (
    <span className={`memory-sky ${name === "dusk" ? "memory-sky-one" : "memory-sky-two"} realm is-${name}`}>
      <i className="star-layer star-layer-far" />
      {name === "night" ? <i className="star-layer star-layer-near" /> : null}
      <i className="aurora memory-aurora memory-aurora-a" />
      <i className="aurora memory-aurora memory-aurora-b" />
      <span className="realm-stars" data-depth="3">
        {stars
          .filter((star) => name === "night" || star.dusk)
          .map((star) => (
            <i
              className="realm-star"
              key={`${star.x}-${star.y}`}
              style={{ "--x": star.x, "--y": star.y, "--size": `${star.size}px`, "--life": `${star.life}s`, "--delay": `${star.delay}s` } as CSSProperties}
            />
          ))}
      </span>
      <span className="realm-celestial-anchor" data-depth="4">
        <span className={`realm-celestial ${name === "dusk" ? "is-sun" : "is-moon"}`}>
          <Rays tint={palette.rays} seed={name === "dusk" ? 3 : 9} />
          <i className="realm-halo" />
          {name === "night" ? <i className="realm-ring" /> : null}
          <i className="realm-disc" />
        </span>
      </span>
      {name === "dusk" ? (
        <span className="realm-cranes">
          {cranes.map(([x, y], index) => (
            <span className="realm-crane" key={`${x}-${y}`} style={{ left: `${x}%`, top: `${y}%`, "--beat": `${0.9 + index * 0.13}s` } as CSSProperties}>
              <Bird />
            </span>
          ))}
        </span>
      ) : null}
      <Peaks side="left" palette={palette.peaks} />
      <Peaks side="right" palette={palette.peaks} />
      {name === "night"
        ? lanterns.map((lantern) => (
            <span
              className="realm-lantern"
              key={lantern.x}
              style={{ "--x": lantern.x, "--x-narrow": lantern.narrow, "--size": lantern.size, "--life": `${lantern.life}s`, "--delay": `${lantern.delay}s` } as CSSProperties}
            >
              <Lantern />
            </span>
          ))
        : null}
      <span className="realm-mist" data-depth="12" />
      <CloudSea layer="back" palette={palette.clouds.back} />
      <CloudSea layer="front" palette={palette.clouds.front} />
      <FairyCorners realm={name} />
    </span>
  );
}

/** Both realms, crossfaded by the part in hand (see memory-opening.css). */
export function FairyRealm() {
  return (
    <>
      <Realm name="dusk" />
      <Realm name="night" />
    </>
  );
}
