import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";
import { createIntroFlower, disposeIntroFlower, type IntroFlowerVariant } from "./introFlowers";

describe.each<IntroFlowerVariant>(["sunflower", "hydrangea", "lily"])("%s cabinet specimen", (variant) => {
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

describe("hydrangea bouquet", () => {
  it("builds three mopheads of separate florets, each head swaying as one while its sepals shiver on their own", () => {
    const root = createIntroFlower("hydrangea");
    const sepals = root.getObjectByName("hydrangea-sepals") as THREE.Mesh;
    const anchor = sepals.geometry.getAttribute("plantAnchor");
    const heads = new Set<string>();
    const seeds = new Set<number>();
    for (let index = 0; index < anchor.count; index += 1) {
      heads.add([anchor.getX(index), anchor.getY(index), anchor.getZ(index)].map((value) => value.toFixed(3)).join(","));
      seeds.add(anchor.getW(index));
    }
    expect(heads.size).toBe(3);
    expect(seeds.size).toBeGreaterThan(2500);
    expect((sepals.material as THREE.MeshPhysicalMaterial).defines).toMatchObject({ USE_PLANT_ANCHOR: "", PLANT_RIGID: "" });
    // One beaded centre per open floret, carried by its head's anchor like the sepals around it.
    const centers = root.getObjectByName("hydrangea-floret-centers") as THREE.InstancedMesh;
    expect(centers.count).toBeGreaterThan(450);
    const centerAnchor = centers.geometry.getAttribute("plantAnchor");
    expect(centerAnchor).toBeInstanceOf(THREE.InstancedBufferAttribute);
    expect(centerAnchor.count).toBe(centers.count);
    disposeIntroFlower(root);
  });

  it("merges heads, foliage, eucalyptus and wrap into a handful of draw calls", () => {
    const root = createIntroFlower("hydrangea");
    const drawables: THREE.Object3D[] = [];
    root.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) drawables.push(child);
    });
    expect(drawables.length).toBeLessThanOrEqual(16);
    for (const name of ["hydrangea-cores", "hydrangea-leaves", "hydrangea-stems", "eucalyptus-leaves", "wrap-front", "wrap-collar", "wrap-bow", "wrap-tag"]) {
      expect(root.getObjectByName(name), name).toBeDefined();
    }
    disposeIntroFlower(root);
  });
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

describe("lily bouquet", () => {
  it("opens six-tepalled blooms that each sway as one while their tepals shiver on their own", () => {
    const root = createIntroFlower("lily");
    const tepals = root.getObjectByName("lily-tepals") as THREE.Mesh;
    const anchor = tepals.geometry.getAttribute("plantAnchor");
    const blooms = new Map<string, Set<number>>();
    for (let index = 0; index < anchor.count; index += 1) {
      const bloom = [anchor.getX(index), anchor.getY(index), anchor.getZ(index)].map((value) => value.toFixed(3)).join(",");
      if (!blooms.has(bloom)) blooms.set(bloom, new Set());
      blooms.get(bloom)!.add(anchor.getW(index));
    }
    expect(blooms.size).toBeGreaterThanOrEqual(5);
    expect(blooms.size).toBeLessThanOrEqual(7);
    for (const seeds of blooms.values()) expect(seeds.size).toBe(6);
    expect((tepals.material as THREE.MeshPhysicalMaterial).defines).toMatchObject({ USE_PLANT_ANCHOR: "", PLANT_RIGID: "" });
    // Six anthers and a three-lobed stigma to every bloom, instanced, each carried by its bloom's anchor.
    const tips = root.getObjectByName("lily-anthers") as THREE.InstancedMesh;
    expect(tips.count).toBe(blooms.size * 9);
    expect(tips.geometry.getAttribute("plantAnchor")).toBeInstanceOf(THREE.InstancedBufferAttribute);
    disposeIntroFlower(root);
  });

  it("colours every tepal red past its warmer throat: never orange, never pink", () => {
    const root = createIntroFlower("lily");
    const tepals = root.getObjectByName("lily-tepals") as THREE.Mesh;
    const color = tepals.geometry.getAttribute("color");
    const uv = tepals.geometry.getAttribute("uv");
    let checked = 0;
    for (let index = 0; index < color.count; index += 1) {
      if (uv.getY(index) < 0.4) continue;
      const [r, g, b] = [color.getX(index), color.getY(index), color.getZ(index)];
      // Green stays under blue (crimson, not orange) and the red is nearly pure (not pink).
      expect(b).toBeGreaterThan(g);
      expect((r - b) / r).toBeGreaterThan(0.85);
      checked += 1;
    }
    expect(checked).toBeGreaterThan(1000);
    disposeIntroFlower(root);
  });

  it("merges blooms, buds, foliage and wrap into a handful of draw calls", () => {
    const root = createIntroFlower("lily");
    const drawables: THREE.Object3D[] = [];
    root.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) drawables.push(child);
    });
    expect(drawables.length).toBeLessThanOrEqual(16);
    for (const name of ["lily-tepals", "lily-stamens", "lily-anthers", "lily-buds", "lily-leaves", "lily-stems", "wrap-front", "wrap-collar", "wrap-bow", "wrap-tag"]) {
      expect(root.getObjectByName(name), name).toBeDefined();
    }
    disposeIntroFlower(root);
  });
});
