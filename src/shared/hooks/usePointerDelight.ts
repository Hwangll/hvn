import { useEffect, type RefObject } from "react";
import type { StoryPage } from "../../app/storyPage";
import { whenIdle } from "../motion/whenIdle";

/**
 * Installs the story's pointer touches (magnets, tilting photos, spotlights, click sparks) unless motion is reduced.
 * They only answer a reader's hand, so their code arrives in its own chunk once the page is up.
 */
export function usePointerDelight(rootRef: RefObject<HTMLElement | null>, page: StoryPage, reducedMotion: boolean) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return undefined;
    let stop: (() => void) | undefined;
    let cancelled = false;
    // A page that has already gone by the time the browser is idle doesn't fetch the chunk at all.
    void whenIdle().then(() => (cancelled ? undefined : import("../interactions"))).then((interactions) => {
      if (interactions && !cancelled) stop = interactions.installPointerDelight(root, page);
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [page, reducedMotion, rootRef]);
}
