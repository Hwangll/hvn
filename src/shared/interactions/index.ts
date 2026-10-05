import { installClickSparks } from "./clickSparks";
import { installPointerEffects } from "./pointerEffects";

/** Sparks take the ink of the room they happen in: rose paper, blue hour, or the gold of the memory room. */
const sparkColors = { partOne: "#e0628f", partTwo: "#a8ddeb", room: "#e2c17f" };

/** Every pointer touch at once; loaded on its own after the story has painted (see usePointerDelight). */
export function installPointerDelight(root: HTMLElement, partTwo: boolean): () => void {
  const storyColor = partTwo ? sparkColors.partTwo : sparkColors.partOne;
  const stopPointer = installPointerEffects(root);
  const stopSparks = installClickSparks((target) => (target.closest(".memory-intro") ? sparkColors.room : storyColor));
  return () => {
    stopPointer();
    stopSparks();
  };
}
