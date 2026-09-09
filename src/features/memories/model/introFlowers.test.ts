import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";
import { createIntroFlower, disposeIntroFlower, type IntroFlowerVariant } from "./introFlowers";

describe.each<IntroFlowerVariant>(["sunflower", "hydrangea"])("%s cabinet specimen", (variant) => {
  it("fits the cabinet and keeps the pedestal independent of the animated bouquet", () => {
    const root = createIntroFlower(variant);
    const bouquet = root.getObjectByName("bouquet")!;
    const bounds = new THREE.Box3().setFromObject(bouquet);
    expect(bouquet.parent).toBe(root);
    expect(root.getObjectByName("pedestal")?.parent).toBe(root);
    expect(bounds.min.x).toBeGreaterThan(-1.1);
    expect(bounds.max.x).toBeLessThan(1.1);
    expect(bounds.min.y).toBeGreaterThan(-1.2);
    expect(bounds.max.y).toBeLessThan(1.55);
    expect(bounds.max.z).toBeLessThan(0.8);
    disposeIntroFlower(root);
  });

  it("releases shared geometries and materials exactly once, including linework and instance buffers", () => {
    const root = createIntroFlower(variant);
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const instanceDisposers: ReturnType<typeof vi.spyOn>[] = [];
    root.traverse((child) => {
      if (child instanceof THREE.InstancedMesh) instanceDisposers.push(vi.spyOn(child, "dispose"));
      if (!(child instanceof THREE.Mesh || child instanceof THREE.Line)) return;
      geometries.add(child.geometry);
      const collection = Array.isArray(child.material) ? child.material : [child.material];
      collection.forEach((material) => materials.add(material));
    });
    const disposers = [...geometries, ...materials].map((resource) => vi.spyOn(resource, "dispose"));
    disposeIntroFlower(root);
    for (const disposer of [...disposers, ...instanceDisposers]) expect(disposer).toHaveBeenCalledTimes(1);
  });
});

it("uses four blue petals per hydrangea floret within a small draw-call budget", () => {
  const root = createIntroFlower("hydrangea");
  const petals = root.getObjectByName("four-petal-blue-florets") as THREE.InstancedMesh;
  const centers = root.getObjectByName("pale-floret-centers") as THREE.InstancedMesh;
  expect(petals.count).toBe(centers.count * 4);
  expect(centers.count).toBeGreaterThan(250);
  const drawables: THREE.Object3D[] = [];
  root.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Line) drawables.push(child);
  });
  expect(drawables.length).toBeLessThan(30);
  disposeIntroFlower(root);
});
