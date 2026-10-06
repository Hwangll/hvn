import { describe, expect, it } from "vitest";
import { particleAlive, stepParticle, windProfile, windSpawns, type WindParticle } from "./scrollWind";

const particle = (overrides: Partial<WindParticle> = {}): WindParticle => ({
  x: 200, y: 400, vx: 0, vy: 0, angle: 0, spin: 1, flip: 0, flipRate: 2, size: 18, depth: 1, age: 0, life: 5, alpha: 0.9,
  sway: 0, swayRate: 1, phase: 0, sprite: 0, entered: true, burst: false, ...overrides,
});

describe("scroll wind spawning", () => {
  it("earns particles by the distance scrolled and carries the fraction over", () => {
    const { density } = windProfile("day", false);
    let carry = 0;
    let total = 0;
    // A thousand px scrolled at reading pace, one frame at a time.
    for (let frame = 0; frame < 100; frame += 1) {
      const [count, rest] = windSpawns(carry, 0.6, 1000 / 60, density);
      total += count;
      carry = rest;
    }
    // Whole particles plus the carried fraction add up to exactly what the distance earned.
    expect(total + carry).toBeCloseTo(1000 * density, 6);
    expect(total).toBeGreaterThan(10);
    expect(windSpawns(0.4, 0, 16, density)).toEqual([0, 0.4]);
  });

  it("blows the same amount whichever way the page moves", () => {
    const { density } = windProfile("night", true);
    expect(windSpawns(0, -2, 16, density)).toEqual(windSpawns(0, 2, 16, density));
  });
});

describe("a particle in the wind", () => {
  it("streams up past the reader while the page moves down, the nearer ones faster", () => {
    const profile = windProfile("day", false);
    const far = particle({ depth: 0.6 });
    const near = particle({ depth: 1.3 });
    for (let frame = 0; frame < 30; frame += 1) {
      stepParticle(far, 1.5, 1 / 60, 0, profile);
      stepParticle(near, 1.5, 1 / 60, 0, profile);
    }
    expect(far.vy).toBeLessThan(0);
    expect(near.vy).toBeLessThan(far.vy);
    expect(near.y).toBeLessThan(far.y);
  });

  it("drifts down by day and up by night once the page is still", () => {
    const petal = particle({ vy: -600 });
    const glint = particle({ vy: -600 });
    for (let frame = 0; frame < 180; frame += 1) {
      stepParticle(petal, 0, 1 / 60, 0, windProfile("day", false));
      stepParticle(glint, 0, 1 / 60, 0, windProfile("night", false));
    }
    expect(petal.vy).toBeGreaterThan(0);
    expect(glint.vy).toBeLessThan(0);
    expect(Math.abs(glint.vy)).toBeLessThan(40);
  });

  it("tumbles faster while the page moves", () => {
    const calm = particle();
    const rushed = particle();
    stepParticle(calm, 0, 0.1, 0, windProfile("day", false));
    stepParticle(rushed, 3, 0.1, 0, windProfile("day", false));
    expect(rushed.flip).toBeGreaterThan(calm.flip);
    expect(rushed.angle).toBeGreaterThan(calm.angle);
  });

  it("waits off screen to come in, then ends once it leaves or its life runs out", () => {
    const incoming = particle({ y: 1100, entered: false });
    expect(particleAlive(incoming, 1440, 900)).toBe(true);
    incoming.y = 850;
    expect(particleAlive(incoming, 1440, 900)).toBe(true);
    expect(incoming.entered).toBe(true);
    incoming.y = -300;
    expect(particleAlive(incoming, 1440, 900)).toBe(false);
    expect(particleAlive(particle({ age: 6 }), 1440, 900)).toBe(false);
  });
});
