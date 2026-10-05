import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { createPlantMaterial, disposePlantMaterial, plantDepthMaterial } from "./plantMaterial";

describe("plant materials", () => {
  it("sways merged parts around their anchors, rigidly when asked, in both the colour and the shadow pass", () => {
    const material = createPlantMaterial({ part: "petal", anchored: true, rigid: true, backTint: 0xddeeff });
    expect(material.defines).toMatchObject({ USE_PLANT_ANCHOR: "", PLANT_RIGID: "", PLANT_BACK_TINT: "", PLANT_THIN_EDGES: "" });
    const depth = plantDepthMaterial(material)!;
    expect(depth.defines).toMatchObject({ USE_PLANT_ANCHOR: "", PLANT_RIGID: "" });
    expect(plantDepthMaterial(material)).toBe(depth);
    disposePlantMaterial(material);
  });

  it("gives every combination of options its own program", () => {
    const keys = [
      createPlantMaterial({ part: "petal" }),
      createPlantMaterial({ part: "petal", anchored: true }),
      createPlantMaterial({ part: "petal", anchored: true, rigid: true }),
      createPlantMaterial({ part: "petal", backTint: 0xffffff }),
      createPlantMaterial({ part: "stem" }),
    ].map((material) => material.customProgramCacheKey());
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("keeps the wrap still and casts its shadow with the plain depth pass", () => {
    const wrap = createPlantMaterial({ part: "wrap", color: 0xa9784b });
    expect(plantDepthMaterial(wrap)).toBeNull();
    expect(wrap.side).toBe(THREE.DoubleSide);
    expect(createPlantMaterial({ part: "stem" }).side).toBe(THREE.FrontSide);
  });
});
