import * as THREE from "three";
import { GOLDEN_ANGLE, jitter, randomStream } from "./common";

/**
 * Surface detail painted in code, once per specimen: albedo variation plus a height field turned into a normal map, so
 * veins, florets, fibres and creases catch the light. Nothing is downloaded. Without WebGL (tests, the drawn fallback)
 * there is nothing to sample them, so no canvas work is done and every slot stays empty.
 */

export interface SurfaceMaps {
  map: THREE.CanvasTexture | null;
  normalMap: THREE.CanvasTexture | null;
}

type Painter = (context: CanvasRenderingContext2D, width: number, height: number) => void;

const canPaint = () => typeof document !== "undefined" && typeof WebGLRenderingContext !== "undefined";

function canvas2d(width: number, height: number): CanvasRenderingContext2D | null {
  const element = document.createElement("canvas");
  element.width = width;
  element.height = height;
  return element.getContext("2d", { willReadFrequently: true });
}

function toTexture(context: CanvasRenderingContext2D, colorSpace: THREE.ColorSpace, repeat?: [number, number]): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(context.canvas);
  texture.colorSpace = colorSpace;
  texture.anisotropy = 8;
  if (repeat) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(...repeat);
  }
  return texture;
}

/**
 * A tangent-space normal map from a height field (red channel). The canvas is stored flipped (its first row is the
 * top of the texture, v = 1), so the vertical slope changes sign. `wrap` treats the edges as continuous.
 */
function normalFromHeight(height: CanvasRenderingContext2D, strength: number, wrap: boolean): CanvasRenderingContext2D | null {
  const { width, height: rows } = height.canvas;
  const output = canvas2d(width, rows);
  if (!output) return null;
  const source = height.getImageData(0, 0, width, rows).data;
  const target = output.createImageData(width, rows);
  const data = target.data;
  const at = (x: number, y: number) => {
    const column = wrap ? (x + width) % width : Math.min(width - 1, Math.max(0, x));
    const row = wrap ? (y + rows) % rows : Math.min(rows - 1, Math.max(0, y));
    return source[(row * width + column) * 4] / 255;
  };
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = -(at(x + 1, y) - at(x - 1, y)) * strength;
      const ny = (at(x, y + 1) - at(x, y - 1)) * strength;
      const length = Math.hypot(nx, ny, 1);
      const index = (y * width + x) * 4;
      data[index] = Math.round(((nx / length) * 0.5 + 0.5) * 255);
      data[index + 1] = Math.round(((ny / length) * 0.5 + 0.5) * 255);
      data[index + 2] = Math.round(((1 / length) * 0.5 + 0.5) * 255);
      data[index + 3] = 255;
    }
  }
  output.putImageData(target, 0, 0);
  return output;
}

interface PairOptions {
  width: number;
  height: number;
  albedo: Painter;
  relief: Painter;
  strength: number;
  repeat?: [number, number];
}

function paintPair({ width, height, albedo, relief, strength, repeat }: PairOptions): SurfaceMaps {
  if (!canPaint()) return { map: null, normalMap: null };
  const colour = canvas2d(width, height);
  const bumps = canvas2d(width, height);
  if (!colour || !bumps) return { map: null, normalMap: null };
  albedo(colour, width, height);
  relief(bumps, width, height);
  const normals = normalFromHeight(bumps, strength, Boolean(repeat));
  return {
    map: toTexture(colour, THREE.SRGBColorSpace, repeat),
    normalMap: normals ? toTexture(normals, THREE.NoColorSpace, repeat) : null,
  };
}

/** Blurs a whole canvas in one pass (a filter set while drawing would blur every stroke separately, far slower). */
function soften(context: CanvasRenderingContext2D, radius: number): void {
  const { width, height } = context.canvas;
  const copy = canvas2d(width, height);
  if (!copy) return;
  copy.drawImage(context.canvas, 0, 0);
  context.filter = `blur(${radius}px)`;
  context.drawImage(copy.canvas, 0, 0);
  context.filter = "none";
}

function grey(value: number, alpha = 1): string {
  const level = Math.round(Math.min(1, Math.max(0, value)) * 255);
  return `rgba(${level},${level},${level},${alpha})`;
}

/**
 * Ray petal, u across and v from base (bottom of the uv) to tip. The geometry already narrows the petal at both ends,
 * so the veins run straight here and converge in 3D. They are faint darker lines in the colour and fine grooves in
 * the relief; elongated cells give the satin grain of a real petal.
 */
export function petalMaps(): SurfaceMaps {
  const veins = Array.from({ length: 34 }, (_, index) => ({
    u: (index + 0.5) / 34 + (jitter(index, 1) - 0.5) * 0.012,
    weight: index % 4 === 0 ? 1 : 0.45 + jitter(index, 2) * 0.35,
    wobble: jitter(index, 3) * Math.PI * 2,
  }));
  const strokeVeins = (context: CanvasRenderingContext2D, width: number, height: number, style: (weight: number) => [string, number]) => {
    for (const vein of veins) {
      const [stroke, lineWidth] = style(vein.weight);
      context.strokeStyle = stroke;
      context.lineWidth = lineWidth;
      context.beginPath();
      for (let step = 0; step <= 24; step += 1) {
        const v = step / 24;
        const x = (vein.u + Math.sin(v * 5 + vein.wobble) * 0.004) * width;
        const y = (1 - v) * height;
        if (step === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    }
  };
  return paintPair({
    width: 256,
    height: 512,
    strength: 3.2,
    albedo: (context, width, height) => {
      context.fillStyle = grey(0.95);
      context.fillRect(0, 0, width, height);
      const random = randomStream(11);
      for (let cell = 0; cell < 2200; cell += 1) {
        context.fillStyle = random.chance(0.5) ? "rgba(255,255,255,0.05)" : "rgba(120,80,20,0.05)";
        context.fillRect(random.next() * width, random.next() * height, 1 + random.next() * 1.5, 4 + random.next() * 9);
      }
      strokeVeins(context, width, height, (weight) => [`rgba(150, 92, 20, ${0.07 + weight * 0.13})`, 0.8 + weight * 1.2]);
      // A deeper tone where the petal leaves the disc, lighter toward the tip where it is thinnest.
      const fade = context.createLinearGradient(0, 0, 0, height);
      fade.addColorStop(0, "rgba(255,255,255,0.10)");
      fade.addColorStop(0.7, "rgba(255,255,255,0)");
      fade.addColorStop(0.93, "rgba(150,80,10,0.10)");
      fade.addColorStop(1, "rgba(120,60,5,0.28)");
      context.fillStyle = fade;
      context.fillRect(0, 0, width, height);
    },
    relief: (context, width, height) => {
      context.fillStyle = grey(0.6);
      context.fillRect(0, 0, width, height);
      const random = randomStream(12);
      for (let cell = 0; cell < 1800; cell += 1) {
        context.fillStyle = grey(0.5 + random.next() * 0.2, 0.35);
        context.fillRect(random.next() * width, random.next() * height, 1.5, 5 + random.next() * 8);
      }
      strokeVeins(context, width, height, (weight) => [grey(0.6 - weight * 0.35), 1.2 + weight * 1.4]);
      soften(context, 1);
    },
  });
}

interface FloretLook {
  base: [number, number, number];
  highlight: [number, number, number];
  size: number;
  height: number;
  star: boolean;
}

/** Disc florets by distance from the centre: young and olive in the middle, then mature, then open, then spent. */
function floretLook(radius: number, wobble: number, young: boolean): FloretLook {
  const ring = radius + wobble;
  if (ring < 0.16) return { base: young ? [62, 70, 26] : [52, 50, 20], highlight: young ? [118, 128, 52] : [96, 90, 36], size: 0.78, height: 0.55, star: false };
  if (ring < (young ? 0.86 : 0.64)) return { base: young ? [54, 52, 22] : [36, 18, 8], highlight: young ? [104, 98, 42] : [104, 60, 26], size: 0.95, height: 0.8, star: false };
  if (ring < (young ? 0.98 : 0.82)) return { base: [70, 40, 12], highlight: [238, 176, 36], size: 1, height: 1, star: true };
  return { base: [50, 28, 12], highlight: [132, 82, 30], size: 1.02, height: 0.85, star: false };
}

/**
 * A sunflower disc: florets on the golden-angle (Vogel) spiral, the pattern of a real capitulum, so the 34 and 55
 * parastichies emerge on their own. Young olive florets in the middle, dark mature ones, a ring of open florets
 * dusted with pollen, and spent ones at the rim. `young` paints an unopened head: greener, with no pollen ring yet.
 */
export function sunflowerDiscMaps(young = false): SurfaceMaps {
  // The young head is small and half hidden by its own petals: a quarter of the pixels is plenty.
  const size = young ? 512 : 1024;
  const count = young ? 700 : 1500;
  const radius = size * 0.49;
  const spacing = radius * Math.sqrt(Math.PI / count);
  const florets = Array.from({ length: count }, (_, index) => {
    const ratio = Math.sqrt((index + 0.5) / count);
    const angle = index * GOLDEN_ANGLE;
    // Zones are not perfect circles: each floret opens a little early or late.
    const look = floretLook(ratio, (jitter(index, 4) - 0.5) * 0.06, young);
    return { x: size / 2 + Math.cos(angle) * ratio * radius, y: size / 2 + Math.sin(angle) * ratio * radius, ratio, angle, look, seed: index };
  });
  return paintPair({
    width: size,
    height: size,
    strength: 5,
    albedo: (context) => {
      context.fillStyle = young ? "rgb(40,40,16)" : "rgb(22,11,5)";
      context.fillRect(0, 0, size, size);
      for (const floret of florets) {
        const { base, highlight, size: scale, star } = floret.look;
        const r = spacing * 0.62 * scale * (0.9 + jitter(floret.seed, 5) * 0.2);
        const tone = 0.85 + jitter(floret.seed, 6) * 0.3;
        const glow = context.createRadialGradient(floret.x, floret.y, 0, floret.x, floret.y, r);
        glow.addColorStop(0, `rgb(${highlight.map((c) => Math.round(c * tone)).join(",")})`);
        glow.addColorStop(0.55, `rgb(${base.map((c) => Math.round(c * 1.25 * tone)).join(",")})`);
        glow.addColorStop(1, `rgba(${base.join(",")},0)`);
        context.fillStyle = glow;
        context.beginPath();
        context.arc(floret.x, floret.y, r, 0, Math.PI * 2);
        context.fill();
        if (star) {
          // An open floret: a five-lobed golden corolla around the dark anther tube.
          context.fillStyle = `rgba(${Math.round(242 * tone)},${Math.round(186 * tone)},${Math.round(44 * tone)},0.9)`;
          context.beginPath();
          for (let lobe = 0; lobe < 10; lobe += 1) {
            const angle = floret.angle + (lobe / 10) * Math.PI * 2;
            const reach = (lobe % 2 ? 0.45 : 0.95) * r * 0.8;
            const px = floret.x + Math.cos(angle) * reach;
            const py = floret.y + Math.sin(angle) * reach;
            if (lobe === 0) context.moveTo(px, py);
            else context.lineTo(px, py);
          }
          context.closePath();
          context.fill();
          context.fillStyle = "rgba(48,24,8,0.9)";
          context.beginPath();
          context.arc(floret.x, floret.y, r * 0.24, 0, Math.PI * 2);
          context.fill();
        }
      }
      if (!young) {
        // Pollen drifts from the open ring, a little inward and outward.
        const random = randomStream(31);
        for (let grain = 0; grain < 2600; grain += 1) {
          const ratio = 0.6 + random.next() * 0.3 + random.signed(0.06);
          const angle = random.next() * Math.PI * 2;
          context.fillStyle = `rgba(255,${200 + Math.round(random.next() * 40)},70,${0.25 + random.next() * 0.45})`;
          const grainSize = (0.8 + random.next() * 1.6) * (size / 1024);
          context.fillRect(size / 2 + Math.cos(angle) * ratio * radius, size / 2 + Math.sin(angle) * ratio * radius, grainSize, grainSize);
        }
      }
      // The rim sinks into shadow under the ray bases.
      const rim = context.createRadialGradient(size / 2, size / 2, radius * 0.9, size / 2, size / 2, radius);
      rim.addColorStop(0, "rgba(0,0,0,0)");
      rim.addColorStop(1, "rgba(10,5,2,0.75)");
      context.fillStyle = rim;
      context.fillRect(0, 0, size, size);
    },
    relief: (context) => {
      context.fillStyle = "rgb(0,0,0)";
      context.fillRect(0, 0, size, size);
      for (const floret of florets) {
        const r = spacing * 0.6 * floret.look.size;
        const dome = context.createRadialGradient(floret.x, floret.y, 0, floret.x, floret.y, r);
        dome.addColorStop(0, grey(floret.look.height));
        dome.addColorStop(0.6, grey(floret.look.height * 0.55));
        dome.addColorStop(1, grey(0));
        context.fillStyle = dome;
        context.beginPath();
        context.arc(floret.x, floret.y, r, 0, Math.PI * 2);
        context.fill();
      }
    },
  });
}

export interface LeafVeins {
  /** The strong pair of veins from the stalk of a sunflower leaf. */
  basal: boolean;
  /** Side veins on each half, where the first leaves the midrib and how far apart the rest are (shares of the length). */
  pairs: number;
  first: number;
  spacing: number;
  /** How far the side veins reach toward the margin, and how much less each one further up reaches. */
  reach: number;
  reachStep: number;
  /** How far each side vein climbs toward the tip on its way out. */
  climb: number;
  /** Soft swelling of the blade between the sunken veins: the quilted face of a hydrangea leaf. */
  pucker: number;
}

const SUNFLOWER_VEINS: LeafVeins = { basal: true, pairs: 7, first: 0.24, spacing: 0.095, reach: 0.42, reachStep: 0.03, climb: 0.13, pucker: 0 };

/** A hydrangea leaf: no basal pair, many straight side veins running out to the teeth, the blade puckered between. */
export const HYDRANGEA_VEINS: LeafVeins = { basal: false, pairs: 9, first: 0.1, spacing: 0.086, reach: 0.44, reachStep: 0.026, climb: 0.15, pucker: 1 };

/**
 * Leaf, u across and v from the stalk to the tip: a pale midrib, side veins arching toward the margin (with the strong
 * basal pair of a sunflower leaf when asked), and a net of fine veins between them. The veins are sunken in the relief,
 * so the blade between them puffs up the way a real leaf does.
 */
export function leafMaps(seed = 1, layout: LeafVeins = SUNFLOWER_VEINS): SurfaceMaps {
  const random = randomStream(seed * 97 + 5);
  type Vein = { points: Array<[number, number]>; width: number };
  const veins: Vein[] = [];
  veins.push({ points: Array.from({ length: 13 }, (_, index) => [0.5, index / 12] as [number, number]), width: 1 });
  const starts: number[] = [];
  for (const side of [-1, 1]) {
    if (layout.basal) {
      // The basal pair: out from the stalk, then running up close to the margin.
      veins.push({ points: Array.from({ length: 12 }, (_, index) => {
        const t = index / 11;
        return [0.5 + side * (0.36 * Math.sin(Math.min(1, t * 1.6) * Math.PI * 0.5) - 0.08 * t * t), 0.02 + t * 0.62] as [number, number];
      }), width: 0.62 });
    }
    for (let index = 0; index < layout.pairs; index += 1) {
      const start = layout.first + index * layout.spacing + random.signed(0.015);
      const reach = layout.reach - index * layout.reachStep;
      if (side === 1) starts.push(start);
      veins.push({ points: Array.from({ length: 9 }, (_, step) => {
        const t = step / 8;
        return [0.5 + side * reach * Math.sin(t * Math.PI * 0.5), start + t * (layout.climb + random.signed(0.01)) + t * t * 0.04] as [number, number];
      }), width: 0.42 - index * 0.025 });
    }
  }
  const net = Array.from({ length: 900 }, () => {
    const u = random.next();
    const v = random.next();
    const angle = random.next() * Math.PI;
    const length = 0.012 + random.next() * 0.03;
    return [u, v, u + Math.cos(angle) * length, v + Math.sin(angle) * length] as const;
  });
  const strokeNet = (context: CanvasRenderingContext2D, width: number, height: number) => {
    context.beginPath();
    for (const [u0, v0, u1, v1] of net) {
      context.moveTo(u0 * width, (1 - v0) * height);
      context.lineTo(u1 * width, (1 - v1) * height);
    }
    context.stroke();
  };
  const drawVeins = (context: CanvasRenderingContext2D, width: number, height: number, stroke: (weight: number) => string, thickness: number) => {
    context.lineCap = "round";
    context.lineJoin = "round";
    for (const vein of veins) {
      for (let index = 1; index < vein.points.length; index += 1) {
        const [u0, v0] = vein.points[index - 1];
        const [u1, v1] = vein.points[index];
        const taper = vein.width * (1 - v1 * 0.55) * (1 - (index / vein.points.length) * 0.4);
        context.strokeStyle = stroke(vein.width);
        context.lineWidth = Math.max(0.6, taper * thickness);
        context.beginPath();
        context.moveTo(u0 * width, (1 - v0) * height);
        context.lineTo(u1 * width, (1 - v1) * height);
        context.stroke();
      }
    }
  };
  // Between two side veins the blade swells: soft raised cushions, larger near the midrib, smaller toward the margin.
  const pucker = (context: CanvasRenderingContext2D, width: number, height: number) => {
    const swell = randomStream(seed * 131 + 9);
    for (let index = 0; index + 1 < starts.length; index += 1) {
      const gap = starts[index + 1] - starts[index];
      for (const side of [-1, 1]) {
        for (let cushion = 0; cushion < 3; cushion += 1) {
          const out = (cushion + 0.5) / 3;
          const reach = layout.reach - (index + 0.5) * layout.reachStep;
          const u = 0.5 + side * reach * Math.sin(out * Math.PI * 0.5) * 0.92;
          const v = starts[index] + gap * 0.5 + out * (layout.climb + 0.02) + swell.signed(0.008);
          const r = gap * height * (0.62 - out * 0.18);
          const x = u * width;
          const y = (1 - v) * height;
          const glow = context.createRadialGradient(x, y, 0, x, y, r);
          glow.addColorStop(0, grey(0.8, 0.55 * layout.pucker));
          glow.addColorStop(1, grey(0.8, 0));
          context.fillStyle = glow;
          context.fillRect(x - r, y - r, r * 2, r * 2);
        }
      }
    }
  };
  return paintPair({
    width: 512,
    height: 512,
    strength: 3.5,
    albedo: (context, width, height) => {
      context.fillStyle = grey(0.88);
      context.fillRect(0, 0, width, height);
      for (let spot = 0; spot < 160; spot += 1) {
        const x = random.next() * width;
        const y = random.next() * height;
        const r = 6 + random.next() * 26;
        const glow = context.createRadialGradient(x, y, 0, x, y, r);
        glow.addColorStop(0, random.chance(0.5) ? "rgba(255,255,230,0.07)" : "rgba(40,60,20,0.07)");
        glow.addColorStop(1, "rgba(0,0,0,0)");
        context.fillStyle = glow;
        context.fillRect(x - r, y - r, r * 2, r * 2);
      }
      context.strokeStyle = "rgba(240,255,200,0.16)";
      context.lineWidth = 1;
      strokeNet(context, width, height);
      drawVeins(context, width, height, (weight) => `rgba(236,248,196,${0.35 + weight * 0.5})`, 9);
    },
    relief: (context, width, height) => {
      context.fillStyle = grey(0.62);
      context.fillRect(0, 0, width, height);
      if (layout.pucker > 0) pucker(context, width, height);
      context.strokeStyle = grey(0.42);
      context.lineWidth = 1.6;
      strokeNet(context, width, height);
      drawVeins(context, width, height, (weight) => grey(0.4 - weight * 0.22), 11);
      soften(context, 1.2);
    },
  });
}

/**
 * Hydrangea sepal, u across and v from the base to the tip. The geometry narrows it to a claw at the base, so veins
 * drawn straight here fan out in 3D, forking once on the way; between them a fine crinkle, and a greenish-white eye
 * where the sepal leaves the floret.
 */
export function sepalMaps(): SurfaceMaps {
  const random = randomStream(71);
  const veins = Array.from({ length: 11 }, (_, index) => {
    const u = 0.5 + ((index - 5) / 5) * 0.42 + random.signed(0.015);
    return { u, fork: index % 2 === 0 ? 0.42 + random.next() * 0.2 : 2, spread: random.signed(0.035), weight: index === 5 ? 1 : 0.5 + random.next() * 0.3, wobble: random.next() * Math.PI * 2 };
  });
  const crinkle = Array.from({ length: 700 }, () => [random.next(), random.next(), 2 + random.next() * 5, random.next()] as const);
  const strokeVeins = (context: CanvasRenderingContext2D, width: number, height: number, style: (weight: number) => [string, number]) => {
    for (const vein of veins) {
      const [stroke, lineWidth] = style(vein.weight);
      context.strokeStyle = stroke;
      context.lineWidth = lineWidth;
      const path = (branch: number) => {
        context.beginPath();
        for (let step = 0; step <= 20; step += 1) {
          const v = step / 20;
          const split = branch * vein.spread * Math.max(0, v - vein.fork) / (1 - vein.fork);
          const x = (vein.u + split + Math.sin(v * 4 + vein.wobble) * 0.006) * width;
          const y = (1 - v * 0.97) * height;
          if (step === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      };
      path(0);
      if (vein.fork < 1) {
        context.lineWidth = lineWidth * 0.7;
        path(1);
      }
    }
  };
  return paintPair({
    width: 256,
    height: 256,
    strength: 3,
    albedo: (context, width, height) => {
      context.fillStyle = grey(0.96);
      context.fillRect(0, 0, width, height);
      for (const [u, v, size, tone] of crinkle) {
        context.fillStyle = tone > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(60,70,140,0.04)";
        context.fillRect(u * width, v * height, size, size * 0.7);
      }
      strokeVeins(context, width, height, (weight) => [`rgba(70,80,160,${0.08 + weight * 0.1})`, 0.8 + weight * 1.1]);
      const eye = context.createLinearGradient(0, height, 0, height * 0.78);
      eye.addColorStop(0, "rgba(210,232,200,0.5)");
      eye.addColorStop(1, "rgba(210,232,200,0)");
      context.fillStyle = eye;
      context.fillRect(0, 0, width, height);
    },
    relief: (context, width, height) => {
      context.fillStyle = grey(0.6);
      context.fillRect(0, 0, width, height);
      for (const [u, v, size, tone] of crinkle) {
        context.fillStyle = grey(0.45 + tone * 0.3, 0.45);
        context.fillRect(u * width, v * height, size, size * 0.7);
      }
      strokeVeins(context, width, height, (weight) => [grey(0.6 - weight * 0.3), 1.4 + weight * 1.2]);
      soften(context, 1.1);
    },
  });
}

/**
 * Silver-dollar eucalyptus, u across and v from the stalk to the tip: a faint midvein and a few side veins at a steep
 * angle, oil glands as fine dots, and the patchy waxy bloom that makes the leaf grey-blue.
 */
export function roundLeafMaps(): SurfaceMaps {
  const random = randomStream(81);
  const glands = Array.from({ length: 900 }, () => [random.next(), random.next(), 0.6 + random.next() * 0.9] as const);
  const bloom = Array.from({ length: 70 }, () => [random.next(), random.next(), 8 + random.next() * 34, 0.05 + random.next() * 0.09] as const);
  const strokeVeins = (context: CanvasRenderingContext2D, width: number, height: number, stroke: string, lineWidth: number) => {
    context.strokeStyle = stroke;
    context.lineCap = "round";
    context.lineWidth = lineWidth * 1.6;
    context.beginPath();
    context.moveTo(width / 2, height);
    context.lineTo(width / 2, height * 0.12);
    context.stroke();
    context.lineWidth = lineWidth;
    context.beginPath();
    for (let index = 0; index < 5; index += 1) {
      const v = 0.12 + index * 0.15;
      for (const side of [-1, 1]) {
        context.moveTo(width / 2, (1 - v) * height);
        context.quadraticCurveTo(width * (0.5 + side * 0.2), (1 - v - 0.08) * height, width * (0.5 + side * 0.4), (1 - v - 0.2) * height);
      }
    }
    context.stroke();
  };
  return paintPair({
    width: 256,
    height: 256,
    strength: 2,
    albedo: (context, width, height) => {
      context.fillStyle = grey(0.9);
      context.fillRect(0, 0, width, height);
      for (const [u, v, r, alpha] of bloom) {
        const x = u * width;
        const y = v * height;
        const glow = context.createRadialGradient(x, y, 0, x, y, r);
        glow.addColorStop(0, `rgba(250,255,252,${alpha})`);
        glow.addColorStop(1, "rgba(250,255,252,0)");
        context.fillStyle = glow;
        context.fillRect(x - r, y - r, r * 2, r * 2);
      }
      context.fillStyle = "rgba(50,70,60,0.12)";
      for (const [u, v, size] of glands) context.fillRect(u * width, v * height, size, size);
      strokeVeins(context, width, height, "rgba(235,240,220,0.22)", 1.2);
    },
    relief: (context, width, height) => {
      context.fillStyle = grey(0.55);
      context.fillRect(0, 0, width, height);
      context.fillStyle = grey(0.42, 0.6);
      for (const [u, v, size] of glands) context.fillRect(u * width, v * height, size, size);
      strokeVeins(context, width, height, grey(0.42), 1.6);
      soften(context, 1.4);
    },
  });
}

/**
 * Lily tepal, u across and v from the throat to the tip. Fine veins run its length (the geometry narrows it at both
 * ends, so they converge in 3D); the nectary furrow runs paler down the middle of its lower half, sunken in the relief;
 * and dark freckles crowd toward the throat, raised there into papillae that catch the light.
 */
export function lilyTepalMaps(): SurfaceMaps {
  const random = randomStream(91);
  const veins = Array.from({ length: 30 }, (_, index) => ({
    u: (index + 0.5) / 30 + random.signed(0.006),
    weight: index % 3 === 0 ? 1 : 0.4 + random.next() * 0.4,
    wobble: random.next() * Math.PI * 2,
  }));
  // Thick near the throat and either side of the furrow, thinning out toward the margins and up the tepal.
  const freckles = Array.from({ length: 120 }, () => {
    const v = 0.05 + Math.pow(random.next(), 1.5) * 0.5;
    const side = random.chance(0.5) ? -1 : 1;
    const u = 0.5 + side * (0.045 + Math.pow(random.next(), 1.3) * 0.36 * (1 - v * 0.5));
    const size = (1.4 + random.next() * 3.2) * (1.1 - v);
    return { u, v, size, stretch: 1.3 + random.next(), alpha: 0.6 + random.next() * 0.35 };
  });
  const strokeVeins = (context: CanvasRenderingContext2D, width: number, height: number, style: (weight: number) => [string, number]) => {
    for (const vein of veins) {
      const [stroke, lineWidth] = style(vein.weight);
      context.strokeStyle = stroke;
      context.lineWidth = lineWidth;
      context.beginPath();
      for (let step = 0; step <= 24; step += 1) {
        const v = step / 24;
        const x = (vein.u + Math.sin(v * 6 + vein.wobble) * 0.004) * width;
        if (step === 0) context.moveTo(x, (1 - v) * height);
        else context.lineTo(x, (1 - v) * height);
      }
      context.stroke();
    }
  };
  const furrow = (context: CanvasRenderingContext2D, width: number, height: number, color: (alpha: number) => string) => {
    const fade = context.createLinearGradient(0, height, 0, height * 0.45);
    fade.addColorStop(0, color(1));
    fade.addColorStop(1, color(0));
    context.fillStyle = fade;
    context.fillRect(width * 0.47, height * 0.45, width * 0.06, height * 0.55);
  };
  const dots = (context: CanvasRenderingContext2D, width: number, height: number, paint: (freckle: (typeof freckles)[number]) => string, grow = 1) => {
    for (const freckle of freckles) {
      context.fillStyle = paint(freckle);
      context.beginPath();
      context.ellipse(freckle.u * width, (1 - freckle.v) * height, freckle.size * grow, freckle.size * freckle.stretch * grow, 0, 0, Math.PI * 2);
      context.fill();
    }
  };
  return paintPair({
    width: 256,
    height: 512,
    strength: 3,
    albedo: (context, width, height) => {
      context.fillStyle = grey(0.94);
      context.fillRect(0, 0, width, height);
      for (let cell = 0; cell < 1800; cell += 1) {
        context.fillStyle = random.chance(0.5) ? "rgba(255,255,255,0.05)" : "rgba(90,0,20,0.05)";
        context.fillRect(random.next() * width, random.next() * height, 1 + random.next() * 1.5, 4 + random.next() * 8);
      }
      strokeVeins(context, width, height, (weight) => [`rgba(80, 0, 18, ${0.06 + weight * 0.1})`, 0.8 + weight * 1.1]);
      furrow(context, width, height, (alpha) => `rgba(255,248,225,${0.55 * alpha})`);
      dots(context, width, height, (freckle) => `rgba(42,0,10,${freckle.alpha})`);
    },
    relief: (context, width, height) => {
      context.fillStyle = grey(0.6);
      context.fillRect(0, 0, width, height);
      strokeVeins(context, width, height, (weight) => [grey(0.6 - weight * 0.25), 1.2 + weight * 1.2]);
      furrow(context, width, height, (alpha) => grey(0.25, alpha));
      // Near the throat the freckles stand proud of the tepal; further up they lie flat.
      dots(context, width, height, (freckle) => grey(0.95, Math.max(0, 1 - freckle.v * 2.4)), 1.25);
      soften(context, 1);
    },
  });
}

/**
 * A lily's narrow leaf (or a sprig of ruscus), u across and v from the stem to the tip: a pale midrib and fainter veins
 * running side by side its whole length (the blade narrows to its tip, so they meet there in 3D), joined by fine
 * cross-veins, under the gloss of a waxy face.
 */
export function lilyLeafMaps(): SurfaceMaps {
  const random = randomStream(101);
  const veins = Array.from({ length: 11 }, (_, index) => ({ u: 0.5 + ((index - 5) / 5) * 0.4 + random.signed(0.01), weight: index === 5 ? 1 : 0.35 + random.next() * 0.2 }));
  const cross = Array.from({ length: 420 }, () => [random.next(), random.next(), 0.01 + random.next() * 0.03] as const);
  const strokeVeins = (context: CanvasRenderingContext2D, width: number, height: number, style: (weight: number) => [string, number]) => {
    for (const vein of veins) {
      const [stroke, lineWidth] = style(vein.weight);
      context.strokeStyle = stroke;
      context.lineWidth = lineWidth;
      context.beginPath();
      context.moveTo(vein.u * width, height);
      context.lineTo(vein.u * width, 0);
      context.stroke();
    }
    const [stroke, lineWidth] = style(0);
    context.strokeStyle = stroke;
    context.lineWidth = lineWidth * 0.6;
    context.beginPath();
    for (const [u, v, length] of cross) {
      context.moveTo(u * width, (1 - v) * height);
      context.lineTo((u + length) * width, (1 - v - length * 0.3) * height);
    }
    context.stroke();
  };
  return paintPair({
    width: 256,
    height: 256,
    strength: 2.6,
    albedo: (context, width, height) => {
      context.fillStyle = grey(0.88);
      context.fillRect(0, 0, width, height);
      for (let spot = 0; spot < 60; spot += 1) {
        const x = random.next() * width;
        const y = random.next() * height;
        const r = 6 + random.next() * 22;
        const glow = context.createRadialGradient(x, y, 0, x, y, r);
        glow.addColorStop(0, random.chance(0.5) ? "rgba(255,255,230,0.07)" : "rgba(30,50,20,0.07)");
        glow.addColorStop(1, "rgba(0,0,0,0)");
        context.fillStyle = glow;
        context.fillRect(x - r, y - r, r * 2, r * 2);
      }
      strokeVeins(context, width, height, (weight) => [`rgba(230,250,200,${0.12 + weight * 0.46})`, 0.8 + weight * 2.4]);
    },
    relief: (context, width, height) => {
      context.fillStyle = grey(0.6);
      context.fillRect(0, 0, width, height);
      strokeVeins(context, width, height, (weight) => [grey(0.52 - weight * 0.27), 1 + weight * 2.6]);
      soften(context, 1.2);
    },
  });
}

/** Stems: fine lengthwise ridges and the stiff hairs of a sunflower stalk, tiled along the tube. */
export function stemMaps(): SurfaceMaps {
  return paintPair({
    width: 128,
    height: 256,
    strength: 2.4,
    repeat: [1, 3],
    albedo: (context, width, height) => {
      context.fillStyle = grey(0.92);
      context.fillRect(0, 0, width, height);
      const random = randomStream(41);
      for (let stripe = 0; stripe < 18; stripe += 1) {
        context.fillStyle = random.chance(0.5) ? "rgba(255,255,230,0.12)" : "rgba(30,50,10,0.1)";
        context.fillRect(random.next() * width, 0, 1 + random.next() * 3, height);
      }
      for (let hair = 0; hair < 260; hair += 1) {
        context.fillStyle = "rgba(255,255,240,0.35)";
        context.fillRect(random.next() * width, random.next() * height, 1, 2 + random.next() * 2);
      }
    },
    relief: (context, width, height) => {
      context.fillStyle = grey(0.5);
      context.fillRect(0, 0, width, height);
      const random = randomStream(42);
      for (let ridge = 0; ridge < 12; ridge += 1) {
        const x = ((ridge + random.next() * 0.4) / 12) * width;
        const glow = context.createLinearGradient(x - 5, 0, x + 5, 0);
        glow.addColorStop(0, grey(0.5, 0));
        glow.addColorStop(0.5, grey(0.8));
        glow.addColorStop(1, grey(0.5, 0));
        context.fillStyle = glow;
        context.fillRect(x - 5, 0, 10, height);
      }
      for (let hair = 0; hair < 220; hair += 1) {
        context.fillStyle = grey(0.9);
        context.fillRect(random.next() * width, random.next() * height, 1.5, 1.5);
      }
    },
  });
}

export type PaperKind = "kraft" | "matte";

/**
 * Wrapping paper, tiled. Kraft has visible fibres and blotches; matte art paper is nearly even. Both carry the creases
 * of paper that has been folded and crumpled by hand: long soft-edged ridges in every direction.
 */
export function paperMaps(kind: PaperKind): SurfaceMaps {
  const random = randomStream(kind === "kraft" ? 51 : 52);
  const creases = Array.from({ length: kind === "kraft" ? 46 : 30 }, () => ({
    x: random.next(), y: random.next(), angle: random.next() * Math.PI, length: 0.2 + random.next() * 0.6, depth: 0.25 + random.next() * 0.55,
  }));
  return paintPair({
    width: 512,
    height: 512,
    strength: kind === "kraft" ? 2.6 : 2,
    repeat: [2, 2],
    albedo: (context, width, height) => {
      context.fillStyle = grey(0.93);
      context.fillRect(0, 0, width, height);
      if (kind === "kraft") {
        for (let fibre = 0; fibre < 2600; fibre += 1) {
          const x = random.next() * width;
          const y = random.next() * height;
          const angle = random.next() * Math.PI;
          const length = 4 + random.next() * 22;
          context.strokeStyle = random.chance(0.6) ? `rgba(90,60,30,${0.05 + random.next() * 0.1})` : `rgba(255,250,235,${0.06 + random.next() * 0.1})`;
          context.lineWidth = 0.5 + random.next();
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
          context.stroke();
        }
      }
      for (let blot = 0; blot < 40; blot += 1) {
        const x = random.next() * width;
        const y = random.next() * height;
        const r = 30 + random.next() * 110;
        const glow = context.createRadialGradient(x, y, 0, x, y, r);
        glow.addColorStop(0, random.chance(0.5) ? "rgba(255,255,255,0.06)" : "rgba(60,40,20,0.06)");
        glow.addColorStop(1, "rgba(0,0,0,0)");
        context.fillStyle = glow;
        context.fillRect(x - r, y - r, r * 2, r * 2);
      }
    },
    relief: (context, width, height) => {
      context.fillStyle = grey(0.5);
      context.fillRect(0, 0, width, height);
      // Each crease is a ridge with one lit and one shaded flank, drawn on a tile that wraps.
      for (const crease of creases) {
        for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const cx = (crease.x + dx) * width;
          const cy = (crease.y + dy) * height;
          const half = (crease.length * width) / 2;
          const ux = Math.cos(crease.angle);
          const uy = Math.sin(crease.angle);
          const glow = context.createLinearGradient(cx - uy * 7, cy + ux * 7, cx + uy * 7, cy - ux * 7);
          glow.addColorStop(0, grey(0.5, 0));
          glow.addColorStop(0.5, grey(0.5 + crease.depth * 0.45, 0.9));
          glow.addColorStop(1, grey(0.5, 0));
          context.strokeStyle = glow;
          context.lineWidth = 14;
          context.beginPath();
          context.moveTo(cx - ux * half, cy - uy * half);
          context.lineTo(cx + ux * half, cy + uy * half);
          context.stroke();
        }
      }
      for (let speck = 0; speck < (kind === "kraft" ? 5000 : 2500); speck += 1) {
        context.fillStyle = grey(0.4 + random.next() * 0.2, 0.5);
        context.fillRect(random.next() * width, random.next() * height, 1.2, 1.2);
      }
    },
  });
}

export interface TagPalette {
  paper: string;
  ink: string;
  accent: string;
  caption: string;
}

/** A small gift tag: the couple's initials in the handwriting used across the diary. */
export function tagTexture(palette: TagPalette): THREE.CanvasTexture | null {
  if (!canPaint()) return null;
  const context = canvas2d(256, 384);
  if (!context) return null;
  const paint = () => {
    const { width, height } = context.canvas;
    context.fillStyle = palette.paper;
    context.fillRect(0, 0, width, height);
    const random = randomStream(61);
    for (let fibre = 0; fibre < 600; fibre += 1) {
      context.fillStyle = random.chance(0.5) ? "rgba(255,255,255,0.08)" : "rgba(80,60,40,0.06)";
      context.fillRect(random.next() * width, random.next() * height, 1 + random.next() * 6, 1);
    }
    context.strokeStyle = palette.accent;
    context.globalAlpha = 0.5;
    context.lineWidth = 2;
    context.strokeRect(16, 16, width - 32, height - 32);
    context.globalAlpha = 1;
    context.fillStyle = palette.ink;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "700 88px 'Dancing Script', 'Literata', Georgia, serif";
    context.fillText("H & N", width / 2, height * 0.45);
    context.font = "500 19px 'Be Vietnam Pro', 'Avenir Next', sans-serif";
    context.fillText(palette.caption, width / 2, height * 0.68);
    // The punched hole the thread runs through.
    context.fillStyle = "rgba(0,0,0,0.55)";
    context.beginPath();
    context.arc(width / 2, 38, 8, 0, Math.PI * 2);
    context.fill();
  };
  paint();
  const texture = toTexture(context, THREE.SRGBColorSpace);
  // The handwriting font usually arrives after the model is built; repaint the tag once it has.
  if (document.fonts?.load) {
    void document.fonts.load("700 88px 'Dancing Script'").then(() => {
      paint();
      texture.needsUpdate = true;
    }).catch(() => undefined);
  }
  return texture;
}
