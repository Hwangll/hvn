import { useEffect, type RefObject } from "react";
import { whenIdle } from "../motion/whenIdle";

/**
 * Installs the story's pointer touches (magnets, tilting photos, spotlights, click sparks) unless motion is reduced.
 * They only answer a reader's hand, so their code arrives in its own chunk once the page is up.
 */
export function usePointerDelight(rootRef: RefObject<HTMLElement | null>, partTwo: boolean, reducedMotion: boolean) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return undefined;
    let stop: (() => void) | undefined;
    let cancelled = false;
    void whenIdle().then(() => import("../interactions")).then(({ installPointerDelight }) => {
      if (!cancelled) stop = installPointerDelight(root, partTwo);
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [partTwo, reducedMotion, rootRef]);
}
