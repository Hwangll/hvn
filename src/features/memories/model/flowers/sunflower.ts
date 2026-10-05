import * as THREE from "three";
import { createPlantMaterial } from "../../three/bouquet/plantMaterial";
import {
  PartBatch,
  clamp01,
  frameMatrix,
  gridGeometry,
  instanced,
  mesh,
  mix,
  randomStream,
  smoothstep,
  tubeGeometry,
  type RandomStream,
} from "./common";
import { leafMaps, petalMaps, stemMaps, sunflowerDiscMaps } from "./textures";

/**
 * The sunflower keepsake, built in code and never twice the same petal: four open heads and one young one, their
 * stems and rough heart-shaped leaves, and sprays of baby's breath. Every petal, bract and leaf is its own shape (its
 * own length, curl, twist, teeth and tint), merged per material into a handful of draw calls; each still sways and
 * shivers on its own through its anchor (see PartBatch).
 *
 * Head space: the disc faces +Z, centred on the origin, radius DISC_RADIUS. Bouquet space: the wrap's neck sits near
 * y = -0.86 and the plinth at y = -1.16.
 */

const DISC_RADIUS = 0.2;
/** Where the stems are bound; they cross here, as in a hand-tied spiral bouquet. */
const BINDING = new THREE.Vector3(0, -0.78, 0.01);

interface HeadSpec {
  name: string;
  center: [number, number, number];
  facing: [number, number, number];
  /** Spin about the facing axis, so no two discs or petal crowns line up. */
  roll: number;
  scale: number;
  /** 1 = fully open; lower cups the petals around a greener disc. */
  openness: number;
  rays: [outer: number, inner: number];
  seed: number;
  /** Real discs spiral either way. */
  mirror: boolean;
}

const HEADS: HeadSpec[] = [
  { name: "main", center: [0.02, 0.5, 0.16], facing: [0.08, 0.14, 1], roll: 0.3, scale: 1.08, openness: 1, rays: [21, 13], seed: 11, mirror: false },
  { name: "left", center: [-0.52, 0.0, 0.12], facing: [-0.6, 0.08, 0.8], roll: 1.3, scale: 0.9, openness: 1, rays: [21, 13], seed: 23, mirror: true },
  { name: "right", center: [0.55, 0.05, 0.04], facing: [0.64, -0.02, 0.77], roll: 2.2, scale: 0.84, openness: 0.95, rays: [21, 13], seed: 37, mirror: false },
  { name: "back", center: [0.4, 0.84, -0.34], facing: [0.4, 0.55, 0.73], roll: 4, scale: 0.72, openness: 0.9, rays: [21, 13], seed: 53, mirror: true },
  { name: "young", center: [-0.36, 0.94, -0.3], facing: [-0.32, 0.7, 0.64], roll: 0.7, scale: 0.6, openness: 0.32, rays: [13, 8], seed: 41, mirror: false },
];

const RAY_YELLOWS = [0xffcc1f, 0xffc61a, 0xffd23a, 0xffc810, 0xfdc416, 0xffd640];

interface BladeSpec {
  length: number;
  /** Half the widest width. */
  width: number;
  /** Where along the length the blade is widest (0..1). */
  peak: number;
  /** Width at the base, as a share of the widest. */
  claw: number;
  /** Width at the tip, as a share of the widest. */
  tipWidth: number;
  /** How rounded the tip edge is. */
  round: number;
  /** Small teeth at the tip of a ray: 0, 2 or 3. */
  teeth: number;
  toothDepth: number;
  /** Backward bend toward the tip in radians (negative bends forward). */
  curl: number;
  curlPower: number;
  /** Edges raised toward the face (share of the half width). */
  cup: number;
  /** Depth of the groove along the midline (share of the half width). */
  channel: number;
  twist: number;
  sideBend: number;
  ruffle: number;
  ruffleWaves: number;
  rufflePhase: number;
  /** Lengthwise pleats from the veins. */
  folds: number;
  foldDepth: number;
}

interface BladeColors {
  base: THREE.Color;
  body: THREE.Color;
  tip: THREE.Color;
  /** Darkening at the base, where neighbours and the disc shade it (1 = none). */
  occlusion: number;
}

/**
 * A thin blade along +Y facing +Z: a ray petal or a bract. Its midline bends back along its length, its cross-section
 * cups and pleats, it twists toward the tip and its edges ripple, all from the spec, so every blade is its own.
 */
function bladeGeometry(spec: BladeSpec, colors: BladeColors, columns = 8, rows = 18): THREE.BufferGeometry {
  const steps = 48;
  const centre = new Float32Array((steps + 1) * 3);
  const ds = spec.length / steps;
  let y = 0;
  let z = 0;
  for (let index = 0; index <= steps; index += 1) {
    centre[index * 3] = y;
    centre[index * 3 + 1] = z;
    centre[index * 3 + 2] = spec.curl * Math.pow(index / steps, spec.curlPower);
    const bend = spec.curl * Math.pow((index + 0.5) / steps, spec.curlPower);
    y += Math.cos(bend) * ds;
    z -= Math.sin(bend) * ds;
  }
  const midline = (s: number): [number, number, number] => {
    const f = clamp01(s / spec.length) * steps;
    const index = Math.min(steps - 1, Math.floor(f));
    const t = f - index;
    return [mix(centre[index * 3], centre[index * 3 + 3], t), mix(centre[index * 3 + 1], centre[index * 3 + 4], t), mix(centre[index * 3 + 2], centre[index * 3 + 5], t)];
  };
  return gridGeometry(columns, rows, (u, v, position, color) => {
    const across = u * 2 - 1;
    const tooth = spec.teeth === 3 ? 0.5 - 0.5 * Math.cos(3 * Math.PI * across) : spec.teeth === 2 ? 0.5 + 0.5 * Math.cos(2 * Math.PI * across) : 0;
    const reach = 1 - spec.round * across * across - spec.toothDepth * tooth;
    const s = v * reach * spec.length;
    const rise = Math.sin((Math.PI / 2) * Math.min(1, v / spec.peak));
    const fall = smoothstep(spec.peak, 1, v);
    const half = spec.width * (spec.claw + (1 - spec.claw) * Math.pow(rise, 0.7)) * (1 - (1 - spec.tipWidth) * Math.pow(fall, 1.5));
    const x = across * half;
    const edge = Math.abs(across);
    const relief =
      spec.cup * across * across * half
      - spec.channel * half * Math.exp(-(across * across) / 0.03) * (1 - v * 0.7)
      + spec.foldDepth * Math.cos(Math.PI * spec.folds * across) * Math.sin(Math.PI * Math.min(1, v * 1.15)) * (1 - Math.pow(edge, 4))
      + spec.ruffle * Math.pow(edge, 2.5) * Math.sin(Math.PI * 2 * spec.ruffleWaves * v + spec.rufflePhase + across) * smoothstep(0.12, 0.55, v);
    const turn = spec.twist * Math.pow(v, 1.4);
    const tx = x * Math.cos(turn) - relief * Math.sin(turn);
    const tz = x * Math.sin(turn) + relief * Math.cos(turn);
    const [cy, cz, angle] = midline(s);
    position.set(tx + spec.sideBend * spec.length * v * v, cy + tz * Math.sin(angle), cz + tz * Math.cos(angle));
    color.copy(colors.base).lerp(colors.body, smoothstep(0, 0.3, v));
    color.lerp(colors.tip, smoothstep(0.55, 1, v) * 0.45 + Math.pow(edge, 3) * 0.15 * smoothstep(0.2, 0.9, v));
    color.multiplyScalar(mix(colors.occlusion, 1, smoothstep(0, 0.35, v)));
  });
}

function rayBlade(random: RandomStream, length: number, openness: number): BladeSpec {
  const wild = random.chance(0.16);
  return {
    length,
    width: length * random.range(0.13, 0.16),
    peak: random.range(0.38, 0.52),
    claw: random.range(0.18, 0.26),
    tipWidth: random.range(0.3, 0.45),
    round: random.range(0.06, 0.12),
    teeth: random.pick([0, 2, 2, 3, 3]),
    toothDepth: random.range(0.015, 0.045),
    curl: (wild ? random.range(0.75, 1.3) : random.range(0.12, 0.55)) * mix(0.35, 1, openness),
    curlPower: random.range(1.6, 2.4),
    cup: random.range(0.08, 0.28),
    channel: random.range(0.05, 0.12),
    twist: random.signed(wild ? 0.9 : 0.35),
    sideBend: random.signed(0.08),
    ruffle: length * random.range(0.006, 0.018),
    ruffleWaves: random.range(1.5, 3.2),
    rufflePhase: random.next() * Math.PI * 2,
    folds: random.range(5, 9),
    foldDepth: length * random.range(0.003, 0.007),
  };
}

function bractBlade(random: RandomStream, length: number): BladeSpec {
  return {
    length,
    width: length * random.range(0.26, 0.34),
    peak: random.range(0.16, 0.26),
    claw: random.range(0.75, 0.9),
    tipWidth: random.range(0.02, 0.06),
    round: 0,
    teeth: 0,
    toothDepth: 0,
    curl: -random.range(0.3, 1),
    curlPower: random.range(1.4, 2),
    cup: random.range(0.25, 0.45),
    channel: random.range(0.06, 0.12),
    twist: random.signed(0.35),
    sideBend: random.signed(0.12),
    ruffle: length * 0.012,
    ruffleWaves: 1.4,
    rufflePhase: random.next() * Math.PI * 2,
    folds: 0,
    foldDepth: 0,
  };
}

function headMatrix(spec: HeadSpec): THREE.Matrix4 {
  const facing = new THREE.Vector3(...spec.facing).normalize();
  const rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), facing);
  rotation.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), spec.roll));
  return new THREE.Matrix4().compose(new THREE.Vector3(...spec.center), rotation, new THREE.Vector3().setScalar(spec.scale));
}

/** The disc: a low dome rolling down at the rim, mapped flat so the floret texture keeps its spiral. */
function discGeometry(turn: number, mirror: boolean, young: boolean): THREE.BufferGeometry {
  const dome = young ? 0.014 : 0.028;
  const geometry = gridGeometry(14, 72, (u, v, position) => {
    const angle = v * Math.PI * 2;
    const height = dome * (1 - Math.pow(u, 2.2)) - 0.014 * Math.pow(smoothstep(0.86, 1, u), 2);
    position.set(Math.cos(angle) * u * DISC_RADIUS, Math.sin(angle) * u * DISC_RADIUS, height);
  });
  const uv = geometry.getAttribute("uv") as THREE.BufferAttribute;
  for (let index = 0; index < uv.count; index += 1) {
    const radius = uv.getX(index);
    const angle = uv.getY(index) * Math.PI * 2 + turn;
    uv.setXY(index, 0.5 + 0.5 * radius * Math.cos(angle) * (mirror ? -1 : 1), 0.5 + 0.5 * radius * Math.sin(angle));
  }
  return geometry;
}

/** Radius (share of the disc's) and depth of the green cup behind the disc, from its rim back to the neck. */
const RECEPTACLE: Array<[number, number]> = [[1.04, -0.012], [1, -0.03], [0.9, -0.056], [0.74, -0.082], [0.55, -0.102], [0.36, -0.118], [0.2, -0.13], [0.11, -0.138]];
const receptacleProfile = new THREE.CatmullRomCurve3(RECEPTACLE.map(([radius, depth]) => new THREE.Vector3(radius * DISC_RADIUS, 0, depth)));

function receptacleGeometry(color: THREE.Color): THREE.BufferGeometry {
  const point = new THREE.Vector3();
  return gridGeometry(10, 56, (u, v, position, tint) => {
    receptacleProfile.getPoint(u, point);
    const angle = v * Math.PI * 2;
    position.set(Math.cos(angle) * point.x, Math.sin(angle) * point.x, point.z);
    tint.copy(color).multiplyScalar(mix(0.62, 1, smoothstep(0, 0.4, u)));
  });
}

interface HeadBatches {
  rays: PartBatch;
  bracts: PartBatch;
  discs: PartBatch;
  youngDiscs: PartBatch;
}

/** One head: disc, two whorls of rays, the green cup behind and three rows of bracts on it. */
function addHead(spec: HeadSpec, batches: HeadBatches): void {
  const random = randomStream(spec.seed);
  const matrix = headMatrix(spec);
  const anchor = new THREE.Vector3(...spec.center);
  const young = spec.openness < 0.6;
  const place = new THREE.Matrix4();
  const step = new THREE.Matrix4();
  const turn = random.next() * Math.PI * 2;

  const disc = discGeometry(turn, spec.mirror, young).applyMatrix4(matrix);
  (young ? batches.youngDiscs : batches.discs).add(disc, anchor, random.next());

  const rows = [
    { count: spec.rays[0], radius: 0.178, depth: -0.02, lean: mix(-1.05, 0.24, spec.openness), length: 0.41, occlusion: 0.62, phase: 0 },
    { count: spec.rays[1], radius: 0.168, depth: -0.008, lean: mix(-1.25, 0.06, spec.openness), length: 0.385, occlusion: 0.5, phase: 0.5 },
  ];
  for (const row of rows) {
    for (let index = 0; index < row.count; index += 1) {
      const angle = ((index + row.phase + random.signed(0.22)) / row.count) * Math.PI * 2 + turn;
      const length = row.length * random.range(0.9, 1.08) * mix(0.72, 1, spec.openness);
      const body = new THREE.Color(random.pick(RAY_YELLOWS)).offsetHSL(random.signed(0.006), random.signed(0.04), random.signed(0.025));
      const colors: BladeColors = {
        body,
        base: body.clone().lerp(new THREE.Color(0xd27a0a), 0.5),
        tip: body.clone().lerp(new THREE.Color(0xffe594), 0.3),
        occlusion: row.occlusion,
      };
      const geometry = bladeGeometry(rayBlade(random, length, spec.openness), colors);
      place.makeTranslation(Math.cos(angle) * row.radius, Math.sin(angle) * row.radius, row.depth)
        .multiply(step.makeRotationZ(angle - Math.PI / 2))
        .multiply(step.makeRotationX(-(row.lean + random.signed(0.12))))
        .multiply(step.makeRotationY(random.signed(0.12)));
      geometry.applyMatrix4(place.premultiply(matrix));
      batches.rays.add(geometry, anchor, random.next());
    }
  }

  const green = new THREE.Color(young ? 0x557d36 : 0x4b7531);
  batches.bracts.add(receptacleGeometry(green).applyMatrix4(matrix), anchor, random.next());
  const bractRows = [
    { count: 21, radius: 0.19, depth: -0.03, tilt: [0.35, 0.6], length: [0.09, 0.12] },
    { count: 21, radius: 0.16, depth: -0.062, tilt: [0.7, 0.95], length: [0.085, 0.11] },
    { count: 13, radius: 0.11, depth: -0.098, tilt: [1, 1.3], length: [0.07, 0.09] },
  ];
  const radial = new THREE.Vector3();
  const along = new THREE.Vector3();
  const face = new THREE.Vector3();
  const back = new THREE.Vector3(0, 0, -1);
  bractRows.forEach((row, rowIndex) => {
    for (let index = 0; index < row.count; index += 1) {
      const angle = ((index + (rowIndex % 2) * 0.5 + random.signed(0.2)) / row.count) * Math.PI * 2 + turn;
      const tilt = random.range(row.tilt[0], row.tilt[1]) - (young ? 0.35 : 0);
      radial.set(Math.cos(angle), Math.sin(angle), 0);
      along.copy(radial).multiplyScalar(Math.cos(tilt)).addScaledVector(back, Math.sin(tilt));
      face.copy(radial).multiplyScalar(-Math.sin(tilt)).addScaledVector(back, Math.cos(tilt));
      const dry = random.chance(0.12);
      const body = green.clone().offsetHSL(random.signed(0.015), random.signed(0.06), random.signed(0.04));
      const colors: BladeColors = {
        base: body.clone().lerp(new THREE.Color(0x7d9a4a), 0.4),
        body,
        tip: dry ? new THREE.Color(0x8a7a42) : body.clone().lerp(new THREE.Color(0x2f5422), 0.4),
        occlusion: 0.7,
      };
      const length = random.range(row.length[0], row.length[1]) * (young ? 1.35 : 1);
      const geometry = bladeGeometry(bractBlade(random, length), colors, 6, 10);
      geometry.applyMatrix4(frameMatrix({ x: radial.x * row.radius, y: radial.y * row.radius, z: row.depth }, along, face).premultiply(matrix));
      batches.bracts.add(geometry, anchor, random.next());
    }
  });
}

/** The stem of a head: up from inside the wrap, through the binding, curving into the back of the head. */
function stemCurve(spec: HeadSpec): THREE.CatmullRomCurve3 {
  const center = new THREE.Vector3(...spec.center);
  const facing = new THREE.Vector3(...spec.facing).normalize();
  const neck = center.clone().addScaledVector(facing, -0.135 * spec.scale);
  const behind = neck.clone().addScaledVector(facing, -0.13).add(new THREE.Vector3(0, -0.05, 0));
  const outward = new THREE.Vector3(center.x, 0, center.z).normalize();
  const bottom = new THREE.Vector3(-outward.x * 0.05, -1.1, -outward.z * 0.04);
  const binding = BINDING.clone().addScaledVector(outward, 0.012);
  const middle = binding.clone().lerp(behind, 0.5).addScaledVector(outward, 0.04);
  return new THREE.CatmullRomCurve3([bottom, binding, middle, behind, neck], false, "centripetal");
}

/** Where a stem passes a height (it rises monotonically); a leaf asked for above the head would sprout from its neck. */
function pointAtHeight(curve: THREE.Curve<THREE.Vector3>, height: number): { point: THREE.Vector3; t: number } {
  let low = 0;
  let high = 1;
  const point = new THREE.Vector3();
  for (let iteration = 0; iteration < 24; iteration += 1) {
    const t = (low + high) / 2;
    curve.getPointAt(t, point);
    if (point.y < height) low = t;
    else high = t;
  }
  return { point: curve.getPointAt((low + high) / 2), t: (low + high) / 2 };
}

interface LeafSpec {
  length: number;
  width: number;
  peak: number;
  cordate: number;
  teeth: number;
  toothDepth: number;
  curl: number;
  curlPower: number;
  fold: number;
  wave: number;
  waves: number;
  wavePhase: number;
  twist: number;
  sideBend: number;
}

/**
 * A sunflower leaf along +Y facing +Z: broad and heart-based, with a long tip, a serrated margin whose teeth point to
 * the tip, a sunken midrib, halves folded slightly up, a wavy edge, and a droop that grows toward the tip.
 */
function leafGeometry(spec: LeafSpec, colors: BladeColors): THREE.BufferGeometry {
  const steps = 48;
  const centre = new Float32Array((steps + 1) * 3);
  const ds = spec.length / steps;
  let y = 0;
  let z = 0;
  for (let index = 0; index <= steps; index += 1) {
    centre[index * 3] = y;
    centre[index * 3 + 1] = z;
    centre[index * 3 + 2] = spec.curl * Math.pow(index / steps, spec.curlPower);
    const bend = spec.curl * Math.pow((index + 0.5) / steps, spec.curlPower);
    y += Math.cos(bend) * ds;
    z -= Math.sin(bend) * ds;
  }
  const exponent = Math.log(0.5) / Math.log(spec.peak);
  return gridGeometry(12, 26, (u, v, position, color) => {
    const across = u * 2 - 1;
    const edge = Math.abs(across);
    const outline = Math.pow(Math.sin(Math.PI * Math.pow(v, exponent)), 0.7) + spec.cordate * Math.exp(-Math.pow((v - 0.06) / 0.07, 2));
    const saw = (v * spec.teeth) % 1;
    const tooth = saw < 0.78 ? saw / 0.78 : (1 - saw) / 0.22;
    const serration = 1 - spec.toothDepth * (1 - tooth) * Math.pow(edge, 6) * smoothstep(0.04, 0.16, v) * smoothstep(1, 0.88, v);
    const half = spec.width * outline;
    const x = across * half * serration;
    const relief = spec.fold * edge * half
      - 0.12 * spec.width * Math.exp(-(across * across) / 0.004) * (1 - v * 0.8)
      + spec.wave * edge * edge * Math.sin(Math.PI * 2 * spec.waves * v + spec.wavePhase * Math.sign(across)) * smoothstep(0.1, 0.4, v);
    const turn = spec.twist * Math.pow(v, 1.3);
    const tx = x * Math.cos(turn) - relief * Math.sin(turn);
    const tz = x * Math.sin(turn) + relief * Math.cos(turn);
    const f = v * steps;
    const index = Math.min(steps - 1, Math.floor(f));
    const t = f - index;
    const cy = mix(centre[index * 3], centre[index * 3 + 3], t);
    const cz = mix(centre[index * 3 + 1], centre[index * 3 + 4], t);
    const angle = mix(centre[index * 3 + 2], centre[index * 3 + 5], t);
    position.set(tx + spec.sideBend * spec.length * v * v, cy + tz * Math.sin(angle), cz + tz * Math.cos(angle));
    color.copy(colors.base).lerp(colors.body, smoothstep(0, 0.25, v));
    color.lerp(colors.tip, Math.pow(edge, 4) * smoothstep(0.3, 1, v) * 0.6);
    color.multiplyScalar(mix(colors.occlusion, 1, smoothstep(0, 0.3, v)));
  });
}

interface LeafPlacement {
  head: number;
  height: number;
  out: [number, number, number];
  /** Rotation of the blade about its own length: past ~1.6 the pale underside shows. */
  spin: number;
  size: number;
  seed: number;
}

/** Leaves drape over the paper's edge in front and spread behind the heads; none grows across a disc. */
const LEAVES: LeafPlacement[] = [
  { head: 0, height: -0.16, out: [-0.55, 0.05, 0.85], spin: 0.2, size: 0.48, seed: 1 },
  { head: 0, height: -0.12, out: [0.6, 0.1, 0.8], spin: -0.3, size: 0.46, seed: 2 },
  { head: 1, height: -0.1, out: [-0.92, 0.4, -0.3], spin: 0.3, size: 0.6, seed: 5 },
  { head: 2, height: -0.07, out: [0.92, 0.4, -0.3], spin: -0.3, size: 0.58, seed: 6 },
  { head: 3, height: 0.4, out: [0.72, 0.6, -0.36], spin: 0.25, size: 0.46, seed: 3 },
  { head: 4, height: 0.38, out: [-0.72, 0.62, -0.32], spin: -0.3, size: 0.46, seed: 4 },
  { head: 4, height: 0.16, out: [-0.82, 0.5, -0.24], spin: 0.1, size: 0.42, seed: 7 },
  { head: 3, height: 0.2, out: [0.8, 0.55, -0.22], spin: -0.15, size: 0.4, seed: 8 },
];

const LEAF_GREENS = [0x3c6b2e, 0x426f30, 0x37632b, 0x477634, 0x3e6a2f];

function addLeaf(placement: LeafPlacement, curve: THREE.Curve<THREE.Vector3>, anchor: THREE.Vector3, leaves: PartBatch, stems: PartBatch): void {
  const random = randomStream(placement.seed * 131 + 7);
  const { point } = pointAtHeight(curve, placement.height);
  const out = new THREE.Vector3(...placement.out).normalize();
  const stalkLength = random.range(0.06, 0.1);
  const base = point.clone().addScaledVector(out, stalkLength).add(new THREE.Vector3(0, stalkLength * 0.35, 0));
  const stalk = new THREE.CatmullRomCurve3([point, point.clone().lerp(base, 0.5).add(new THREE.Vector3(0, 0.012, 0)), base]);
  const stalkGreen = new THREE.Color(0x4f7a34);
  stems.add(tubeGeometry(stalk, 8, 6, (t) => mix(0.0085, 0.0055, t), (_, out) => out.copy(stalkGreen)), anchor, random.next());

  const spec: LeafSpec = {
    length: placement.size * random.range(0.95, 1.05),
    width: placement.size * random.range(0.36, 0.42),
    peak: random.range(0.3, 0.38),
    cordate: random.range(0.05, 0.16),
    teeth: random.range(16, 24),
    toothDepth: random.range(0.05, 0.09),
    curl: random.range(0.55, 1.05),
    curlPower: random.range(1.4, 2),
    fold: random.range(0.08, 0.2),
    wave: placement.size * random.range(0.015, 0.03),
    waves: random.range(2, 3.5),
    wavePhase: random.next() * Math.PI * 2,
    twist: random.signed(0.35),
    sideBend: random.signed(0.1),
  };
  const body = new THREE.Color(random.pick(LEAF_GREENS)).offsetHSL(random.signed(0.01), random.signed(0.05), random.signed(0.02));
  const colors: BladeColors = {
    base: body.clone().lerp(new THREE.Color(0x6a8a3a), 0.45),
    body,
    tip: body.clone().lerp(new THREE.Color(0x7a7430), random.range(0.15, 0.45)),
    occlusion: 0.7,
  };
  // The blade faces the room and a little up, spun about its own length.
  const facing = new THREE.Vector3(0, 0.8, 1).applyAxisAngle(out, placement.spin);
  const geometry = leafGeometry(spec, colors).applyMatrix4(frameMatrix(base, out.clone().add(new THREE.Vector3(0, 0.25, 0)), facing));
  leaves.add(geometry, base, random.next());
}

interface SprigPlacement {
  tip: [number, number, number];
  seed: number;
}

const SPRIGS: SprigPlacement[] = [
  { tip: [-0.9, 0.42, -0.2], seed: 1 },
  { tip: [0.92, 0.5, -0.24], seed: 2 },
  { tip: [-0.12, 1.28, -0.48], seed: 3 },
  { tip: [0.18, 1.24, -0.5], seed: 4 },
  { tip: [0.86, -0.06, 0.1], seed: 5 },
  { tip: [-0.88, -0.04, 0.12], seed: 6 },
  { tip: [-0.68, 0.8, -0.42], seed: 7 },
  { tip: [0.76, 0.84, -0.46], seed: 8 },
];

/**
 * Baby's breath: each spray forks twice into fine twigs that end in tiny white pompons and green buds, the way the
 * real plant branches, rather than a cloud of dots on a stick.
 */
function addBabysBreath(stems: PartBatch): THREE.InstancedMesh {
  const florets: Array<{ position: THREE.Vector3; size: number; bud: boolean }> = [];
  const stemGreen = new THREE.Color(0x6f8a5a);
  const tint = (_: number, out: THREE.Color) => out.copy(stemGreen);
  for (const sprig of SPRIGS) {
    const random = randomStream(sprig.seed * 977 + 3);
    const tip = new THREE.Vector3(...sprig.tip);
    const direction = tip.clone().sub(BINDING).normalize();
    const fork = tip.clone().addScaledVector(direction, -0.12);
    const main = new THREE.CatmullRomCurve3([
      BINDING.clone().addScaledVector(direction, -0.2).setY(-1.08),
      BINDING.clone(),
      BINDING.clone().lerp(fork, 0.55).add(new THREE.Vector3(random.signed(0.04), 0, random.signed(0.04))),
      fork,
    ]);
    stems.add(tubeGeometry(main, 20, 4, (t) => mix(0.0042, 0.0028, t), tint), tip, random.next());
    const branches = Math.round(random.range(4, 6));
    for (let branch = 0; branch < branches; branch += 1) {
      const heading = direction.clone().add(new THREE.Vector3(random.signed(0.9), random.signed(0.7), random.signed(0.6))).normalize();
      const end = fork.clone().addScaledVector(heading, random.range(0.06, 0.13));
      stems.add(tubeGeometry(new THREE.LineCurve3(fork, end), 2, 3, () => 0.0022, tint), tip, random.next());
      const twigs = Math.round(random.range(2, 3));
      for (let twig = 0; twig < twigs; twig += 1) {
        const bend = heading.clone().add(new THREE.Vector3(random.signed(0.8), random.signed(0.8), random.signed(0.6))).normalize();
        const twigEnd = end.clone().addScaledVector(bend, random.range(0.03, 0.06));
        stems.add(tubeGeometry(new THREE.LineCurve3(end, twigEnd), 1, 3, () => 0.0016, tint), tip, random.next());
        const blooms = Math.round(random.range(3, 5));
        for (let bloom = 0; bloom < blooms; bloom += 1) {
          const bud = random.chance(0.18);
          florets.push({
            position: twigEnd.clone().add(new THREE.Vector3(random.signed(0.014), random.signed(0.014), random.signed(0.014))),
            size: bud ? random.range(0.0035, 0.0055) : random.range(0.0068, 0.0105),
            bud,
          });
        }
      }
    }
  }
  const material = createPlantMaterial({ part: "seed", color: 0xffffff, roughness: 0.78, sheen: 0.4, sheenColor: 0xffffff, translucency: 0.35, translucencyColor: 0xffffff });
  const blooms = instanced(new THREE.IcosahedronGeometry(1, 1), material, florets.length, "babys-breath");
  const transform = new THREE.Object3D();
  const color = new THREE.Color();
  florets.forEach((floret, index) => {
    transform.position.copy(floret.position);
    transform.rotation.set(index * 1.3, index * 0.7, 0);
    transform.scale.set(floret.size, floret.size * 0.82, floret.size);
    transform.updateMatrix();
    blooms.setMatrixAt(index, transform.matrix);
    blooms.setColorAt(index, color.setHex(floret.bud ? 0xc9d8b4 : index % 5 === 0 ? 0xfff3e2 : 0xfffbf5));
  });
  return blooms;
}

/** Builds the sunflower bouquet into `bouquet`; the wrap is added separately. */
export function addSunflowerBouquet(bouquet: THREE.Group): void {
  const batches: HeadBatches = { rays: new PartBatch(), bracts: new PartBatch(), discs: new PartBatch(), youngDiscs: new PartBatch() };
  const stems = new PartBatch();
  const leaves = new PartBatch();
  HEADS.forEach((spec) => addHead(spec, batches));
  const curves = HEADS.map(stemCurve);
  const stemGreen = new THREE.Color(0x48742f);
  const neckGreen = new THREE.Color(0x6b8f3c);
  HEADS.forEach((spec, index) => {
    const random = randomStream(spec.seed * 7 + 1);
    const tint = (t: number, out: THREE.Color) => out.copy(stemGreen).lerp(neckGreen, smoothstep(0.75, 1, t));
    const radius = (t: number) => (mix(0.021, 0.017, t) + 0.007 * smoothstep(0.82, 1, t)) * mix(0.75, 1, spec.scale);
    stems.add(tubeGeometry(curves[index], 56, 10, radius, tint), new THREE.Vector3(...spec.center), random.next());
  });
  LEAVES.forEach((placement) => addLeaf(placement, curves[placement.head], new THREE.Vector3(...HEADS[placement.head].center), leaves, stems));
  const blooms = addBabysBreath(stems);

  const petal = petalMaps();
  const disc = sunflowerDiscMaps(false);
  const youngDisc = sunflowerDiscMaps(true);
  const leaf = leafMaps(3);
  const stem = stemMaps();
  const rayMaterial = createPlantMaterial({
    part: "petal", anchored: true, rigid: true, vertexColors: true, color: 0xffffff, roughness: 0.56,
    sheen: 0.12, sheenRoughness: 0.5, sheenColor: 0xffc040, translucencyColor: 0xffc64a,
    map: petal.map, normalMap: petal.normalMap, normalScale: new THREE.Vector2(0.7, 0.7),
  });
  const bractMaterial = createPlantMaterial({
    part: "leaf", anchored: true, rigid: true, vertexColors: true, color: 0xffffff, roughness: 0.72,
    sheen: 0.6, sheenRoughness: 0.4, sheenColor: 0xc8d8b0, backTint: new THREE.Color(1.25, 1.2, 1.05), translucency: 0.25,
  });
  const discMaterial = (maps: typeof disc) => createPlantMaterial({
    part: "seed", anchored: true, rigid: true, color: 0xffffff, roughness: 0.86, sheen: 0.3, sheenRoughness: 0.5, sheenColor: 0xb08040,
    map: maps.map, normalMap: maps.normalMap,
  });
  const leafMaterial = createPlantMaterial({
    part: "leaf", anchored: true, rigid: true, vertexColors: true, color: 0xffffff, roughness: 0.74,
    sheen: 0.4, sheenRoughness: 0.45, sheenColor: 0xb8c8a0, backTint: new THREE.Color(1.6, 1.5, 1.25), translucencyColor: 0xa8d070,
    map: leaf.map, normalMap: leaf.normalMap, normalScale: new THREE.Vector2(0.9, 0.9),
  });
  const stemMaterial = createPlantMaterial({
    part: "stem", anchored: true, vertexColors: true, color: 0xffffff, roughness: 0.55,
    sheen: 0.6, sheenRoughness: 0.35, sheenColor: 0xd8e8c0, normalMap: stem.normalMap, map: stem.map,
  });

  bouquet.add(
    mesh(stems.build(), stemMaterial, "sunflower-stems"),
    mesh(leaves.build(), leafMaterial, "sunflower-leaves"),
    mesh(batches.bracts.build(), bractMaterial, "sunflower-bracts"),
    mesh(batches.discs.build(), discMaterial(disc), "sunflower-discs"),
    mesh(batches.youngDiscs.build(), discMaterial(youngDisc), "sunflower-young-disc"),
    mesh(batches.rays.build(), rayMaterial, "sunflower-rays"),
    blooms,
  );
}
