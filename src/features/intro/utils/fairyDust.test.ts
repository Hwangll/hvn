import { describe, expect, it } from "vitest";
import { butterflyFlight, fairyProfile, orbitPoint, pulse, stageBoxOf, trailSpawns, wander } from "./fairyDust";

describe("fairy dust motion", () => {
  it("keeps a wandering light within its reach of the anchor", () => {
    for (let t = 0; t < 120; t += 0.37) {
      const [x, y] = wander(t, 1.3, 40, 24);
      expect(Math.abs(x)).toBeLessThanOrEqual(40);
      expect(Math.abs(y)).toBeLessThanOrEqual(24);
    }
    expect(wander(5, 0, 40, 24)).not.toEqual(wander(5, 2, 40, 24));
  });

  it("swells a firefly now and then but never puts it out", () => {
    const glows = Array.from({ length: 400 }, (_, frame) => pulse(frame / 30, 1.7, 0.4));
    expect(Math.min(...glows)).toBeGreaterThanOrEqual(0.4);
    expect(Math.max(...glows)).toBeCloseTo(1, 2);
    // Dim more often than bright.
    expect(glows.filter((glow) => glow < 0.7).length).toBeGreaterThan(glows.length / 2);
  });

  it("circles the bouquet on a tilted ring, nearest the reader at the bottom of it", () => {
    const front = orbitPoint(Math.PI / 2, 200, 0.3);
    const back = orbitPoint(-Math.PI / 2, 200, 0.3);
    expect(front.front).toBeCloseTo(1);
    expect(back.front).toBeCloseTo(0);
    expect(front.y).toBeCloseTo(60);
    expect(back.y).toBeCloseTo(-60);
    expect(orbitPoint(0, 200, 0.3).x).toBeCloseTo(200);
  });

  it("flies a butterfly round a figure of eight inside its box, heading the way it goes", () => {
    for (let t = 0; t < 60; t += 0.21) {
      const { x, y } = butterflyFlight(t, 0.8, 400, 300);
      expect(Math.abs(x)).toBeLessThanOrEqual(200);
      expect(Math.abs(y)).toBeLessThanOrEqual(300 * 0.31);
    }
    const now = butterflyFlight(10, 0, 400, 300);
    const next = butterflyFlight(10.01, 0, 400, 300);
    expect(Math.sign(next.x - now.x)).toBe(Math.sign(Math.cos(now.heading)));
  });
});

describe("pointer glitter", () => {
  it("leaves one glitter per stretch of travel and carries the rest over", () => {
    let carry = 0;
    let total = 0;
    for (let stroke = 0; stroke < 30; stroke += 1) {
      const [count, rest] = trailSpawns(carry, 7, 11);
      total += count;
      carry = rest;
    }
    expect(total * 11 + carry).toBeCloseTo(30 * 7);
    expect(trailSpawns(0, 500, 0)).toEqual([0, 0]);
  });
});

describe("profiles and the stage", () => {
  it("puts less in the air on a phone", () => {
    const desktop = fairyProfile(false);
    const phone = fairyProfile(true);
    expect(phone.wisps).toBeLessThan(desktop.wisps);
    expect(phone.cap).toBeLessThan(desktop.cap);
    expect(phone.ratio).toBeLessThan(desktop.ratio);
    expect(phone.trailSpacing).toBe(0);
  });

  it("finds the flowers above the middle of the bouquet's frame and the plinth near its foot", () => {
    const box = stageBoxOf({ left: 100, top: 200, width: 400, height: 440 });
    expect(box.x).toBe(300);
    expect(box.y).toBeLessThan(200 + 220);
    expect(box.plinthY).toBeGreaterThan(200 + 330);
  });
});
