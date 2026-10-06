/**
 * Shapes the fairyland draws once, as SVG path data: clouds of puffs, tapering limbs, petals, leaves and seed discs.
 * Everything takes its randomness from a seeded stream, so every visit draws the same realm.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Puff {
  x: number;
  y: number;
  r: number;
}

const f = (value: number) => value.toFixed(1);

/** A small seeded random stream (mulberry32). */
export function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/** Puffs as one path, each a circle `grow` times its size, lifted by `rise` of its radius. */
export function puffPath(puffs: Puff[], grow = 1, rise = 0): string {
  return puffs
    .map(({ x, y, r }) => {
      const radius = r * grow;
      return `M${f(x - radius)} ${f(y - r * rise)}a${f(radius)} ${f(radius)} 0 1 0 ${f(radius * 2)} 0a${f(radius)} ${f(radius)} 0 1 0 ${f(-radius * 2)} 0`;
    })
    .join("");
}

/** A smooth curve through the points (Catmull-Rom, written as cubic Béziers), open or closed. */
export function smoothPath(points: Point[], closed: boolean): string {
  const count = points.length;
  const at = (index: number) => points[closed ? (index + count) % count : Math.max(0, Math.min(count - 1, index))];
  let path = `M${f(points[0].x)} ${f(points[0].y)}`;
  for (let index = 0; index < (closed ? count : count - 1); index += 1) {
    const [before, from, to, after] = [at(index - 1), at(index), at(index + 1), at(index + 2)];
    path += `C${f(from.x + (to.x - before.x) / 6)} ${f(from.y + (to.y - before.y) / 6)} ${f(to.x - (after.x - from.x) / 6)} ${f(to.y - (after.y - from.y) / 6)} ${f(to.x)} ${f(to.y)}`;
  }
  return closed ? `${path}Z` : path;
}

/** A limb (a bough, a twig, a stem, a blade of grass) along its spine, tapering from `from` px thick to `to`. */
export function limbPath(spine: Point[], from: number, to: number): string {
  const left: Point[] = [];
  const right: Point[] = [];
  spine.forEach((point, index) => {
    const before = spine[Math.max(0, index - 1)];
    const after = spine[Math.min(spine.length - 1, index + 1)];
    const length = Math.hypot(after.x - before.x, after.y - before.y) || 1;
    const half = (from + ((to - from) * index) / (spine.length - 1)) / 2;
    const nx = (-(after.y - before.y) / length) * half;
    const ny = ((after.x - before.x) / length) * half;
    left.push({ x: point.x + nx, y: point.y + ny });
    right.push({ x: point.x - nx, y: point.y - ny });
  });
  return smoothPath([...left, ...right.reverse()], true);
}

/** Places a flower's own frame on the page: turned by `turn`, squashed across by `squash` (a flower seen from the side). */
export type Place = (along: number, across: number) => [number, number];

export function placer(x: number, y: number, turn: number, squash = 1): Place {
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);
  return (along, across) => {
    const v = across * squash;
    return [x + along * cos - v * sin, y + along * sin + v * cos];
  };
}

export type PetalKind = "pointed" | "notched" | "toothed" | "round";

/** One petal from the flower's middle outward along `angle`, `length` long and `width` across at its widest. */
export function petalPath(place: Place, angle: number, length: number, width: number, kind: PetalKind): string {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const p = (along: number, across: number) => {
    const [x, y] = place(along * cos - across * sin, along * sin + across * cos);
    return `${f(x)} ${f(y)}`;
  };
  const l = length;
  const w = width / 2;
  switch (kind) {
    case "pointed":
      return `M${p(0, 0)}C${p(0.25 * l, 0.9 * w)} ${p(0.75 * l, 0.75 * w)} ${p(l, 0)}C${p(0.75 * l, -0.75 * w)} ${p(0.25 * l, -0.9 * w)} ${p(0, 0)}Z`;
    case "notched":
      return `M${p(0, 0)}C${p(0.2 * l, 1.1 * w)} ${p(0.85 * l, 1.05 * w)} ${p(0.98 * l, 0.35 * w)}L${p(0.86 * l, 0)}L${p(0.98 * l, -0.35 * w)}C${p(0.85 * l, -1.05 * w)} ${p(0.2 * l, -1.1 * w)} ${p(0, 0)}Z`;
    case "toothed":
      return `M${p(0, 0)}C${p(0.3 * l, 0.8 * w)} ${p(0.8 * l, 1.1 * w)} ${p(0.97 * l, 0.75 * w)}L${p(1.02 * l, 0.4 * w)}L${p(0.93 * l, 0.18 * w)}L${p(1.02 * l, 0)}L${p(0.93 * l, -0.18 * w)}L${p(1.02 * l, -0.4 * w)}L${p(0.97 * l, -0.75 * w)}C${p(0.8 * l, -1.1 * w)} ${p(0.3 * l, -0.8 * w)} ${p(0, 0)}Z`;
    default:
      return `M${p(0, 0)}C${p(0.1 * l, 1.2 * w)} ${p(0.9 * l, 1.25 * w)} ${p(l, 0)}C${p(0.9 * l, -1.25 * w)} ${p(0.1 * l, -1.2 * w)} ${p(0, 0)}Z`;
  }
}

/** All the petals of one flower, evenly round from `start` radians. */
export function corolla(place: Place, count: number, length: number, width: number, kind: PetalKind, start = 0): string {
  let path = "";
  for (let index = 0; index < count; index += 1) path += petalPath(place, start + (index / count) * Math.PI * 2, length, width, kind);
  return path;
}

/** A disc of radius `radius` in the flower's frame: round face on, an ellipse from the side. */
export function discPath(place: Place, radius: number): string {
  const k = radius * 0.5523;
  const p = (along: number, across: number) => {
    const [x, y] = place(along, across);
    return `${f(x)} ${f(y)}`;
  };
  return `M${p(radius, 0)}C${p(radius, k)} ${p(k, radius)} ${p(0, radius)}C${p(-k, radius)} ${p(-radius, k)} ${p(-radius, 0)}C${p(-radius, -k)} ${p(-k, -radius)} ${p(0, -radius)}C${p(k, -radius)} ${p(radius, -k)} ${p(radius, 0)}Z`;
}

/** A sunflower's seeds in their golden-angle spiral, as one path of dots. */
export function seedDots(place: Place, radius: number, count: number, dot: number): string {
  let path = "";
  for (let index = 1; index < count; index += 1) {
    const distance = radius * Math.sqrt(index / count);
    const angle = index * 2.39996;
    path += discPath((along, across) => place(Math.cos(angle) * distance + along, Math.sin(angle) * distance + across), dot * (0.6 + 0.4 * (distance / radius)));
  }
  return path;
}

/** A leaf from its stalk at (x, y) along `angle`: the blade, and its midrib as an open path. */
export function leafPath(x: number, y: number, angle: number, length: number, width: number): { blade: string; rib: string } {
  const place = placer(x, y, 0);
  const tip = place(Math.cos(angle) * length * 0.92, Math.sin(angle) * length * 0.92);
  const bend = place(Math.cos(angle + 0.06) * length * 0.5, Math.sin(angle + 0.06) * length * 0.5);
  return {
    blade: petalPath(place, angle, length, width, "pointed"),
    rib: `M${f(x)} ${f(y)}Q${f(bend[0])} ${f(bend[1])} ${f(tip[0])} ${f(tip[1])}`,
  };
}
