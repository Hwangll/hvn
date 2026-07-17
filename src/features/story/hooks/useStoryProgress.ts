export function getStoryProgress(activeIndex: number, total: number): number {
  if (total <= 1) {
    return 1;
  }

  return Math.min(1, Math.max(0, activeIndex / (total - 1)));
}
