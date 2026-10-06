import { describe, expect, it } from "vitest";
import { nextRibbonOffset, stepSpring, type Spring } from "./scrollInertia";

describe("layer inertia spring", () => {
  it("lags behind a moving target, overshoots a touch, then settles exactly at rest", () => {
    const spring: Spring = { value: 0, speed: 0 };
    stepSpring(spring, 40, 1 / 60);
    expect(spring.value).toBeGreaterThan(0);
    expect(spring.value).toBeLessThan(40);

    let peak = 0;
    for (let frame = 0; frame < 120; frame += 1) {
      stepSpring(spring, 40, 1 / 60);
      peak = Math.max(peak, spring.value);
    }
    expect(peak).toBeGreaterThan(40);
    expect(peak).toBeLessThan(48);

    let moving = true;
    for (let frame = 0; frame < 240 && moving; frame += 1) moving = stepSpring(spring, 0, 1 / 60);
    expect(moving).toBe(false);
    expect(spring).toEqual({ value: 0, speed: 0 });
  });

  it("stays stable through a long, dropped frame", () => {
    const spring: Spring = { value: 30, speed: 0 };
    stepSpring(spring, 0, 2);
    expect(Math.abs(spring.value)).toBeLessThan(30);
  });
});

describe("ribbon drift", () => {
  it("runs at its own pace while the page is still, and faster while it scrolls", () => {
    const still = nextRibbonOffset(0, 1, 0, 1, 1000);
    const scrolling = nextRibbonOffset(0, 1, 2, 1, 1000);
    expect(still).toBeGreaterThan(0);
    expect(scrolling).toBeGreaterThan(still * 3);
  });

  it("follows the reader's direction and wraps to one run without a seam", () => {
    expect(nextRibbonOffset(10, -1, 0, 1, 1000)).toBeCloseTo(976);
    expect(nextRibbonOffset(990, 1, 0, 1, 1000)).toBeCloseTo(24);
    for (const offset of [0, 250, 999]) {
      const next = nextRibbonOffset(offset, 1, 5, 0.5, 1000);
      expect(next).toBeGreaterThanOrEqual(0);
      expect(next).toBeLessThan(1000);
    }
  });

  it("holds still until its words have been measured", () => {
    expect(nextRibbonOffset(120, 1, 3, 1, 0)).toBe(0);
  });
});
