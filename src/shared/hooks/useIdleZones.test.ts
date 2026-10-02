import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { observeIdleZones } from "./useIdleZones";

describe("idle zones", () => {
  let report: IntersectionObserverCallback;
  const observe = vi.fn();
  const disconnect = vi.fn();
  const entry = (target: Element, isIntersecting: boolean) => ({ target, isIntersecting }) as unknown as IntersectionObserverEntry;

  afterEach(() => vi.unstubAllGlobals());

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { report = callback; }
      observe = observe;
      disconnect = disconnect;
    });
    document.body.innerHTML = '<main><section class="story-ending" data-idle-zone></section><p>copy</p></main>';
  });

  it("marks a section off screen and back with an attribute React never rewrites", () => {
    const root = document.querySelector("main")!;
    const zone = root.querySelector("section")!;
    const cleanup = observeIdleZones(root);
    expect(observe).toHaveBeenCalledWith(zone);
    expect(observe).toHaveBeenCalledTimes(1);

    report([entry(zone, false)], {} as IntersectionObserver);
    expect(zone.hasAttribute("data-offscreen")).toBe(true);
    expect(zone.className).toBe("story-ending");
    report([entry(zone, true)], {} as IntersectionObserver);
    expect(zone.hasAttribute("data-offscreen")).toBe(false);

    report([entry(zone, false)], {} as IntersectionObserver);
    cleanup();
    expect(disconnect).toHaveBeenCalled();
    expect(zone.hasAttribute("data-offscreen")).toBe(false);
  });

  it("picks up zones rendered after a layout switch", async () => {
    const root = document.querySelector("main")!;
    observeIdleZones(root);
    const canvas = document.createElement("div");
    canvas.setAttribute("data-idle-zone", "");
    root.append(canvas);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(observe).toHaveBeenCalledWith(canvas);
  });

  it("leaves every loop running when the browser has no IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    expect(() => observeIdleZones(document.querySelector("main")!)()).not.toThrow();
    expect(document.querySelector("[data-offscreen]")).toBeNull();
  });
});
