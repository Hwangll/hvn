import * as THREE from "three";
import { disposePlantMaterial } from "../three/bouquet/plantMaterial";
import { finish, type BuildSteps } from "./flowers/common";
import { buildHydrangeaBouquet } from "./flowers/hydrangea";
import { buildSunflowerBouquet } from "./flowers/sunflower";
import { IVORY_WRAP, KRAFT_WRAP, buildWrap } from "./flowers/wrap";

export type IntroFlowerVariant = "sunflower" | "hydrangea";

/**
 * One specimen, a slice at a time: the bouquet group (the part that sways and turns) inside a root the stage places on
 * its plinth. The stage builds the bouquet not on show this way, in the gaps between frames.
 */
export function* introFlowerSteps(variant: IntroFlowerVariant): BuildSteps<THREE.Group> {
  const root = new THREE.Group();
  root.name = `intro-${variant}`;
  const bouquet = new THREE.Group();
  bouquet.name = "bouquet";
  yield* variant === "sunflower" ? buildSunflowerBouquet(bouquet) : buildHydrangeaBouquet(bouquet);
  yield* buildWrap(bouquet, variant === "sunflower" ? KRAFT_WRAP : IVORY_WRAP);
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
