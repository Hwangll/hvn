import * as THREE from "three";
import { disposePlantMaterial } from "../three/bouquet/plantMaterial";
import { finish, type BuildSteps } from "./flowers/common";
import { buildHydrangeaBouquet } from "./flowers/hydrangea";
import { buildLilyBouquet } from "./flowers/lily";
import { buildSunflowerBouquet } from "./flowers/sunflower";
import { CHAMPAGNE_WRAP, IVORY_WRAP, KRAFT_WRAP, buildWrap, type WrapPalette } from "./flowers/wrap";

/** One keepsake for each part of the story: sunflowers for Phần I, hydrangeas for Phần II, red lilies for Phần III. */
export type IntroFlowerVariant = "sunflower" | "hydrangea" | "lily";

/** How each keepsake is made: its flowers, and the paper they are wrapped in. */
const recipes: Record<IntroFlowerVariant, { build: (bouquet: THREE.Group) => BuildSteps; wrap: WrapPalette }> = {
  sunflower: { build: buildSunflowerBouquet, wrap: KRAFT_WRAP },
  hydrangea: { build: buildHydrangeaBouquet, wrap: IVORY_WRAP },
  lily: { build: buildLilyBouquet, wrap: CHAMPAGNE_WRAP },
};

/**
 * One specimen, a slice at a time: the bouquet group (the part that sways and turns) inside a root the stage places on
 * its plinth. The stage builds the bouquets not on show this way, in the gaps between frames.
 */
export function* introFlowerSteps(variant: IntroFlowerVariant): BuildSteps<THREE.Group> {
  const root = new THREE.Group();
  root.name = `intro-${variant}`;
  const bouquet = new THREE.Group();
  bouquet.name = "bouquet";
  yield* recipes[variant].build(bouquet);
  yield* buildWrap(bouquet, recipes[variant].wrap);
  root.add(bouquet);
  return root;
}

/** One specimen, built at once. */
export function createIntroFlower(variant: IntroFlowerVariant): THREE.Group {
  return finish(introFlowerSteps(variant));
}

/** Releases a specimen, built in code or loaded: its geometries, materials and every texture they hold, each once. */
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
  const textures = new Set<THREE.Texture>();
  materials.forEach((material) => {
    for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
    disposePlantMaterial(material);
    material.dispose();
  });
  textures.forEach((texture) => texture.dispose());
}
