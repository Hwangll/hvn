import { Howl } from "howler";
import { useCallback, useEffect, useRef, useState } from "react";

const BACKGROUND_TRACK = "/audio/tinh-minh-la-ky.mp4";
export type SoundCue =
  | "dissolve"
  | "galleryClose"
  | "galleryOpen"
  | "keepsakeBouquet"
  | "keepsakeCandle"
  | "keepsakeEnvelope"
  | "keepsakeHeart"
  | "keepsakePolaroid"
  | "keepsakeStar"
  | "replay"
  | "secretClose"
  | "secretOpen"
  | "select"
  | "soundOff"
  | "soundOn";

const soundCueFiles: Record<SoundCue, { src: string; volume: number }> = {
  dissolve: { src: "/audio/memory-return.wav", volume: 0.28 },
  galleryClose: { src: "/audio/gallery-close.wav", volume: 0.28 },
  galleryOpen: { src: "/audio/gallery-open.wav", volume: 0.32 },
  keepsakeBouquet: { src: "/audio/keepsake-bouquet.wav", volume: 0.3 },
  keepsakeCandle: { src: "/audio/keepsake-candle.wav", volume: 0.34 },
  keepsakeEnvelope: { src: "/audio/keepsake-envelope.wav", volume: 0.32 },
  keepsakeHeart: { src: "/audio/keepsake-heart.wav", volume: 0.3 },
  keepsakePolaroid: { src: "/audio/keepsake-polaroid.wav", volume: 0.32 },
  keepsakeStar: { src: "/audio/keepsake-star.wav", volume: 0.28 },
  replay: { src: "/audio/replay-sweep.wav", volume: 0.28 },
  secretClose: { src: "/audio/secret-close.wav", volume: 0.28 },
  secretOpen: { src: "/audio/secret-open.wav", volume: 0.32 },
  select: { src: "/audio/memory-open.wav", volume: 0.34 },
  soundOff: { src: "/audio/sound-off.wav", volume: 0.28 },
  soundOn: { src: "/audio/sound-on.wav", volume: 0.32 },
};

export function useSoundToggle() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const backgroundAudioRef = useRef<Howl | null>(null);
  const cueAudioRef = useRef<Partial<Record<SoundCue, Howl>>>({});
  const activeCueRef = useRef<Howl | null>(null);
  const getCueAudio = useCallback((cue: SoundCue) => {
    const cachedAudio = cueAudioRef.current[cue];
    if (cachedAudio) {
      return cachedAudio;
    }

    const { src, volume } = soundCueFiles[cue];
    const audio = new Howl({ src: [src], preload: true, volume });
    cueAudioRef.current = { ...cueAudioRef.current, [cue]: audio };

    return audio;
  }, []);

  const playCueImmediately = useCallback(
    (cue: SoundCue) => {
      const audio = getCueAudio(cue);
      activeCueRef.current?.stop();
      activeCueRef.current = audio;
      audio.play();
    },
    [getCueAudio],
  );

  const toggleSound = useCallback(
    () =>
      setSoundEnabled((value) => {
        const nextValue = !value;
        playCueImmediately(nextValue ? "soundOn" : "soundOff");
        return nextValue;
      }),
    [playCueImmediately],
  );

  useEffect(() => {
    if (!soundEnabled) {
      backgroundAudioRef.current?.stop();
      return;
    }

    const audio =
      backgroundAudioRef.current ??
      new Howl({
        src: [BACKGROUND_TRACK],
        html5: true,
        loop: true,
        preload: true,
        volume: 0.16,
      });
    backgroundAudioRef.current = audio;

    audio.play();

    return () => {
      audio.pause();
    };
  }, [soundEnabled]);

  useEffect(() => () => {
    backgroundAudioRef.current?.stop();
    backgroundAudioRef.current?.unload();
    Object.values(cueAudioRef.current).forEach((audio) => {
      audio.stop();
      audio.unload();
    });
    backgroundAudioRef.current = null;
    cueAudioRef.current = {};
    activeCueRef.current = null;
  }, []);

  const playCue = useCallback(
    (cue: SoundCue) => {
      if (!soundEnabled) {
        return;
      }

      playCueImmediately(cue);
    },
    [playCueImmediately, soundEnabled],
  );

  return { playCue, soundEnabled, toggleSound };
}
