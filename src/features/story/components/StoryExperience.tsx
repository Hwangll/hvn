import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { createStoryScrollItems, storyParts, type StoryScrollItem } from "../data/story";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import type { StoryPage } from "../../../app/storyPage";
import { StoryScrollytelling } from "./StoryScrollytelling";
import { StoryConnectionPath } from "./StoryConnectionPath";
import { StoryEnding } from "./StoryEnding";
import { StoryIntro } from "../../intro/components/StoryIntro";
import { MoodSetup } from "../../intro/components/MoodSetup";
import { PartTwoAtmosphere } from "./PartTwoAtmosphere";
import { StoryPartOneEnding } from "./StoryPartOneEnding";

const KeepsakePlayground = lazy(() =>
  import("../../memories/components/KeepsakePlayground").then((module) => ({ default: module.KeepsakePlayground })),
);

interface StoryExperienceProps {
  onReturnToIntro: () => void;
  page: StoryPage;
  playCue?: (cue: SoundCue) => void;
  reducedMotion: boolean;
  soundEnabled: boolean;
}

export function StoryExperience({ onReturnToIntro, page, playCue, reducedMotion, soundEnabled }: StoryExperienceProps) {
  const pageParts = useMemo(
    () => storyParts.filter((part) => part.id === (page === "part-two" ? "together-offline" : "before-meeting")),
    [page],
  );
  const pageItems = useMemo(() => createStoryScrollItems(pageParts), [pageParts]);
  const [visitedStoryIds, setVisitedStoryIds] = useState<ReadonlySet<string>>(
    () => new Set(pageItems[0] ? [pageItems[0].id] : []),
  );
  const handleActiveItemChange = useCallback((item: StoryScrollItem) => {
    setVisitedStoryIds((current) => {
      if (current.has(item.id)) {
        return current;
      }

      return new Set([...current, item.id]);
    });
  }, []);

  const keepsakePlayground = (
    <Suspense fallback={<div className="keepsake-loading">Đang mở hộp kỷ vật...</div>}>
      <KeepsakePlayground
        partId={pageParts[0]?.id}
        visitedStoryIds={visitedStoryIds}
        playCue={playCue}
        reducedMotion={reducedMotion}
      />
    </Suspense>
  );

  return (
    <main className={`story-experience story-page-${page}`} id="top">
      {page === "part-two" ? <PartTwoAtmosphere /> : null}
      <StoryConnectionPath reducedMotion={reducedMotion} continuousBlue={page === "part-two"} />
      {page === "part-one" ? <StoryIntro reducedMotion={reducedMotion} /> : null}
      {page === "part-one" ? <MoodSetup /> : null}
      {page === "part-one" ? keepsakePlayground : null}
      <StoryScrollytelling
        navigationParts={storyParts}
        parts={pageParts}
        onActiveItemChange={handleActiveItemChange}
        playCue={playCue}
        reducedMotion={reducedMotion}
        startWithTransition={page === "part-two"}
        soundEnabled={soundEnabled}
        visitedStoryIds={visitedStoryIds}
      />
      {page === "part-two" ? keepsakePlayground : null}
      {page === "part-one" ? (
        <StoryPartOneEnding />
      ) : (
        <StoryEnding onReturnToIntro={onReturnToIntro} playCue={playCue} reducedMotion={reducedMotion} separatePartPages />
      )}
    </main>
  );
}
