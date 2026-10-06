import * as THREE from "three";
import { createPlantMaterial } from "../../three/bouquet/plantMaterial";
import { gridGeometry, merged, mesh, randomStream, smoothstep, valueNoise, type BuildSteps } from "./common";
import { paperMaps, tagTexture, type PaperKind, type TagPalette } from "./textures";

/**
 * The florist's wrap, shared by both keepsakes: sheets of paper gathered at a tie and opening above it, a tall collar
 * of darker paper behind the flowers, lower sheets in front; a satin bow with two loops and swallowtail ends; and the
 * couple's tag on a thread. Bouquet space, front toward +Z; angles run from the front (0) toward +x.
 */

export interface WrapPalette {
  /** The sheets in front. */
  outer: { color: number; kind: PaperKind };
  /** The collar behind the flowers. */
  inner: { color: number; kind: PaperKind };
  ribbon: { color: number; sheen: number };
  tag: TagPalette;
  thread: number;
}

/** Golden hour: kraft in front of matte black, an ivory satin bow. */
export const KRAFT_WRAP: WrapPalette = {
  outer: { color: 0x977656, kind: "kraft" },
  inner: { color: 0x1c1a19, kind: "matte" },
  ribbon: { color: 0xe4d3b4, sheen: 0xfff1d8 },
  tag: { paper: "#efe3cc", ink: "#5a3a26", accent: "rgba(140,100,60,0.7)", caption: "2023 · 2026" },
  thread: 0x8a6a4a,
};

/** Moonlight: ivory paper in front of deep navy, a navy satin bow. */
export const IVORY_WRAP: WrapPalette = {
  outer: { color: 0xe6e2d9, kind: "matte" },
  inner: { color: 0x1d2a42, kind: "matte" },
  ribbon: { color: 0x233f6c, sheen: 0x9dc4ff },
  tag: { paper: "#f3f6f9", ink: "#22518c", accent: "rgba(34,81,140,0.5)", caption: "PHẦN II" },
  thread: 0x4f6f96,
};

const NECK_Y = -0.8;
const BASE_Y = -1.15;
const NECK_RADIUS = 0.11;
/** The bundle is a little flatter front to back than side to side. */
const DEPTH_SCALE = 0.8;
const AXIS_Z = 0.02;

/** Radius of the paper bundle at a height: a skirt belling out below the tie, a cone flaring above it and easing off. */
function bundleRadius(y: number): number {
  if (y < NECK_Y) {
    const t = (NECK_Y - y) / (NECK_Y - BASE_Y);
    return NECK_RADIUS + t * 0.07 + t * t * 0.075;
  }
  const rise = y - NECK_Y;
  return NECK_RADIUS + 0.62 * (1 - Math.exp(-1.6 * rise)) + 0.05 * rise;
}

function bundlePoint(angle: number, radius: number, y: number, out = new THREE.Vector3()): THREE.Vector3 {
  return out.set(Math.sin(angle) * radius, y, Math.cos(angle) * radius * DEPTH_SCALE + AXIS_Z);
}

interface SheetSpec {
  /** Angular span, from and to. */
  span: [number, number];
  /** Height of the top edge at the start, middle and end of the span. */
  top: [number, number, number];
  /** Sheets further out sit a little further from the axis. */
  layer: number;
  pleats: number;
  /** How far the top edge rolls outward. */
  roll: number;
  seed: number;
}

/**
 * One sheet: wrapped around the bundle, pinched into small crinkles at the tie, opening into a few sharp pleats above
 * it, crumpled throughout, its top edge cut on a slant and rolled outward.
 */
function sheetGeometry(spec: SheetSpec): THREE.BufferGeometry {
  const random = randomStream(spec.seed * 59 + 1);
  const folds = Array.from({ length: spec.pleats }, () => ({
    at: random.next(),
    width: random.range(0.03, 0.07),
    depth: random.range(0.018, 0.04) * (random.chance(0.35) ? -1 : 1),
  }));
  const [from, to] = spec.span;
  const [start, middle, end] = spec.top;
  const control = 2 * middle - 0.5 * (start + end);
  const tallest = Math.max(start, middle, end);
  const width = (to - from) * 0.32;
  return gridGeometry(64, 26, (u, v, position) => {
    const angle = from + u * (to - from);
    const top = (1 - u) * (1 - u) * start + 2 * u * (1 - u) * control + u * u * end;
    const y = BASE_Y + v * (top - BASE_Y);
    // Pleats open out above the tie and, more softly, in the skirt below it; at the tie the layers are squeezed together.
    const open = Math.max(smoothstep(NECK_Y, NECK_Y + 0.3, y), smoothstep(NECK_Y, NECK_Y - 0.25, y) * 0.6);
    let radius = bundleRadius(y) + spec.layer * 0.007 * (0.25 + 0.75 * open);
    for (const fold of folds) radius += fold.depth * open * Math.max(0, 1 - Math.abs(u - fold.at) / fold.width);
    // Cinched at the tie: the paper bunches into many small folds.
    const cinch = Math.exp(-Math.pow((y - NECK_Y) / 0.09, 2));
    radius += cinch * (0.009 * Math.sin(angle * 23 + spec.seed) + 0.005 * Math.sin(angle * 41 + spec.seed * 2));
    const lip = smoothstep(0.84, 1, v);
    radius += spec.roll * lip * lip;
    radius += (0.004 + 0.01 * open) * valueNoise(Math.sin(angle) * 4.5, y * 9, Math.cos(angle) * 4.5, spec.seed);
    radius += 0.004 * valueNoise(Math.sin(angle) * 14, y * 22, Math.cos(angle) * 14, spec.seed + 7);
    bundlePoint(angle, radius, y - spec.roll * 0.35 * lip * lip, position);
  }, [width * 2, (tallest - BASE_Y) * 2]);
}

/** Golden hour and moonlight share the cut of the sheets; only the paper changes. */
const COLLAR: SheetSpec[] = [
  { span: [Math.PI - 1.7, Math.PI + 1.7], top: [-0.05, 0.5, 0], layer: 0, pleats: 5, roll: 0.05, seed: 1 },
  { span: [Math.PI - 1.95, Math.PI - 0.3], top: [-0.1, 0.18, 0.32], layer: 1, pleats: 4, roll: 0.05, seed: 2 },
  { span: [Math.PI + 0.3, Math.PI + 1.95], top: [0.3, 0.16, -0.12], layer: 1, pleats: 4, roll: 0.05, seed: 3 },
];
const FRONT: SheetSpec[] = [
  { span: [-2.25, 0.4], top: [0.02, -0.14, -0.3], layer: 2, pleats: 4, roll: 0.06, seed: 4 },
  { span: [-0.4, 2.25], top: [-0.32, -0.12, 0.04], layer: 3, pleats: 4, roll: 0.06, seed: 5 },
  { span: [-1, 1], top: [-0.22, -0.32, -0.24], layer: 4, pleats: 3, roll: 0.05, seed: 6 },
];

/**
 * A ribbon along a path, `across(t)` giving the direction of its width (kept square to the path), so it can loop
 * and twist. `notch` cuts a swallowtail into the end.
 */
function ribbonStrip(path: THREE.Curve<THREE.Vector3>, width: number, across: (t: number, out: THREE.Vector3) => void, segments = 40, notch = 0): THREE.BufferGeometry {
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  const length = path.getLength();
  return gridGeometry(4, segments, (u, v, position) => {
    const centre = 1 - Math.abs(u * 2 - 1);
    const t = Math.max(0, v - (notch / length) * centre * Math.pow(v, 8));
    path.getPointAt(t, point);
    path.getTangentAt(t, tangent);
    across(t, side);
    side.addScaledVector(tangent, -side.dot(tangent)).normalize();
    position.copy(point).addScaledVector(side, (u - 0.5) * width);
  }, [1, length * 8]);
}

/** Just outside the squeezed paper at the tie (radius, crinkles and all). */
const RIBBON_RADIUS = NECK_RADIUS + 0.03;

function bowGeometry(): THREE.BufferGeometry {
  const knot = new THREE.Vector3(0, NECK_Y + 0.004, RIBBON_RADIUS * DEPTH_SCALE + AXIS_Z + 0.014);
  const parts: THREE.BufferGeometry[] = [];
  const band = new THREE.CatmullRomCurve3(
    Array.from({ length: 24 }, (_, index) => bundlePoint((index / 24) * Math.PI * 2, RIBBON_RADIUS, NECK_Y + 0.004)),
    true,
  );
  parts.push(ribbonStrip(band, 0.056, (_, out) => out.set(0, 1, 0), 72));
  const wrapAround = new THREE.CatmullRomCurve3(
    Array.from({ length: 12 }, (_, index) => {
      const angle = (index / 12) * Math.PI * 2;
      return new THREE.Vector3(0, knot.y + Math.cos(angle) * 0.026, knot.z - 0.006 + Math.sin(angle) * 0.014);
    }),
    true,
  );
  parts.push(ribbonStrip(wrapAround, 0.034, (_, out) => out.set(1, 0, 0), 32));
  for (const side of [-1, 1]) {
    const outward = new THREE.Vector3(side, 0.42, -0.2).normalize();
    const forward = new THREE.Vector3(0, -0.2, 1).normalize();
    const axis = new THREE.Vector3().crossVectors(outward, forward).normalize();
    const loop = new THREE.CatmullRomCurve3(
      Array.from({ length: 16 }, (_, index) => {
        const angle = (index / 16) * Math.PI * 2;
        return knot.clone().addScaledVector(outward, 0.074 * (1 - Math.cos(angle)) + side * 0.004).addScaledVector(forward, 0.03 * Math.sin(angle));
      }),
      true,
    );
    parts.push(ribbonStrip(loop, 0.054, (_, out) => out.copy(axis), 48));
    const tail = new THREE.CatmullRomCurve3([
      knot.clone().add(new THREE.Vector3(side * 0.008, -0.012, 0.004)),
      knot.clone().add(new THREE.Vector3(side * 0.04, -0.09, 0.026)),
      knot.clone().add(new THREE.Vector3(side * 0.07, -0.18, 0.042)),
      knot.clone().add(new THREE.Vector3(side * 0.1, -0.27, 0.058)),
    ]);
    parts.push(ribbonStrip(tail, 0.05, (t, out) => {
      const twist = 0.25 + t * 0.7;
      out.set(Math.cos(twist), 0, Math.sin(twist) * side);
    }, 32, 0.04));
  }
  return merged(parts);
}

/** Wraps `bouquet` in paper, ribbon and tag, a slice at a time (see BuildSteps). */
export function* buildWrap(bouquet: THREE.Group, palette: WrapPalette): BuildSteps {
  const outerPaper = paperMaps(palette.outer.kind);
  yield;
  const innerPaper = palette.inner.kind === palette.outer.kind ? outerPaper : paperMaps(palette.inner.kind);
  yield;
  const paper = (color: number, kind: PaperKind, maps: typeof outerPaper) => createPlantMaterial({
    part: "wrap",
    color,
    roughness: kind === "kraft" ? 0.96 : 0.84,
    specularIntensity: kind === "kraft" ? 0.4 : 0.6,
    sheen: kind === "kraft" ? 0.12 : 0.3,
    sheenRoughness: 0.8,
    sheenColor: 0xffffff,
    map: maps.map,
    normalMap: maps.normalMap,
    normalScale: new THREE.Vector2(1.2, 1.2),
  });
  const collar = mesh(merged(COLLAR.map(sheetGeometry)), paper(palette.inner.color, palette.inner.kind, innerPaper), "wrap-collar");
  yield;
  bouquet.add(collar, mesh(merged(FRONT.map(sheetGeometry)), paper(palette.outer.color, palette.outer.kind, outerPaper), "wrap-front"));
  yield;

  const ribbon = createPlantMaterial({
    part: "wrap",
    color: palette.ribbon.color,
    roughness: 0.3,
    sheen: 0.8,
    sheenRoughness: 0.32,
    sheenColor: palette.ribbon.sheen,
    anisotropy: 0.55,
    clearcoat: 0.08,
    clearcoatRoughness: 0.4,
  });
  bouquet.add(mesh(bowGeometry(), ribbon, "wrap-bow"));

  const tagMaterial = createPlantMaterial({ part: "wrap", color: 0xffffff, roughness: 0.86, map: tagTexture(palette.tag) });
  if (!tagMaterial.map) tagMaterial.color.set(palette.tag.paper);
  const tag = mesh(new THREE.PlaneGeometry(0.095, 0.14), tagMaterial, "wrap-tag");
  tag.position.set(0.08, NECK_Y - 0.14, RIBBON_RADIUS * DEPTH_SCALE + AXIS_Z + 0.07);
  tag.rotation.set(0.05, 0.28, -0.18);
  tag.updateMatrix();
  const hole = new THREE.Vector3(0, 0.07 - 0.0145, 0.001).applyMatrix4(tag.matrix);
  const knot = new THREE.Vector3(0.006, NECK_Y - 0.006, RIBBON_RADIUS * DEPTH_SCALE + AXIS_Z + 0.026);
  const sag = knot.clone().lerp(hole, 0.5).add(new THREE.Vector3(0, -0.012, 0.006));
  const thread = new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3([knot, sag, hole]).getPoints(12));
  bouquet.add(tag, new THREE.Line(thread, new THREE.LineBasicMaterial({ color: palette.thread })));
}
