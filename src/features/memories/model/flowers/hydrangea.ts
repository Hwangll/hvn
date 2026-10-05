import * as THREE from "three";
import { createPlantMaterial, type PlantPart } from "../../three/bouquet/plantMaterial";
import { GOLDEN_ANGLE, instanced, jitter, merged, mesh, smooth, transformed } from "./common";

/**
 * The hydrangea keepsake as first built: mopheads of four-petalled florets, eucalyptus, and leaves on tapered stems.
 * It keeps its original construction until it is rebuilt to the standard of the sunflowers; it already shares their
 * studio, materials and wrap.
 */

const FRONT = new THREE.Vector3(0, 0, 1);

/** A plant surface: the breeze and back-light translucency come with the part it is (see plantMaterial). */
function satin(part: PlantPart, color: number, roughness = 0.82, extra: THREE.MeshPhysicalMaterialParameters = {}): THREE.MeshPhysicalMaterial {
  return createPlantMaterial({ part, color, roughness, ...extra });
}

type SurfaceKind = "sepal" | "leaf";

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
 * Procedural surface detail: soft radial veins (sepals) or a pinnate vein net (leaves). Near-white, so it only
 * modulates the vertex and instance colours, and it doubles as a bump map so the detail catches the light.
 */
function surfaceTexture(kind: SurfaceKind): THREE.CanvasTexture | null {
  const texture = canvasTexture(256, 512, (context, width, height) => {
    context.fillStyle = "#f4f4f4";
    context.fillRect(0, 0, width, height);
    context.lineCap = "round";
    if (kind === "sepal") {
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
    }
  });
  return texture;
}

/** Velvety petal surface: vertex tints multiply the per-instance colour; back light glows through in `glow`. */
function petalMaterial(sheenColor: number, kind: SurfaceKind, bumpScale = 0.004, glow?: number): THREE.MeshPhysicalMaterial {
  const texture = surfaceTexture(kind);
  return createPlantMaterial({
    part: kind === "leaf" ? "leaf" : "petal",
    translucencyColor: glow,
    color: 0xffffff,
    roughness: 0.62,
    sheen: 0.55,
    sheenRoughness: 0.7,
    sheenColor,
    vertexColors: true,
    map: texture,
    bumpMap: texture,
    bumpScale,
  });
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
  const material = petalMaterial(0xcfe3ff, "sepal", 0.0035, 0xc4d6ff);
  const centerGeometry = new THREE.SphereGeometry(0.0125, 6, 4);
  const centerMaterial = satin("seed", 0xffffff, 0.6);
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
  const buds = instanced(budGeometry, satin("seed", 0xffffff, 0.7), budsPerHead * heads.length, "unopened-buds");
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
  bouquet.add(mesh(merged(inners), satin("seed", 0x4a72b8, 0.98)), buds, florets, centers);
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
function addFoliage(bouquet: THREE.Group, stems: THREE.BufferGeometry[]): void {
  const blue = true;
  const targets: [number, number, number][] = [[-0.08, 0.7, 0.02], [0.43, 0.2, 0], [-0.48, 0.13, -0.14]];
  for (const target of targets) stems.push(taperedTube(stemCurve(target), 0.036, 0.024, 22, 9));

  const leaf = leafGeometry(blue ? 0.7 : 0.66, blue ? 0.25 : 0.2, !blue);
  const leafTexture = surfaceTexture("leaf");
  const leafMaterial = satin("leaf", 0xffffff, 0.68, { vertexColors: true, map: leafTexture, bumpMap: leafTexture, bumpScale: 0.007 });
  // Kept inside the opening of the taller shared wrap until the hydrangea is rebuilt.
  const leaves: LeafSpec[] = [
    { x: -0.16, y: -0.36, z: -0.02, angle: 0.62, scale: 0.72, tone: 0x2f6b46 },
    { x: 0.18, y: -0.32, z: -0.08, angle: -0.66, scale: 0.72, tone: 0x3f8354 },
    { x: -0.24, y: -0.22, z: -0.22, angle: 0.8, scale: 0.62, tilt: -0.4, tone: 0x244f37 },
    { x: 0.27, y: -0.18, z: -0.2, angle: -0.84, scale: 0.6, tilt: 0.4, tone: 0x2c6641 },
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

/** Silver-dollar eucalyptus: round grey-green leaves paired along reddish stems, the classic partner to blue hydrangea. */
function addEucalyptus(bouquet: THREE.Group): void {
  const tips: [number, number, number][] = [[-0.9, 0.74, -0.3], [0.88, 0.86, -0.32], [0.14, 1.36, -0.4], [-0.5, 1.16, -0.42]];
  const leavesPerStem = 30;
  const leafGeometryDisc = new THREE.CircleGeometry(1, 18);
  const leafMaterial = satin("leaf", 0xffffff, 0.72, { sheen: 0.3, sheenRoughness: 0.7, sheenColor: 0xdcebe4 });
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
  bouquet.add(mesh(merged(stems), satin("stem", 0x5e4036, 0.85)), leaves);
}

/** Builds the hydrangea bouquet into `bouquet`; the wrap is added separately. */
export function addHydrangeaBouquet(bouquet: THREE.Group): void {
  const stems: THREE.BufferGeometry[] = [];
  addFoliage(bouquet, stems);
  addEucalyptus(bouquet);
  addHydrangea(bouquet);
  bouquet.add(mesh(merged(stems), satin("stem", 0x3d7048, 0.86)));
}
