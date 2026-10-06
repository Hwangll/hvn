import { useId } from "react";
import { corolla, discPath, leafPath, limbPath, placer, puffPath, seedDots, seeded, type Point, type Puff } from "../utils/realmShapes";

/**
 * Flowers in the four corners of each realm, framing the room: a flowering bough with wisteria hanging from it at the top
 * corners (cherry blossom at dusk, moon-white blossom at night), and a bed of flowers on the clouds at the bottom ones
 * (sunflowers, cosmos and baby's breath at dusk; hydrangeas, lavender and baby's breath at night). The right-hand pieces
 * are the left ones turned round and grown from another seed.
 *
 * Each piece is one SVG of a dozen or so paths, every petal of a colour in the same path, drawn once; the whole piece
 * sways on its corner as one layer (memory-fairyland.css) and leans with the pointer, nearest of all (`data-depth`).
 */

type RealmName = "dusk" | "night";
type Side = "left" | "right";

interface Layer {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  blur?: number;
}

/** A vertical gradient in the piece's own units; layers use it as `@key`. */
interface Gradient {
  key: string;
  from: number;
  to: number;
  stops: Array<[offset: number, color: string]>;
}

interface Artwork {
  gradients: Gradient[];
  layers: Layer[];
}

/* ---------- The boughs at the top corners ---------- */

const BOUGH: Point[] = [
  { x: -30, y: 22 },
  { x: 40, y: 30 },
  { x: 110, y: 46 },
  { x: 180, y: 70 },
  { x: 250, y: 90 },
  { x: 320, y: 100 },
  { x: 390, y: 100 },
  { x: 455, y: 90 },
  { x: 515, y: 76 },
  { x: 568, y: 66 },
];

const TWIGS: Array<{ spine: Point[]; from: number; to: number }> = [
  { spine: [{ x: 105, y: 45 }, { x: 122, y: 80 }, { x: 138, y: 116 }, { x: 150, y: 150 }], from: 9, to: 2 },
  { spine: [{ x: 240, y: 88 }, { x: 258, y: 62 }, { x: 282, y: 42 }, { x: 312, y: 30 }], from: 8, to: 2 },
  { spine: [{ x: 330, y: 100 }, { x: 348, y: 134 }, { x: 360, y: 168 }], from: 6, to: 1.6 },
  { spine: [{ x: 190, y: 73 }, { x: 200, y: 108 }, { x: 206, y: 140 }], from: 6, to: 1.6 },
  { spine: [{ x: 455, y: 90 }, { x: 476, y: 118 }, { x: 486, y: 146 }], from: 5, to: 1.4 },
];

/** Where blossoms bunch: x, y and how many. */
const CLUSTERS: Array<[number, number, number]> = [
  [22, 28, 3], [78, 38, 4], [140, 110, 3], [152, 150, 2], [205, 136, 3], [214, 82, 3], [276, 46, 3], [312, 30, 3],
  [292, 96, 2], [356, 160, 3], [372, 98, 3], [428, 96, 3], [486, 142, 2], [500, 80, 3], [552, 66, 3],
];

/** Wisteria hanging from the bough: where along it, and how long; the longest hang nearest the corner. */
const RACEMES: Array<[number, number]> = [[50, 168], [92, 210], [134, 150], [176, 122], [236, 160], [300, 104], [350, 76], [412, 126], [470, 90], [530, 70]];

const boughTones = {
  dusk: {
    wood: "#3d1d33", bark: "#a6606f", leaf: "#5e6a3c", rib: "#9aa968", petal: "#ffd3e0", petalEdge: "#f39bb9", heart: "#ff7aa4",
    stamen: "#ffd86b", bud: "#ff9fbe", glow: "#ffbfd6", raceme: ["#ffd3ec", "#df92d6", "#9b58bf"], racemeShade: "#5e2c70", racemeLight: "#fff0f9",
  },
  night: {
    wood: "#141d36", bark: "#5d83bd", leaf: "#234852", rib: "#4f7d84", petal: "#eef4ff", petalEdge: "#b6caf2", heart: "#9cb6ff",
    stamen: "#fff0b8", bud: "#c6d6ff", glow: "#b8ccff", raceme: ["#d9e2ff", "#9aa6f0", "#5f5fc9"], racemeShade: "#252a6a", racemeLight: "#f2f5ff",
  },
};

function yOnBough(x: number): number {
  for (let index = 1; index < BOUGH.length; index += 1) {
    const [before, after] = [BOUGH[index - 1], BOUGH[index]];
    if (after.x >= x) return before.y + ((after.y - before.y) * (x - before.x)) / (after.x - before.x);
  }
  return BOUGH[BOUGH.length - 1].y;
}

/** One raceme of wisteria hanging from (x, y): florets big and close at the top, small and sparse toward the tip. */
function raceme(random: () => number, x: number, y: number, length: number, lean: number): Puff[] {
  const florets: Puff[] = [];
  const count = Math.round(length / 5);
  for (let index = 0; index < count; index += 1) {
    const t = index / (count - 1);
    const spread = (1 - t * 0.8) * 7;
    florets.push({
      x: x + Math.sin(t * Math.PI * 0.85) * lean + (random() - 0.5) * spread * 2,
      y: y + t * length + (random() - 0.5) * 4,
      r: 6.4 - 4.4 * t + random() * 1.2,
    });
  }
  return florets;
}

function boughArt(realm: RealmName, seed: number): Artwork {
  const random = seeded(seed);
  const tone = boughTones[realm];
  const limbs = [{ spine: BOUGH, from: 26, to: 4 }, ...TWIGS];
  const wood = limbs.map((limb) => limbPath(limb.spine, limb.from, limb.to)).join("");
  // Light along the top of each limb.
  const bark = limbs.map((limb) => limbPath(limb.spine.map((point) => ({ x: point.x, y: point.y - limb.from * 0.22 })), limb.from * 0.3, limb.to * 0.3)).join("");
  let petals = "";
  let hearts = "";
  let stamens = "";
  let buds = "";
  let leaves = "";
  let ribs = "";
  const glow: Puff[] = [];
  for (const [cx, cy, count] of CLUSTERS) {
    glow.push({ x: cx, y: cy, r: 22 + count * 5 });
    for (let index = 0; index < count; index += 1) {
      const angle = random() * Math.PI * 2;
      const distance = 4 + random() * 15;
      const size = 9 + random() * 7;
      const place = placer(cx + Math.cos(angle) * distance, cy + Math.sin(angle) * distance * 0.8, random() * Math.PI * 2, 0.6 + random() * 0.4);
      const start = random() * Math.PI;
      petals += corolla(place, 5, size, size * 0.95, "notched", start);
      hearts += corolla(place, 5, size * 0.4, size * 0.42, "round", start);
      stamens += discPath(place, size * 0.15);
    }
    const budAngle = random() * Math.PI * 2;
    buds += discPath(placer(cx + Math.cos(budAngle) * 20, cy + Math.sin(budAngle) * 14, budAngle, 0.62), 4.2);
    if (random() < 0.75) {
      const leaf = leafPath(cx + (random() - 0.5) * 18, cy + 4, (random() < 0.5 ? 0.5 : 2.6) + (random() - 0.5) * 0.6, 22 + random() * 12, 10 + random() * 4);
      leaves += leaf.blade;
      ribs += leaf.rib;
    }
  }
  const florets: Puff[] = [];
  for (const [x, length] of RACEMES) florets.push(...raceme(random, x, yOnBough(x) + 3, length * (0.85 + random() * 0.3), (random() - 0.5) * 16));
  return {
    gradients: [{ key: "raceme", from: 60, to: 300, stops: [[0, tone.raceme[0]], [0.45, tone.raceme[1]], [1, tone.raceme[2]]] }],
    layers: [
      { d: puffPath(glow), fill: tone.glow, opacity: 0.3, blur: 16 },
      { d: puffPath(florets, 1, -0.22), fill: tone.racemeShade, opacity: 0.8 },
      { d: puffPath(florets), fill: "@raceme" },
      { d: puffPath(florets, 0.46, 0.34), fill: tone.racemeLight, opacity: 0.5 },
      { d: wood, fill: tone.wood },
      { d: bark, fill: tone.bark, opacity: 0.75 },
      { d: leaves, fill: tone.leaf },
      { d: ribs, stroke: tone.rib, strokeWidth: 1, opacity: 0.7 },
      { d: buds, fill: tone.bud },
      { d: petals, fill: tone.petal, stroke: tone.petalEdge, strokeWidth: 0.7 },
      { d: hearts, fill: tone.heart, opacity: 0.8 },
      { d: stamens, fill: tone.stamen },
    ],
  };
}

/* ---------- The flower beds at the bottom corners ---------- */

/** The ground line sits just below the piece, so every stem runs out of the picture. */
const GROUND = 440;

/** Blades of grass across the bed, leaning in toward the room. */
function grass(random: () => number): string {
  let path = "";
  for (let index = 0; index < 12; index += 1) {
    const x = 6 + index * 46 + random() * 20;
    const height = 80 + random() * 130 * (1 - index / 16);
    const lean = 14 + random() * 40;
    path += limbPath(
      [
        { x, y: GROUND },
        { x: x + lean * 0.15, y: GROUND - height * 0.4 },
        { x: x + lean * 0.55, y: GROUND - height * 0.78 },
        { x: x + lean, y: GROUND - height },
      ],
      7,
      0.8,
    );
  }
  return path;
}

/** Baby's breath: thin stems fanning up from one root, each ending in a puff of tiny flowers. */
function babysBreath(random: () => number, root: Point, area: { x: [number, number]; y: [number, number] }): { stems: string; florets: Puff[] } {
  let stems = "";
  const florets: Puff[] = [];
  for (let index = 0; index < 9; index += 1) {
    const tip = { x: area.x[0] + random() * (area.x[1] - area.x[0]), y: area.y[0] + random() * (area.y[1] - area.y[0]) };
    const bend = { x: (root.x + tip.x) / 2 + (random() - 0.5) * 30, y: (root.y + tip.y) / 2 };
    stems += `M${root.x} ${root.y}Q${bend.x.toFixed(1)} ${bend.y.toFixed(1)} ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`;
    for (let floret = 0; floret < 8; floret += 1) {
      const angle = random() * Math.PI * 2;
      const distance = random() * 15;
      florets.push({ x: tip.x + Math.cos(angle) * distance, y: tip.y + Math.sin(angle) * distance * 0.8, r: 1.6 + random() * 1.8 });
    }
  }
  return { stems, florets };
}

const SUNFLOWERS = [
  { x: 168, y: 196, size: 64, turn: 0.25, squash: 0.92, stem: [{ x: 150, y: GROUND }, { x: 154, y: 360 }, { x: 160, y: 286 }, { x: 166, y: 222 }], thick: 12 },
  { x: 308, y: 272, size: 46, turn: 0.55, squash: 0.74, stem: [{ x: 268, y: GROUND }, { x: 280, y: 372 }, { x: 296, y: 318 }, { x: 305, y: 290 }], thick: 9 },
  { x: 64, y: 292, size: 40, turn: -0.2, squash: 0.86, stem: [{ x: 52, y: GROUND }, { x: 56, y: 380 }, { x: 62, y: 316 }], thick: 8 },
];

const COSMOS: Array<[number, number, number]> = [[392, 300, 20], [446, 350, 17], [358, 366, 15], [232, 344, 16], [500, 392, 14], [424, 246, 18]];

const HYDRANGEAS = [
  { x: 160, y: 238, rx: 98, ry: 76, stem: [{ x: 150, y: GROUND }, { x: 154, y: 360 }, { x: 158, y: 300 }] },
  { x: 308, y: 314, rx: 74, ry: 58, stem: [{ x: 296, y: GROUND }, { x: 302, y: 400 }, { x: 306, y: 360 }] },
  { x: 62, y: 320, rx: 62, ry: 50, stem: [{ x: 56, y: GROUND }, { x: 60, y: 400 }, { x: 62, y: 364 }] },
];

const LEAVES: Record<RealmName, Array<[number, number, number, number, number]>> = {
  dusk: [[154, 336, -2.55, 78, 42], [160, 300, -0.55, 68, 36], [282, 368, -0.45, 60, 30], [56, 378, -2.65, 54, 28], [232, 404, -0.95, 72, 34], [110, 412, -2.2, 66, 30]],
  night: [[150, 336, -2.45, 84, 46], [196, 348, -0.6, 78, 42], [302, 384, -0.5, 66, 34], [70, 384, -2.7, 62, 32], [250, 410, -1, 70, 34]],
};

const bedTones = {
  dusk: { glow: "#ffcf8f", grass: ["#7d8a45", "#2f3a1c"], stem: "#4f6a2a", leaf: "#5b6b34", rib: "#93a35e", breath: "#fff6ec", breathStem: "#6f7f45" },
  night: { glow: "#a9c4ff", grass: ["#3d6a66", "#14282c"], stem: "#1f3c3c", leaf: "#1d3c4b", rib: "#3f6f7c", breath: "#eaf2ff", breathStem: "#3c5c5c" },
};

function bedArt(realm: RealmName, seed: number): Artwork {
  const random = seeded(seed);
  const tone = bedTones[realm];
  let leaves = "";
  let ribs = "";
  for (const [x, y, angle, length, width] of LEAVES[realm]) {
    const leaf = leafPath(x, y, angle + (random() - 0.5) * 0.2, length, width);
    leaves += leaf.blade;
    ribs += leaf.rib;
  }
  const breath = babysBreath(random, { x: 470, y: GROUND }, realm === "dusk" ? { x: [400, 585], y: [222, 330] } : { x: [330, 470], y: [250, 350] });
  const base: Layer[] = [
    { d: puffPath([{ x: 190, y: 250, r: 150 }, { x: 340, y: 300, r: 100 }]), fill: tone.glow, opacity: 0.32, blur: 30 },
    { d: grass(random), fill: "@grass" },
  ];
  const gradients: Gradient[] = [{ key: "grass", from: 230, to: GROUND, stops: [[0, tone.grass[0]], [1, tone.grass[1]]] }];
  const greens = (stems: string): Layer[] => [
    { d: stems, fill: tone.stem },
    { d: leaves, fill: tone.leaf },
    { d: ribs, stroke: tone.rib, strokeWidth: 1.2, opacity: 0.7 },
  ];
  const breathLayers: Layer[] = [
    { d: breath.stems, stroke: tone.breathStem, strokeWidth: 1.1 },
    { d: puffPath(breath.florets), fill: tone.breath, opacity: 0.92 },
  ];

  if (realm === "dusk") {
    let backRays = "";
    let rays = "";
    let streaks = "";
    let rims = "";
    let discs = "";
    let seeds = "";
    for (const flower of SUNFLOWERS) {
      const place = placer(flower.x, flower.y, flower.turn, flower.squash);
      const start = random() * Math.PI;
      backRays += corolla(place, 21, flower.size, flower.size * 0.3, "pointed", start + Math.PI / 21);
      rays += corolla(place, 21, flower.size * 0.93, flower.size * 0.29, "pointed", start);
      streaks += corolla(place, 21, flower.size * 0.62, flower.size * 0.1, "pointed", start);
      rims += discPath(place, flower.size * 0.47);
      discs += discPath(place, flower.size * 0.42);
      seeds += seedDots(place, flower.size * 0.38, 64, flower.size * 0.026);
    }
    let cosmos = "";
    let cosmosHearts = "";
    let cosmosEyes = "";
    let cosmosStems = "";
    for (const [x, y, size] of COSMOS) {
      const place = placer(x, y, random() * Math.PI, 0.7 + random() * 0.3);
      const start = random() * Math.PI;
      cosmos += corolla(place, 8, size, size * 0.55, "toothed", start);
      cosmosHearts += corolla(place, 8, size * 0.36, size * 0.3, "round", start);
      cosmosEyes += discPath(place, size * 0.18);
      cosmosStems += `M${(x + (random() - 0.5) * 40).toFixed(1)} ${GROUND}Q${(x + (random() - 0.5) * 30).toFixed(1)} ${((y + GROUND) / 2).toFixed(1)} ${x} ${(y + size * 0.2).toFixed(1)}`;
    }
    return {
      gradients,
      layers: [
        ...base,
        ...greens(SUNFLOWERS.map((flower) => limbPath(flower.stem, flower.thick, flower.thick * 0.6)).join("")),
        ...breathLayers,
        { d: cosmosStems, stroke: tone.stem, strokeWidth: 1.6 },
        { d: cosmos, fill: "#ff9cc6", stroke: "#f0679f", strokeWidth: 0.6 },
        { d: cosmosHearts, fill: "#e0457f", opacity: 0.75 },
        { d: cosmosEyes, fill: "#ffd23f" },
        { d: backRays, fill: "#d8761a" },
        { d: rays, fill: "#ffc531", stroke: "#e89a1c", strokeWidth: 0.6 },
        { d: streaks, fill: "#ffe590", opacity: 0.5 },
        { d: rims, fill: "#8b4513" },
        { d: discs, fill: "#3d1f0b" },
        { d: seeds, fill: "#7a4216", opacity: 0.9 },
      ],
    };
  }

  let domeShade = "";
  const floretShade: Puff[] = [];
  const tones = { deep: "", mid: "", light: "", lilac: "" };
  let eyes = "";
  for (const head of HYDRANGEAS) {
    domeShade += puffPath([{ x: head.x, y: head.y + head.ry * 0.18, r: head.rx * 0.92 }]);
    const count = Math.round((head.rx * head.ry) / 95);
    for (let index = 0; index < count; index += 1) {
      const reach = Math.sqrt((index + 0.5) / count);
      const angle = index * 2.39996;
      const x = head.x + Math.cos(angle) * head.rx * reach;
      const y = head.y + Math.sin(angle) * head.ry * reach;
      const size = 10.5 + random() * 3;
      const place = placer(x, y, random() * Math.PI, 0.75 + random() * 0.25);
      const height = (y - head.y) / head.ry - ((x - head.x) / head.rx) * 0.3;
      const tint = random() < 0.18 ? "lilac" : height < -0.25 || random() < 0.12 ? "light" : height > 0.35 ? "deep" : "mid";
      tones[tint] += corolla(place, 4, size, size * 0.92, "round", random());
      floretShade.push({ x, y: y + 3, r: size * 0.85 });
      eyes += discPath(place, 1.6);
    }
  }
  let lavenderStems = "";
  const buds = { light: "", deep: "" };
  for (const [index, x] of [380, 412, 446, 478, 512, 548].entries()) {
    const height = 150 + random() * 80;
    const lean = -10 + random() * 24;
    const top = { x: x + lean, y: GROUND - height };
    lavenderStems += `M${x} ${GROUND}Q${(x + lean * 0.2).toFixed(1)} ${(GROUND - height * 0.5).toFixed(1)} ${top.x.toFixed(1)} ${top.y.toFixed(1)}`;
    for (let bud = 0; bud < 14; bud += 1) {
      const t = 0.55 + (bud / 13) * 0.45;
      // A point along the stem's curve (quadratic), from its foot to its tip.
      const u = 1 - t;
      const px = u * u * x + 2 * u * t * (x + lean * 0.2) + t * t * top.x;
      const py = u * u * GROUND + 2 * u * t * (GROUND - height * 0.5) + t * t * top.y;
      const side = bud % 2 ? 1 : -1;
      buds[(bud + index) % 3 ? "light" : "deep"] += discPath(placer(px + side * 3.4, py, -Math.PI / 2 + side * 0.5, 0.55), 3.6 - 1.4 * ((t - 0.55) / 0.45));
    }
  }
  return {
    gradients,
    layers: [
      ...base,
      ...greens(HYDRANGEAS.map((head) => limbPath(head.stem, 8, 5)).join("")),
      { d: lavenderStems, stroke: "#2c4a44", strokeWidth: 1.8 },
      { d: buds.deep, fill: "#9a7cf0" },
      { d: buds.light, fill: "#c4b0ff" },
      ...breathLayers,
      { d: domeShade, fill: "#121c42", opacity: 0.85 },
      { d: puffPath(floretShade), fill: "#1a2558", opacity: 0.9 },
      { d: tones.deep, fill: "#6f86d8" },
      { d: tones.mid, fill: "#98b4f0" },
      { d: tones.lilac, fill: "#b9a6f2" },
      { d: tones.light, fill: "#d2e2ff" },
      { d: eyes, fill: "#f6f8ff", opacity: 0.9 },
    ],
  };
}

/* ---------- Pieces ---------- */

const artworks = new Map<string, Artwork>();

/** Each piece is worked out the first time it is drawn, then kept. */
function artwork(kind: "bough" | "bed", realm: RealmName, side: Side): Artwork {
  const key = `${kind}-${realm}-${side}`;
  let art = artworks.get(key);
  if (!art) {
    const seed = (kind === "bough" ? 101 : 211) + (realm === "dusk" ? 0 : 17) + (side === "left" ? 0 : 5);
    art = kind === "bough" ? boughArt(realm, seed) : bedArt(realm, seed);
    artworks.set(key, art);
  }
  return art;
}

function Corner({ kind, realm, side }: { kind: "bough" | "bed"; realm: RealmName; side: Side }) {
  const id = useId().replace(/[^\w-]/g, "");
  const art = artwork(kind, realm, side);
  const paint = (value?: string) => (value?.startsWith("@") ? `url(#${id}-${value.slice(1)})` : value);
  const blurs = [...new Set(art.layers.map((layer) => layer.blur).filter((blur): blur is number => Boolean(blur)))];
  return (
    <span className={`realm-corner is-${kind === "bough" ? "top" : "bottom"} is-${side}`} data-depth={kind === "bough" ? "20" : "26"}>
      <svg viewBox="0 0 600 420" aria-hidden="true" focusable="false">
        <defs>
          {art.gradients.map((gradient) => (
            <linearGradient key={gradient.key} id={`${id}-${gradient.key}`} gradientUnits="userSpaceOnUse" x1="0" y1={gradient.from} x2="0" y2={gradient.to}>
              {gradient.stops.map(([offset, color]) => (
                <stop key={offset} offset={offset} stopColor={color} />
              ))}
            </linearGradient>
          ))}
          {blurs.map((blur) => (
            <filter key={blur} id={`${id}-blur${blur}`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation={blur} />
            </filter>
          ))}
        </defs>
        <g transform={side === "right" ? "matrix(-1 0 0 1 600 0)" : undefined}>
          {art.layers.map((layer, index) =>
            layer.d ? (
              <path
                key={index}
                d={layer.d}
                fill={paint(layer.fill) ?? "none"}
                stroke={paint(layer.stroke)}
                strokeWidth={layer.strokeWidth}
                strokeLinecap={layer.stroke ? "round" : undefined}
                opacity={layer.opacity}
                filter={layer.blur ? `url(#${id}-blur${layer.blur})` : undefined}
              />
            ) : null,
          )}
        </g>
      </svg>
    </span>
  );
}

/** The four corners of one realm. */
export function FairyCorners({ realm }: { realm: RealmName }) {
  return (
    <>
      <Corner kind="bough" realm={realm} side="left" />
      <Corner kind="bough" realm={realm} side="right" />
      <Corner kind="bed" realm={realm} side="left" />
      <Corner kind="bed" realm={realm} side="right" />
    </>
  );
}
