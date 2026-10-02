import { describe, expect, it } from "vitest";
import { audioSources } from "./useSoundToggle";

describe("sound sources", () => {
  it("plays sound effects as AAC first and keeps the WAV as the fallback", () => {
    expect(audioSources("/audio/typing.wav")).toEqual(["/audio/typing.m4a", "/audio/typing.wav"]);
    expect(audioSources("/audio/tinh-minh-la-ky.m4a")).toEqual(["/audio/tinh-minh-la-ky.m4a"]);
  });
});
