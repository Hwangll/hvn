import { describe, expect, it, vi } from "vitest";
import { AdaptiveQuality, startingTier, tierSettings } from "./adaptiveQuality";

describe("adaptive quality", () => {
  it("never renders above the screen's own pixel ratio", () => {
    expect(tierSettings(3, 3).pixelRatio).toBe(2);
    expect(tierSettings(3, 1).pixelRatio).toBe(1);
    expect(tierSettings(2, 3).pixelRatio).toBe(1.5);
    expect(tierSettings(0, 3)).toMatchObject({ pixelRatio: 1, depthOfField: false, bloom: false, finish: false });
  });

  it("starts phones and small machines without depth of field", () => {
    expect(startingTier({ coarsePointer: true, cores: 8 })).toBe(2);
    expect(startingTier({ coarsePointer: false, cores: 4 })).toBe(2);
    expect(startingTier({ coarsePointer: false, cores: 10 })).toBe(3);
  });

  it("steps down once after a sustained slowdown, and ignores stalls and short hitches", () => {
    const onChange = vi.fn();
    const quality = new AdaptiveQuality(3, onChange);
    for (let frame = 0; frame < 120; frame += 1) quality.sample(16.7);
    // A tab switch and a brief hitch are not a slow machine.
    quality.sample(900);
    for (let frame = 0; frame < 20; frame += 1) quality.sample(40);
    for (let frame = 0; frame < 120; frame += 1) quality.sample(16.7);
    expect(onChange).not.toHaveBeenCalled();
    for (let frame = 0; frame < 80; frame += 1) quality.sample(40);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(2);
    expect(quality.tier).toBe(2);
  });

  it("never steps back up", () => {
    const onChange = vi.fn();
    const quality = new AdaptiveQuality(1, onChange);
    for (let frame = 0; frame < 600; frame += 1) quality.sample(8);
    expect(quality.tier).toBe(1);
    expect(onChange).not.toHaveBeenCalled();
  });
});
