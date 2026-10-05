/** Resolves once the browser has a quiet moment after the page's own work. */
export function whenIdle(timeout = 1500): Promise<void> {
  return new Promise((resolve) => {
    // Safari has no idle callbacks; a short wait stands in for one there.
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => resolve(), { timeout });
    else window.setTimeout(resolve, 1200);
  });
}
