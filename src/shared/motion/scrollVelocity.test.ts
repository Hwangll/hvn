import { describe, expect, it } from "vitest";
import { MAX_SCROLL_VELOCITY, nextScrollVelocity } from "./scrollVelocity";

describe("scroll velocity", () => {
  it("eases toward the frame's speed in px per ms, signed by direction", () => {
    let velocity = 0;
    for (let frame = 0; frame < 20; frame += 1) velocity = nextScrollVelocity(velocity, 32, 16, 900);
    expect(velocity).toBeCloseTo(2, 2);
    let back = 0;
    for (let frame = 0; frame < 20; frame += 1) back = nextScrollVelocity(back, -32, 16, 900);
    expect(back).toBeCloseTo(-2, 2);
  });

  it("caps a hard fling", () => {
    let velocity = 0;
    for (let frame = 0; frame < 40; frame += 1) velocity = nextScrollVelocity(velocity, 600, 16, 900);
    expect(velocity).toBeCloseTo(MAX_SCROLL_VELOCITY, 2);
  });

  it("reads a jump of more than a screen and a half as stillness, not speed", () => {
    expect(nextScrollVelocity(0, 4000, 16, 900)).toBe(0);
    expect(nextScrollVelocity(1, -2000, 16, 900)).toBeCloseTo(0.6);
  });

  it("comes to rest exactly once the page stops", () => {
    let velocity = 1.5;
    for (let frame = 0; frame < 40; frame += 1) velocity = nextScrollVelocity(velocity, 0, 16, 900);
    expect(velocity).toBe(0);
  });
});
