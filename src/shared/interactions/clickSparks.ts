const RAYS = 8;
/** Matches the length of the `click-spark-ray` animation, plus a frame of slack. */
const LIFETIME = 620;

/**
 * Short rays of light from wherever a button or link is clicked (Click Spark, React Bits). Only pointer clicks spark:
 * keyboard activation reports `detail` 0 and stays quiet. Each burst is a handful of spans on a CSS animation that
 * removes itself, and it lives on <body> so photos opened in the lightbox spark too.
 */
export function installClickSparks(colorFor: (target: Element) => string): () => void {
  const onClick = (event: MouseEvent) => {
    if (event.detail === 0 || event.button !== 0) return;
    const target = event.target instanceof Element ? event.target.closest("button:not(:disabled), a[href], [role='button']") : null;
    if (!target) return;

    const burst = document.createElement("span");
    burst.className = "click-spark";
    burst.setAttribute("aria-hidden", "true");
    burst.style.left = `${event.clientX}px`;
    burst.style.top = `${event.clientY}px`;
    burst.style.setProperty("--spark", colorFor(target));
    for (let index = 0; index < RAYS; index += 1) {
      const ray = document.createElement("i");
      ray.style.setProperty("--angle", `${(index * 360) / RAYS}deg`);
      burst.append(ray);
    }
    document.body.append(burst);
    window.setTimeout(() => burst.remove(), LIFETIME);
  };

  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}
