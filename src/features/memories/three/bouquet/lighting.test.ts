import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { StudioLights, lightPresets } from "./lighting";

describe("studio lights", () => {
  it("grades golden hour punchier than moonlight", () => {
    expect(lightPresets.golden.look.saturation).toBeGreaterThan(lightPresets.moonlight.look.saturation);
    expect(lightPresets.golden.look.power).toBeGreaterThan(lightPresets.moonlight.look.power);
  });

  it("lights the lilies red-gold, graded between golden hour and moonlight", () => {
    const { ember, golden, moonlight } = lightPresets;
    for (const light of [ember.key, ember.rim]) {
      const color = new THREE.Color(light.color);
      expect(color.r).toBeGreaterThanOrEqual(color.g);
      expect(color.g).toBeGreaterThanOrEqual(color.b);
    }
    expect(ember.look.saturation).toBeLessThan(golden.look.saturation);
    expect(ember.look.saturation).toBeGreaterThan(moonlight.look.saturation);
  });

  it("eases the light and its grade into a new preset instead of snapping", () => {
    const lights = new StudioLights(new THREE.Scene(), "golden");
    lights.setPreset("moonlight");
    expect(lights.update(1 / 60)).toBe(true);
    const golden = lightPresets.golden.look.saturation;
    const moonlight = lightPresets.moonlight.look.saturation;
    expect(lights.lookSaturation).toBeLessThan(golden);
    expect(lights.lookSaturation).toBeGreaterThan(moonlight);
    for (let frame = 0; frame < 600; frame += 1) lights.update(1 / 60);
    expect(lights.lookSaturation).toBeCloseTo(moonlight, 3);
    expect(lights.exposure).toBeCloseTo(lightPresets.moonlight.exposure, 3);
  });

  it("jumps straight to a preset when motion is reduced", () => {
    const lights = new StudioLights(new THREE.Scene(), "golden");
    lights.setPreset("moonlight", true);
    expect(lights.lookPower).toBe(lightPresets.moonlight.look.power);
    expect(lights.key.color.getHex()).toBe(new THREE.Color(lightPresets.moonlight.key.color).getHex());
  });
});
