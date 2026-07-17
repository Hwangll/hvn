import { useEffect, useState } from "react";
import scrollama from "scrollama";

interface UseActiveStoryStepOptions {
  count: number;
  disabled: boolean;
}

export function useActiveStoryStep({ count, disabled }: UseActiveStoryStepOptions): number {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (disabled || count === 0) {
      return undefined;
    }

    const scroller = scrollama();
    scroller
      .setup({
        step: "[data-story-step]",
        offset: 0.6,
        progress: false,
      })
      .onStepEnter(({ index }) => {
        setActiveIndex(Math.min(Math.max(index, 0), count - 1));
      });

    const resize = () => scroller.resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      scroller.destroy();
    };
  }, [count, disabled]);

  return activeIndex;
}
