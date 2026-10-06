import { useCallback, useMemo, useState } from "react";
import { createStoryScrollItems, scrollRibbonCopy, storyParts, type StoryScrollItem } from "../data/story";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import type { StoryPage } from "../../../app/storyPage";
import { StoryScrollytelling } from "./StoryScrollytelling";
import { StoryConnectionPath } from "./StoryConnectionPath";
import { StoryEnding } from "./StoryEnding";
import { StoryIntro } from "../../intro/components/StoryIntro";
import { MoodSetup } from "../../intro/components/MoodSetup";
import { PartTwoAtmosphere } from "./PartTwoAtmosphere";
import { PartOneAtmosphere } from "./PartOneAtmosphere";
import { PartOneDepth } from "./PartOneDepth";
import { PartTwoDepth } from "./PartTwoDepth";
import { DreamVeil } from "./DreamVeil";
import { ScrollRibbon } from "./ScrollRibbon";
import { ScrollWind } from "./ScrollWind";
import { useMemoryReveals } from "../../../shared/hooks/useMemoryReveals";
import { useScrollChoreography } from "../hooks/useScrollChoreography";
import { useDepthInertia } from "../hooks/useDepthInertia";
import { useIdleZones } from "../../../shared/hooks/useIdleZones";
import { useDepthParallaxFallback } from "../../../shared/hooks/useDepthParallaxFallback";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { StoryPartOneEnding } from "./StoryPartOneEnding";
// The box's copy and controls render with the page; its three.js scene loads itself once the box is near.
import { KeepsakePlayground } from "../../memories/components/KeepsakePlayground";

interface StoryExperienceProps {
  onReturnToIntro: () => void;
  page: StoryPage;
  playCue?: (cue: SoundCue) => void;
  reducedMotion: boolean;
  soundEnabled: boolean;
}

export function StoryExperience({ onReturnToIntro, page, playCue, reducedMotion, soundEnabled }: StoryExperienceProps) {
  const mobile = useMediaQuery("(max-width: 900px)");
  const revealScope = useMemoryReveals(reducedMotion, mobile);
  useIdleZones(revealScope);
  useDepthParallaxFallback(revealScope, !reducedMotion);
  // Touch scrolling carries its own momentum; the layers' lag is for the wheel and trackpad, and phones keep the frames.
  useDepthInertia(revealScope, !reducedMotion && !mobile);
  useScrollChoreography(revealScope, page, mobile, reducedMotion);
  const pageParts = useMemo(
    () => storyParts.filter((part) => part.id === (page === "part-two" ? "together-offline" : "before-meeting")),
    [page],
  );
  const pageItems = useMemo(() => createStoryScrollItems(pageParts), [pageParts]);
  /** The page's chapters by name, for the ribbon that runs past once they have all been read. */
  const chapterNames = useMemo(() => pageItems.map((item) => item.shortTitle.toLocaleLowerCase("vi")), [pageItems]);
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
    <KeepsakePlayground
      partId={pageParts[0]?.id}
      visitedStoryIds={visitedStoryIds}
      playCue={playCue}
      reducedMotion={reducedMotion}
    />
  );

  return (
    <main className={`story-experience story-page-${page}`} id="top" ref={revealScope}>
      {page === "part-two"
        ? <PartTwoAtmosphere reducedMotion={reducedMotion} />
        : <PartOneAtmosphere moods={pageParts[0]?.chapters.map((chapter) => chapter.mood) ?? []} reducedMotion={reducedMotion} />}
      {page === "part-one" ? <PartOneDepth /> : <PartTwoDepth />}
      {/* Part I's page-length thread; Part II carries its own thread motif on the title page and the ending. */}
      {page === "part-one" ? <StoryConnectionPath reducedMotion={reducedMotion} /> : null}
      {page === "part-one" ? (
        <>
          <StoryIntro reducedMotion={reducedMotion} />
          <ScrollRibbon tone="rose" placement="opening" {...scrollRibbonCopy.partOneOpening} reducedMotion={reducedMotion} />
          <MoodSetup />
          {keepsakePlayground}
        </>
      ) : null}
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
      {page === "part-two" ? (
        <>
          <ScrollRibbon tone="night" placement="stops" front={chapterNames} back={scrollRibbonCopy.partTwoStops.back} reducedMotion={reducedMotion} />
          {keepsakePlayground}
          <ScrollRibbon tone="night" placement="closing" {...scrollRibbonCopy.partTwoClosing} reducedMotion={reducedMotion} />
        </>
      ) : null}
      {page === "part-one" ? (
        <>
          <ScrollRibbon tone="rose" placement="recap" front={chapterNames} back={scrollRibbonCopy.partOneRecap.back} reducedMotion={reducedMotion} />
          <StoryPartOneEnding />
        </>
      ) : (
        <StoryEnding onReturnToIntro={onReturnToIntro} playCue={playCue} reducedMotion={reducedMotion} separatePartPages />
      )}
      <DreamVeil variant={page === "part-two" ? "night" : "day"} />
      {/* Petals by day, glints by night, blowing past the reader while the page scrolls. */}
      {reducedMotion ? null : <ScrollWind variant={page === "part-two" ? "night" : "day"} mobile={mobile} />}
    </main>
  );
}
