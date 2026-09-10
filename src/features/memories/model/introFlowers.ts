import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type IntroFlowerVariant = "sunflower" | "hydrangea";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const FRONT = new THREE.Vector3(0, 0, 1);

/** Deterministic 0..1 noise so a specimen looks identical on every visit. */
function jitter(seed: number, salt = 0): number {
  const value = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function smooth(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped * clamped * (3 - 2 * clamped);
}

function satin(color: number, roughness = 0.82, extra: THREE.MeshStandardMaterialParameters = {}): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, side: THREE.DoubleSide, ...extra });
}

type SurfaceKind = "ray" | "sepal" | "leaf" | "paper";

/** Textures are painted once per specimen. Without WebGL there is no renderer to sample them, so the 2D work is skipped. */
function canvasTexture(width: number, height: number, paint: (context: CanvasRenderingContext2D, width: number, height: number) => void): THREE.CanvasTexture | null {
  if (typeof document === "undefined" || typeof WebGLRenderingContext === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  paint(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/**
 * Procedural surface detail: fine longitudinal veins (ray petals), soft radial veins (hydrangea sepals),
 * a pinnate vein net (leaves) or paper fibres (wrapping). Near-white, so it only modulates the vertex and
 * instance colours, and it doubles as a bump map so the detail catches the light.
 */
function surfaceTexture(kind: SurfaceKind): THREE.CanvasTexture | null {
  const texture = canvasTexture(kind === "paper" ? 512 : 256, 512, (context, width, height) => {
    context.fillStyle = "#f4f4f4";
    context.fillRect(0, 0, width, height);
    context.lineCap = "round";
    if (kind === "ray") {
      for (let vein = 0; vein < 30; vein += 1) {
        const x = ((vein + 0.5) / 30) * width + (jitter(vein, 1) - 0.5) * 8;
        const strong = vein % 5 === 0;
        context.strokeStyle = `rgba(125, 70, 15, ${strong ? 0.26 : 0.11})`;
        context.lineWidth = strong ? 2.6 : 1.1;
        context.beginPath();
        context.moveTo(x, height);
        context.bezierCurveTo(x + (jitter(vein, 2) - 0.5) * 30, height * 0.62, width / 2 + (x - width / 2) * 0.55, height * 0.28, width / 2 + (x - width / 2) * 0.22, 6);
        context.stroke();
      }
      const glow = context.createLinearGradient(0, 0, 0, height);
      glow.addColorStop(0, "rgba(255,255,255,0.1)");
      glow.addColorStop(0.55, "rgba(255,255,255,0)");
      glow.addColorStop(1, "rgba(95,50,10,0.26)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
    } else if (kind === "sepal") {
      context.strokeStyle = "rgba(40, 70, 160, 0.2)";
      for (let vein = -4; vein <= 4; vein += 1) {
        context.lineWidth = vein === 0 ? 3 : 1.4;
        context.beginPath();
        context.moveTo(width / 2, height);
        context.quadraticCurveTo(width / 2 + vein * 26, height * 0.5, width / 2 + vein * 22, 20 + Math.abs(vein) * 22);
        context.stroke();
      }
      const glow = context.createRadialGradient(width / 2, height, 10, width / 2, height * 0.7, height * 0.9);
      glow.addColorStop(0, "rgba(255,255,255,0.2)");
      glow.addColorStop(0.55, "rgba(255,255,255,0)");
      glow.addColorStop(1, "rgba(20,40,120,0.22)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
    } else if (kind === "leaf") {
      context.strokeStyle = "rgba(215, 240, 185, 0.6)";
      context.lineWidth = 6;
      context.beginPath();
      context.moveTo(width / 2, height);
      context.lineTo(width / 2, 10);
      context.stroke();
      context.lineWidth = 2.2;
      for (let vein = 1; vein <= 10; vein += 1) {
        const y = height - (vein / 11) * height * 0.94;
        for (const side of [-1, 1]) {
          context.beginPath();
          context.moveTo(width / 2, y);
          context.quadraticCurveTo(width / 2 + side * width * 0.26, y - 44, width / 2 + side * width * 0.48, y - 82);
          context.stroke();
        }
      }
      context.strokeStyle = "rgba(30, 70, 40, 0.18)";
      context.lineWidth = 1;
      for (let cell = 0; cell < 140; cell += 1) {
        const x = jitter(cell, 3) * width;
        const y = jitter(cell, 4) * height;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + (jitter(cell, 5) - 0.5) * 34, y + (jitter(cell, 6) - 0.5) * 34);
        context.stroke();
      }
      // Darker margin so the serrated edge reads even from a distance.
      const edge = context.createLinearGradient(0, 0, width, 0);
      edge.addColorStop(0, "rgba(20,50,30,0.22)");
      edge.addColorStop(0.18, "rgba(20,50,30,0)");
      edge.addColorStop(0.82, "rgba(20,50,30,0)");
      edge.addColorStop(1, "rgba(20,50,30,0.22)");
      context.fillStyle = edge;
      context.fillRect(0, 0, width, height);
    } else {
      // Kraft fibres: many faint short strokes at random angles, plus soft blotches.
      for (let fibre = 0; fibre < 1400; fibre += 1) {
        const x = jitter(fibre, 1) * width;
        const y = jitter(fibre, 2) * height;
        const angle = jitter(fibre, 3) * Math.PI;
        const length = 6 + jitter(fibre, 4) * 26;
        context.strokeStyle = `rgba(${fibre % 3 ? "110, 80, 50" : "255, 255, 255"}, ${0.05 + jitter(fibre, 5) * 0.09})`;
        context.lineWidth = 0.6 + jitter(fibre, 6) * 1.2;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        context.stroke();
      }
      for (let blot = 0; blot < 26; blot += 1) {
        const x = jitter(blot, 7) * width;
        const y = jitter(blot, 8) * height;
        const radius = 30 + jitter(blot, 9) * 90;
        const glow = context.createRadialGradient(x, y, 0, x, y, radius);
        glow.addColorStop(0, blot % 2 ? "rgba(255,255,255,0.09)" : "rgba(90,60,30,0.07)");
        glow.addColorStop(1, "rgba(0,0,0,0)");
        context.fillStyle = glow;
        context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }
    }
  });
  if (texture && kind === "paper") {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
  }
  return texture;
}

/** A small gift tag: the couple's initials in the handwriting used across the diary. */
function tagTexture(blue: boolean): THREE.CanvasTexture | null {
  const paint = (context: CanvasRenderingContext2D, width: number, height: number) => {
    context.fillStyle = blue ? "#f3f7fa" : "#f7efe0";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = blue ? "rgba(34, 81, 140, 0.45)" : "rgba(179, 68, 62, 0.45)";
    context.lineWidth = 3;
    context.strokeRect(14, 14, width - 28, height - 28);
    context.fillStyle = blue ? "#22518c" : "#8a3c36";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "700 92px 'Dancing Script', 'Literata', Georgia, serif";
    context.fillText("H & N", width / 2, height * 0.42);
    context.font = "500 20px 'Be Vietnam Pro', 'Avenir Next', sans-serif";
    context.fillStyle = blue ? "rgba(34, 81, 140, 0.8)" : "rgba(120, 70, 50, 0.85)";
    context.fillText(blue ? "PHẦN II" : "2023 · 2026", width / 2, height * 0.66);
    // A small heart, drawn from two arcs and a point.
    const x = width / 2;
    const y = height * 0.8;
    context.fillStyle = blue ? "#4f8fd6" : "#c9554b";
    context.beginPath();
    context.moveTo(x, y + 14);
    context.bezierCurveTo(x - 22, y - 4, x - 12, y - 22, x, y - 10);
    context.bezierCurveTo(x + 12, y - 22, x + 22, y - 4, x, y + 14);
    context.fill();
    context.beginPath();
    context.arc(width / 2, 34, 6, 0, Math.PI * 2);
    context.fillStyle = blue ? "#22518c" : "#8a3c36";
    context.fill();
  };
  const texture = canvasTexture(256, 384, paint);
  // The handwriting font usually arrives after the model is built; repaint the tag once it has.
  if (texture && typeof document !== "undefined" && document.fonts?.load) {
    void document.fonts.load("700 92px 'Dancing Script'").then(() => {
      const canvas = texture.image as HTMLCanvasElement;
      const context = canvas.getContext("2d");
      if (!context) return;
      paint(context, canvas.width, canvas.height);
      texture.needsUpdate = true;
    }).catch(() => undefined);
  }
  return texture;
}

/** Velvety petal surface: vertex tints multiply the per-instance colour. */
function petalMaterial(sheenColor: number, kind: SurfaceKind, bumpScale = 0.004): THREE.MeshPhysicalMaterial {
  const texture = surfaceTexture(kind);
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.62,
    metalness: 0,
    sheen: 0.55,
    sheenRoughness: 0.7,
    sheenColor,
    vertexColors: true,
    side: THREE.DoubleSide,
    map: texture,
    bumpMap: texture,
    bumpScale,
  });
}

/** Ribbon with a satin finish, so the loops catch a soft highlight instead of reading as matte tubing. */
function satinRibbon(color: number, sheenColor: number): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.42, metalness: 0, sheen: 0.7, sheenRoughness: 0.45, sheenColor, clearcoat: 0.22, clearcoatRoughness: 0.5, side: THREE.DoubleSide });
}

function mesh(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
  const result = new THREE.Mesh(geometry, material);
  result.castShadow = true;
  result.receiveShadow = true;
  return result;
}

function instanced(geometry: THREE.BufferGeometry, material: THREE.Material, count: number, name: string): THREE.InstancedMesh {
  const result = new THREE.InstancedMesh(geometry, material, count);
  result.name = name;
  result.castShadow = true;
  result.receiveShadow = true;
  return result;
}

/** Joins static parts into one draw call; the parts are consumed. */
function merged(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const result = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  if (!result) throw new Error("Bouquet parts could not be merged.");
  return result;
}

function transformed(geometry: THREE.BufferGeometry, position: THREE.Vector3Like, rotation?: THREE.Euler, scale?: THREE.Vector3Like): THREE.BufferGeometry {
  const matrix = new THREE.Matrix4().compose(
    new THREE.Vector3(position.x, position.y, position.z),
    new THREE.Quaternion().setFromEuler(rotation ?? new THREE.Euler()),
    scale ? new THREE.Vector3(scale.x, scale.y, scale.z) : new THREE.Vector3(1, 1, 1),
  );
  return geometry.applyMatrix4(matrix);
}

/** A stem that thins toward the flower: TubeGeometry cannot taper, so the rings are built by hand. */
function taperedTube(curve: THREE.Curve<THREE.Vector3>, radiusStart: number, radiusEnd: number, segments = 24, radial = 8): THREE.BufferGeometry {
  const frames = curve.computeFrenetFrames(segments, false);
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const point = new THREE.Vector3();
  const normal = new THREE.Vector3();
  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    curve.getPointAt(t, point);
    const radius = radiusStart + (radiusEnd - radiusStart) * t;
    const N = frames.normals[index];
    const B = frames.binormals[index];
    for (let ring = 0; ring <= radial; ring += 1) {
      const angle = (ring / radial) * Math.PI * 2;
      const sin = Math.sin(angle);
      const cos = -Math.cos(angle);
      normal.set(cos * N.x + sin * B.x, cos * N.y + sin * B.y, cos * N.z + sin * B.z).normalize();
      positions.push(point.x + radius * normal.x, point.y + radius * normal.y, point.z + radius * normal.z);
      normals.push(normal.x, normal.y, normal.z);
      uvs.push(ring / radial, t);
      if (index < segments && ring < radial) {
        const a = index * (radial + 1) + ring;
        indices.push(a, a + radial + 1, a + 1, a + radial + 1, a + radial + 2, a + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

const PEDESTAL_ACCENT: Record<IntroFlowerVariant, number> = { sunflower: 0xe2c17f, hydrangea: 0xa8ddeb };

/** Both specimens share a cabinet-sized base; the bouquet alone may sway. */
export function createIntroFlower(variant: IntroFlowerVariant): THREE.Group {
  const root = new THREE.Group();
  root.name = `intro-${variant}`;
  const floor = mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.13, 64), satin(0x121722, 0.7));
  floor.name = "pedestal";
  floor.position.y = -1.28;
  const edge = mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.045, 64), satin(0x29303c, 0.74));
  edge.position.y = -1.18;
  // A hairline of light along the pedestal rim, in the room's accent for this part.
  const accent = PEDESTAL_ACCENT[variant];
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.105, 0.009, 8, 128), new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 1.4, roughness: 0.4, metalness: 0 }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -1.156;
  root.add(floor, edge, ring);

  const bouquet = new THREE.Group();
  bouquet.name = "bouquet";
  const blue = variant === "hydrangea";
  const stems: THREE.BufferGeometry[] = [];
  addFoliage(bouquet, blue, stems);
  if (blue) {
    addEucalyptus(bouquet);
    addHydrangea(bouquet);
  } else {
    addGypsophila(bouquet, stems);
    addSunflowers(bouquet);
  }
  bouquet.add(mesh(merged(stems), satin(blue ? 0x3d7048 : 0x3b7345, 0.86)));
  addWrapping(bouquet, blue);
  root.add(bouquet);
  return root;
}

interface PetalShape {
  length: number;
  width: number;
  /** Envelope exponent: lower is rounder, higher is more lance-like. */
  tip: number;
  /** Positive bends the tip backwards (away from the viewer). */
  curl: number;
  /** Positive cups the side edges towards the viewer. */
  cup: number;
  /** Rotation of the blade about its own axis from base to tip, in radians. */
  twist?: number;
  /** Depth of the small notch at the tip, 0..1. */
  notch?: number;
  /** Extra waviness along the edges. */
  ruffle?: number;
  rows?: number;
  columns?: number;
  base: THREE.Color;
  mid: THREE.Color;
  tipTint: THREE.Color;
  edge: THREE.Color;
}

/** A thin, curved petal facing +Z with a baked colour gradient (base → tip, centre → edge). */
function petalGeometry(shape: PetalShape): THREE.BufferGeometry {
  const rows = shape.rows ?? 14;
  const columns = shape.columns ?? 8;
  const twist = shape.twist ?? 0;
  const notch = shape.notch ?? 0;
  const ruffle = shape.ruffle ?? 0;
  const vertices: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const color = new THREE.Color();
  for (let row = 0; row <= rows; row += 1) {
    const t = row / rows;
    const envelopeBase = Math.pow(Math.sin(Math.PI * t), shape.tip);
    for (let column = 0; column <= columns; column += 1) {
      const across = (column / columns) * 2 - 1;
      // A gentle ripple along the edges keeps the silhouette from looking die-cut; a notch splits the tip.
      const ripple = 1 + Math.sin(t * 11 + across * 2) * (0.05 + ruffle) * Math.pow(Math.abs(across), 3);
      const envelope = envelopeBase * (1 - notch * Math.exp(-(across * across) / 0.05) * smooth((t - 0.84) / 0.16));
      let x = across * shape.width * envelope * ripple;
      let z = shape.cup * across * across * shape.width * envelope
        - shape.curl * Math.pow(t, 2.3) * shape.length
        + Math.sin(t * Math.PI) * shape.length * 0.04
        + Math.sin(across * 6 + t * 5) * shape.width * 0.03
        + ruffle * Math.sin(across * 9 + t * 13) * shape.width * 0.5 * Math.abs(across);
      if (twist) {
        const angle = twist * t;
        const rotatedX = x * Math.cos(angle) - z * Math.sin(angle);
        z = x * Math.sin(angle) + z * Math.cos(angle);
        x = rotatedX;
      }
      vertices.push(x, t * shape.length, z);
      uvs.push((across + 1) / 2, t);
      if (t < 0.5) color.copy(shape.base).lerp(shape.mid, smooth(t / 0.5));
      else color.copy(shape.mid).lerp(shape.tipTint, smooth((t - 0.5) / 0.5));
      color.lerp(shape.edge, Math.pow(Math.abs(across), 2.2) * envelope);
      colors.push(color.r, color.g, color.b);
      if (row < rows && column < columns) {
        const a = row * (columns + 1) + column;
        indices.push(a, a + 1, a + columns + 1, a + 1, a + columns + 2, a + columns + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

interface RingSpec {
  count: number;
  radius: number;
  scale: number;
  /** Rotation about the petal's own base axis; positive leans backwards. */
  lean: number;
  depth: number;
  phase: number;
  colors: [number, number];
}

interface HeadPose {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

function headMatrix(pose: HeadPose): THREE.Matrix4 {
  return new THREE.Matrix4().compose(
    new THREE.Vector3().fromArray(pose.position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(pose.rotation[0], pose.rotation[1], pose.rotation[2])),
    new THREE.Vector3().setScalar(pose.scale),
  );
}

/** Three heads share one instanced mesh per part, so extra petals cost geometry rather than draw calls. */
function addSunflowers(bouquet: THREE.Group): void {
  const heads: HeadPose[] = [
    { position: [0.1, 0.72, 0.14], rotation: [-0.09, -0.1, 0.07], scale: 1 },
    { position: [-0.49, 0.13, -0.025], rotation: [-0.16, 0.22, -0.25], scale: 0.64 },
    { position: [0.51, 0.065, -0.09], rotation: [0.03, -0.24, 0.16], scale: 0.57 },
  ];
  const matrices = heads.map(headMatrix);
  const rayPetal = petalGeometry({
    length: 0.54, width: 0.078, tip: 0.82, curl: 0.24, cup: 0.36, twist: 0.3, notch: 0.35, ruffle: 0.02,
    base: new THREE.Color(0.76, 0.34, 0.05), mid: new THREE.Color(0.98, 0.64, 0.11), tipTint: new THREE.Color(1.02, 0.86, 0.36), edge: new THREE.Color(0.84, 0.48, 0.08),
  });
  const bract = petalGeometry({
    length: 0.3, width: 0.08, tip: 0.95, curl: 0.42, cup: 0.14, twist: 0.15, rows: 10, columns: 6,
    base: new THREE.Color(0.62, 0.8, 0.52), mid: new THREE.Color(1, 1, 1), tipTint: new THREE.Color(0.88, 1, 0.78), edge: new THREE.Color(0.74, 0.88, 0.66),
  });
  const rayMaterial = petalMaterial(0xffc866, "ray", 0.007);
  rayMaterial.roughness = 0.7;
  rayMaterial.sheen = 0.4;
  const bractMaterial = petalMaterial(0xb8e0a0, "leaf", 0.003);
  const rings: RingSpec[] = [
    { count: 27, radius: 0.2, scale: 1.05, lean: 0.42, depth: -0.06, phase: 0, colors: [0xd2760a, 0xeaa122] },
    { count: 23, radius: 0.197, scale: 0.93, lean: 0.05, depth: -0.022, phase: 0.12, colors: [0xe89814, 0xf7bb3a] },
    { count: 17, radius: 0.19, scale: 0.66, lean: -0.32, depth: 0.008, phase: 0.05, colors: [0xf0ae24, 0xfbcf58] },
    { count: 12, radius: 0.186, scale: 0.4, lean: -0.66, depth: 0.028, phase: 0.2, colors: [0xcfa428, 0xe2c455] },
  ];
  const petalsPerHead = rings.reduce((sum, ring) => sum + ring.count, 0);
  const petals = instanced(rayPetal, rayMaterial, petalsPerHead * heads.length, "golden-petals");
  const bractsPerHead = 18 + 12;
  const bracts = instanced(bract, bractMaterial, bractsPerHead * heads.length, "green-bracts");
  const seedGeometry = new THREE.SphereGeometry(1, 8, 6);
  const seedMaterial = satin(0xffffff, 0.5);
  const seedCount = 430;
  const ringFlorets = 56;
  const pollen = 40;
  const seedsPerHead = seedCount + ringFlorets + pollen;
  const seeds = instanced(seedGeometry, seedMaterial, seedsPerHead * heads.length, "spiral-seeds");
  const domes: THREE.BufferGeometry[] = [];
  const backs: THREE.BufferGeometry[] = [];
  const transform = new THREE.Object3D();
  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();
  const secondary = new THREE.Color();

  heads.forEach((_, headIndex) => {
    const head = matrices[headIndex];
    let petalIndex = headIndex * petalsPerHead;
    rings.forEach((ring, ringIndex) => {
      for (let index = 0; index < ring.count; index += 1) {
        const seed = headIndex * 1000 + ringIndex * 100 + index;
        const angle = (index / ring.count) * Math.PI * 2 + ring.phase + (jitter(seed, 1) - 0.5) * 0.07;
        // A few petals curl further back or droop, so the head is not a perfect gear.
        const wild = jitter(seed, 9) > 0.86 ? 0.42 : 0;
        transform.position.set(Math.cos(angle) * ring.radius, Math.sin(angle) * ring.radius, ring.depth);
        transform.rotation.set(ring.lean + wild + (jitter(seed, 2) - 0.5) * 0.18, (jitter(seed, 3) - 0.5) * 0.3, angle - Math.PI / 2, "ZXY");
        const grow = ring.scale * (0.9 + jitter(seed, 4) * 0.2) * (wild ? 1.08 : 1);
        transform.scale.set(0.88 + jitter(seed, 5) * 0.24, grow, 1);
        transform.updateMatrix();
        matrix.multiplyMatrices(head, transform.matrix);
        petals.setMatrixAt(petalIndex, matrix);
        petals.setColorAt(petalIndex, color.setHex(ring.colors[0]).lerp(secondary.setHex(ring.colors[1]), jitter(seed, 6)));
        petalIndex += 1;
      }
    });

    let bractIndex = headIndex * bractsPerHead;
    for (const row of [{ count: 18, radius: 0.17, lean: 0.7, scale: 1, depth: -0.1 }, { count: 12, radius: 0.15, lean: 0.98, scale: 0.72, depth: -0.12 }]) {
      for (let index = 0; index < row.count; index += 1) {
        const angle = (index / row.count) * Math.PI * 2 + 0.2 + row.lean;
        transform.position.set(Math.cos(angle) * row.radius, Math.sin(angle) * row.radius, row.depth);
        transform.rotation.set(row.lean, 0, angle - Math.PI / 2, "ZXY");
        transform.scale.set(1, row.scale * (0.9 + jitter(index + headIndex * 31, 7) * 0.25), 1);
        transform.updateMatrix();
        matrix.multiplyMatrices(head, transform.matrix);
        bracts.setMatrixAt(bractIndex, matrix);
        bracts.setColorAt(bractIndex, color.setHex(0x3f7f45).lerp(secondary.setHex(0x86b862), jitter(index, 8)));
        bractIndex += 1;
      }
    }

    // The disc: a dark dome carrying a phyllotaxis of seeds that lighten toward a ring of opening florets.
    domes.push(transformed(new THREE.SphereGeometry(0.245, 40, 24), new THREE.Vector3(0, 0, 0.012), undefined, new THREE.Vector3(1, 1, 0.5)).applyMatrix4(head));
    backs.push(
      transformed(new THREE.SphereGeometry(0.205, 24, 16), new THREE.Vector3(0, 0, -0.09), undefined, new THREE.Vector3(1, 1, 0.42)).applyMatrix4(head),
      transformed(new THREE.ConeGeometry(0.16, 0.2, 14, 1, true), new THREE.Vector3(0, 0, -0.18), new THREE.Euler(-Math.PI / 2, 0, 0)).applyMatrix4(head),
    );
    let seedIndex = headIndex * seedsPerHead;
    for (let index = 0; index < seedCount; index += 1) {
      const ratio = (index + 0.5) / seedCount;
      const radius = Math.sqrt(ratio) * 0.222;
      const angle = index * GOLDEN_ANGLE;
      transform.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.012 + Math.sqrt(Math.max(0, 1 - ratio * 0.84)) * 0.122);
      transform.rotation.set(0.2 * ratio, 0, angle);
      const size = 0.0068 + ratio * 0.0062;
      transform.scale.set(size, size * 1.3, size * 0.75);
      transform.updateMatrix();
      matrix.multiplyMatrices(head, transform.matrix);
      seeds.setMatrixAt(seedIndex, matrix);
      const tone = ratio < 0.4 ? (index % 2 ? 0x2b1408 : 0x3f2210) : ratio < 0.78 ? (index % 3 ? 0x6e3f1b : 0x51301a) : (index % 2 ? 0xb47a35 : 0x8f5f2b);
      seeds.setColorAt(seedIndex, color.setHex(tone));
      seedIndex += 1;
    }
    for (let index = 0; index < ringFlorets; index += 1) {
      const angle = (index / ringFlorets) * Math.PI * 2;
      const radius = 0.215 + (index % 2) * 0.01;
      transform.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.012 + Math.sqrt(0.16) * 0.122 + 0.006);
      transform.rotation.set(0.5, 0, angle);
      transform.scale.set(0.009, 0.016, 0.009);
      transform.updateMatrix();
      matrix.multiplyMatrices(head, transform.matrix);
      seeds.setMatrixAt(seedIndex, matrix);
      seeds.setColorAt(seedIndex, color.setHex(index % 3 === 0 ? 0xd8d45e : index % 2 ? 0xf3c650 : 0xe5ad34));
      seedIndex += 1;
    }
    for (let index = 0; index < pollen; index += 1) {
      const seed = headIndex * 77 + index;
      const angle = jitter(seed, 10) * Math.PI * 2;
      const radius = 0.16 + jitter(seed, 11) * 0.05;
      transform.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.012 + Math.sqrt(1 - Math.pow(radius / 0.222, 2) * 0.84) * 0.122 + 0.006);
      transform.rotation.set(0, 0, 0);
      transform.scale.setScalar(0.0032 + jitter(seed, 12) * 0.002);
      transform.updateMatrix();
      matrix.multiplyMatrices(head, transform.matrix);
      seeds.setMatrixAt(seedIndex, matrix);
      seeds.setColorAt(seedIndex, color.setHex(0xffe08a));
      seedIndex += 1;
    }
  });

  bouquet.add(
    mesh(merged(backs), satin(0x3a7040, 0.9)),
    bracts,
    petals,
    mesh(merged(domes), satin(0x24120a, 0.96)),
    seeds,
  );
}

interface HeadSpec {
  center: THREE.Vector3;
  radius: THREE.Vector3;
  count: number;
  palette: number[];
  seed: number;
}

function addHydrangea(bouquet: THREE.Group): void {
  const petal = petalGeometry({
    length: 0.096, width: 0.072, tip: 0.34, curl: -0.22, cup: 0.15, ruffle: 0.025, rows: 8, columns: 6,
    base: new THREE.Color(1.12, 1.1, 1.02), mid: new THREE.Color(0.74, 0.83, 1), tipTint: new THREE.Color(0.36, 0.52, 1), edge: new THREE.Color(0.32, 0.48, 1),
  });
  const material = petalMaterial(0xcfe3ff, "sepal", 0.0035);
  const centerGeometry = new THREE.SphereGeometry(0.0125, 6, 4);
  const centerMaterial = satin(0xffffff, 0.6);
  const heads: HeadSpec[] = [
    { center: new THREE.Vector3(-0.08, 0.7, 0.06), radius: new THREE.Vector3(0.64, 0.58, 0.4), count: 470, palette: [0x5aa0ee, 0x4a8fe6, 0x6fb2f2, 0x3f80dc, 0x559be9, 0x7c8fe8], seed: 1 },
    { center: new THREE.Vector3(0.43, 0.2, 0.04), radius: new THREE.Vector3(0.38, 0.35, 0.3), count: 240, palette: [0x6f8ce9, 0x5c79e2, 0x829bee, 0x516cda, 0x9a8fe0], seed: 2 },
    { center: new THREE.Vector3(-0.48, 0.13, -0.11), radius: new THREE.Vector3(0.29, 0.28, 0.24), count: 150, palette: [0x5fbaf0, 0x4aacec, 0x76c8f4, 0x419fe4, 0x8fb9ee], seed: 3 },
  ];
  const count = heads.reduce((sum, head) => sum + head.count, 0);
  const florets = instanced(petal, material, count * 4, "four-petal-blue-florets");
  const centers = instanced(centerGeometry, centerMaterial, count, "pale-floret-centers");
  const budGeometry = new THREE.SphereGeometry(1, 8, 6);
  const budsPerHead = 40;
  const buds = instanced(budGeometry, satin(0xffffff, 0.7), budsPerHead * heads.length, "unopened-buds");
  const transform = new THREE.Object3D();
  const floretFrame = new THREE.Object3D();
  const matrix = new THREE.Matrix4();
  const direction = new THREE.Vector3();
  const color = new THREE.Color();
  const pale = new THREE.Color(0xcfe6fb);
  const lavender = new THREE.Color(0xb59ddc);
  const white = new THREE.Color(0xffffff);
  const inners: THREE.BufferGeometry[] = [];
  let floretIndex = 0;
  let budIndex = 0;
  for (const head of heads) {
    for (let index = 0; index < head.count; index += 1) {
      const seed = head.seed * 1000 + index;
      // Fibonacci distribution covers the whole head, including the silhouette.
      const y = 1 - (2 * (index + 0.5)) / head.count;
      const ring = Math.sqrt(1 - y * y);
      const angle = index * GOLDEN_ANGLE;
      direction.set(Math.cos(angle) * ring, y, Math.sin(angle) * ring);
      // Lobed, slightly irregular mophead instead of a perfect ball.
      const lobes = Math.sin(direction.x * 4.3 + head.seed) * Math.sin(direction.y * 3.7 + head.seed * 1.7) + Math.sin(direction.z * 5.1 + direction.x * 2.2 + head.seed * 0.6);
      // A few florets stand proud of the head so the surface reads as fluffy, not shrink-wrapped.
      const proud = jitter(seed, 12) > 0.86 ? 0.06 : 0;
      const bump = 1 + lobes * 0.04 + (jitter(seed, 1) - 0.5) * 0.05 + proud;
      floretFrame.position.copy(direction).multiply(head.radius).multiplyScalar(bump).add(head.center);
      floretFrame.quaternion.setFromUnitVectors(FRONT, direction);
      floretFrame.rotateX((jitter(seed, 2) - 0.5) * 0.34);
      floretFrame.rotateY((jitter(seed, 3) - 0.5) * 0.34);
      floretFrame.rotateZ(jitter(seed, 4) * Math.PI * 2);
      floretFrame.updateMatrix();
      const scale = (0.84 + jitter(seed, 5) * 0.3) * (proud ? 1.1 : 1);
      color.setHex(head.palette[Math.floor(jitter(seed, 6) * head.palette.length)]);
      // Sun-facing florets are paler; a scattering turns lavender or near-white, the way real mopheads mottle.
      color.lerp(white, Math.max(0, direction.y) * 0.16);
      const variegation = jitter(seed, 9);
      if (variegation > 0.92) color.lerp(pale, 0.5);
      else if (variegation > 0.84) color.lerp(lavender, 0.55);
      for (let petalIndex = 0; petalIndex < 4; petalIndex += 1) {
        const petalAngle = (petalIndex / 4) * Math.PI * 2 + (jitter(seed, 7 + petalIndex) - 0.5) * 0.22;
        transform.position.set(Math.sin(petalAngle) * 0.011, Math.cos(petalAngle) * 0.011, petalIndex % 2 ? 0.003 : 0);
        transform.rotation.set(petalIndex % 2 ? 0.12 : -0.06, 0, -petalAngle, "ZXY");
        transform.scale.set(scale * (0.92 + jitter(seed, 11 + petalIndex) * 0.16), scale, scale);
        transform.updateMatrix();
        matrix.multiplyMatrices(floretFrame.matrix, transform.matrix);
        florets.setMatrixAt(floretIndex * 4 + petalIndex, matrix);
        florets.setColorAt(floretIndex * 4 + petalIndex, color);
      }
      transform.position.set(0, 0, 0.01);
      transform.rotation.set(0, 0, 0);
      transform.scale.setScalar(0.8 + (index % 3) * 0.12);
      transform.updateMatrix();
      matrix.multiplyMatrices(floretFrame.matrix, transform.matrix);
      centers.setMatrixAt(floretIndex, matrix);
      centers.setColorAt(floretIndex, color.setHex(index % 4 === 0 ? 0xdff0c4 : 0xfff4cc));
      floretIndex += 1;
    }
    // Unopened buds sit low between the florets, green-blue like the real thing.
    for (let index = 0; index < budsPerHead; index += 1) {
      const seed = head.seed * 500 + index;
      const y = 1 - 2 * jitter(seed, 13);
      const ring = Math.sqrt(1 - y * y);
      const angle = jitter(seed, 14) * Math.PI * 2;
      direction.set(Math.cos(angle) * ring, y, Math.sin(angle) * ring);
      transform.position.copy(direction).multiply(head.radius).multiplyScalar(0.93).add(head.center);
      transform.rotation.set(0, 0, 0);
      transform.scale.setScalar(0.013 + jitter(seed, 15) * 0.008);
      transform.updateMatrix();
      buds.setMatrixAt(budIndex, transform.matrix);
      buds.setColorAt(budIndex, color.setHex(index % 3 === 0 ? 0xa9cfc0 : index % 2 ? 0xb9d6e6 : 0x8fb8c9));
      budIndex += 1;
    }
    inners.push(transformed(new THREE.SphereGeometry(1, 24, 18), head.center, undefined, head.radius.clone().multiplyScalar(0.92)));
  }
  bouquet.add(mesh(merged(inners), satin(0x4a72b8, 0.98)), buds, florets, centers);
}

/** Ovate or heart-shaped leaf facing +Z, softly serrated, with a paler midrib baked into the vertex colours. */
function leafGeometry(length: number, width: number, heart: boolean): THREE.BufferGeometry {
  const rows = 24;
  const columns = 12;
  const vertices: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const color = new THREE.Color();
  for (let row = 0; row <= rows; row += 1) {
    const t = row / rows;
    const lobe = heart ? 0.32 * Math.exp(-Math.pow((t - 0.1) / 0.13, 2)) : 0;
    const envelope = Math.pow(Math.sin(Math.PI * t), heart ? 0.42 : 0.55) * (1 - (heart ? 0.3 : 0.18) * t) + lobe;
    for (let column = 0; column <= columns; column += 1) {
      const across = (column / columns) * 2 - 1;
      uvs.push((across + 1) / 2, t);
      const serration = 1 + Math.sin(t * (heart ? 44 : 36)) * (heart ? 0.07 : 0.05) * Math.pow(Math.abs(across), 3);
      vertices.push(
        across * width * envelope * serration,
        t * length,
        across * across * width * 0.3 + t * t * length * 0.12 - Math.sin(Math.PI * t) * 0.03 + Math.sin(across * 4 + t * 9) * width * 0.02,
      );
      color.setRGB(0.72 + t * 0.3, 0.86 + t * 0.18, 0.68 + t * 0.24);
      const rib = Math.exp(-Math.pow((across * width * envelope) / 0.012, 2)) * (1 - t * 0.6);
      color.lerp(new THREE.Color(1.35, 1.32, 1.05), rib);
      colors.push(color.r, color.g, color.b);
      if (row < rows && column < columns) {
        const a = row * (columns + 1) + column;
        indices.push(a, a + 1, a + columns + 1, a + 1, a + columns + 2, a + columns + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function stemCurve(target: [number, number, number], bend = 0.3): THREE.CatmullRomCurve3 {
  const [x, y, z] = target;
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -1.15, -0.02),
    new THREE.Vector3(x * bend, -0.58, z * 0.5),
    new THREE.Vector3(x * 0.87, y - 0.4, z),
    new THREE.Vector3(x, y, z),
  ]);
}

interface LeafSpec {
  x: number;
  y: number;
  z: number;
  angle: number;
  scale: number;
  tilt?: number;
  tone?: number;
}

/** Stems for each head plus a rosette of leaves; every leaf is one instance and every vein one line segment. */
function addFoliage(bouquet: THREE.Group, blue: boolean, stems: THREE.BufferGeometry[]): void {
  const targets: [number, number, number][] = blue ? [[-0.08, 0.7, 0.02], [0.43, 0.2, 0], [-0.48, 0.13, -0.14]] : [[0.1, 0.72, 0], [-0.49, 0.13, -0.1], [0.51, 0.065, -0.16]];
  for (const target of targets) stems.push(taperedTube(stemCurve(target), 0.036, 0.024, 22, 9));

  const leaf = leafGeometry(blue ? 0.7 : 0.66, blue ? 0.25 : 0.2, !blue);
  const leafTexture = surfaceTexture("leaf");
  const leafMaterial = satin(0xffffff, 0.68, { vertexColors: true, map: leafTexture, bumpMap: leafTexture, bumpScale: 0.007 });
  const leaves: LeafSpec[] = [
    { x: -0.19, y: -0.5, z: -0.02, angle: 0.96, scale: 1.04, tone: 0x2f6b46 },
    { x: 0.21, y: -0.42, z: -0.08, angle: -1.04, scale: 1.05, tone: 0x3f8354 },
    { x: -0.08, y: -0.78, z: 0.16, angle: 1.19, scale: 0.68, tone: 0x27573d },
    { x: 0.15, y: -0.68, z: 0.13, angle: -0.55, scale: 0.73, tone: 0x35744a },
    { x: -0.3, y: -0.3, z: -0.22, angle: 1.35, scale: 0.86, tilt: -0.4, tone: 0x244f37 },
    { x: 0.34, y: -0.24, z: -0.2, angle: -1.4, scale: 0.8, tilt: 0.4, tone: 0x2c6641 },
  ];
  const ruscus: LeafSpec[] = blue ? [] : [
    { x: -0.62, y: -0.28, z: -0.3, angle: 0.55, scale: 0.42, tone: 0x1f4f32 },
    { x: -0.7, y: -0.05, z: -0.34, angle: 0.75, scale: 0.36, tone: 0x25603a },
    { x: 0.66, y: -0.24, z: -0.32, angle: -0.5, scale: 0.4, tone: 0x1f4f32 },
    { x: 0.74, y: 0.0, z: -0.36, angle: -0.8, scale: 0.34, tone: 0x25603a },
    { x: -0.12, y: 0.15, z: -0.42, angle: 0.1, scale: 0.46, tone: 0x1c4830 },
    { x: 0.2, y: 0.2, z: -0.44, angle: -0.15, scale: 0.44, tone: 0x1c4830 },
  ];
  const specs = [...leaves, ...ruscus];
  const foliage = instanced(leaf, leafMaterial, specs.length, "leaves");
  const transform = new THREE.Object3D();
  const color = new THREE.Color();
  const veinPoints: number[] = [];
  const point = new THREE.Vector3();
  specs.forEach((spec, index) => {
    const narrow = index >= leaves.length;
    transform.position.set(spec.x, spec.y, spec.z);
    transform.rotation.set(-0.08 + (spec.tilt ?? 0), index % 2 === 0 ? -0.12 : 0.2, spec.angle);
    transform.scale.set(spec.scale * (narrow ? 0.55 : 1), spec.scale * (narrow ? 1.15 : 1), spec.scale);
    transform.updateMatrix();
    foliage.setMatrixAt(index, transform.matrix);
    foliage.setColorAt(index, color.setHex(spec.tone ?? 0x2f6b46));
    if (narrow) return;
    for (let vein = 1; vein <= 6; vein += 1) {
      const y = vein * 0.09;
      const width = Math.sin((y / 0.66) * Math.PI) * (blue ? 0.17 : 0.14);
      for (const side of [-1, 1]) {
        point.set(0, y, 0.026).applyMatrix4(transform.matrix);
        veinPoints.push(point.x, point.y, point.z);
        point.set(side * width, y + 0.07, 0.04).applyMatrix4(transform.matrix);
        veinPoints.push(point.x, point.y, point.z);
      }
    }
  });
  const veins = new THREE.BufferGeometry();
  veins.setAttribute("position", new THREE.Float32BufferAttribute(veinPoints, 3));
  bouquet.add(foliage, new THREE.LineSegments(veins, new THREE.LineBasicMaterial({ color: 0x9fbf86, transparent: true, opacity: 0.35 })));
}

/** Baby's breath: thin sprigs ending in clouds of tiny white buds, tucked between and behind the sunflowers. */
function addGypsophila(bouquet: THREE.Group, stems: THREE.BufferGeometry[]): void {
  const tips: [number, number, number][] = [
    [-0.8, 0.4, -0.22], [0.8, 0.34, -0.24], [-0.3, 1.0, -0.26], [0.44, 1.04, -0.3], [0.74, -0.12, -0.02], [-0.72, -0.16, -0.04], [0.06, 1.14, -0.34], [-0.58, 0.7, -0.36], [0.66, 0.72, -0.38],
  ];
  const budsPerSprig = 54;
  const geometry = new THREE.SphereGeometry(1, 7, 5);
  const buds = instanced(geometry, satin(0xffffff, 0.72), budsPerSprig * tips.length, "baby-breath");
  const transform = new THREE.Object3D();
  const color = new THREE.Color();
  tips.forEach((tip, sprigIndex) => {
    stems.push(taperedTube(stemCurve(tip, 0.2), 0.008, 0.003, 18, 5));
    for (let index = 0; index < budsPerSprig; index += 1) {
      const seed = sprigIndex * 100 + index;
      const spread = Math.pow(jitter(seed, 1), 0.6);
      const theta = jitter(seed, 2) * Math.PI * 2;
      const phi = Math.acos(1 - 2 * jitter(seed, 3));
      transform.position.set(
        tip[0] + Math.sin(phi) * Math.cos(theta) * spread * 0.15,
        tip[1] + Math.cos(phi) * spread * 0.14,
        tip[2] + Math.sin(phi) * Math.sin(theta) * spread * 0.1,
      );
      const size = 0.0055 + jitter(seed, 4) * 0.0075;
      transform.scale.setScalar(size);
      transform.updateMatrix();
      buds.setMatrixAt(sprigIndex * budsPerSprig + index, transform.matrix);
      buds.setColorAt(sprigIndex * budsPerSprig + index, color.setHex(jitter(seed, 5) > 0.8 ? 0xa7cf9a : index % 4 === 0 ? 0xfff1d8 : 0xfffaf2));
    }
  });
  bouquet.add(buds);
}

/** Silver-dollar eucalyptus: round grey-green leaves paired along reddish stems, the classic partner to blue hydrangea. */
function addEucalyptus(bouquet: THREE.Group): void {
  const tips: [number, number, number][] = [[-0.9, 0.74, -0.3], [0.88, 0.86, -0.32], [0.14, 1.36, -0.4], [-0.5, 1.16, -0.42]];
  const leavesPerStem = 30;
  const leafGeometryDisc = new THREE.CircleGeometry(1, 18);
  const leafMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.72, metalness: 0, sheen: 0.3, sheenRoughness: 0.7, sheenColor: 0xdcebe4, vertexColors: false, side: THREE.DoubleSide });
  const leaves = instanced(leafGeometryDisc, leafMaterial, leavesPerStem * tips.length, "eucalyptus-leaves");
  const stems: THREE.BufferGeometry[] = [];
  const transform = new THREE.Object3D();
  const color = new THREE.Color();
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  tips.forEach((tip, stemIndex) => {
    const curve = stemCurve(tip, 0.18);
    stems.push(taperedTube(curve, 0.009, 0.004, 20, 6));
    for (let index = 0; index < leavesPerStem; index += 1) {
      const t = 0.4 + (index / (leavesPerStem - 1)) * 0.6;
      curve.getPointAt(t, point);
      curve.getTangentAt(t, tangent);
      side.set(-tangent.y, tangent.x, 0).normalize();
      const flip = index % 2 ? 1 : -1;
      const radius = 0.046 - (index / leavesPerStem) * 0.022;
      const seed = stemIndex * 50 + index;
      transform.position.copy(point).addScaledVector(side, flip * radius * 0.9).add(new THREE.Vector3(0, 0, (jitter(seed, 1) - 0.5) * 0.04));
      transform.rotation.set((jitter(seed, 2) - 0.5) * 1.1, flip * (0.5 + jitter(seed, 3) * 0.6), jitter(seed, 4) * Math.PI);
      transform.scale.set(radius * (0.9 + jitter(seed, 5) * 0.2), radius * 1.1, radius);
      transform.updateMatrix();
      leaves.setMatrixAt(stemIndex * leavesPerStem + index, transform.matrix);
      leaves.setColorAt(stemIndex * leavesPerStem + index, color.setHex(0x7d9c8d).lerp(new THREE.Color(0xa9c2b4), jitter(seed, 6)));
    }
  });
  bouquet.add(mesh(merged(stems), satin(0x5e4036, 0.85)), leaves);
}

function paperGeometry(offset: number, radius: number, height: number): THREE.BufferGeometry {
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const segments = 18;
  const rows = 5;
  for (let row = 0; row <= rows; row += 1) {
    const t = row / rows;
    for (let index = 0; index <= segments; index += 1) {
      const u = index / segments;
      const angle = offset + (u - 0.5) * Math.PI * 1.16;
      const r = 0.15 + t * radius + Math.sin(u * Math.PI * 6) * 0.018 * t;
      const top = Math.sin(u * Math.PI) * 0.12 + Math.sin(u * Math.PI * 3) * 0.025 + Math.sin(u * Math.PI * 9) * 0.008;
      // A soft crease runs down the sheet, so the wrapping reads as folded paper rather than a cone.
      const crease = Math.exp(-Math.pow((u - 0.5) / 0.08, 2)) * 0.014 * t;
      vertices.push(Math.sin(angle) * (r - crease), -1.16 + t * (height + top), Math.cos(angle) * (r - crease) * 0.65 + 0.02);
      uvs.push(u * 1.4, t);
      if (row < rows && index < segments) {
        const a = row * (segments + 1) + index;
        indices.push(a, a + 1, a + segments + 1, a + 1, a + segments + 2, a + segments + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function addWrapping(bouquet: THREE.Group, blue: boolean): void {
  const paperTexture = surfaceTexture("paper");
  const paper = (color: number, roughness: number) => satin(color, roughness, { map: paperTexture, bumpMap: paperTexture, bumpScale: 0.005 });
  // Two layers: an outer sheet, and a taller tissue that peeks above it.
  const outer = merged([paperGeometry(Math.PI, 0.36, 0.58), paperGeometry(-0.71, 0.3, 0.45), paperGeometry(0.74, 0.32, 0.42)]);
  const tissue = merged([paperGeometry(-0.18, 0.27, 0.53), paperGeometry(0.42, 0.28, 0.5), paperGeometry(Math.PI + 0.3, 0.33, 0.66)]);
  bouquet.add(mesh(outer, paper(blue ? 0xdde9f0 : 0xc99a66, 0.9)), mesh(tissue, paper(blue ? 0xf3f7fa : 0xf6e3c2, 0.95)));

  const ribbon = satinRibbon(blue ? 0x2a5aa0 : 0xb6403a, blue ? 0x9dc4ff : 0xffb2a8);
  const knot = transformed(new THREE.SphereGeometry(0.056, 14, 10), new THREE.Vector3(0, -0.84, 0.274), undefined, new THREE.Vector3(1, 0.72, 0.55));
  const parts: THREE.BufferGeometry[] = [knot];
  for (const side of [-1, 1]) {
    const loop = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.026, -0.84, 0.277),
      new THREE.Vector3(side * 0.17, -0.735, 0.29),
      new THREE.Vector3(side * 0.245, -0.8, 0.3),
      new THREE.Vector3(side * 0.16, -0.858, 0.315),
      new THREE.Vector3(side * 0.03, -0.84, 0.277),
    ]);
    parts.push(ribbonGeometry(loop, 0.042));
    const tail = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.023, -0.855, 0.28),
      new THREE.Vector3(side * 0.063, -0.94, 0.31),
      new THREE.Vector3(side * 0.1, -1.025, 0.29),
      new THREE.Vector3(side * 0.15, -1.06, 0.31),
    ]);
    parts.push(ribbonGeometry(tail, 0.06));
  }
  bouquet.add(mesh(merged(parts), ribbon));

  // A gift tag hangs from the knot on a thread.
  const tagMaterial = satin(0xffffff, 0.9, { map: tagTexture(blue) ?? undefined });
  if (!tagMaterial.map) tagMaterial.color.setHex(blue ? 0xf3f7fa : 0xf7efe0);
  const tag = mesh(new THREE.PlaneGeometry(0.16, 0.23), tagMaterial);
  tag.position.set(0.21, -1.02, 0.34);
  tag.rotation.set(0.06, 0.18, -0.2);
  const thread = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.02, -0.86, 0.29), new THREE.Vector3(0.12, -0.93, 0.32), new THREE.Vector3(0.175, -0.965, 0.33)]);
  bouquet.add(tag, new THREE.Line(thread, new THREE.LineBasicMaterial({ color: blue ? 0x4f6f96 : 0x9a6a4a })));
}

function ribbonGeometry(curve: THREE.CatmullRomCurve3, width: number): THREE.BufferGeometry {
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let index = 0; index <= 24; index += 1) {
    const t = index / 24;
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t);
    const across = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize().multiplyScalar(width * 0.5);
    for (const side of [-1, 1]) {
      vertices.push(point.x + across.x * side, point.y + across.y * side, point.z + Math.sin(t * Math.PI) * 0.008);
      uvs.push(t, side > 0 ? 1 : 0);
    }
    if (index < 24) {
      const a = index * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function disposeIntroFlower(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  root.traverse((child) => {
    if (child instanceof THREE.InstancedMesh) child.dispose();
    if (!(child instanceof THREE.Mesh || child instanceof THREE.Line)) return;
    geometries.add(child.geometry);
    const collection = Array.isArray(child.material) ? child.material : [child.material];
    collection.forEach((material) => materials.add(material));
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => {
    if (material instanceof THREE.MeshStandardMaterial) {
      material.map?.dispose();
      material.bumpMap?.dispose();
    }
    material.dispose();
  });
}
