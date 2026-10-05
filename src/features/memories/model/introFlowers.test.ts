import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";
import { createIntroFlower, disposeIntroFlower, type IntroFlowerVariant } from "./introFlowers";

describe.each<IntroFlowerVariant>(["sunflower", "hydrangea"])("%s cabinet specimen", (variant) => {
  it("fits the cabinet, with the bouquet as the one group that sways and turns", () => {
    const root = createIntroFlower(variant);
    const bouquet = root.getObjectByName("bouquet")!;
    const bounds = new THREE.Box3().setFromObject(bouquet);
    expect(bouquet.parent).toBe(root);
    expect(root.children).toEqual([bouquet]);
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

describe("sunflower bouquet", () => {
  it("gives every petal its own shape, each swaying with its head and shivering on its own", () => {
    const root = createIntroFlower("sunflower");
    const rays = root.getObjectByName("sunflower-rays") as THREE.Mesh;
    const anchor = rays.geometry.getAttribute("plantAnchor");
    const heads = new Set<string>();
    const seeds = new Set<number>();
    for (let index = 0; index < anchor.count; index += 1) {
      heads.add([anchor.getX(index), anchor.getY(index), anchor.getZ(index)].map((value) => value.toFixed(3)).join(","));
      seeds.add(anchor.getW(index));
    }
    expect(heads.size).toBe(5);
    // Four heads of 34 rays and a young one of 21.
    expect(seeds.size).toBeGreaterThanOrEqual(150);
    expect((rays.material as THREE.MeshPhysicalMaterial).defines).toMatchObject({ USE_PLANT_ANCHOR: "", PLANT_RIGID: "" });
    disposeIntroFlower(root);
  });

  it("merges heads, leaves, stems and wrap into a handful of draw calls", () => {
    const root = createIntroFlower("sunflower");
    const drawables: THREE.Object3D[] = [];
    root.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) drawables.push(child);
    });
    expect(drawables.length).toBeLessThanOrEqual(16);
    for (const name of ["sunflower-discs", "sunflower-bracts", "sunflower-leaves", "sunflower-stems", "babys-breath", "wrap-front", "wrap-collar", "wrap-bow", "wrap-tag"]) {
      expect(root.getObjectByName(name), name).toBeDefined();
    }
    disposeIntroFlower(root);
  });
});
