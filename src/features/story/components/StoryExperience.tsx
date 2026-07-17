import { lazy, Suspense, useCallback, useState } from "react";
import { storyChapters } from "../data/story";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import { StoryScrollytelling } from "./StoryScrollytelling";
import { StoryConnectionPath } from "./StoryConnectionPath";
import { StoryEnding } from "./StoryEnding";
import { StoryIntro } from "../../intro/components/StoryIntro";
import { MoodSetup } from "../../intro/components/MoodSetup";

const KeepsakePlayground = lazy(() =>
  import("../../memories/components/KeepsakePlayground").then((module) => ({ default: module.KeepsakePlayground })),
);

interface StoryExperienceProps {
  onReturnToIntro: () => void;
  playCue?: (cue: SoundCue) => void;
  reducedMotion: boolean;
  soundEnabled: boolean;
}

export function StoryExperience({ onReturnToIntro, playCue, reducedMotion, soundEnabled }: StoryExperienceProps) {
  const [maxVisitedChapterIndex, setMaxVisitedChapterIndex] = useState(0);
  const visibleMaxVisitedChapterIndex = reducedMotion ? storyChapters.length - 1 : maxVisitedChapterIndex;
  const handleActiveIndexChange = useCallback((index: number) => {
    setMaxVisitedChapterIndex((current) => Math.max(current, index));
  }, []);

  return (
    <main className="story-experience" id="top">
      <StoryConnectionPath reducedMotion={reducedMotion} />
      <StoryIntro reducedMotion={reducedMotion} />
      <MoodSetup />
      <Suspense fallback={<div className="keepsake-loading">Đang mở hộp kỷ vật...</div>}>
        <KeepsakePlayground
          maxVisitedChapterIndex={visibleMaxVisitedChapterIndex}
          playCue={playCue}
          reducedMotion={reducedMotion}
        />
      </Suspense>
      <StoryScrollytelling
        chapters={storyChapters}
        onActiveIndexChange={handleActiveIndexChange}
        playCue={playCue}
        reducedMotion={reducedMotion}
        soundEnabled={soundEnabled}
      />
      <StoryEnding onReturnToIntro={onReturnToIntro} playCue={playCue} reducedMotion={reducedMotion} />
    </main>
  );
}
