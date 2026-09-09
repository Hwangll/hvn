import { useEffect } from "react";
import { Howl } from "howler";

export function useActiveStorySound(source: string | undefined, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !source) {
      return undefined;
    }

    const audio = new Howl({ src: [source], preload: true, volume: 0.24 });
    audio.play();

    return () => {
      audio.stop();
      audio.unload();
    };
  }, [enabled, source]);
}
