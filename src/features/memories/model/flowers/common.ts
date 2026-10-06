import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { attachPlantShadow } from "../../three/bouquet/plantMaterial";

export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Building a bouquet a slice at a time: every `yield` is a point where the work may pause for a frame, so a bouquet
 * built in the background never freezes the one on show. The generator's return value is the result.
 */
export type BuildSteps<T = void> = Generator<void, T, void>;

/** Runs all the remaining steps at once, for when the result is needed now. */
export function finish<T>(steps: BuildSteps<T>): T {
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

/** Deterministic 0..1 noise so a specimen looks identical on every visit. */
export function jitter(seed: number, salt = 0): number {
  const value = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export interface RandomStream {
  next(): number;
  range(min: number, max: number): number;
  /** Uniform in -amount..amount. */
  signed(amount: number): number;
  chance(probability: number): boolean;
  pick<T>(items: readonly T[]): T;
}

/**
 * A seeded stream of numbers (mulberry32). Every part draws from its own stream, so adding a petal to one head never
 * reshuffles the leaves of another and the bouquet stays the same from visit to visit.
 */
export function randomStream(seed: number): RandomStream {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (min, max) => min + (max - min) * next(),
    signed: (amount) => (next() * 2 - 1) * amount,
    chance: (probability) => next() < probability,
    pick: (items) => items[Math.floor(next() * items.length)],
  };
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function smooth(t: number): number {
  const clamped = clamp01(t);
  return clamped * clamped * (3 - 2 * clamped);
}

export function smoothstep(edge0: number, edge1: number, value: number): number {
  return smooth((value - edge0) / (edge1 - edge0));
}

export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Smooth value noise in 3D, about -1..1: crumples paper and breaks up anything that would look machined. */
export function valueNoise(x: number, y: number, z: number, seed = 0): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);
  const corner = (dx: number, dy: number, dz: number) => jitter((ix + dx) * 157.31 + (iy + dy) * 113.7 + (iz + dz) * 71.93 + seed * 19.19, 3) * 2 - 1;
  const x00 = mix(corner(0, 0, 0), corner(1, 0, 0), ux);
  const x10 = mix(corner(0, 1, 0), corner(1, 1, 0), ux);
  const x01 = mix(corner(0, 0, 1), corner(1, 0, 1), ux);
  const x11 = mix(corner(0, 1, 1), corner(1, 1, 1), ux);
  return mix(mix(x00, x10, uy), mix(x01, x11, uy), uz);
}

export function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, name?: string): THREE.Mesh {
  const result = new THREE.Mesh(geometry, material);
  if (name) result.name = name;
  result.castShadow = true;
  result.receiveShadow = true;
  return attachPlantShadow(result);
}

export function instanced(geometry: THREE.BufferGeometry, material: THREE.Material, count: number, name: string): THREE.InstancedMesh {
  const result = new THREE.InstancedMesh(geometry, material, count);
  result.name = name;
  result.castShadow = true;
  result.receiveShadow = true;
  return attachPlantShadow(result);
}

/** Joins static parts into one draw call; the parts are consumed. */
export function merged(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const result = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  if (!result) throw new Error("Bouquet parts could not be merged.");
  return result;
}

export function transformed(geometry: THREE.BufferGeometry, position: THREE.Vector3Like, rotation?: THREE.Euler, scale?: THREE.Vector3Like): THREE.BufferGeometry {
  const matrix = new THREE.Matrix4().compose(
    new THREE.Vector3(position.x, position.y, position.z),
    new THREE.Quaternion().setFromEuler(rotation ?? new THREE.Euler()),
    scale ? new THREE.Vector3(scale.x, scale.y, scale.z) : new THREE.Vector3(1, 1, 1),
  );
  return geometry.applyMatrix4(matrix);
}

/**
 * Many parts of one material, merged into a single draw call. Each part is tagged with the point it sways around and
 * a seed for its own shiver (the `plantAnchor` attribute an anchored plant material reads), so a merged head of petals
 * still moves like separate petals on one flower.
 */
export class PartBatch {
  private readonly parts: THREE.BufferGeometry[] = [];

  add(geometry: THREE.BufferGeometry, anchor: THREE.Vector3Like, seed: number): void {
    const count = geometry.getAttribute("position").count;
    const data = new Float32Array(count * 4);
    for (let index = 0; index < count; index += 1) {
      data[index * 4] = anchor.x;
      data[index * 4 + 1] = anchor.y;
      data[index * 4 + 2] = anchor.z;
      data[index * 4 + 3] = seed - Math.floor(seed);
    }
    geometry.setAttribute("plantAnchor", new THREE.BufferAttribute(data, 4));
    this.parts.push(geometry);
  }

  get size(): number {
    return this.parts.length;
  }

  build(): THREE.BufferGeometry {
    return merged(this.parts.splice(0));
  }
}

export type GridSampler = (u: number, v: number, position: THREE.Vector3, color: THREE.Color) => void;

/**
 * A surface sampled on a (columns × rows) grid: u runs across (0..1), v along (0..1) and becomes the uv (scaled by
 * `uvScale` for tiled textures), so thin edges and tips can be told apart in the shaders. Faces +Z when position grows
 * with u toward +x and v toward +y.
 *
 * A row may close to a point (the tip of a leaf, the pole of a dome). A vertex there can belong only to triangles of no
 * area and so get no normal at all; it takes the normal of the nearest vertex up its column that has one. Left at zero
 * it would turn into NaN in the shader as soon as the breeze opened its triangle, and bloom would smear that across
 * the screen.
 */
export function gridGeometry(columns: number, rows: number, sample: GridSampler, uvScale: [number, number] = [1, 1]): THREE.BufferGeometry {
  const count = (columns + 1) * (rows + 1);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const indices: number[] = [];
  const position = new THREE.Vector3();
  const color = new THREE.Color();
  for (let row = 0; row <= rows; row += 1) {
    const v = row / rows;
    for (let column = 0; column <= columns; column += 1) {
      const u = column / columns;
      color.setRGB(1, 1, 1);
      sample(u, v, position, color);
      const index = row * (columns + 1) + column;
      position.toArray(positions, index * 3);
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
      uvs[index * 2] = u * uvScale[0];
      uvs[index * 2 + 1] = v * uvScale[1];
      if (row < rows && column < columns) indices.push(index, index + 1, index + columns + 1, index + 1, index + columns + 2, index + columns + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const normals = geometry.getAttribute("normal") as THREE.BufferAttribute;
  for (let row = 0; row <= rows; row += 1) {
    for (let column = 0; column <= columns; column += 1) {
      const index = row * (columns + 1) + column;
      if (Math.abs(normals.getX(index)) + Math.abs(normals.getY(index)) + Math.abs(normals.getZ(index)) > 1e-6) continue;
      const toward = row * 2 < rows ? 1 : -1;
      for (let other = row + toward; other >= 0 && other <= rows; other += toward) {
        const source = other * (columns + 1) + column;
        if (Math.abs(normals.getX(source)) + Math.abs(normals.getY(source)) + Math.abs(normals.getZ(source)) <= 1e-6) continue;
        normals.setXYZ(index, normals.getX(source), normals.getY(source), normals.getZ(source));
        break;
      }
    }
  }
  return geometry;
}

/**
 * A tube along a curve, its radius and colour following t (0 at the start, 1 at the end). Frames are carried along the
 * curve without twisting, and uv.y runs along it so a stem texture can repeat lengthwise.
 */
export function tubeGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  segments: number,
  radial: number,
  radius: (t: number) => number,
  color: (t: number, out: THREE.Color) => void = (_, out) => out.setRGB(1, 1, 1),
): THREE.BufferGeometry {
  const frames = curve.computeFrenetFrames(segments, false);
  const count = (segments + 1) * (radial + 1);
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const indices: number[] = [];
  const point = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const tint = new THREE.Color();
  const length = curve.getLength();
  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    curve.getPointAt(t, point);
    const r = radius(t);
    color(t, tint);
    const N = frames.normals[index];
    const B = frames.binormals[index];
    for (let ring = 0; ring <= radial; ring += 1) {
      const angle = (ring / radial) * Math.PI * 2;
      const sin = Math.sin(angle);
      const cos = -Math.cos(angle);
      normal.set(cos * N.x + sin * B.x, cos * N.y + sin * B.y, cos * N.z + sin * B.z).normalize();
      const vertex = index * (radial + 1) + ring;
      positions[vertex * 3] = point.x + r * normal.x;
      positions[vertex * 3 + 1] = point.y + r * normal.y;
      positions[vertex * 3 + 2] = point.z + r * normal.z;
      normal.toArray(normals, vertex * 3);
      colors[vertex * 3] = tint.r;
      colors[vertex * 3 + 1] = tint.g;
      colors[vertex * 3 + 2] = tint.b;
      uvs[vertex * 2] = ring / radial;
      uvs[vertex * 2 + 1] = t * length;
      if (index < segments && ring < radial) indices.push(vertex, vertex + radial + 1, vertex + 1, vertex + radial + 1, vertex + radial + 2, vertex + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

/** Where a stem passes a height (it must rise monotonically); a leaf asked for above the head would sprout from its neck. */
export function pointAtHeight(curve: THREE.Curve<THREE.Vector3>, height: number): { point: THREE.Vector3; t: number } {
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

/** A frame at `origin` whose +Y points along `direction` and whose +Z leans toward `facing`. */
export function frameMatrix(origin: THREE.Vector3Like, direction: THREE.Vector3Like, facing: THREE.Vector3Like, scale = 1): THREE.Matrix4 {
  const y = new THREE.Vector3(direction.x, direction.y, direction.z).normalize();
  const z = new THREE.Vector3(facing.x, facing.y, facing.z);
  z.addScaledVector(y, -z.dot(y));
  if (z.lengthSq() < 1e-8) z.set(y.y, -y.x, 0).cross(y);
  z.normalize();
  const x = new THREE.Vector3().crossVectors(y, z);
  return new THREE.Matrix4().makeBasis(x.multiplyScalar(scale), y.multiplyScalar(scale), z.multiplyScalar(scale)).setPosition(origin.x, origin.y, origin.z);
}
