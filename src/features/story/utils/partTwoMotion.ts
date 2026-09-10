import { clampProgress } from "./sceneBlend";

/** A capped stagger lets a long chapter settle as early as a short one. */
export function readingRevealProgress(top: number, viewport: number, index: number, mobile: boolean) {
  const distance = viewport * (mobile ? 0.18 : 0.26);
  const stagger = Math.min(index, 3) * (mobile ? 0.015 : 0.025);
  const progress = clampProgress((viewport * 0.92 - top) / distance - stagger);
  return 1 - Math.pow(1 - progress, 3);
}
