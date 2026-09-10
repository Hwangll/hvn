import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { observeMemoryReveals } from "./useMemoryReveals";

describe("memory entrance lifecycle", () => {
  let enter: IntersectionObserverCallback;
  const observe = vi.fn();
  const unobserve = vi.fn();
  const disconnect = vi.fn();
  const cancel = vi.fn();
  const animate = vi.fn<(...args: unknown[]) => { cancel: typeof cancel }>(() => ({ cancel }));

  const originalAnimate = Element.prototype.animate;
  afterEach(() => {
    vi.unstubAllGlobals();
    Element.prototype.animate = originalAnimate;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { enter = callback; }
      observe = observe;
      unobserve = unobserve;
      disconnect = disconnect;
    });
    document.body.innerHTML = '<main><figure data-memory-reveal style="transform:rotate(5deg)"></figure></main>';
    Element.prototype.animate = animate as unknown as typeof Element.prototype.animate;
  });

  it("reveals once without replacing photo rotation or hiding offscreen content", () => {
    const root = document.querySelector("main")!;
    const photo = root.querySelector("figure")!;
    const cleanup = observeMemoryReveals(root, false);
    expect(photo.style.opacity).toBe("");
    enter([{ target: photo, isIntersecting: true } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
    enter([{ target: photo, isIntersecting: true } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(animate).toHaveBeenCalledTimes(1);
    expect(animate.mock.calls[0][0]).not.toHaveProperty("transform");
    expect(photo.style.transform).toBe("rotate(5deg)");
    cleanup();
    expect(cancel).toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalled();
  });

  it("observes late loaded keepsakes and stops observing after cleanup", async () => {
    const root = document.querySelector("main")!;
    const cleanup = observeMemoryReveals(root, true);
    const keepsake = document.createElement("div");
    keepsake.setAttribute("data-memory-reveal", "");
    root.append(keepsake);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(observe).toHaveBeenCalledWith(keepsake);
    cleanup();
    observe.mockClear();
    root.append(keepsake.cloneNode());
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(observe).not.toHaveBeenCalled();
  });

  it("keeps everything readable when the browser cannot animate", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    expect(() => observeMemoryReveals(document.querySelector("main")!, false)()).not.toThrow();
    expect(animate).not.toHaveBeenCalled();
  });
});
