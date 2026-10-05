import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { clampPose, poseToPosition, wheelZoom, type RigLimits } from "./cameraRig";

const limits: RigLimits = { azimuth: [-0.6, 0.6], polar: [1.2, 1.6], distance: [4.5, 6.4] };

describe("camera rig", () => {
  it("keeps every axis of a pose inside its limits", () => {
    expect(clampPose({ azimuth: 2, polar: 0.4, distance: 9 }, limits)).toEqual({ azimuth: 0.6, polar: 1.2, distance: 6.4 });
    expect(clampPose({ azimuth: -0.2, polar: 1.5, distance: 5 }, limits)).toEqual({ azimuth: -0.2, polar: 1.5, distance: 5 });
  });

  it("places the camera on a sphere around the target, azimuth 0 in front", () => {
    const target = new THREE.Vector3(3.6, 0.1, 0);
    const front = poseToPosition(target, { azimuth: 0, polar: Math.PI / 2, distance: 5 }, new THREE.Vector3());
    expect(front.x).toBeCloseTo(3.6);
    expect(front.y).toBeCloseTo(0.1);
    expect(front.z).toBeCloseTo(5);
    const right = poseToPosition(target, { azimuth: Math.PI / 2, polar: Math.PI / 2, distance: 5 }, new THREE.Vector3());
    expect(right.x).toBeCloseTo(8.6);
    expect(right.z).toBeCloseTo(0);
    expect(front.distanceTo(target)).toBeCloseTo(5);
  });

  it("zooms within the limits and lets the wheel go once a limit is reached", () => {
    const closer = wheelZoom(5.3, -120, limits);
    expect(closer.distance).toBeLessThan(5.3);
    expect(closer.consumed).toBe(true);
    expect(wheelZoom(4.5, -120, limits)).toEqual({ distance: 4.5, consumed: false });
    expect(wheelZoom(6.4, 400, limits)).toEqual({ distance: 6.4, consumed: false });
    expect(wheelZoom(6.3, 4000, limits).distance).toBe(6.4);
  });
});
