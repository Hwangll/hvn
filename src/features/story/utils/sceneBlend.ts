export const clampProgress = (value: number) => Math.min(1, Math.max(0, value));

// Each boundary has an entrance, then a long hold before the next boundary.
// Sampling absolute positions makes reverse scroll and skipped scenes deterministic.
export function sceneBlend(position: number, boundaries: readonly number[], distance: number) {
  return boundaries.map((boundary) => {
    const progress = clampProgress((position - boundary) / Math.max(1, distance));
    return progress * progress * (3 - 2 * progress);
  });
}
