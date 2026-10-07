import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FairyRealm } from "./FairyRealm";

describe("fairy realms", () => {
  it("draws a realm for each part, Phần III's under a harvest moon with red lanterns", () => {
    const { container } = render(<FairyRealm />);
    const realms = container.querySelectorAll(".memory-sky.realm");
    expect(Array.from(realms, (realm) => realm.className)).toEqual([
      "memory-sky memory-sky-one realm is-dusk",
      "memory-sky memory-sky-two realm is-night",
      "memory-sky memory-sky-three realm is-ember",
    ]);
    const ember = container.querySelector(".memory-sky-three")!;
    expect(ember.querySelector(".realm-celestial.is-harvest")).not.toBeNull();
    expect(ember.querySelectorAll(".realm-lantern").length).toBeGreaterThan(0);
    expect(ember.querySelectorAll(".realm-corner")).toHaveLength(4);
    // More stars than at dusk, fewer than at night.
    const stars = (selector: string) => container.querySelectorAll(`${selector} .realm-star`).length;
    expect(stars(".memory-sky-three")).toBeGreaterThan(stars(".memory-sky-one"));
    expect(stars(".memory-sky-three")).toBeLessThan(stars(".memory-sky-two"));
  });

  it("works out every corner's flowers as finite paths", () => {
    const { container } = render(<FairyRealm />);
    const paths = Array.from(container.querySelectorAll(".realm-corner path"), (path) => path.getAttribute("d") ?? "");
    expect(paths.length).toBeGreaterThan(100);
    for (const d of paths) expect(d).not.toMatch(/NaN|Infinity/);
  });
});
