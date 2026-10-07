import type { StoryPage } from "../../app/storyPage";
import { installClickSparks } from "./clickSparks";
import { installPointerEffects } from "./pointerEffects";

/** Sparks take the ink of the room they happen in: rose paper, blue hour, the projector gold of Part III's red room, or
 * the gold of the memory room. */
const sparkColors: Record<StoryPage | "room", string> = { "part-one": "#e0628f", "part-two": "#a8ddeb", "part-three": "#f3c77e", room: "#e2c17f" };

/** Every pointer touch at once; loaded on its own after the story has painted (see usePointerDelight). */
export function installPointerDelight(root: HTMLElement, page: StoryPage): () => void {
  const storyColor = sparkColors[page];
  const stopPointer = installPointerEffects(root);
  const stopSparks = installClickSparks((target) => (target.closest(".memory-intro") ? sparkColors.room : storyColor));
  return () => {
    stopPointer();
    stopSparks();
  };
}
