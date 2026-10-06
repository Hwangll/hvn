import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { PartBatch, frameMatrix, gridGeometry, randomStream, tubeGeometry } from "./common";

describe("flower geometry helpers", () => {
  it("draws the same numbers from the same seed, and different ones from another", () => {
    const first = randomStream(7);
    const again = randomStream(7);
    const other = randomStream(8);
    const sequence = Array.from({ length: 5 }, () => first.next());
    expect(Array.from({ length: 5 }, () => again.next())).toEqual(sequence);
    expect(Array.from({ length: 5 }, () => other.next())).not.toEqual(sequence);
    sequence.forEach((value) => expect(value).toBeGreaterThanOrEqual(0));
    sequence.forEach((value) => expect(value).toBeLessThan(1));
  });

  it("builds grids that face +Z, with uv across and along the surface", () => {
    const geometry = gridGeometry(4, 6, (u, v, position) => position.set(u, v, 0), [2, 3]);
    const normal = geometry.getAttribute("normal");
    for (let index = 0; index < normal.count; index += 1) expect(normal.getZ(index)).toBeCloseTo(1);
    const uv = geometry.getAttribute("uv");
    expect(uv.getX(uv.count - 1)).toBeCloseTo(2);
    expect(uv.getY(uv.count - 1)).toBeCloseTo(3);
    expect(geometry.getAttribute("color").count).toBe(5 * 7);
  });

  it("gives a row that closes to a point the normals of the surface next to it, never zero", () => {
    // A leaf-like blade whose base and tip rows each close to a single point.
    const geometry = gridGeometry(4, 6, (u, v, position) => position.set((u - 0.5) * Math.sin(Math.PI * v), v, 0));
    const normal = geometry.getAttribute("normal");
    for (let index = 0; index < normal.count; index += 1) expect(normal.getZ(index)).toBeCloseTo(1);
  });

  it("tags every vertex of a part with its anchor and seed, and merges parts into one geometry", () => {
    const batch = new PartBatch();
    batch.add(gridGeometry(2, 2, (u, v, position) => position.set(u, v, 0)), { x: 1, y: 2, z: 3 }, 0.25);
    batch.add(tubeGeometry(new THREE.LineCurve3(new THREE.Vector3(), new THREE.Vector3(0, 1, 0)), 3, 4, () => 0.1), { x: -1, y: 0, z: 0 }, 1.75);
    expect(batch.size).toBe(2);
    const merged = batch.build();
    const anchor = merged.getAttribute("plantAnchor");
    expect(anchor.itemSize).toBe(4);
    expect(anchor.count).toBe(9 + 4 * 5);
    expect([anchor.getX(0), anchor.getY(0), anchor.getZ(0), anchor.getW(0)]).toEqual([1, 2, 3, 0.25]);
    expect([anchor.getX(anchor.count - 1), anchor.getW(anchor.count - 1)]).toEqual([-1, 0.75]);
    expect(batch.size).toBe(0);
  });

  it("frames a part so +Y follows its direction and +Z leans toward its facing", () => {
    const matrix = frameMatrix({ x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 2 }, { x: 0, y: 1, z: 0.3 });
    const along = new THREE.Vector3(0, 1, 0).applyMatrix4(matrix).sub(new THREE.Vector3(1, 0, 0));
    const face = new THREE.Vector3(0, 0, 1).transformDirection(matrix);
    expect(along.z).toBeCloseTo(1);
    expect(face.y).toBeCloseTo(1);
    expect(matrix.determinant()).toBeCloseTo(1);
  });
});
