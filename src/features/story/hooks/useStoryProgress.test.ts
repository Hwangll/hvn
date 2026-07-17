import { describe, expect, it } from "vitest";
import { getStoryProgress } from "./useStoryProgress";

describe("getStoryProgress", () => {
  it("returns a complete progress value when the story has zero or one chapter", () => {
    expect(getStoryProgress(0, 0)).toBe(1);
    expect(getStoryProgress(0, 1)).toBe(1);
  });

  it("calculates and bounds progress for a multi-chapter story", () => {
    expect(getStoryProgress(2, 5)).toBe(0.5);
    expect(getStoryProgress(-1, 5)).toBe(0);
    expect(getStoryProgress(10, 5)).toBe(1);
  });
});
