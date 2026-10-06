import * as THREE from "three";
import {
  plantBeginVertex,
  plantColorFragment,
  plantFragmentHeader,
  plantProjectVertex,
  plantTranslucencyFragment,
  plantVertexHeader,
  plantWorldPosVertex,
} from "./plantShader";

/** What a mesh is, by the name a modeller would give it; decides how it bends, shivers and lets light through. */
export type PlantPart = "petal" | "leaf" | "stem" | "seed" | "wrap";

export interface PlantMaterialOptions extends THREE.MeshPhysicalMaterialParameters {
  part: PlantPart;
  /** How far the part leans with the breeze, 0 (rooted) to 1. */
  sway?: number;
  /** How much it shivers on its own (thin parts), 0 to 1. */
  flutter?: number;
  /** Fake subsurface: how much back light glows through, 0 (opaque) up. */
  translucency?: number;
  translucencyColor?: THREE.ColorRepresentation;
  /** PBR slot: thickness (red channel, 1 = thin), modulates the translucency. */
  thicknessMap?: THREE.Texture | null;
  /**
   * The geometry is many parts merged into one, each carrying a `plantAnchor` attribute (see PartBatch): the point it
   * sways around and a seed for its shiver.
   */
  anchored?: boolean;
  /** With anchors: each part bends by its anchor's height, travelling as one piece (a flower head, a leaf). */
  rigid?: boolean;
  /** Multiplies the colour of back faces: the paler underside of a petal or leaf. */
  backTint?: THREE.ColorRepresentation;
}

interface PartDefaults {
  roughness: number;
  sway: number;
  flutter: number;
  translucency: number;
  translucencyColor: number;
  sheen: number;
  /** Petals and leaves are thin sheets whose uv runs across (x) and base to tip (y). */
  thinEdges: boolean;
}

/** Clearly different surfaces: matte paper, coarse seeds, waxy leaves, silky petals. */
const PART_DEFAULTS: Record<PlantPart, PartDefaults> = {
  petal: { roughness: 0.58, sway: 1, flutter: 0.55, translucency: 0.42, translucencyColor: 0xffd59a, sheen: 0.5, thinEdges: true },
  leaf: { roughness: 0.42, sway: 0.85, flutter: 0.25, translucency: 0.35, translucencyColor: 0xb8e07a, sheen: 0.15, thinEdges: true },
  stem: { roughness: 0.6, sway: 1, flutter: 0, translucency: 0.08, translucencyColor: 0xa8d08a, sheen: 0.25, thinEdges: false },
  seed: { roughness: 0.92, sway: 1, flutter: 0, translucency: 0, translucencyColor: 0xffffff, sheen: 0, thinEdges: false },
  wrap: { roughness: 0.94, sway: 0, flutter: 0, translucency: 0.12, translucencyColor: 0xfff2dd, sheen: 0.2, thinEdges: false },
};

/** One breeze for the whole room: every plant material reads these, so one update moves all of them. */
export const plantWind = {
  uniforms: {
    plantTime: { value: 0 },
    plantWindStrength: { value: 0.03 },
    plantWindSpeed: { value: 0.6 },
    plantWindDirection: { value: new THREE.Vector2(0.92, 0.38).normalize() },
    /** Bouquet-space height of the wrap's top edge, where bending starts. */
    plantWindBase: { value: -0.78 },
    /** Height over which the bend reaches full strength. */
    plantWindHeight: { value: 2.1 },
  },
  /** windStrength: tip travel in bouquet units; windSpeed: how quickly the gusts come and go. */
  configure({ windStrength, windSpeed }: { windStrength?: number; windSpeed?: number }) {
    if (windStrength !== undefined) this.uniforms.plantWindStrength.value = windStrength;
    if (windSpeed !== undefined) this.uniforms.plantWindSpeed.value = windSpeed;
  },
  advance(seconds: number) {
    this.uniforms.plantTime.value += seconds;
  },
};

interface PlantUniforms {
  plantSway: { value: number };
  plantFlutter: { value: number };
  plantTranslucency: { value: number };
  plantTranslucencyColor: { value: THREE.Color };
  plantThicknessMap: { value: THREE.Texture | null };
  plantBackTint: { value: THREE.Color };
}

interface PlantRecord {
  part: PlantPart;
  uniforms: PlantUniforms;
  windDefines: Record<string, string>;
  depth: THREE.MeshDepthMaterial | null;
}

/**
 * What makes a material a plant material, kept beside it rather than in its userData: userData is copied as plain data
 * by material.clone() and written into a glTF file's extras, and a copy read back must not pass for the real thing.
 */
const plants = new WeakMap<THREE.Material, PlantRecord>();

function injectWind(shader: THREE.WebGLProgramParametersWithUniforms, uniforms: PlantUniforms): void {
  Object.assign(shader.uniforms, plantWind.uniforms, { plantSway: uniforms.plantSway, plantFlutter: uniforms.plantFlutter });
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", `#include <common>\n${plantVertexHeader}`)
    .replace("#include <begin_vertex>", plantBeginVertex)
    .replace("#include <project_vertex>", plantProjectVertex)
    .replace("#include <worldpos_vertex>", plantWorldPosVertex);
}

/**
 * A physical material for one part of a plant, with the breeze in its vertex shader and back-light translucency in its
 * fragment shader. The standard PBR slots (map, normalMap, roughnessMap, aoMap) pass straight through.
 */
export function createPlantMaterial({
  part, sway, flutter, translucency, translucencyColor, thicknessMap = null, anchored = false, rigid = false, backTint, ...parameters
}: PlantMaterialOptions): THREE.MeshPhysicalMaterial {
  const defaults = PART_DEFAULTS[part];
  const material = new THREE.MeshPhysicalMaterial({
    roughness: defaults.roughness,
    metalness: 0,
    sheen: defaults.sheen,
    sheenRoughness: 0.6,
    side: part === "seed" || part === "stem" ? THREE.FrontSide : THREE.DoubleSide,
    ...parameters,
  });
  const uniforms: PlantUniforms = {
    plantSway: { value: sway ?? defaults.sway },
    plantFlutter: { value: flutter ?? defaults.flutter },
    plantTranslucency: { value: translucency ?? defaults.translucency },
    plantTranslucencyColor: { value: new THREE.Color(translucencyColor ?? defaults.translucencyColor) },
    plantThicknessMap: { value: thicknessMap },
    plantBackTint: { value: new THREE.Color(backTint ?? 0xffffff) },
  };
  const thinEdges = defaults.thinEdges;
  const windDefines: Record<string, string> = { ...(anchored ? { USE_PLANT_ANCHOR: "" } : {}), ...(anchored && rigid ? { PLANT_RIGID: "" } : {}) };
  material.defines = {
    ...material.defines,
    ...windDefines,
    ...(thinEdges ? { USE_UV: "", PLANT_THIN_EDGES: "" } : {}),
    ...(thicknessMap ? { USE_UV: "", USE_PLANT_THICKNESSMAP: "" } : {}),
    ...(backTint !== undefined ? { PLANT_BACK_TINT: "" } : {}),
  };
  plants.set(material, { part, uniforms, windDefines, depth: null });
  material.onBeforeCompile = (shader) => {
    injectWind(shader, uniforms);
    Object.assign(shader.uniforms, {
      plantTranslucency: uniforms.plantTranslucency,
      plantTranslucencyColor: uniforms.plantTranslucencyColor,
      plantThicknessMap: uniforms.plantThicknessMap,
      plantBackTint: uniforms.plantBackTint,
    });
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${plantFragmentHeader}`)
      .replace("#include <color_fragment>", plantColorFragment)
      .replace("#include <lights_fragment_end>", plantTranslucencyFragment);
  };
  const key = ["plant", thinEdges ? "thin" : "solid", thicknessMap ? "thick" : "plain", ...Object.keys(windDefines), backTint !== undefined ? "back" : "front"].join("-");
  material.customProgramCacheKey = () => key;
  return material;
}

export function isPlantMaterial(material: THREE.Material): material is THREE.MeshPhysicalMaterial {
  return plants.has(material);
}

/** The part a plant material was made for, or null for any other material. */
export function plantPartOfMaterial(material: THREE.Material): PlantPart | null {
  return plants.get(material)?.part ?? null;
}

/**
 * The shadow-pass twin of a plant material: the same breeze, so cast shadows sway with the petals. Created once per
 * material and shared by every mesh using it; released with disposePlantMaterial.
 */
export function plantDepthMaterial(material: THREE.Material): THREE.MeshDepthMaterial | null {
  const plant = plants.get(material);
  if (!plant || plant.part === "wrap") return null;
  if (!plant.depth) {
    const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: material.side });
    depth.defines = { ...depth.defines, ...plant.windDefines };
    depth.onBeforeCompile = (shader) => injectWind(shader, plant.uniforms);
    const key = ["plant-depth", ...Object.keys(plant.windDefines)].join("-");
    depth.customProgramCacheKey = () => key;
    plant.depth = depth;
  }
  return plant.depth;
}

/** Gives a mesh the shadow twin of its plant material, so its shadow moves with it. */
export function attachPlantShadow<T extends THREE.Mesh>(mesh: T): T {
  const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  const depth = material ? plantDepthMaterial(material) : null;
  if (depth) mesh.customDepthMaterial = depth;
  return mesh;
}

export function disposePlantMaterial(material: THREE.Material): void {
  const plant = plants.get(material);
  if (!plant) return;
  plant.depth?.dispose();
  plant.depth = null;
  plant.uniforms.plantThicknessMap.value?.dispose();
}
