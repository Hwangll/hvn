import * as THREE from "three";

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

type SurfaceKind = "ray" | "sepal" | "leaf";

/**
 * Procedural surface detail: fine longitudinal veins (ray petals), soft radial
 * veins (hydrangea sepals) or a pinnate vein net (leaves). Drawn once per
 * specimen; near-white so it only modulates the vertex/instance colours, and it
 * doubles as a bump map so the veins catch the light.
 */
function surfaceTexture(kind: SurfaceKind): THREE.CanvasTexture | null {
  // Without WebGL there is no renderer to sample the texture, so skip the 2D work (and jsdom noise).
  if (typeof document === "undefined" || typeof WebGLRenderingContext === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const width = canvas.width;
  const height = canvas.height;
  context.fillStyle = "#f4f4f4";
  context.fillRect(0, 0, width, height);
  context.lineCap = "round";
  if (kind === "ray") {
    for (let vein = 0; vein < 26; vein += 1) {
      const x = ((vein + 0.5) / 26) * width + (jitter(vein, 1) - 0.5) * 8;
      const strength = vein % 5 === 0 ? 0.22 : 0.1;
      context.strokeStyle = `rgba(120, 70, 20, ${strength})`;
      context.lineWidth = vein % 5 === 0 ? 2.4 : 1.2;
      context.beginPath();
      context.moveTo(x, height);
      context.bezierCurveTo(x + (jitter(vein, 2) - 0.5) * 30, height * 0.62, width / 2 + (x - width / 2) * 0.55, height * 0.28, width / 2 + (x - width / 2) * 0.25, 8);
      context.stroke();
    }
    const glow = context.createLinearGradient(0, 0, 0, height);
    glow.addColorStop(0, "rgba(255,255,255,0.07)");
    glow.addColorStop(0.5, "rgba(255,255,255,0)");
    glow.addColorStop(1, "rgba(90,50,10,0.2)");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);
  } else if (kind === "sepal") {
    context.strokeStyle = "rgba(40, 70, 160, 0.18)";
    for (let vein = -4; vein <= 4; vein += 1) {
      context.lineWidth = vein === 0 ? 3 : 1.4;
      context.beginPath();
      context.moveTo(width / 2, height);
      context.quadraticCurveTo(width / 2 + vein * 26, height * 0.5, width / 2 + vein * 22, 20 + Math.abs(vein) * 22);
      context.stroke();
    }
    const glow = context.createRadialGradient(width / 2, height, 10, width / 2, height * 0.7, height * 0.9);
    glow.addColorStop(0, "rgba(255,255,255,0.16)");
    glow.addColorStop(0.55, "rgba(255,255,255,0)");
    glow.addColorStop(1, "rgba(20,40,120,0.2)");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);
  } else {
    context.strokeStyle = "rgba(200, 230, 170, 0.55)";
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(width / 2, height);
    context.lineTo(width / 2, 12);
    context.stroke();
    context.lineWidth = 2;
    for (let vein = 1; vein <= 9; vein += 1) {
      const y = height - (vein / 10) * height * 0.92;
      for (const side of [-1, 1]) {
        context.beginPath();
        context.moveTo(width / 2, y);
        context.quadraticCurveTo(width / 2 + side * width * 0.28, y - 40, width / 2 + side * width * 0.47, y - 78);
        context.stroke();
      }
    }
    context.strokeStyle = "rgba(30, 70, 40, 0.16)";
    context.lineWidth = 1;
    for (let cell = 0; cell < 90; cell += 1) {
      const x = jitter(cell, 3) * width;
      const y = jitter(cell, 4) * height;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + (jitter(cell, 5) - 0.5) * 40, y + (jitter(cell, 6) - 0.5) * 40);
      context.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Velvety petal surface: vertex tints multiply the per-instance colour. */
function petalMaterial(sheenColor: number, kind: SurfaceKind, bumpScale = 0.004): THREE.MeshPhysicalMaterial {
  const texture = surfaceTexture(kind);
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.66,
    metalness: 0,
    sheen: 0.42,
    sheenRoughness: 0.75,
    sheenColor,
    vertexColors: true,
    side: THREE.DoubleSide,
    map: texture,
    bumpMap: texture,
    bumpScale,
  });
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

/** Both specimens share a cabinet-sized base; the bouquet alone may sway. */
export function createIntroFlower(variant: IntroFlowerVariant): THREE.Group {
  const root = new THREE.Group();
  root.name = `intro-${variant}`;
  const floor = mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.13, 64), satin(0x121722, 0.7));
  floor.name = "pedestal";
  floor.position.y = -1.28;
  const edge = mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.045, 64), satin(0x29303c, 0.74));
  edge.position.y = -1.18;
  root.add(floor, edge);

  const bouquet = new THREE.Group();
  bouquet.name = "bouquet";
  const blue = variant === "hydrangea";
  addFoliage(bouquet, blue);
  addWrapping(bouquet, blue);
  if (blue) addHydrangea(bouquet);
  else addSunflowers(bouquet);
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
  base: THREE.Color;
  mid: THREE.Color;
  tipTint: THREE.Color;
  edge: THREE.Color;
}

/** A thin, curved petal facing +Z with a baked colour gradient (base → tip, centre → edge). */
function petalGeometry(shape: PetalShape): THREE.BufferGeometry {
  const rows = 12;
  const columns = 8;
  const vertices: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const color = new THREE.Color();
  for (let row = 0; row <= rows; row += 1) {
    const t = row / rows;
    const envelope = Math.pow(Math.sin(Math.PI * t), shape.tip);
    for (let column = 0; column <= columns; column += 1) {
      const across = (column / columns) * 2 - 1;
      // A gentle ripple along the edges keeps the silhouette from looking die-cut.
      const ripple = 1 + Math.sin(t * 11 + across * 2) * 0.05 * Math.pow(Math.abs(across), 3);
      vertices.push(
        across * shape.width * envelope * ripple,
        t * shape.length,
        shape.cup * across * across * shape.width * envelope - shape.curl * Math.pow(t, 2.3) * shape.length + Math.sin(t * Math.PI) * shape.length * 0.04 + Math.sin(across * 6 + t * 5) * shape.width * 0.03,
      );
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

function addSunflowers(bouquet: THREE.Group): void {
  const rayPetal = petalGeometry({
    length: 0.5, width: 0.088, tip: 0.7, curl: 0.24, cup: 0.3,
    base: new THREE.Color(0.66, 0.38, 0.16), mid: new THREE.Color(1, 0.94, 0.78), tipTint: new THREE.Color(1.04, 0.98, 0.76), edge: new THREE.Color(0.84, 0.66, 0.4),
  });
  const bract = petalGeometry({
    length: 0.3, width: 0.085, tip: 0.95, curl: 0.4, cup: 0.12,
    base: new THREE.Color(0.65, 0.82, 0.55), mid: new THREE.Color(1, 1, 1), tipTint: new THREE.Color(0.9, 1, 0.8), edge: new THREE.Color(0.78, 0.9, 0.7),
  });
  const rayMaterial = petalMaterial(0xffd27a, "ray", 0.005);
  const bractMaterial = petalMaterial(0xb8e0a0, "leaf", 0.003);
  const seedGeometry = new THREE.SphereGeometry(1, 8, 6);
  const seedMaterial = satin(0xffffff, 0.55);
  const domeGeometry = new THREE.SphereGeometry(0.25, 32, 20);
  const domeMaterial = satin(0x2c190d, 0.95);
  const calyxGeometry = new THREE.ConeGeometry(0.2, 0.16, 14, 1, true);
  const calyxMaterial = satin(0x3f7443, 0.9);
  const rings: RingSpec[] = [
    { count: 32, radius: 0.2, scale: 1, lean: 0.32, depth: -0.055, phase: 0, colors: [0xe99a12, 0xf6c23a] },
    { count: 28, radius: 0.196, scale: 0.86, lean: -0.06, depth: -0.014, phase: 0.1, colors: [0xf0ad22, 0xfbd257] },
    { count: 20, radius: 0.19, scale: 0.5, lean: -0.42, depth: 0.012, phase: 0.05, colors: [0xf4b92e, 0xffdc6c] },
  ];
  const blooms = [
    { position: [0.1, 0.72, 0.14], rotation: [-0.09, -0.1, 0.07], scale: 1 },
    { position: [-0.49, 0.13, -0.025], rotation: [-0.16, 0.22, -0.25], scale: 0.64 },
    { position: [0.51, 0.065, -0.09], rotation: [0.03, -0.24, 0.16], scale: 0.57 },
  ];
  const transform = new THREE.Object3D();
  const color = new THREE.Color();
  blooms.forEach((spec, bloomIndex) => {
    const bloom = new THREE.Group();
    bloom.position.fromArray(spec.position);
    bloom.rotation.set(spec.rotation[0], spec.rotation[1], spec.rotation[2]);
    bloom.scale.setScalar(spec.scale);

    const petalCount = rings.reduce((sum, ring) => sum + ring.count, 0);
    const petals = instanced(rayPetal, rayMaterial, petalCount, "golden-petals");
    let petalIndex = 0;
    for (const ring of rings) {
      for (let index = 0; index < ring.count; index += 1) {
        const seed = bloomIndex * 100 + petalIndex;
        const angle = (index / ring.count) * Math.PI * 2 + ring.phase + (jitter(seed, 1) - 0.5) * 0.06;
        transform.position.set(Math.cos(angle) * ring.radius, Math.sin(angle) * ring.radius, ring.depth);
        transform.rotation.set(ring.lean + (jitter(seed, 2) - 0.5) * 0.16, (jitter(seed, 3) - 0.5) * 0.24, angle - Math.PI / 2, "ZXY");
        const grow = ring.scale * (0.92 + jitter(seed, 4) * 0.16);
        transform.scale.set(0.9 + jitter(seed, 5) * 0.2, grow, 1);
        transform.updateMatrix();
        petals.setMatrixAt(petalIndex, transform.matrix);
        petals.setColorAt(petalIndex, color.setHex(ring.colors[0]).lerp(new THREE.Color(ring.colors[1]), jitter(seed, 6)));
        petalIndex += 1;
      }
    }

    const bracts = instanced(bract, bractMaterial, 16, "green-bracts");
    for (let index = 0; index < 16; index += 1) {
      const angle = (index / 16) * Math.PI * 2 + 0.2;
      transform.position.set(Math.cos(angle) * 0.165, Math.sin(angle) * 0.165, -0.1);
      transform.rotation.set(0.62, 0, angle - Math.PI / 2, "ZXY");
      transform.scale.set(1, 0.9 + jitter(index, 7) * 0.25, 1);
      transform.updateMatrix();
      bracts.setMatrixAt(index, transform.matrix);
      bracts.setColorAt(index, color.setHex(0x4d8c47).lerp(new THREE.Color(0x7fb35c), jitter(index, 8)));
    }
    const calyx = mesh(calyxGeometry, calyxMaterial);
    calyx.position.z = -0.14;
    calyx.rotation.x = -Math.PI / 2;

    const dome = mesh(domeGeometry, domeMaterial);
    dome.position.z = 0.02;
    dome.scale.z = 0.42;
    const seedCount = 250;
    const ringFlorets = 44;
    const seeds = instanced(seedGeometry, seedMaterial, seedCount + ringFlorets, "spiral-seeds");
    for (let index = 0; index < seedCount; index += 1) {
      const ratio = (index + 0.5) / seedCount;
      const radius = Math.sqrt(ratio) * 0.222;
      const angle = index * GOLDEN_ANGLE;
      transform.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.02 + Math.sqrt(Math.max(0, 1 - ratio * 0.85)) * 0.105);
      transform.rotation.set(0, 0, angle);
      const size = 0.0075 + ratio * 0.005;
      transform.scale.set(size, size * 1.25, size * 0.8);
      transform.updateMatrix();
      seeds.setMatrixAt(index, transform.matrix);
      const tone = ratio < 0.5 ? (index % 2 ? 0x3d2211 : 0x55301a) : ratio < 0.82 ? (index % 3 ? 0x7d4d22 : 0x5a361b) : (index % 2 ? 0xc48f3d : 0x9a6a2c);
      seeds.setColorAt(index, color.setHex(tone));
    }
    for (let index = 0; index < ringFlorets; index += 1) {
      const angle = (index / ringFlorets) * Math.PI * 2;
      const radius = 0.212 + (index % 2) * 0.008;
      transform.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.02 + Math.sqrt(0.15) * 0.105 + 0.004);
      transform.rotation.set(0, 0, angle);
      transform.scale.set(0.011, 0.014, 0.011);
      transform.updateMatrix();
      seeds.setMatrixAt(seedCount + index, transform.matrix);
      seeds.setColorAt(seedCount + index, color.setHex(index % 2 ? 0xf3c650 : 0xe5ad34));
    }
    bloom.add(calyx, bracts, petals, dome, seeds);
    bouquet.add(bloom);
  });
}

interface HeadSpec {
  center: THREE.Vector3;
  radius: THREE.Vector3;
  count: number;
  palette: number[];
  inner: number;
  seed: number;
}

function addHydrangea(bouquet: THREE.Group): void {
  const petal = petalGeometry({
    length: 0.088, width: 0.064, tip: 0.36, curl: -0.22, cup: 0.14,
    base: new THREE.Color(1.12, 1.08, 1), mid: new THREE.Color(0.7, 0.8, 1), tipTint: new THREE.Color(0.32, 0.48, 1), edge: new THREE.Color(0.28, 0.44, 1),
  });
  const material = petalMaterial(0xcfe3ff, "sepal", 0.0035);
  const centerGeometry = new THREE.SphereGeometry(0.0125, 6, 4);
  const centerMaterial = satin(0xffffff, 0.6);
  const heads: HeadSpec[] = [
    { center: new THREE.Vector3(-0.08, 0.7, 0.06), radius: new THREE.Vector3(0.64, 0.58, 0.4), count: 430, palette: [0x5aa0ee, 0x458ee6, 0x6fb2f2, 0x3a7edc, 0x549be9], inner: 0x143672, seed: 1 },
    { center: new THREE.Vector3(0.43, 0.2, 0.04), radius: new THREE.Vector3(0.38, 0.35, 0.3), count: 215, palette: [0x6f8ce9, 0x5c79e2, 0x829bee, 0x516cda], inner: 0x1b3378, seed: 2 },
    { center: new THREE.Vector3(-0.48, 0.13, -0.11), radius: new THREE.Vector3(0.29, 0.28, 0.24), count: 135, palette: [0x5fbaf0, 0x4aacec, 0x76c8f4, 0x419fe4], inner: 0x144674, seed: 3 },
  ];
  const count = heads.reduce((sum, head) => sum + head.count, 0);
  const florets = instanced(petal, material, count * 4, "four-petal-blue-florets");
  const centers = instanced(centerGeometry, centerMaterial, count, "pale-floret-centers");
  const transform = new THREE.Object3D();
  const floretFrame = new THREE.Object3D();
  const matrix = new THREE.Matrix4();
  const direction = new THREE.Vector3();
  const color = new THREE.Color();
  let floretIndex = 0;
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
      const proud = jitter(seed, 12) > 0.82 ? 0.07 : 0;
      const bump = 1 + lobes * 0.04 + (jitter(seed, 1) - 0.5) * 0.05 + proud;
      floretFrame.position.copy(direction).multiply(head.radius).multiplyScalar(bump).add(head.center);
      floretFrame.quaternion.setFromUnitVectors(FRONT, direction);
      floretFrame.rotateX((jitter(seed, 2) - 0.5) * 0.32);
      floretFrame.rotateY((jitter(seed, 3) - 0.5) * 0.32);
      floretFrame.rotateZ(jitter(seed, 4) * Math.PI * 2);
      floretFrame.updateMatrix();
      const scale = 0.82 + jitter(seed, 5) * 0.34;
      color.setHex(head.palette[Math.floor(jitter(seed, 6) * head.palette.length)]);
      if (jitter(seed, 9) > 0.9) color.lerp(new THREE.Color(0xcfe6fb), 0.55); // the odd paler floret
      for (let petalIndex = 0; petalIndex < 4; petalIndex += 1) {
        const petalAngle = (petalIndex / 4) * Math.PI * 2 + (jitter(seed, 7 + petalIndex) - 0.5) * 0.2;
        transform.position.set(Math.sin(petalAngle) * 0.011, Math.cos(petalAngle) * 0.011, petalIndex % 2 ? 0.003 : 0);
        transform.rotation.set(petalIndex % 2 ? 0.1 : -0.05, 0, -petalAngle, "ZXY");
        transform.scale.set(scale * (0.94 + jitter(seed, 11 + petalIndex) * 0.12), scale, scale);
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
    const inner = mesh(new THREE.SphereGeometry(1, 24, 18), satin(head.inner, 0.98));
    inner.position.copy(head.center);
    inner.scale.copy(head.radius).multiplyScalar(0.92);
    bouquet.add(inner);
  }
  bouquet.add(florets, centers);
}

/** Ovate, softly serrated leaf facing +Z, with a paler midrib baked into the vertex colours. */
function leafGeometry(length: number, width: number): THREE.BufferGeometry {
  const rows = 22;
  const columns = 12;
  const vertices: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const color = new THREE.Color();
  for (let row = 0; row <= rows; row += 1) {
    const t = row / rows;
    const envelope = Math.pow(Math.sin(Math.PI * t), 0.55) * (1 - 0.18 * t);
    for (let column = 0; column <= columns; column += 1) {
      const across = (column / columns) * 2 - 1;
      uvs.push((across + 1) / 2, t);
      const serration = 1 + Math.sin(t * 36) * 0.05 * Math.pow(Math.abs(across), 3);
      vertices.push(
        across * width * envelope * serration,
        t * length,
        across * across * width * 0.28 + t * t * length * 0.1 - Math.sin(Math.PI * t) * 0.03,
      );
      color.setRGB(0.72 + t * 0.34, 0.86 + t * 0.2, 0.68 + t * 0.26);
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

function addFoliage(bouquet: THREE.Group, blue: boolean): void {
  const stemMaterial = satin(0x3d7048, 0.86);
  const targets = blue ? [[-0.08, 0.7, 0.02], [0.43, 0.2, 0], [-0.48, 0.13, -0.14]] : [[0.1, 0.72, 0], [-0.49, 0.13, -0.1], [0.51, 0.065, -0.16]];
  for (const [x, y, z] of targets) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -1.15, -0.02),
      new THREE.Vector3(x * 0.3, -0.58, z),
      new THREE.Vector3(x * 0.87, y - 0.4, z),
      new THREE.Vector3(x, y, z),
    ]);
    bouquet.add(mesh(new THREE.TubeGeometry(curve, 20, 0.03, 8), stemMaterial));
  }
  const leaf = leafGeometry(0.66, blue ? 0.235 : 0.175);
  const leafTexture = surfaceTexture("leaf");
  const materials = [0x2f6b46, 0x3f8354, 0x27573d].map((tone) => satin(tone, 0.72, { vertexColors: true, map: leafTexture, bumpMap: leafTexture, bumpScale: 0.006 }));
  const veinMaterial = new THREE.LineBasicMaterial({ color: 0x9fbf86, transparent: true, opacity: 0.4 });
  const leaves = [
    { x: -0.19, y: -0.5, z: -0.02, angle: 0.96, scale: 1.04 },
    { x: 0.21, y: -0.42, z: -0.08, angle: -1.04, scale: 1.05 },
    { x: -0.08, y: -0.78, z: 0.16, angle: 1.19, scale: 0.68 },
    { x: 0.15, y: -0.68, z: 0.13, angle: -0.55, scale: 0.73 },
  ];
  leaves.forEach((spec, index) => {
    const group = new THREE.Group();
    group.position.set(spec.x, spec.y, spec.z);
    group.rotation.set(-0.08, index % 2 === 0 ? -0.12 : 0.2, spec.angle);
    group.scale.setScalar(spec.scale);
    group.add(mesh(leaf, materials[index % materials.length]));
    const points: number[] = [];
    for (let vein = 1; vein <= 5; vein += 1) {
      const y = vein * 0.092;
      const width = Math.sin((y / 0.66) * Math.PI) * (blue ? 0.17 : 0.13);
      points.push(0, y, 0.026, -width, y + 0.07, 0.04, 0, y, 0.026, width, y + 0.07, 0.04);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    group.add(new THREE.LineSegments(geometry, veinMaterial));
    bouquet.add(group);
  });
}

function paperGeometry(offset: number, radius: number, height: number): THREE.BufferGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];
  const segments = 14;
  for (let row = 0; row <= 4; row += 1) {
    const t = row / 4;
    for (let index = 0; index <= segments; index += 1) {
      const u = index / segments;
      const angle = offset + (u - 0.5) * Math.PI * 1.16;
      const r = 0.15 + t * radius + Math.sin(u * Math.PI * 6) * 0.018 * t;
      const top = Math.sin(u * Math.PI) * 0.12 + Math.sin(u * Math.PI * 3) * 0.025;
      vertices.push(Math.sin(angle) * r, -1.16 + t * (height + top), Math.cos(angle) * r * 0.65 + 0.02);
      if (row < 4 && index < segments) {
        const a = row * (segments + 1) + index;
        indices.push(a, a + 1, a + segments + 1, a + 1, a + segments + 2, a + segments + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function addWrapping(bouquet: THREE.Group, blue: boolean): void {
  const back = mesh(paperGeometry(Math.PI, 0.36, 0.58), satin(blue ? 0xd3e3ec : 0xcfa572, 0.96));
  const left = mesh(paperGeometry(-0.71, 0.3, 0.45), satin(blue ? 0xf0f6f8 : 0xf7e8cb, 0.94));
  const right = mesh(paperGeometry(0.74, 0.32, 0.42), satin(blue ? 0xdde9f0 : 0xf0dcb6, 0.94));
  bouquet.add(back, left, right);
  const material = satin(blue ? 0x22518c : 0xb3443e, 0.58);
  const knot = mesh(new THREE.SphereGeometry(0.056, 12, 8), material);
  knot.position.set(0, -0.84, 0.274);
  knot.scale.set(1, 0.72, 0.55);
  bouquet.add(knot);
  for (const side of [-1, 1]) {
    const loop = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.026, -0.84, 0.277),
      new THREE.Vector3(side * 0.17, -0.735, 0.29),
      new THREE.Vector3(side * 0.245, -0.8, 0.3),
      new THREE.Vector3(side * 0.16, -0.858, 0.315),
      new THREE.Vector3(side * 0.03, -0.84, 0.277),
    ]);
    bouquet.add(mesh(ribbonGeometry(loop, 0.04), material));
    const tail = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.023, -0.855, 0.28),
      new THREE.Vector3(side * 0.063, -0.94, 0.31),
      new THREE.Vector3(side * 0.1, -1.025, 0.29),
      new THREE.Vector3(side * 0.15, -1.06, 0.31),
    ]);
    bouquet.add(mesh(ribbonGeometry(tail, 0.06), material));
  }
}

function ribbonGeometry(curve: THREE.CatmullRomCurve3, width: number): THREE.BufferGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];
  for (let index = 0; index <= 24; index += 1) {
    const t = index / 24;
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t);
    const across = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize().multiplyScalar(width * 0.5);
    for (const side of [-1, 1]) vertices.push(point.x + across.x * side, point.y + across.y * side, point.z + Math.sin(t * Math.PI) * 0.008);
    if (index < 24) {
      const a = index * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
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
