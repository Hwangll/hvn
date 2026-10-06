import * as THREE from "three";
import { createPlantMaterial } from "../../three/bouquet/plantMaterial";
import { bladeGeometry, leafGeometry, type BladeColors, type BladeSpec, type LeafSpec } from "./blades";
import {
  GOLDEN_ANGLE,
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
import { HYDRANGEA_VEINS, leafMaps, roundLeafMaps, sepalMaps, stemMaps } from "./textures";

/**
 * The hydrangea keepsake, built in code: three mopheads from sky blue through periwinkle to lilac, glossy serrated
 * leaves, and stems of silver-dollar eucalyptus. A mophead is hundreds of small florets of three to five sepals each,
 * gathered into lumps (the branches of the flower head) over a dark interior. Every sepal is its own shape and tint,
 * merged per material into a few draw calls; each head sways as one through its anchor (see PartBatch) while its sepals
 * shiver on their own.
 *
 * Bouquet space, as for the sunflowers: the wrap is tied at y = -0.8 and stands on the plinth at y = -1.16.
 */

/** Where the stems are bound. */
const BINDING = new THREE.Vector3(0, -0.78, 0.01);

interface HeadSpec {
  center: [number, number, number];
  /** Radii of the dome (across, along its stem, front to back) before it is lumped. */
  radius: [number, number, number];
  florets: number;
  /** The lumps the florets gather into. */
  lobes: number;
  /** How far round toward the stem the florets reach, as a height on the unit dome (-1 would close the ball). */
  floor: number;
  /** Sepal length of an average floret. */
  sepal: number;
  palette: number[];
  seed: number;
}

/**
 * The big head in front is periwinkle blue, the one to the right lilac, the one to the left sky blue. They press
 * against each other the way heads do in a hand-tied bouquet: where two meet, the head listed first keeps its florets
 * and the other leaves out those that would sit inside it, so the crease between them is closed, never a hole.
 */
const HEADS: HeadSpec[] = [
  { center: [0, 0.47, 0.1], radius: [0.43, 0.38, 0.37], florets: 290, lobes: 9, floor: -0.62, sepal: 0.068, palette: [0x7896d8, 0x8399da, 0x6e8bd2, 0x8f92d6, 0x8aa6e0, 0x9c90d0], seed: 11 },
  { center: [0.47, 0.06, 0.0], radius: [0.37, 0.34, 0.33], florets: 210, lobes: 7, floor: -0.58, sepal: 0.064, palette: [0x9088cf, 0x9c84c8, 0xa892cf, 0x8a92d4, 0xaa8cc4], seed: 23 },
  { center: [-0.46, 0.09, 0.02], radius: [0.35, 0.32, 0.31], florets: 190, lobes: 7, floor: -0.58, sepal: 0.062, palette: [0x94b4e6, 0x82a4de, 0xa2bce8, 0x7898d6, 0x8eace2], seed: 37 },
];

/**
 * Florets come in two layers: the open ones on the surface, and a sparser layer of smaller, shaded ones beneath, so
 * a gap between florets shows more florets deeper in, the way a real head has depth, rather than a hole.
 */
interface FloretLayer {
  share: number;
  /** Distance from the centre, as a share of the dome's radius, in the valleys and on top of the lumps. */
  reach: [number, number];
  size: number;
  shade: number;
  grid: [number, number];
  /** Whether its florets show their beaded centres (the shaded layer's are never seen). */
  beads: boolean;
  salt: number;
}

const LAYERS: FloretLayer[] = [
  { share: 1, reach: [0.88, 1], size: 1, shade: 1, grid: [6, 7], beads: true, salt: 1 },
  { share: 0.65, reach: [0.79, 0.87], size: 0.9, shade: 0.5, grid: [4, 4], beads: false, salt: 2 },
];

/** The greenish-white eye at the heart of a floret, and the deeper tone sepals take at their tips. */
const EYE = new THREE.Color(0xeef3f8);
const BLUSH = new THREE.Color(0x7c66c2);
const PALE = new THREE.Color(0xdde6f6);
const VIOLET = new THREE.Color(0x9d84d6);
const ANTIQUE = new THREE.Color(0xa3b994);
const DEEP = new THREE.Color(0x4a5cb0);

/** A head's own frame: +Y away from its stem (and a little toward the room), so a head nods out like a real one. */
interface HeadFrame {
  spec: HeadSpec;
  center: THREE.Vector3;
  rotation: THREE.Quaternion;
  radius: THREE.Vector3;
  lobes: THREE.Vector3[];
  lobeWidth: number;
  random: RandomStream;
}

function headFrame(spec: HeadSpec): HeadFrame {
  const random = randomStream(spec.seed * 31 + 3);
  const center = new THREE.Vector3(...spec.center);
  const up = center.clone().sub(BINDING).add(new THREE.Vector3(0, 0, 0.35)).normalize();
  const rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
  // Lumps spread over the dome like the florets, but loosely, so no two heads share a pattern.
  const lobes = Array.from({ length: spec.lobes }, (_, index) => {
    const y = 1 - (1 - (spec.floor + 0.25)) * (index + 0.5) / spec.lobes + random.signed(0.08);
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = index * GOLDEN_ANGLE + random.signed(0.5);
    return new THREE.Vector3(Math.cos(angle) * ring, y, Math.sin(angle) * ring).normalize();
  });
  return { spec, center, rotation, radius: new THREE.Vector3(...spec.radius), lobes, lobeWidth: (1 - spec.floor) / spec.lobes / 1.2, random };
}

/** How far a direction (head frame) sits up a lump, 0 in the valleys between them to 1 on top, and which lump it is. */
function lobeAt(frame: HeadFrame, direction: THREE.Vector3): { field: number; lobe: number } {
  let field = 0;
  let lobe = 0;
  frame.lobes.forEach((centre, index) => {
    const value = Math.exp((direction.dot(centre) - 1) / frame.lobeWidth);
    if (value > field) {
      field = value;
      lobe = index;
    }
  });
  return { field, lobe };
}

function toBouquet(frame: HeadFrame, local: THREE.Vector3, out = new THREE.Vector3()): THREE.Vector3 {
  return out.copy(local).applyQuaternion(frame.rotation).add(frame.center);
}

const inverse = new THREE.Quaternion();
const probe = new THREE.Vector3();

/** Whether a point (bouquet space) lies within `reach` of a head's dome, where that head's own florets would be. */
function insideHead(frame: HeadFrame, point: THREE.Vector3, reach: number): boolean {
  probe.copy(point).sub(frame.center).applyQuaternion(inverse.copy(frame.rotation).invert());
  return (probe.x / frame.radius.x) ** 2 + (probe.y / frame.radius.y) ** 2 + (probe.z / frame.radius.z) ** 2 < reach * reach;
}

interface Floret {
  /** Head frame. */
  position: THREE.Vector3;
  facing: THREE.Vector3;
  roll: number;
  sepalLength: number;
  sepals: number;
  young: boolean;
  color: THREE.Color;
  tip: THREE.Color;
  shade: number;
  grid: [number, number];
  bead: boolean;
}

/**
 * Where the florets of one layer of a head sit: spread evenly over the dome (a Fibonacci spiral, well jittered so it
 * never shows), pushed out on the lumps and sunk in the valleys, thinning out raggedly toward the stem. Each faces out
 * from its lump, so a lump reads as a rounded cluster of its own.
 */
function placeFlorets(frame: HeadFrame, layer: FloretLayer, neighbours: HeadFrame[]): Floret[] {
  const { spec } = frame;
  const random = randomStream(spec.seed * 1009 + layer.salt * 7919);
  const florets: Floret[] = [];
  const lobeColors = frame.lobes.map((_, index) => new THREE.Color(randomStream(spec.seed * 61 + index).pick(spec.palette)));
  const direction = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const count = Math.round(spec.florets * layer.share);
  const step = (1 - spec.floor) / count;
  const turn = layer.salt * 1.9;
  for (let index = 0; index < count; index += 1) {
    const y = Math.min(1, Math.max(spec.floor, 1 - step * (index + 0.5) + random.signed(step * 0.45)));
    const ring = Math.sqrt(1 - y * y);
    const angle = index * GOLDEN_ANGLE + turn + random.signed(0.35 / Math.max(0.2, ring) * Math.sqrt(step * 4));
    direction.set(Math.cos(angle) * ring, y, Math.sin(angle) * ring).normalize();
    // Near the stem the florets thin out unevenly instead of stopping at a line.
    if (random.next() > 0.4 + 0.6 * smoothstep(spec.floor, spec.floor + 0.22, y)) continue;
    const { field, lobe } = lobeAt(frame, direction);
    const proud = layer.beads && random.chance(0.07) ? 0.05 : 0;
    const reach = mix(layer.reach[0], layer.reach[1], field) + random.signed(0.015) + proud;
    const position = direction.clone().multiply(frame.radius).multiplyScalar(reach);
    const world = toBouquet(frame, position);
    if (neighbours.some((other) => insideHead(other, world, layer.reach[1] - 0.04))) continue;
    // Out from the ellipsoid, then tipped away from the middle of its own lump.
    const centre = frame.lobes[lobe];
    tangent.copy(direction).addScaledVector(centre, -direction.dot(centre));
    const facing = new THREE.Vector3(direction.x / frame.radius.x, direction.y / frame.radius.y, direction.z / frame.radius.z).normalize()
      .addScaledVector(tangent, 1.6 * field)
      .add(new THREE.Vector3(random.signed(0.22), random.signed(0.22), random.signed(0.22)))
      .normalize();
    const young = random.chance(0.07);
    const color = lobeColors[lobe].clone().lerp(new THREE.Color(random.pick(spec.palette)), random.range(0, 0.6));
    color.offsetHSL(random.signed(0.012), random.signed(0.05), random.signed(0.03));
    const tip = BLUSH.clone();
    const variety = random.next();
    if (variety < 0.1) color.lerp(PALE, 0.45);
    else if (variety < 0.18) color.lerp(VIOLET, 0.5);
    else if (variety < 0.24) color.multiplyScalar(0.84);
    else if (variety < 0.29) tip.copy(ANTIQUE);
    if (young) color.lerp(EYE, 0.35);
    florets.push({
      position,
      facing,
      roll: random.next() * Math.PI * 2,
      sepalLength: spec.sepal * layer.size * random.range(0.86, 1.14) * (young ? 0.62 : 1) * mix(0.9, 1, field),
      sepals: random.chance(0.08) ? 3 : random.chance(0.09) ? 5 : 4,
      young,
      color,
      tip,
      // Valleys and the underside, toward the stem, sit in each other's shade.
      shade: layer.shade * mix(0.66, 1, field) * mix(0.72, 1, smoothstep(spec.floor, 0.2, y)),
      grid: layer.grid,
      bead: layer.beads,
    });
  }
  return florets;
}

function sepalBlade(random: RandomStream, length: number, young: boolean): BladeSpec {
  const reflexed = random.chance(0.25);
  return {
    length,
    width: length * random.range(0.56, 0.68),
    peak: random.range(0.55, 0.68),
    claw: random.range(0.12, 0.2),
    tipWidth: random.range(0.3, 0.5),
    round: random.range(0.18, 0.32),
    teeth: 0,
    toothDepth: 0,
    curl: young ? -random.range(0.5, 0.9) : reflexed ? random.range(0.25, 0.6) : random.range(-0.35, 0.2),
    curlPower: random.range(1.4, 2.2),
    cup: young ? random.range(0.3, 0.5) : random.range(0.06, 0.24),
    channel: random.range(0.02, 0.05),
    twist: random.signed(0.25),
    sideBend: random.signed(0.06),
    ruffle: length * random.range(0.015, 0.04),
    ruffleWaves: random.range(1.2, 2.2),
    rufflePhase: random.next() * Math.PI * 2,
    folds: random.range(3, 6),
    foldDepth: length * random.range(0.004, 0.01),
  };
}

interface HeadParts {
  sepals: PartBatch;
  cores: PartBatch;
  centers: Array<{ matrix: THREE.Matrix4; color: THREE.Color; anchor: THREE.Vector3; seed: number }>;
}

const Z_AXIS = new THREE.Vector3(0, 0, 1);

/** The sepals of one floret, in a cross (or a triangle, or a star of five), two opposite ones a little larger. */
function addFloret(frame: HeadFrame, floret: Floret, parts: HeadParts, random: RandomStream): void {
  const facing = floret.facing.clone().applyQuaternion(frame.rotation);
  const rotation = new THREE.Quaternion().setFromUnitVectors(Z_AXIS, facing).multiply(new THREE.Quaternion().setFromAxisAngle(Z_AXIS, floret.roll));
  const place = new THREE.Matrix4().compose(toBouquet(frame, floret.position), rotation, new THREE.Vector3(1, 1, 1));
  const radial = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const face = new THREE.Vector3();
  const origin = new THREE.Vector3();
  for (let index = 0; index < floret.sepals; index += 1) {
    const angle = (index / floret.sepals) * Math.PI * 2 + random.signed(0.14);
    const lean = floret.young ? random.range(0.55, 0.85) : random.range(0.02, 0.3);
    radial.set(Math.cos(angle), Math.sin(angle), 0);
    direction.copy(radial).multiplyScalar(Math.cos(lean)).addScaledVector(Z_AXIS, Math.sin(lean));
    face.copy(radial).multiplyScalar(-Math.sin(lean)).addScaledVector(Z_AXIS, Math.cos(lean));
    origin.copy(radial).multiplyScalar(floret.sepalLength * 0.05).addScaledVector(Z_AXIS, index % 2 ? floret.sepalLength * 0.02 : 0);
    const length = floret.sepalLength * (floret.sepals === 4 && index % 2 ? 0.86 : 1) * random.range(0.92, 1.08);
    const body = floret.color.clone().offsetHSL(random.signed(0.008), random.signed(0.04), random.signed(0.025));
    const colors: BladeColors = {
      base: body.clone().lerp(EYE, 0.55).multiplyScalar(floret.shade),
      body: body.multiplyScalar(floret.shade),
      tip: body.clone().lerp(floret.tip, random.range(0.15, 0.4)),
      occlusion: 0.78,
    };
    const geometry = bladeGeometry(sepalBlade(random, length, floret.young), colors, ...floret.grid);
    geometry.applyMatrix4(frameMatrix(origin, direction, face).premultiply(place));
    parts.sepals.add(geometry, frame.center, random.next());
  }
  if (!floret.bead) return;
  // The vestigial flower at the heart: a tiny bead, pale or a deeper blue, tinted by its sepals.
  const bead = floret.sepalLength * 0.075;
  const center = toBouquet(frame, floret.position).addScaledVector(facing, floret.sepalLength * 0.04);
  parts.centers.push({
    matrix: new THREE.Matrix4().compose(center, rotation, new THREE.Vector3(bead, bead, bead * 0.7)),
    color: floret.color.clone().lerp(random.chance(0.35) ? DEEP : EYE, 0.45).multiplyScalar(floret.shade),
    anchor: frame.center,
    seed: random.next(),
  });
}

/** The dark interior of a head, lumped like the florets over it, so the gaps between florets read as depth, not holes. */
function coreGeometry(frame: HeadFrame): THREE.BufferGeometry {
  const navy = new THREE.Color(0x2a3e66);
  const green = new THREE.Color(0x2f4229);
  const direction = new THREE.Vector3();
  const geometry = gridGeometry(28, 18, (u, v, position, color) => {
    const polar = (1 - v) * Math.PI;
    const azimuth = u * Math.PI * 2;
    // z runs against the azimuth so the surface faces outward (the core is drawn front side only).
    direction.set(Math.sin(polar) * Math.cos(azimuth), Math.cos(polar), -Math.sin(polar) * Math.sin(azimuth));
    const { field } = lobeAt(frame, direction);
    position.copy(direction).multiply(frame.radius).multiplyScalar(mix(0.72, 0.8, field));
    color.copy(navy).lerp(green, smoothstep(frame.spec.floor + 0.2, frame.spec.floor - 0.3, direction.y)).multiplyScalar(mix(0.7, 1, field));
  });
  const matrix = new THREE.Matrix4().compose(frame.center, frame.rotation, new THREE.Vector3(1, 1, 1));
  return geometry.applyMatrix4(matrix);
}

/** The stem of a head: up from inside the wrap, through the binding, into the underside of the head. */
function stemCurve(frame: HeadFrame): THREE.CatmullRomCurve3 {
  const base = toBouquet(frame, new THREE.Vector3(0, -frame.radius.y * 0.55, 0));
  const inside = toBouquet(frame, new THREE.Vector3(0, -frame.radius.y * 0.25, 0));
  const outward = new THREE.Vector3(frame.center.x, 0, frame.center.z).normalize();
  const bottom = new THREE.Vector3(-outward.x * 0.05, -1.1, -outward.z * 0.04 + 0.01);
  const binding = BINDING.clone().addScaledVector(outward, 0.012);
  const middle = binding.clone().lerp(base, 0.5).addScaledVector(outward, 0.035);
  return new THREE.CatmullRomCurve3([bottom, binding, middle, base, inside], false, "centripetal");
}

/** The branches of the flower head, fanning from the top of the stem to the florets: seen where the florets thin out. */
function addBranches(frame: HeadFrame, stems: PartBatch): void {
  const { random, spec } = frame;
  const green = new THREE.Color(0x6f8f4a);
  const start = new THREE.Vector3(0, -frame.radius.y * 0.5, 0);
  for (let index = 0; index < 7; index += 1) {
    const angle = (index / 7) * Math.PI * 2 + random.signed(0.3);
    const y = spec.floor + random.range(-0.05, 0.25);
    const ring = Math.sqrt(1 - y * y);
    const end = new THREE.Vector3(Math.cos(angle) * ring, y, Math.sin(angle) * ring).multiply(frame.radius).multiplyScalar(0.9);
    const bend = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, -0.03, 0));
    const curve = new THREE.CatmullRomCurve3([start, bend, end].map((point) => toBouquet(frame, point)));
    stems.add(tubeGeometry(curve, 8, 5, (t) => mix(0.0065, 0.0035, t), (_, out) => out.copy(green)), frame.center, random.next());
  }
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

/** Leaves rest on the paper's edge in front and spread to the sides and behind the heads, never across one. */
const LEAVES: LeafPlacement[] = [
  { head: 2, height: -0.36, out: [-0.8, 0, 0.6], spin: 0.25, size: 0.46, seed: 1 },
  { head: 1, height: -0.36, out: [0.82, 0, 0.58], spin: -0.3, size: 0.44, seed: 2 },
  { head: 0, height: -0.12, out: [0.12, 0.5, 0.9], spin: 0, size: 0.36, seed: 7 },
  { head: 2, height: -0.2, out: [-0.98, 0.3, -0.25], spin: 0.4, size: 0.46, seed: 3 },
  { head: 1, height: -0.18, out: [0.98, 0.3, -0.28], spin: -0.4, size: 0.46, seed: 4 },
  { head: 0, height: 0, out: [-0.5, 0.85, -0.6], spin: 0.2, size: 0.42, seed: 5 },
  { head: 0, height: 0.04, out: [0.55, 0.8, -0.62], spin: -0.2, size: 0.4, seed: 6 },
];

const LEAF_GREENS = [0x37663a, 0x3d6c3c, 0x325e35, 0x427040];

function addLeaf(placement: LeafPlacement, curve: THREE.Curve<THREE.Vector3>, head: THREE.Vector3, leaves: PartBatch, stems: PartBatch): void {
  const random = randomStream(placement.seed * 151 + 11);
  const { point } = pointAtHeight(curve, placement.height);
  const out = new THREE.Vector3(...placement.out).normalize();
  const stalkLength = random.range(0.05, 0.08);
  const base = point.clone().addScaledVector(out, stalkLength).add(new THREE.Vector3(0, stalkLength * 0.3, 0));
  const stalk = new THREE.CatmullRomCurve3([point, point.clone().lerp(base, 0.5).add(new THREE.Vector3(0, 0.01, 0)), base]);
  const stalkGreen = new THREE.Color(0x56763a);
  // Swaying with the stem it grows from: the breeze is read where the stem is anchored, the bend at the leaf's height.
  const anchor = new THREE.Vector3(head.x, base.y, head.z);
  stems.add(tubeGeometry(stalk, 8, 6, (t) => mix(0.008, 0.0055, t), (_, tint) => tint.copy(stalkGreen)), head, random.next());
  const spec: LeafSpec = {
    length: placement.size * random.range(0.95, 1.05),
    width: placement.size * random.range(0.29, 0.34),
    peak: random.range(0.42, 0.5),
    fullness: 0.6,
    cordate: 0,
    acuminate: random.range(0.3, 0.45),
    teeth: random.range(22, 30),
    toothDepth: random.range(0.06, 0.1),
    curl: random.range(0.5, 0.95),
    curlPower: random.range(1.5, 2),
    fold: random.range(0.18, 0.3),
    wave: placement.size * random.range(0.01, 0.02),
    waves: random.range(2, 3),
    wavePhase: random.next() * Math.PI * 2,
    twist: random.signed(0.3),
    sideBend: random.signed(0.08),
    midrib: 0.14,
  };
  const body = new THREE.Color(random.pick(LEAF_GREENS)).offsetHSL(random.signed(0.01), random.signed(0.05), random.signed(0.02));
  const colors: BladeColors = {
    base: body.clone().lerp(new THREE.Color(0x5a7a3a), 0.35),
    body,
    tip: body.clone().lerp(new THREE.Color(0x1f3a22), 0.4),
    occlusion: 0.7,
  };
  const facing = new THREE.Vector3(0, 0.8, 1).applyAxisAngle(out, placement.spin);
  const geometry = leafGeometry(spec, colors).applyMatrix4(frameMatrix(base, out.clone().add(new THREE.Vector3(0, 0.25, 0)), facing));
  leaves.add(geometry, anchor, random.next());
}

interface EucalyptusSpray {
  tip: [number, number, number];
  pairs: number;
}

interface EucalyptusStem extends EucalyptusSpray {
  seed: number;
  /** How far the stem arcs up on its way out, so the low ones bow over the paper instead of sticking out straight. */
  arch: number;
  /** A side shoot, leaving the stem a share of the way up. */
  branch?: EucalyptusSpray & { at: number };
}

/** Eucalyptus rises behind the heads and fans out past them, so its round leaves frame the blue. */
const EUCALYPTUS: EucalyptusStem[] = [
  { tip: [-0.97, 0.36, -0.16], pairs: 13, arch: 0.26, seed: 1, branch: { at: 0.6, tip: [-0.82, 0.76, -0.34], pairs: 8 } },
  { tip: [0.97, 0.4, -0.18], pairs: 13, arch: 0.26, seed: 2, branch: { at: 0.58, tip: [0.84, 0.8, -0.36], pairs: 8 } },
  { tip: [-0.72, 1.04, -0.42], pairs: 14, arch: 0.12, seed: 3 },
  { tip: [0.74, 1.02, -0.44], pairs: 14, arch: 0.12, seed: 4 },
  { tip: [-0.28, 1.34, -0.5], pairs: 15, arch: 0.05, seed: 5, branch: { at: 0.68, tip: [-0.52, 1.28, -0.52], pairs: 7 } },
  { tip: [0.32, 1.32, -0.52], pairs: 15, arch: 0.05, seed: 6 },
  { tip: [0.04, 1.44, -0.58], pairs: 15, arch: 0.03, seed: 7 },
];

const EUCALYPTUS_GREYS = [0x7d998a, 0x86a294, 0x92ab9d, 0x7a9488, 0x8aa595];
const EUCALYPTUS_LOWER = new THREE.Color(0x5c3a30);
const EUCALYPTUS_UPPER = new THREE.Color(0x8d8f78);

/**
 * Round, slightly cupped leaves in opposite pairs along a stem from `from` (share of its length) to its tip, each pair
 * turned a quarter from the last and smaller than the one below. They sway with the stem: the breeze is read at its
 * tip, the bend at the height of the leaf.
 */
function addLeafPairs(curve: THREE.Curve<THREE.Vector3>, from: number, pairs: number, largest: number, random: RandomStream, leaves: PartBatch): void {
  const tip = curve.getPointAt(1);
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const facing = new THREE.Vector3();
  const turn = random.next() * Math.PI;
  for (let pair = 0; pair < pairs; pair += 1) {
    const along = pair / (pairs - 1);
    const t = mix(from, 0.97, along);
    curve.getPointAt(t, point);
    curve.getTangentAt(t, tangent);
    side.crossVectors(tangent, Z_AXIS).normalize().applyAxisAngle(tangent, turn + pair * (Math.PI / 2) + random.signed(0.2));
    const radius = mix(largest, 0.03, Math.pow(along, 0.8)) * random.range(0.9, 1.1);
    for (const sign of [-1, 1]) {
      const angle = random.range(0.35, 0.75);
      direction.copy(side).multiplyScalar(sign * Math.cos(angle)).addScaledVector(tangent, Math.sin(angle)).normalize();
      facing.crossVectors(direction, tangent).normalize();
      if (facing.z + facing.y * 0.5 < 0) facing.negate();
      facing.applyAxisAngle(direction, random.signed(0.45));
      const spec: LeafSpec = {
        length: radius * 2,
        width: radius * random.range(0.92, 1.06),
        peak: random.range(0.46, 0.54),
        fullness: 0.5,
        cordate: random.range(0.06, 0.14),
        acuminate: 0,
        teeth: 0,
        toothDepth: 0,
        curl: random.range(0.05, 0.5),
        curlPower: random.range(1.3, 1.8),
        fold: random.range(0.04, 0.14),
        wave: radius * random.range(0.03, 0.06),
        waves: random.range(1.2, 2),
        wavePhase: random.next() * Math.PI * 2,
        twist: random.signed(0.2),
        sideBend: random.signed(0.05),
        midrib: 0.04,
      };
      const body = new THREE.Color(random.pick(EUCALYPTUS_GREYS)).offsetHSL(random.signed(0.01), random.signed(0.04), random.signed(0.03));
      const colors: BladeColors = {
        base: body.clone().lerp(new THREE.Color(0x8a7a7c), 0.25),
        body,
        tip: body.clone().lerp(new THREE.Color(0xb4c4ba), 0.3),
        occlusion: 0.8,
      };
      const origin = point.clone().addScaledVector(direction, 0.003);
      const geometry = leafGeometry(spec, colors, 6, 8).applyMatrix4(frameMatrix(origin, direction, facing));
      leaves.add(geometry, new THREE.Vector3(tip.x, origin.y, tip.z), random.next());
    }
  }
}

/**
 * Silver-dollar eucalyptus: slender stems, red-brown low down and grey-green above, some forking once, all leafy from
 * where they clear the heads to the tip. A stem at a time (see BuildSteps).
 */
function* addEucalyptus(stems: PartBatch, leaves: PartBatch): BuildSteps {
  const tint = (from: number) => (t: number, out: THREE.Color) => out.copy(EUCALYPTUS_LOWER).lerp(EUCALYPTUS_UPPER, smoothstep(0.3, 0.9, from + (1 - from) * t));
  for (const stem of EUCALYPTUS) {
    const random = randomStream(stem.seed * 313 + 17);
    const tip = new THREE.Vector3(...stem.tip);
    const outward = new THREE.Vector3(tip.x, 0, Math.min(0, tip.z)).normalize();
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-outward.x * 0.04, -1.08, -0.02),
      BINDING.clone().add(new THREE.Vector3(0, 0, -0.02)),
      BINDING.clone().lerp(tip, 0.45).add(new THREE.Vector3(outward.x * 0.06, 0.04 + stem.arch * 0.5, -0.14)),
      BINDING.clone().lerp(tip, 0.78).add(new THREE.Vector3(outward.x * 0.03, stem.arch, -0.06)),
      tip,
    ], false, "centripetal");
    stems.add(tubeGeometry(curve, 40, 6, (t) => mix(0.0062, 0.0028, t), tint(0)), tip, random.next());
    addLeafPairs(curve, 0.36, stem.pairs, 0.074, random, leaves);
    if (stem.branch) {
      const start = curve.getPointAt(stem.branch.at);
      const end = new THREE.Vector3(...stem.branch.tip);
      const shoot = new THREE.CatmullRomCurve3([start, start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 0.03, -0.02)), end]);
      stems.add(tubeGeometry(shoot, 16, 5, (t) => mix(0.0036, 0.0024, t), tint(stem.branch.at)), end, random.next());
      addLeafPairs(shoot, 0.16, stem.branch.pairs, 0.056, random, leaves);
    }
    yield;
  }
}

/** Florets built between pauses when the bouquet is built in slices: a few milliseconds' work. */
const FLORETS_PER_STEP = 24;

/** Builds the hydrangea bouquet into `bouquet`, a slice at a time (see BuildSteps); the wrap is added separately. */
export function* buildHydrangeaBouquet(bouquet: THREE.Group): BuildSteps {
  const parts: HeadParts = { sepals: new PartBatch(), cores: new PartBatch(), centers: [] };
  const stems = new PartBatch();
  const leaves = new PartBatch();
  const eucalyptusLeaves = new PartBatch();
  const frames = HEADS.map(headFrame);
  const curves = frames.map(stemCurve);
  const stemGreen = new THREE.Color(0x4f6a35);
  const woody = new THREE.Color(0x5d5a36);
  // Woody low down, greener toward the head, with a slight swelling at each node.
  const radius = (t: number) => mix(0.02, 0.015, t) * (1 + 0.12 * Math.exp(-Math.pow((t - 0.38) / 0.025, 2)) + 0.1 * Math.exp(-Math.pow((t - 0.62) / 0.025, 2)));
  for (const [index, frame] of frames.entries()) {
    const neighbours = frames.slice(0, index);
    for (const layer of LAYERS) {
      const random = randomStream(frame.spec.seed * 4099 + layer.salt);
      for (const [count, floret] of placeFlorets(frame, layer, neighbours).entries()) {
        addFloret(frame, floret, parts, random);
        if (count % FLORETS_PER_STEP === FLORETS_PER_STEP - 1) yield;
      }
      yield;
    }
    parts.cores.add(coreGeometry(frame), frame.center, frame.random.next());
    addBranches(frame, stems);
    stems.add(tubeGeometry(curves[index], 48, 10, radius, (t, out) => out.copy(woody).lerp(stemGreen, smoothstep(0.2, 0.7, t))), frame.center, frame.random.next());
    yield;
  }
  LEAVES.forEach((placement) => addLeaf(placement, curves[placement.head], frames[placement.head].center, leaves, stems));
  yield;
  yield* addEucalyptus(stems, eucalyptusLeaves);

  const sepal = sepalMaps();
  yield;
  const leaf = leafMaps(5, HYDRANGEA_VEINS);
  yield;
  const round = roundLeafMaps();
  const stem = stemMaps();
  yield;
  const sepalMaterial = createPlantMaterial({
    part: "petal", anchored: true, rigid: true, vertexColors: true, color: 0xffffff, roughness: 0.62,
    sheen: 0.35, sheenRoughness: 0.55, sheenColor: 0xdfe8ff, flutter: 0.12, translucency: 0.5, translucencyColor: 0xc6d2ff,
    backTint: new THREE.Color(1.12, 1.1, 1.08), map: sepal.map, normalMap: sepal.normalMap, normalScale: new THREE.Vector2(0.6, 0.6),
  });
  const centerMaterial = createPlantMaterial({ part: "seed", anchored: true, rigid: true, color: 0xffffff, roughness: 0.7, sheen: 0.4, sheenColor: 0xffffff });
  const coreMaterial = createPlantMaterial({ part: "seed", anchored: true, rigid: true, vertexColors: true, color: 0xffffff, roughness: 0.95 });
  const leafMaterial = createPlantMaterial({
    part: "leaf", anchored: true, rigid: true, vertexColors: true, color: 0xffffff, roughness: 0.4, clearcoat: 0.35, clearcoatRoughness: 0.4,
    sheen: 0.15, sheenRoughness: 0.5, sheenColor: 0xb8d0a8, backTint: new THREE.Color(1.55, 1.5, 1.3), translucencyColor: 0x9ccc6a,
    map: leaf.map, normalMap: leaf.normalMap, normalScale: new THREE.Vector2(1, 1),
  });
  const eucalyptusMaterial = createPlantMaterial({
    part: "leaf", anchored: true, rigid: true, vertexColors: true, color: 0xffffff, roughness: 0.6, flutter: 0.35,
    sheen: 0.6, sheenRoughness: 0.5, sheenColor: 0xe2efe9, backTint: new THREE.Color(1.12, 1.15, 1.1), translucency: 0.25, translucencyColor: 0xc8dcb8,
    map: round.map, normalMap: round.normalMap, normalScale: new THREE.Vector2(0.8, 0.8),
  });
  const stemMaterial = createPlantMaterial({
    part: "stem", anchored: true, vertexColors: true, color: 0xffffff, roughness: 0.6,
    sheen: 0.25, sheenRoughness: 0.45, sheenColor: 0xc8d8b0, normalMap: stem.normalMap, map: stem.map,
  });

  // A few pixels across even close up: the plainest icosahedron is round enough once its normals are a sphere's.
  const beads = new THREE.IcosahedronGeometry(1, 0);
  const beadNormals = beads.getAttribute("normal") as THREE.BufferAttribute;
  beadNormals.copy(beads.getAttribute("position") as THREE.BufferAttribute);
  for (let index = 0; index < beadNormals.count; index += 1) {
    const length = Math.hypot(beadNormals.getX(index), beadNormals.getY(index), beadNormals.getZ(index));
    beadNormals.setXYZ(index, beadNormals.getX(index) / length, beadNormals.getY(index) / length, beadNormals.getZ(index) / length);
  }
  const anchors = new Float32Array(parts.centers.length * 4);
  parts.centers.forEach((center, index) => {
    anchors.set([center.anchor.x, center.anchor.y, center.anchor.z, center.seed], index * 4);
  });
  beads.setAttribute("plantAnchor", new THREE.InstancedBufferAttribute(anchors, 4));
  const centers = instanced(beads, centerMaterial, parts.centers.length, "hydrangea-floret-centers");
  parts.centers.forEach((center, index) => {
    centers.setMatrixAt(index, center.matrix);
    centers.setColorAt(index, center.color);
  });

  const stemMesh = mesh(stems.build(), stemMaterial, "hydrangea-stems");
  const leafMesh = mesh(leaves.build(), leafMaterial, "hydrangea-leaves");
  const eucalyptusMesh = mesh(eucalyptusLeaves.build(), eucalyptusMaterial, "eucalyptus-leaves");
  const coreMesh = mesh(parts.cores.build(), coreMaterial, "hydrangea-cores");
  yield;
  const sepalMesh = mesh(parts.sepals.build(), sepalMaterial, "hydrangea-sepals");
  bouquet.add(stemMesh, leafMesh, eucalyptusMesh, coreMesh, sepalMesh, centers);
}
