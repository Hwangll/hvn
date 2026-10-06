import * as THREE from "three";
import { attachPlantShadow, createPlantMaterial, type PlantMaterialOptions, type PlantPart } from "./plantMaterial";

/**
 * A modelled bouquet (a loaded glTF scene) made ready for the cabinet: it ends up just like a bouquet built in code, so
 * the stage, the breeze, the shadows and disposal treat both the same.
 */

/**
 * Words a modeller can name an object with, and the part of a plant each stands for. The first word of an object's
 * name that is one of these (or else of the nearest parent's name) decides how it bends, shivers and lets light
 * through.
 */
const PART_WORDS: Array<[PlantPart, string[]]> = [
  ["petal", ["petal", "petals", "sepal", "sepals", "tepal", "tepals", "ray", "rays"]],
  ["leaf", ["leaf", "leaves", "bract", "bracts", "foliage"]],
  ["stem", ["stem", "stems", "stalk", "stalks", "branch", "branches", "twig", "twigs"]],
  ["seed", ["seed", "seeds", "disc", "discs", "disk", "disks", "center", "centers", "centre", "centres", "bud", "buds", "stamen", "stamens", "pistil"]],
  ["wrap", ["wrap", "wrapper", "paper", "ribbon", "bow", "tag", "twine", "string"]],
];

export function plantPartOf(name: string): PlantPart | null {
  for (const word of name.toLowerCase().split(/[^a-z]+/)) {
    const match = word ? PART_WORDS.find(([, words]) => words.includes(word)) : undefined;
    if (match) return match[0];
  }
  return null;
}

const PARTS: readonly string[] = ["petal", "leaf", "stem", "seed", "wrap"];

/**
 * The part an object is: a `plantPart` custom property (glTF extras) on it or a parent wins, "none" keeping it still;
 * otherwise its name, or the nearest parent's.
 */
function partOf(object: THREE.Object3D, scene: THREE.Object3D): PlantPart | null {
  for (let node: THREE.Object3D | null = object; node; node = node === scene ? null : node.parent) {
    const declared = node.userData.plantPart;
    if (declared === "none") return null;
    if (typeof declared === "string" && PARTS.includes(declared)) return declared as PlantPart;
    const part = plantPartOf(node.name);
    if (part) return part;
  }
  return null;
}

/** A colour from a custom property: "#rrggbb", or the [r, g, b] list Blender writes for a colour property. */
function colorFrom(value: unknown): THREE.Color | undefined {
  if (typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)) return new THREE.Color(value);
  if (Array.isArray(value) && value.length >= 3 && value.every((channel) => typeof channel === "number")) return new THREE.Color(value[0], value[1], value[2]);
  return undefined;
}

const numberFrom = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : undefined);

/** Standard glTF material settings a plant material keeps. Metalness and transmission are left behind on purpose. */
const CARRIED = [
  "color", "map", "normalMap", "normalScale", "roughness", "roughnessMap", "aoMap", "aoMapIntensity",
  "alphaMap", "alphaTest", "transparent", "opacity", "emissive", "emissiveMap", "emissiveIntensity",
  "sheen", "sheenColor", "sheenColorMap", "sheenRoughness", "sheenRoughnessMap",
  "clearcoat", "clearcoatMap", "clearcoatRoughness", "clearcoatRoughnessMap", "clearcoatNormalMap", "clearcoatNormalScale",
  "specularIntensity", "specularIntensityMap", "specularColor", "specularColorMap", "anisotropy", "anisotropyMap", "anisotropyRotation",
] as const;

/**
 * The plant material for a part, keeping the model's own look. Light through a modelled petal is tinted by the petal's
 * own colour alone unless the material says otherwise; custom properties on the material (glTF extras) can set
 * `translucency`, `translucencyColor`, `backTint`, `sway` and `flutter` (see plantMaterial).
 */
function plantMaterialFrom(source: THREE.Material, part: PlantPart, anchored: boolean): THREE.MeshPhysicalMaterial {
  const physical = source as Partial<Record<(typeof CARRIED)[number], unknown>> & { vertexColors?: boolean };
  const extras = source.userData;
  const parameters: PlantMaterialOptions = {
    part,
    anchored,
    rigid: anchored && part !== "stem",
    vertexColors: Boolean(physical.vertexColors),
    name: source.name,
    translucency: numberFrom(extras.translucency),
    translucencyColor: colorFrom(extras.translucencyColor) ?? 0xffffff,
    backTint: colorFrom(extras.backTint),
    sway: numberFrom(extras.sway),
    flutter: numberFrom(extras.flutter),
  };
  const target = parameters as unknown as Record<string, unknown>;
  for (const key of CARRIED) {
    const value = physical[key];
    if (value === undefined || value === null) continue;
    target[key] = value instanceof THREE.Vector2 || value instanceof THREE.Color ? value.clone() : value;
  }
  if (source.side === THREE.DoubleSide) parameters.side = THREE.DoubleSide;
  return createPlantMaterial(parameters);
}

/** Every part of a merged mesh sways around one anchor: its centre, with a seed of its own for the shiver. */
function anchorAt(geometry: THREE.BufferGeometry, seed: number): void {
  geometry.computeBoundingBox();
  const center = geometry.boundingBox!.getCenter(new THREE.Vector3());
  const count = geometry.getAttribute("position").count;
  const data = new Float32Array(count * 4);
  const phase = (seed * 0.618034) % 1;
  for (let index = 0; index < count; index += 1) data.set([center.x, center.y, center.z, phase], index * 4);
  geometry.setAttribute("plantAnchor", new THREE.BufferAttribute(data, 4));
}

/**
 * Compressed files store positions and normals as small (often normalised) integers, or interleaved; baking a transform
 * into those would clip whatever leaves their range, so they are unpacked to plain floats first.
 */
function unpack(geometry: THREE.BufferGeometry): void {
  for (const name of ["position", "normal", "tangent"]) {
    const attribute = geometry.getAttribute(name);
    if (!attribute || (attribute instanceof THREE.BufferAttribute && attribute.array instanceof Float32Array)) continue;
    const floats = new THREE.Float32BufferAttribute(attribute.count * attribute.itemSize, attribute.itemSize);
    for (let index = 0; index < attribute.count; index += 1) {
      for (let component = 0; component < attribute.itemSize; component += 1) floats.setComponent(index, component, attribute.getComponent(index, component));
    }
    geometry.setAttribute(name, floats);
  }
}

/** A mirrored transform turns triangles inside out; swapping two corners of each puts their front faces back outside. */
function flipWinding(geometry: THREE.BufferGeometry): void {
  const index = geometry.getIndex();
  if (index) {
    for (let corner = 0; corner + 2 < index.count; corner += 3) {
      const second = index.getX(corner + 1);
      index.setX(corner + 1, index.getX(corner + 2));
      index.setX(corner + 2, second);
    }
    index.needsUpdate = true;
    return;
  }
  for (const attribute of Object.values(geometry.attributes)) {
    for (let vertex = 0; vertex + 2 < attribute.count; vertex += 3) {
      for (let component = 0; component < attribute.itemSize; component += 1) {
        const second = attribute.getComponent(vertex + 1, component);
        attribute.setComponent(vertex + 1, component, attribute.getComponent(vertex + 2, component));
        attribute.setComponent(vertex + 2, component, second);
      }
    }
    attribute.needsUpdate = true;
  }
}

export interface PlantModelOptions {
  /** Height the model is scaled to, in bouquet units: about what the bouquets built in code stand. */
  height?: number;
  /** Bouquet-space height of the plinth top it stands on. */
  floor?: number;
}

/**
 * Turns a loaded glTF scene into a specimen like those built in code: a root holding one "bouquet" group, centred on
 * the plinth and scaled to the bouquet's height (so it can be modelled at any size, with its front toward +Z), every
 * mesh's transform baked into its geometry (the breeze works in bouquet space), and every mesh given the plant
 * material its name asks for. A mesh sways around its own centre as one piece, so what a modeller joins into one
 * object moves together; an instanced mesh's copies each sway on their own. Parts with no recognised name keep their
 * own material and stay still. Replaced materials are released; their textures carry over.
 */
export function prepareGlbBouquet(scene: THREE.Object3D, { height = 2.55, floor = -1.15 }: PlantModelOptions = {}): THREE.Group {
  scene.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(scene);
  if (bounds.isEmpty()) throw new Error("The bouquet model has no meshes.");
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const scale = height / Math.max(size.y, 1e-6);
  const fit = new THREE.Matrix4().makeTranslation(0, floor, 0)
    .multiply(new THREE.Matrix4().makeScale(scale, scale, scale))
    .multiply(new THREE.Matrix4().makeTranslation(-center.x, -bounds.min.y, -center.z));

  const meshes: THREE.Mesh[] = [];
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) meshes.push(child);
  });
  const users = new Map<THREE.BufferGeometry, number>();
  meshes.forEach((mesh) => users.set(mesh.geometry, (users.get(mesh.geometry) ?? 0) + 1));
  const converted = new Map<THREE.Material, Map<string, THREE.MeshPhysicalMaterial>>();
  const replaced = new Set<THREE.Material>();
  const convert = (material: THREE.Material, part: PlantPart, anchored: boolean) => {
    const variants = converted.get(material) ?? new Map<string, THREE.MeshPhysicalMaterial>();
    converted.set(material, variants);
    const key = `${part}-${anchored}`;
    if (!variants.has(key)) variants.set(key, plantMaterialFrom(material, part, anchored));
    replaced.add(material);
    return variants.get(key)!;
  };

  const bouquet = new THREE.Group();
  bouquet.name = "bouquet";
  const relative = new THREE.Matrix4();
  const instance = new THREE.Matrix4();
  meshes.forEach((mesh, index) => {
    const part = partOf(mesh, scene);
    relative.multiplyMatrices(fit, mesh.matrixWorld);
    const instanced = mesh instanceof THREE.InstancedMesh;
    if (instanced) {
      for (let copy = 0; copy < mesh.count; copy += 1) {
        mesh.getMatrixAt(copy, instance);
        mesh.setMatrixAt(copy, instance.premultiply(relative));
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    } else {
      // A geometry used by several objects is copied for all but the last, so each can take its own transform.
      const remaining = users.get(mesh.geometry) ?? 1;
      users.set(mesh.geometry, remaining - 1);
      if (remaining > 1) mesh.geometry = mesh.geometry.clone();
      unpack(mesh.geometry);
      mesh.geometry.applyMatrix4(relative);
      if (relative.determinant() < 0) flipWinding(mesh.geometry);
    }
    mesh.position.set(0, 0, 0);
    mesh.quaternion.identity();
    mesh.scale.set(1, 1, 1);
    mesh.updateMatrix();
    if (part) {
      if (!instanced) anchorAt(mesh.geometry, index + 1);
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map((material) => convert(material, part, !instanced))
        : convert(mesh.material, part, !instanced);
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    bouquet.add(attachPlantShadow(mesh));
  });
  replaced.forEach((material) => material.dispose());

  const root = new THREE.Group();
  root.name = "intro-glb";
  root.add(bouquet);
  return root;
}
