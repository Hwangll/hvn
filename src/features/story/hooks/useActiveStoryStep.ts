import { useEffect, useState } from "react";
import scrollama from "scrollama";

interface UseActiveStoryStepOptions {
  stepIds: string[];
  disabled: boolean;
  layoutKey?: string;
  onStepEnter?: (stepId: string) => void;
}

export function useActiveStoryStep({ stepIds, disabled, layoutKey, onStepEnter }: UseActiveStoryStepOptions): string {
  const [activeId, setActiveId] = useState(stepIds[0] ?? "");
  const stepKey = stepIds.join("|");

  useEffect(() => {
    if (disabled || stepIds.length === 0) {
      return undefined;
    }

    const scroller = scrollama();
    scroller
      .setup({
        step: "[data-story-step]",
        offset: 0.6,
        progress: false,
      })
      .onStepEnter(({ element, index }) => {
        const fallbackId = stepIds[Math.min(Math.max(index, 0), stepIds.length - 1)];
        const nextId = (element as HTMLElement | undefined)?.dataset.storyStepId ?? fallbackId ?? "";
        setActiveId(nextId);
        onStepEnter?.(nextId);
      });

    // Photos load in bursts while the reader scrolls; one re-measure on the next frame covers each burst, where one per
    // photo made the scroller read every step's box again and again in the middle of the scroll.
    let frame = 0;
    const resize = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        scroller.resize();
      });
    };
    let active = true;
    window.addEventListener("resize", resize);
    document.addEventListener("load", resize, true);
    void document.fonts?.ready.then(() => {
      if (active) {
        resize();
      }
    });

    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("load", resize, true);
      scroller.destroy();
    };
  }, [disabled, layoutKey, onStepEnter, stepIds, stepKey]);

  return activeId;
}
