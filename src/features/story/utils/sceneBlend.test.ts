import { describe, expect, it } from "vitest";
import { sceneBlend } from "./sceneBlend";

describe("scroll scene blend", () => {
  it("holds the current mood, blending only at scene boundaries", () => {
    expect(sceneBlend(50, [100, 500], 100)).toEqual([0, 0]);
    expect(sceneBlend(150, [100, 500], 100)).toEqual([0.5, 0]);
    expect(sceneBlend(350, [100, 500], 100)).toEqual([1, 0]);
  });
  it("reconstructs the same scene when jumping forward and scrolling backward", () => {
    expect(sceneBlend(900, [100, 500], 100)).toEqual([1, 1]);
    expect(sceneBlend(550, [100, 500], 100)).toEqual([1, 0.5]);
    expect(sceneBlend(50, [100, 500], 100)).toEqual([0, 0]);
  });
});
