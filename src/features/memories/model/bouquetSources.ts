import type { IntroFlowerVariant } from "./introFlowers";

/** A keepsake built in code (model/flowers), or modelled and exported as binary glTF (see the README). */
export type BouquetSource = { source: "procedural" } | { source: "glb"; url: string };

/**
 * Where each keepsake comes from. To show a modelled bouquet, put its .glb under public/ (or anywhere that serves it
 * with CORS) and point `url` at it, e.g. `{ source: "glb", url: "/models/hydrangea.glb" }`. If it cannot be loaded,
 * the bouquet built in code stands in.
 */
export const bouquetSources: Record<IntroFlowerVariant, BouquetSource> = {
  sunflower: { source: "procedural" },
  hydrangea: { source: "procedural" },
  lily: { source: "procedural" },
};
