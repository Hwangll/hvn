import * as THREE from "three";
import { disposePlantMaterial } from "../three/bouquet/plantMaterial";
import { addHydrangeaBouquet } from "./flowers/hydrangea";
import { addSunflowerBouquet } from "./flowers/sunflower";
import { IVORY_WRAP, KRAFT_WRAP, addWrap } from "./flowers/wrap";

export type IntroFlowerVariant = "sunflower" | "hydrangea";

/** One specimen: the bouquet group (the part that sways and turns) inside a root the stage places on its plinth. */
export function createIntroFlower(variant: IntroFlowerVariant): THREE.Group {
  const root = new THREE.Group();
  root.name = `intro-${variant}`;
  const bouquet = new THREE.Group();
  bouquet.name = "bouquet";
  if (variant === "sunflower") addSunflowerBouquet(bouquet);
  else addHydrangeaBouquet(bouquet);
  addWrap(bouquet, variant === "sunflower" ? KRAFT_WRAP : IVORY_WRAP);
  root.add(bouquet);
  return root;
}

const TEXTURE_SLOTS = ["map", "normalMap", "bumpMap", "roughnessMap", "aoMap"] as const;

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
    if (material instanceof THREE.MeshStandardMaterial) {
      for (const slot of TEXTURE_SLOTS) {
        const texture = material[slot];
        if (texture) textures.add(texture);
      }
    }
    disposePlantMaterial(material);
    material.dispose();
  });
  textures.forEach((texture) => texture.dispose());
}
