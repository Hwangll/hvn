import { describe, expect, it } from "vitest";
import { readingRevealProgress, sceneDissolve } from "./partTwoMotion";

describe("Part II scene handoff", () => {
  it("keeps a visual anchor throughout each dissolve in both directions", () => {
    const positions = Array.from({ length: 101 }, (_, i) => i / 100);
    for (const progress of [...positions, ...[...positions].reverse()]) {
      const incoming = sceneDissolve(progress);
      const outgoing = 1 - sceneDissolve(progress);
      expect(incoming + outgoing).toBeCloseTo(1);
      expect(Math.max(incoming, outgoing)).toBeGreaterThanOrEqual(0.5);
    }
    expect(sceneDissolve(0.5)).toBeGreaterThan(0.5);
  });

  it("settles completely and clamps skipped or out-of-range scenes", () => {
    expect(sceneDissolve(-1)).toBe(0);
    expect(sceneDissolve(0)).toBe(0);
    expect(sceneDissolve(0.9)).toBe(1);
    expect(sceneDissolve(2)).toBe(1);
  });
});

describe("Part II reading reveals", () => {
  it("keeps paragraphs fully readable by the reading line, including long chapters", () => {
    for (const index of [0, 3, 12]) {
      expect(readingRevealProgress(600, 1000, index, false)).toBe(1);
    }
  });

  it("finishes earlier on a small screen so copy does not wait for extra scrolling", () => {
    expect(readingRevealProgress(700, 1000, 8, true)).toBe(1);
    expect(readingRevealProgress(700, 1000, 8, false)).toBeLessThan(1);
  });

  it("holds offscreen copy and completes copy already passed after a route jump", () => {
    expect(readingRevealProgress(1100, 1000, 0, false)).toBe(0);
    expect(readingRevealProgress(-400, 1000, 8, false)).toBe(1);
  });

  it("recreates the same reveal when scrolling back through a chapter", () => {
    const before = readingRevealProgress(780, 1000, 2, false);
    readingRevealProgress(-100, 1000, 2, false);
    expect(readingRevealProgress(780, 1000, 2, false)).toBe(before);
    expect(before).toBeGreaterThan(0);
    expect(before).toBeLessThan(1);
  });

  it("preserves reading rhythm across viewport heights", () => {
    expect(readingRevealProgress(390, 500, 2, false)).toBe(readingRevealProgress(780, 1000, 2, false));
  });
});
