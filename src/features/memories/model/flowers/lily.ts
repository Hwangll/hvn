import * as THREE from "three";
import { createPlantMaterial } from "../../three/bouquet/plantMaterial";
import { bentMidline, leafGeometry, type BladeColors, type LeafSpec } from "./blades";
import {
  PartBatch,
  type BuildSteps,
  frameMatrix,
  gridGeometry,
  instanced,
  mesh,
  mix,
  pointAtHeight,
  randomStream,
  smoothstep,
  tubeGeometry,
  type RandomStream,
} from "./common";
import { lilyLeafMaps, lilyTepalMaps, stemMaps } from "./textures";

/**
 * The red lily keepsake, built in code: six open lilies from deep crimson to scarlet, a seventh still opening and three
 * long buds blushing from green to red, on stems set with whorls of narrow glossy leaves, with arching sprays of ruscus
 * behind them. A bloom is two whorls of tepals, three broad petals inside three narrower sepals, each grooved down the
 * middle, freckled toward a warmer throat and rolled back at the tip, round six long stamens with rust-brown anthers
 * and a longer pistil ending in a three-lobed stigma. Every tepal, leaf and bud is its own shape and tint, merged per
 * material into a handful of draw calls; each bloom sways as one through its anchor (see PartBatch) while its tepals
 * shiver on their own.
 *
 * Head space: the bloom faces +Z from its throat at the origin. Bouquet space, as for the other keepsakes: the wrap is
 * tied at y = -0.8 and stands on the plinth at y = -1.16.
 */

/** Where the stems are bound. */
const BINDING = new THREE.Vector3(0, -0.78, 0.01);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);

interface BloomSpec {
  center: [number, number, number];
  facing: [number, number, number];
  /** Spin about the facing axis, so no two stars of tepals line up. */
  roll: number;
  scale: number;
  /** 1 = wide open with the tips rolled back; lower still holds the tepals in a trumpet. */
  openness: number;
  seed: number;
}

/**
 * A dome of blooms: the largest in front, two low at the sides resting on the paper, two higher behind them, one at the
 * crown and a young one still opening behind it, all turned out and up from the binding the way lilies turn to the
 * light.
 */
const BLOOMS: BloomSpec[] = [
  { center: [0.02, 0.3, 0.25], facing: [0.06, 0.25, 1], roll: 0.2, scale: 1.34, openness: 1, seed: 11 },
  { center: [-0.52, -0.02, 0.18], facing: [-0.55, 0, 0.83], roll: 1.1, scale: 1.2, openness: 1, seed: 23 },
  { center: [0.54, 0.02, 0.15], facing: [0.56, 0.06, 0.83], roll: 2.3, scale: 1.18, openness: 0.96, seed: 37 },
  { center: [-0.4, 0.66, -0.02], facing: [-0.5, 0.42, 0.76], roll: 0.6, scale: 1.16, openness: 0.94, seed: 53 },
  { center: [0.44, 0.7, -0.06], facing: [0.48, 0.45, 0.75], roll: 3.4, scale: 1.18, openness: 1, seed: 67 },
  { center: [0.04, 0.92, -0.16], facing: [0, 0.7, 0.71], roll: 1.9, scale: 1.12, openness: 0.92, seed: 79 },
  { center: [-0.3, 1.06, -0.4], facing: [-0.25, 0.92, 0.3], roll: 4.2, scale: 0.94, openness: 0.42, seed: 97 },
];

interface BudSpec {
  base: [number, number, number];
  direction: [number, number, number];
  length: number;
  /** How far the red has spread down from the tip: 0 still green, 1 about to open. */
  blush: number;
  /** A gentle sideways bow, as a share of its length. */
  bow: number;
  seed: number;
}

/** Buds stand out of the gaps along the dome's edge. */
const BUDS: BudSpec[] = [
  { base: [0.32, 1.16, -0.46], direction: [0.22, 0.96, 0.15], length: 0.3, blush: 1, bow: -0.05, seed: 5 },
  { base: [0.86, 0.42, -0.3], direction: [0.62, 0.76, 0.12], length: 0.28, blush: 0.6, bow: -0.05, seed: 7 },
  { base: [-0.88, 0.38, -0.26], direction: [-0.64, 0.74, 0.16], length: 0.26, blush: 0.8, bow: 0.04, seed: 9 },
];

/** Deep crimson to scarlet: green always well below blue, so the grade (see lighting) keeps them red, not orange. */
const CRIMSONS = [0xb0062e, 0xa80432, 0xbc0a36, 0xac082e, 0xb60c34];
/** The throat is lighter and warmer; the tips deepen; the nectary furrow is pale gold at its foot. */
const THROAT = new THREE.Color(0xdc3236);
const DEEP = new THREE.Color(0x86081e);
const FURROW = new THREE.Color(0xeeae58);
const FILAMENT_BASE = new THREE.Color(0xc2c98a);
const FILAMENT_TIP = new THREE.Color(0xd23a2c);
const STYLE_BASE = new THREE.Color(0xc9cf96);
const STYLE_TIP = new THREE.Color(0xb8283a);
const STIGMA = new THREE.Color(0x5c0a1c);
const ANTHERS = [0x8e3c18, 0x9a4420, 0x7e3414, 0xa04a22];

interface TepalSpec {
  length: number;
  /** Half the widest width. */
  width: number;
  /** Where along the length it is widest (0..1). */
  peak: number;
  /** Width at the base, as a share of the widest. */
  claw: number;
  /** How far it rolls back along its length, in radians, and how late the bend comes. */
  curl: number;
  curlPower: number;
  /** The halves raised toward the face round the throat, as a share of the half width. */
  cup: number;
  /** The margins rolled back near the tip. */
  roll: number;
  /** Depth of the groove down the middle (share of the half width): the nectary furrow low down, a crease above. */
  groove: number;
  wave: number;
  waves: number;
  wavePhase: number;
  twist: number;
  sideBend: number;
}

interface TepalColors {
  throat: THREE.Color;
  body: THREE.Color;
  tip: THREE.Color;
}

/**
 * One tepal along +Y facing +Z: a claw at the throat, widest a little below the middle, holding its width past it and
 * then drawn to a point. It leaves the throat cupped round the furrow, bends back along its length (the bend coming
 * late, so the bloom keeps a funnel before it opens into a star) and rolls its margins back near the tip, where they
 * wave a little.
 */
function tepalGeometry(spec: TepalSpec, colors: TepalColors, mirror: boolean): THREE.BufferGeometry {
  const midline = bentMidline(spec.length, spec.curl, spec.curlPower);
  const geometry = gridGeometry(12, 30, (u, v, position, color) => {
    const across = u * 2 - 1;
    const edge = Math.abs(across);
    const rise = Math.sin((Math.PI / 2) * Math.min(1, v / spec.peak));
    const fall = smoothstep(spec.peak + 0.12, 1, v);
    const half = spec.width * (spec.claw + (1 - spec.claw) * Math.pow(rise, 0.7)) * (1 - 0.97 * Math.pow(fall, 1.15));
    const relief =
      spec.cup * Math.pow(1 - v, 1.5) * across * across * half
      - spec.roll * smoothstep(0.5, 1, v) * across * across * half
      - spec.groove * half * Math.exp(-(across * across) / 0.02) * (1 - 0.6 * v)
      + spec.wave * Math.pow(edge, 2.2) * Math.sin(Math.PI * 2 * spec.waves * v + spec.wavePhase + across) * smoothstep(0.15, 0.55, v);
    const turn = spec.twist * Math.pow(v, 1.4);
    const x = across * half;
    const tx = x * Math.cos(turn) - relief * Math.sin(turn);
    const tz = x * Math.sin(turn) + relief * Math.cos(turn);
    const [cy, cz, angle] = midline(v);
    position.set(tx + spec.sideBend * spec.length * v * v, cy + tz * Math.sin(angle), cz + tz * Math.cos(angle));
    color.copy(colors.throat).lerp(colors.body, smoothstep(0.04, 0.34, v));
    color.lerp(colors.tip, smoothstep(0.6, 1, v) * 0.5 + Math.pow(edge, 3) * 0.3 * smoothstep(0.2, 0.8, v));
    color.lerp(FURROW, Math.exp(-(across * across) / 0.012) * (1 - smoothstep(0.05, 0.3, v)) * 0.6);
    color.multiplyScalar(mix(0.78, 1, smoothstep(0, 0.25, v)));
  });
  // Half the tepals take the freckles the other way round, so no two neighbours share a pattern.
  if (mirror) {
    const uv = geometry.getAttribute("uv") as THREE.BufferAttribute;
    for (let index = 0; index < uv.count; index += 1) uv.setX(index, 1 - uv.getX(index));
  }
  return geometry;
}

function headMatrix(spec: BloomSpec): THREE.Matrix4 {
  const facing = new THREE.Vector3(...spec.facing).normalize();
  const rotation = new THREE.Quaternion().setFromUnitVectors(Z_AXIS, facing);
  rotation.multiply(new THREE.Quaternion().setFromAxisAngle(Z_AXIS, spec.roll));
  return new THREE.Matrix4().compose(new THREE.Vector3(...spec.center), rotation, new THREE.Vector3().setScalar(spec.scale));
}

/** An anther or a lobe of a stigma: an instance of one small ellipsoid, swaying with its bloom. */
interface Tip {
  matrix: THREE.Matrix4;
  color: THREE.Color;
  anchor: THREE.Vector3;
  seed: number;
}

interface BloomParts {
  tepals: PartBatch;
  /** Filaments and styles. */
  stamens: PartBatch;
  tips: Tip[];
}

/** One bloom: three sepals and three petals between them, six stamens and the pistil. */
function addBloom(spec: BloomSpec, parts: BloomParts): void {
  const random = randomStream(spec.seed);
  const matrix = headMatrix(spec);
  const anchor = new THREE.Vector3(...spec.center);
  const open = spec.openness;
  const crimson = new THREE.Color(random.pick(CRIMSONS));
  const radial = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const face = new THREE.Vector3();
  for (let index = 0; index < 6; index += 1) {
    // Petals sit inside the sepals, broader and a little more upright, and curl back less.
    const petal = index % 2 === 1;
    const angle = (index / 6) * Math.PI * 2 + random.signed(0.06);
    const length = (petal ? 0.5 : 0.52) * random.range(0.95, 1.05) * mix(0.78, 1, open);
    const tepal: TepalSpec = {
      length,
      width: length * (petal ? random.range(0.21, 0.24) : random.range(0.145, 0.165)),
      peak: petal ? random.range(0.38, 0.45) : random.range(0.42, 0.5),
      claw: petal ? random.range(0.18, 0.22) : random.range(0.25, 0.3),
      curl: mix(0.3, petal ? random.range(1.35, 1.65) : random.range(1.55, 1.95), open),
      curlPower: random.range(2, 2.6),
      cup: random.range(0.5, 0.8),
      roll: random.range(0.1, 0.3) * open,
      groove: petal ? random.range(0.22, 0.3) : random.range(0.16, 0.24),
      wave: length * random.range(0.015, 0.03),
      waves: random.range(1.5, 2.6),
      wavePhase: random.next() * Math.PI * 2,
      twist: random.signed(0.28),
      sideBend: random.signed(0.05),
    };
    const lean = mix(0.12, petal ? 0.34 : 0.42, open) + random.signed(0.05);
    radial.set(Math.cos(angle), Math.sin(angle), 0);
    direction.copy(radial).multiplyScalar(Math.sin(lean)).addScaledVector(Z_AXIS, Math.cos(lean));
    face.copy(radial).multiplyScalar(-Math.cos(lean)).addScaledVector(Z_AXIS, Math.sin(lean));
    const origin = radial.clone().multiplyScalar(petal ? 0.011 : 0.015).setZ(petal ? 0.003 : -0.003);
    const body = crimson.clone().offsetHSL(random.signed(0.006), random.signed(0.04), random.signed(0.025));
    const colors: TepalColors = { throat: THROAT.clone().lerp(body, 0.2), body, tip: body.clone().lerp(DEEP, 0.55) };
    const geometry = tepalGeometry(tepal, colors, random.chance(0.5));
    geometry.applyMatrix4(frameMatrix(origin, direction, face).premultiply(matrix));
    parts.tepals.add(geometry, anchor, random.next());
  }

  const at = (toward: THREE.Vector3, out: number, along: number) => toward.clone().multiplyScalar(out).addScaledVector(Z_AXIS, along).applyMatrix4(matrix);
  const tangent = new THREE.Vector3();
  const across = new THREE.Vector3();
  for (let index = 0; index < 6; index += 1) {
    // Each stamen stands before a tepal, arching out from the throat and turning up at its anther.
    const angle = (index / 6) * Math.PI * 2 + random.signed(0.1);
    radial.set(Math.cos(angle), Math.sin(angle), 0);
    const length = 0.32 * random.range(0.92, 1.06) * mix(0.72, 1, open);
    const spread = mix(0.1, 0.42, open) + random.signed(0.05);
    const out = Math.sin(spread) * length;
    const along = Math.cos(spread) * length;
    const filament = new THREE.CatmullRomCurve3([at(radial, 0.006, 0.006), at(radial, out * 0.38, along * 0.34), at(radial, out * 0.82, along * 0.7), at(radial, out, along)]);
    const tint = (t: number, color: THREE.Color) => color.copy(FILAMENT_BASE).lerp(FILAMENT_TIP, smoothstep(0.15, 0.9, t));
    parts.stamens.add(tubeGeometry(filament, 12, 5, (t) => mix(0.0026, 0.0017, t) * spec.scale, tint), anchor, random.next());
    // The anther hangs by its middle across the end of the filament.
    filament.getTangentAt(1, tangent);
    across.copy(radial).transformDirection(matrix).cross(tangent).normalize().applyAxisAngle(tangent, random.signed(0.5));
    const centre = filament.getPointAt(1).addScaledVector(tangent, 0.004 * spec.scale);
    const size = random.range(0.92, 1.08) * spec.scale;
    parts.tips.push({
      matrix: new THREE.Matrix4().compose(centre, new THREE.Quaternion().setFromUnitVectors(Y_AXIS, across), new THREE.Vector3(0.011, 0.034, 0.0085).multiplyScalar(size)),
      color: new THREE.Color(random.pick(ANTHERS)).offsetHSL(0, random.signed(0.05), random.signed(0.02)),
      anchor,
      seed: random.next(),
    });
  }

  // The style bows a little to one side and ends in a stigma of three swollen lobes.
  const angle = random.next() * Math.PI * 2;
  radial.set(Math.cos(angle), Math.sin(angle), 0);
  const length = 0.37 * random.range(0.95, 1.05) * mix(0.72, 1, open);
  const style = new THREE.CatmullRomCurve3([at(radial, 0, 0.004), at(radial, 0.006, length * 0.35), at(radial, 0.022, length * 0.7), at(radial, 0.05, length)]);
  const tint = (t: number, color: THREE.Color) => color.copy(STYLE_BASE).lerp(STYLE_TIP, smoothstep(0.3, 1, t));
  parts.stamens.add(tubeGeometry(style, 14, 6, (t) => (mix(0.0034, 0.0026, t) + 0.0012 * smoothstep(0.88, 1, t)) * spec.scale, tint), anchor, random.next());
  style.getTangentAt(1, tangent);
  across.set(1, 0, 0).cross(tangent).normalize();
  const end = style.getPointAt(1).addScaledVector(tangent, 0.002 * spec.scale);
  for (let lobe = 0; lobe < 3; lobe += 1) {
    const offset = across.clone().applyAxisAngle(tangent, (lobe / 3) * Math.PI * 2).multiplyScalar(0.0052 * spec.scale);
    parts.tips.push({
      matrix: new THREE.Matrix4().compose(end.clone().add(offset), new THREE.Quaternion(), new THREE.Vector3().setScalar(0.0062 * spec.scale)),
      color: STIGMA,
      anchor,
      seed: random.next(),
    });
  }
}

const BUD_GREEN = new THREE.Color(0x4e7f34);
const BUD_LIME = new THREE.Color(0x8fa847);
const BUD_RED = new THREE.Color(0xb3142c);

/**
 * A closed bud along +Y from its stalk: a slender club swelling two thirds of the way up and closing to a blunt point,
 * ridged by the midribs of its three outer tepals. Green at the foot, it blushes red from the tip down as it ripens.
 */
function budGeometry(spec: BudSpec, random: RandomStream): THREE.BufferGeometry {
  const radius = spec.length * random.range(0.13, 0.15);
  const seams = random.next() * Math.PI * 2;
  return gridGeometry(16, 24, (u, v, position, color) => {
    const angle = u * Math.PI * 2;
    const swell = v < 0.66 ? 0.22 + 0.78 * Math.pow(Math.sin((Math.PI / 2) * (v / 0.66)), 0.85) : Math.pow(Math.cos((Math.PI / 2) * ((v - 0.66) / 0.34)), 0.9);
    const ridge = Math.cos(3 * (angle - seams));
    const r = radius * swell * (1 + (0.05 + 0.05 * smoothstep(0.3, 0.9, v)) * ridge);
    // z runs against the angle so the surface faces outward (it is drawn front side only).
    position.set(Math.cos(angle) * r + spec.bow * spec.length * v * v, v * spec.length, -Math.sin(angle) * r);
    const blush = smoothstep(mix(0.9, 0.3, spec.blush), 1, v) * mix(0.8, 1, ridge * 0.5 + 0.5);
    color.copy(BUD_GREEN).lerp(BUD_LIME, smoothstep(0.1, 0.5, v) * 0.6).lerp(BUD_RED, blush);
  });
}

/** A bloom's stem: up from inside the wrap, through the binding, curving into the back of the flower. */
function bloomStem(spec: BloomSpec): THREE.CatmullRomCurve3 {
  const center = new THREE.Vector3(...spec.center);
  const facing = new THREE.Vector3(...spec.facing).normalize();
  const neck = center.clone().addScaledVector(facing, -0.035 * spec.scale);
  const behind = neck.clone().addScaledVector(facing, -0.12).add(new THREE.Vector3(0, -0.06, 0));
  return stemThrough(new THREE.Vector3(center.x, 0, center.z).normalize(), behind, neck);
}

/** A bud's stem, which carries straight on into the bud. */
function budStem(spec: BudSpec): THREE.CatmullRomCurve3 {
  const base = new THREE.Vector3(...spec.base);
  const below = base.clone().addScaledVector(new THREE.Vector3(...spec.direction).normalize(), -0.12);
  return stemThrough(new THREE.Vector3(base.x, 0, base.z).normalize(), below, base);
}

function stemThrough(outward: THREE.Vector3, approach: THREE.Vector3, end: THREE.Vector3): THREE.CatmullRomCurve3 {
  const bottom = new THREE.Vector3(-outward.x * 0.05, -1.1, -outward.z * 0.04);
  const binding = BINDING.clone().addScaledVector(outward, 0.012);
  const middle = binding.clone().lerp(approach, 0.5).addScaledVector(outward, 0.04);
  return new THREE.CatmullRomCurve3([bottom, binding, middle, approach, end], false, "centripetal");
}

const LEAF_GREENS = [0x3a7a30, 0x427f34, 0x35722d, 0x4a8638, 0x3c7631];

/**
 * A stem's leaves, from inside the paper right up to its flower, as a lily carries them: whorls of three or four
 * narrow, pointed leaves, smaller toward the top, each rising from the stem and arching over at the tip, turned mostly
 * out to the front and sides, where they show between the blooms and frame them. They sway with the stem: the breeze is
 * read where the stem is anchored, the bend at the height of the leaf.
 */
function addWhorls(curve: THREE.Curve<THREE.Vector3>, top: number, stemAnchor: THREE.Vector3, seed: number, leaves: PartBatch): void {
  const random = randomStream(seed * 173 + 29);
  // The lowest whorl grows inside the paper, so its leaves come out over the edge.
  const low = -0.42;
  const high = top - 0.1;
  if (high <= low) return;
  const nodes = Math.max(1, Math.round((high - low) / 0.17));
  const side = new THREE.Vector3();
  const out = new THREE.Vector3();
  const direction = new THREE.Vector3();
  for (let node = 0; node < nodes; node += 1) {
    const { point, t } = pointAtHeight(curve, mix(low, high, (node + 0.4 + random.signed(0.15)) / nodes));
    const tangent = curve.getTangentAt(t);
    side.crossVectors(tangent, Z_AXIS).normalize();
    out.set(point.x, 0, point.z + 0.6).normalize().addScaledVector(tangent, -out.dot(tangent)).normalize();
    const count = random.chance(0.5) ? 3 : 4;
    const turn = random.next() * Math.PI * 2;
    for (let leaf = 0; leaf < count; leaf += 1) {
      const around = side.clone().applyAxisAngle(tangent, turn + (leaf / count) * Math.PI * 2 + random.signed(0.3)).lerp(out, 0.55).normalize();
      const rise = random.range(0.55, 0.95);
      direction.copy(tangent).multiplyScalar(Math.cos(rise)).addScaledVector(around, Math.sin(rise)).normalize();
      // The face turns up toward the stem, as a lily's ascending leaves hold it.
      const origin = point.clone().addScaledVector(around, 0.01);
      const geometry = lilyLeaf(random, random.range(0.24, 0.32) * mix(1.06, 0.6, node / Math.max(1, nodes - 1))).applyMatrix4(frameMatrix(origin, direction, tangent));
      leaves.add(geometry, new THREE.Vector3(stemAnchor.x, origin.y, stemAnchor.z), random.next());
    }
  }
}

/** A lily's leaf along +Y facing +Z: narrow, pointed, folded a little along its midrib and arching over at the tip. */
function lilyLeaf(random: RandomStream, length: number): THREE.BufferGeometry {
  const spec: LeafSpec = {
    length,
    width: length * random.range(0.085, 0.11),
    peak: random.range(0.3, 0.4),
    fullness: 0.85,
    cordate: 0,
    acuminate: random.range(0.25, 0.4),
    teeth: 0,
    toothDepth: 0,
    curl: random.range(0.35, 0.9),
    curlPower: random.range(1.4, 2),
    fold: random.range(0.25, 0.4),
    wave: length * random.range(0.004, 0.01),
    waves: random.range(1.5, 2.5),
    wavePhase: random.next() * Math.PI * 2,
    twist: random.signed(0.5),
    sideBend: random.signed(0.08),
    midrib: 0.12,
  };
  const body = new THREE.Color(random.pick(LEAF_GREENS)).offsetHSL(random.signed(0.01), random.signed(0.05), random.signed(0.02));
  const colors: BladeColors = {
    base: body.clone().lerp(new THREE.Color(0x6a8a3a), 0.35),
    body,
    tip: body.clone().lerp(new THREE.Color(0x1d3a1c), 0.35),
    occlusion: 0.72,
  };
  return leafGeometry(spec, colors, 6, 18);
}

/** The leaves low on the stems, spilling out over the paper's edge round the front and sides of the bouquet. */
function addSkirt(leaves: PartBatch): void {
  const random = randomStream(211);
  const count = 10;
  for (let index = 0; index < count; index += 1) {
    // Round from the left side, past the front, to the right; angles run from the front toward +x, as the wrap's do.
    const angle = mix(-2.3, 2.3, (index + 0.5) / count) + random.signed(0.12);
    const out = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
    const base = new THREE.Vector3(out.x * 0.24, -0.36 + random.signed(0.04), out.z * 0.2 + 0.02);
    const rise = random.range(0.8, 1.1);
    const direction = new THREE.Vector3(0, Math.cos(rise), 0).addScaledVector(out, Math.sin(rise));
    const geometry = lilyLeaf(random, random.range(0.32, 0.4)).applyMatrix4(frameMatrix(base, direction, Y_AXIS));
    leaves.add(geometry, base, random.next());
  }
}

interface Spray {
  tip: [number, number, number];
  leaves: number;
  /** How far the stem arcs up on its way out. */
  arch: number;
  seed: number;
}

/**
 * Ruscus rises behind the lilies and arches out past them, so its glossy green frames the red; a few shorter sprays
 * fill the hollows between the blooms.
 */
const RUSCUS: Spray[] = [
  { tip: [-0.96, 0.04, -0.1], leaves: 16, arch: 0.3, seed: 1 },
  { tip: [0.97, 0.1, -0.12], leaves: 16, arch: 0.3, seed: 2 },
  { tip: [-1, 0.6, -0.3], leaves: 18, arch: 0.2, seed: 3 },
  { tip: [1, 0.66, -0.32], leaves: 18, arch: 0.2, seed: 4 },
  { tip: [-0.8, 1.12, -0.45], leaves: 20, arch: 0.1, seed: 5 },
  { tip: [0.82, 1.14, -0.46], leaves: 20, arch: 0.1, seed: 6 },
  { tip: [0.06, 1.42, -0.6], leaves: 20, arch: 0.04, seed: 7 },
  { tip: [-0.3, -0.06, 0.36], leaves: 12, arch: 0.08, seed: 8 },
  { tip: [0.32, -0.04, 0.34], leaves: 12, arch: 0.08, seed: 9 },
  { tip: [-0.2, 0.62, 0.12], leaves: 14, arch: 0.06, seed: 10 },
  { tip: [0.26, 0.66, 0.1], leaves: 14, arch: 0.06, seed: 11 },
  { tip: [-0.66, 0.36, 0.02], leaves: 14, arch: 0.1, seed: 12 },
  { tip: [0.7, 0.4, 0], leaves: 14, arch: 0.1, seed: 13 },
];

/**
 * Italian ruscus: slender green stems with small glossy, pointed leaves set alternately along them, smaller toward the
 * tip. They sway with the stem: the breeze is read at its tip, the bend at the height of the leaf. A spray at a time.
 */
function* addRuscus(stems: PartBatch, leaves: PartBatch): BuildSteps {
  const green = new THREE.Color(0x4a6e30);
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const facing = new THREE.Vector3();
  for (const spray of RUSCUS) {
    const random = randomStream(spray.seed * 389 + 13);
    const tip = new THREE.Vector3(...spray.tip);
    const outward = new THREE.Vector3(tip.x, 0, Math.min(0, tip.z)).normalize();
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-outward.x * 0.04, -1.08, -0.02),
      BINDING.clone().add(new THREE.Vector3(0, 0, -0.02)),
      BINDING.clone().lerp(tip, 0.45).add(new THREE.Vector3(outward.x * 0.06, 0.04 + spray.arch * 0.5, -0.14)),
      BINDING.clone().lerp(tip, 0.78).add(new THREE.Vector3(outward.x * 0.03, spray.arch, -0.06)),
      tip,
    ], false, "centripetal");
    stems.add(tubeGeometry(curve, 36, 5, (t) => mix(0.0055, 0.0025, t), (_, out) => out.copy(green)), tip, random.next());
    const turn = random.next() * Math.PI;
    for (let index = 0; index < spray.leaves; index += 1) {
      const along = index / (spray.leaves - 1);
      const t = mix(0.34, 0.98, along);
      const point = curve.getPointAt(t);
      curve.getTangentAt(t, tangent);
      side.crossVectors(tangent, Z_AXIS).normalize().applyAxisAngle(tangent, turn + random.signed(0.35));
      const lean = random.range(0.55, 0.85);
      direction.copy(side).multiplyScalar((index % 2 ? 1 : -1) * Math.cos(lean)).addScaledVector(tangent, Math.sin(lean)).normalize();
      facing.crossVectors(direction, tangent).normalize();
      if (facing.z + facing.y * 0.5 < 0) facing.negate();
      facing.applyAxisAngle(direction, random.signed(0.4));
      const length = mix(0.092, 0.04, Math.pow(along, 0.9)) * random.range(0.9, 1.1);
      const spec: LeafSpec = {
        length,
        width: length * random.range(0.24, 0.3),
        peak: random.range(0.36, 0.44),
        fullness: 0.62,
        cordate: 0,
        acuminate: random.range(0.3, 0.45),
        teeth: 0,
        toothDepth: 0,
        curl: random.range(0.1, 0.4),
        curlPower: random.range(1.3, 1.8),
        fold: random.range(0.1, 0.2),
        wave: length * random.range(0.01, 0.025),
        waves: random.range(1, 1.6),
        wavePhase: random.next() * Math.PI * 2,
        twist: random.signed(0.25),
        sideBend: random.signed(0.06),
        midrib: 0.06,
      };
      const body = new THREE.Color(random.pick(LEAF_GREENS)).offsetHSL(random.signed(0.01), random.signed(0.05), random.signed(0.02));
      const colors: BladeColors = {
        base: body.clone().lerp(new THREE.Color(0x5f7f38), 0.3),
        body,
        tip: body.clone().lerp(new THREE.Color(0x24461f), 0.3),
        occlusion: 0.82,
      };
      const geometry = leafGeometry(spec, colors, 6, 8).applyMatrix4(frameMatrix(point, direction, facing));
      leaves.add(geometry, new THREE.Vector3(tip.x, point.y, tip.z), random.next());
    }
    yield;
  }
}

/** Builds the lily bouquet into `bouquet`, a slice at a time (see BuildSteps); the wrap is added separately. */
export function* buildLilyBouquet(bouquet: THREE.Group): BuildSteps {
  const parts: BloomParts = { tepals: new PartBatch(), stamens: new PartBatch(), tips: [] };
  const buds = new PartBatch();
  const stems = new PartBatch();
  const leaves = new PartBatch();
  for (const spec of BLOOMS) {
    addBloom(spec, parts);
    yield;
  }
  const stemGreen = new THREE.Color(0x3f6f2c);
  const neckGreen = new THREE.Color(0x7f9a44);
  const tint = (t: number, out: THREE.Color) => out.copy(stemGreen).lerp(neckGreen, smoothstep(0.8, 1, t));
  BLOOMS.forEach((spec) => {
    const random = randomStream(spec.seed * 7 + 1);
    const curve = bloomStem(spec);
    const anchor = new THREE.Vector3(...spec.center);
    // Slender, swelling a little where it meets the flower.
    const radius = (t: number) => (mix(0.0145, 0.0115, t) + 0.004 * smoothstep(0.85, 1, t)) * mix(0.8, 1, spec.scale);
    stems.add(tubeGeometry(curve, 48, 8, radius, tint), anchor, random.next());
    addWhorls(curve, spec.center[1], anchor, spec.seed, leaves);
  });
  yield;
  for (const spec of BUDS) {
    const random = randomStream(spec.seed * 11 + 3);
    const curve = budStem(spec);
    const base = new THREE.Vector3(...spec.base);
    stems.add(tubeGeometry(curve, 40, 7, (t) => mix(0.012, 0.0085, t), tint), base, random.next());
    const geometry = budGeometry(spec, random).applyMatrix4(frameMatrix(base, new THREE.Vector3(...spec.direction), Z_AXIS));
    buds.add(geometry, base, random.next());
    addWhorls(curve, spec.base[1], base, spec.seed + 100, leaves);
  }
  addSkirt(leaves);
  yield;
  yield* addRuscus(stems, leaves);

  const tepal = lilyTepalMaps();
  yield;
  const leaf = lilyLeafMaps();
  const stem = stemMaps();
  yield;
  const tepalMaterial = createPlantMaterial({
    part: "petal", anchored: true, rigid: true, vertexColors: true, color: 0xffffff, roughness: 0.5, flutter: 0.4,
    sheen: 0.35, sheenRoughness: 0.4, sheenColor: 0xff5a5a, translucency: 0.55, translucencyColor: 0xff6058,
    backTint: new THREE.Color(1.1, 1.05, 1.05), map: tepal.map, normalMap: tepal.normalMap, normalScale: new THREE.Vector2(0.65, 0.65),
  });
  const stamenMaterial = createPlantMaterial({ part: "stem", anchored: true, rigid: true, vertexColors: true, color: 0xffffff, roughness: 0.4, sheen: 0.3, sheenColor: 0xffd0b0 });
  const tipMaterial = createPlantMaterial({ part: "seed", anchored: true, rigid: true, color: 0xffffff, roughness: 0.82, sheen: 0.5, sheenRoughness: 0.5, sheenColor: 0xc8703a });
  const budMaterial = createPlantMaterial({
    part: "stem", anchored: true, rigid: true, vertexColors: true, color: 0xffffff, roughness: 0.45,
    sheen: 0.35, sheenRoughness: 0.4, sheenColor: 0xd8e8c0, clearcoat: 0.2, clearcoatRoughness: 0.4,
  });
  const leafMaterial = createPlantMaterial({
    part: "leaf", anchored: true, rigid: true, vertexColors: true, color: 0xffffff, roughness: 0.36, clearcoat: 0.4, clearcoatRoughness: 0.35,
    sheen: 0.15, sheenRoughness: 0.5, sheenColor: 0xb8d0a8, backTint: new THREE.Color(1.45, 1.4, 1.2), translucencyColor: 0x9ccc6a,
    map: leaf.map, normalMap: leaf.normalMap, normalScale: new THREE.Vector2(0.9, 0.9),
  });
  const stemMaterial = createPlantMaterial({
    part: "stem", anchored: true, vertexColors: true, color: 0xffffff, roughness: 0.5,
    sheen: 0.4, sheenRoughness: 0.35, sheenColor: 0xd8e8c0, normalMap: stem.normalMap, map: stem.map,
  });

  // Anthers and stigmas are a few pixels across: one small ellipsoid, instanced, each carrying its bloom's anchor.
  const ellipsoid = new THREE.SphereGeometry(1, 10, 7);
  const anchors = new Float32Array(parts.tips.length * 4);
  parts.tips.forEach((tip, index) => anchors.set([tip.anchor.x, tip.anchor.y, tip.anchor.z, tip.seed], index * 4));
  ellipsoid.setAttribute("plantAnchor", new THREE.InstancedBufferAttribute(anchors, 4));
  const tips = instanced(ellipsoid, tipMaterial, parts.tips.length, "lily-anthers");
  parts.tips.forEach((tip, index) => {
    tips.setMatrixAt(index, tip.matrix);
    tips.setColorAt(index, tip.color);
  });

  const stemMesh = mesh(stems.build(), stemMaterial, "lily-stems");
  const leafMesh = mesh(leaves.build(), leafMaterial, "lily-leaves");
  const budMesh = mesh(buds.build(), budMaterial, "lily-buds");
  yield;
  const stamenMesh = mesh(parts.stamens.build(), stamenMaterial, "lily-stamens");
  const tepalMesh = mesh(parts.tepals.build(), tepalMaterial, "lily-tepals");
  bouquet.add(stemMesh, leafMesh, budMesh, stamenMesh, tips, tepalMesh);
}
