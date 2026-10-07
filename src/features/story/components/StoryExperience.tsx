import { useCallback, useMemo, useState } from "react";
import { createStoryScrollItems, scrollRibbonCopy, storyParts, type StoryPartId, type StoryScrollItem } from "../data/story";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import { pageScopes, type StoryPage } from "../../../app/storyPage";
import { StoryScrollytelling } from "./StoryScrollytelling";
import { StoryConnectionPath } from "./StoryConnectionPath";
import { StoryEnding } from "./StoryEnding";
import { StoryIntro } from "../../intro/components/StoryIntro";
import { MoodSetup } from "../../intro/components/MoodSetup";
import { PartTwoAtmosphere } from "./PartTwoAtmosphere";
import { PartOneAtmosphere } from "./PartOneAtmosphere";
import { PartOneDepth } from "./PartOneDepth";
import { PartTwoDepth } from "./PartTwoDepth";
import { PartThreeAtmosphere } from "./PartThreeAtmosphere";
import { PartThreeDepth } from "./PartThreeDepth";
import { StoryPartThreeEnding } from "./StoryPartThreeEnding";
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

const pagePartIds: Record<StoryPage, StoryPartId> = {
  "part-one": "before-meeting",
  "part-two": "together-offline",
  "part-three": "too-fast",
};

/** The air of each page: petals by day, glints by night, embers in Part III's red room. */
const pageVariants = { "part-one": "day", "part-two": "night", "part-three": "ember" } as const;

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
  // On a phone the layered backgrounds hold still (depth-field.css), so there is nothing for the fallback to move either.
  useDepthParallaxFallback(revealScope, !reducedMotion && !mobile);
  // Touch scrolling carries its own momentum; the layers' lag is for the wheel and trackpad, and phones keep the frames.
  useDepthInertia(revealScope, !reducedMotion && !mobile);
  useScrollChoreography(revealScope, page, mobile, reducedMotion);
  const pageParts = useMemo(() => storyParts.filter((part) => part.id === pagePartIds[page]), [page]);
  const pageItems = useMemo(() => createStoryScrollItems(pageParts), [pageParts]);
  const moods = useMemo(() => pageParts[0]?.chapters.map((chapter) => chapter.mood) ?? [], [pageParts]);
  /** The page's chapters by name, for the ribbon that runs past once they have all been read. */
  const chapterNames = useMemo(() => pageItems.map((item) => item.shortTitle.toLocaleLowerCase("vi")), [pageItems]);
  // Reaching a new chapter re-renders this page. Its scenery (the depth, the skies, the ribbons, the hero and the endings)
  // is memoized and has nothing that changes with it, so only the chapters and the keepsake box render again: on a phone,
  // rebuilding everything at every new chapter was a hitch in the middle of the scroll.
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
    <main className={`story-experience ${pageScopes[page].main}`} id="top" ref={revealScope}>
      {page === "part-one" ? <PartOneAtmosphere moods={moods} reducedMotion={reducedMotion} /> : null}
      {page === "part-two" ? <PartTwoAtmosphere reducedMotion={reducedMotion} /> : null}
      {page === "part-three" ? <PartThreeAtmosphere reducedMotion={reducedMotion} /> : null}
      {page === "part-one" ? <PartOneDepth /> : page === "part-two" ? <PartTwoDepth /> : <PartThreeDepth />}
      {/* Part I's page-length thread, in the margins beside the chapters. A phone has no margins: there it would cross the
          words, and redrawing it as it unwinds would cost every frame of the scroll. Parts II and III carry their own
          thread motif on the title page and the ending. */}
      {page === "part-one" && !mobile ? <StoryConnectionPath reducedMotion={reducedMotion} /> : null}
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
        startWithTransition={page !== "part-one"}
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
      {page === "part-three" ? (
        <>
          <ScrollRibbon tone="night" placement="stops" front={chapterNames} back={scrollRibbonCopy.partThreeStops.back} reducedMotion={reducedMotion} />
          <StoryPartThreeEnding onReturnToIntro={onReturnToIntro} playCue={playCue} />
        </>
      ) : null}
      {page === "part-one" ? (
        <>
          <ScrollRibbon tone="rose" placement="recap" front={chapterNames} back={scrollRibbonCopy.partOneRecap.back} reducedMotion={reducedMotion} />
          <StoryPartOneEnding />
        </>
      ) : null}
      {page === "part-two" ? <StoryEnding onReturnToIntro={onReturnToIntro} playCue={playCue} reducedMotion={reducedMotion} separatePartPages /> : null}
      <DreamVeil variant={pageVariants[page]} />
      {/* Petals by day, glints by night, embers in the red room, blowing past the reader while the page scrolls. */}
      {reducedMotion ? null : <ScrollWind variant={pageVariants[page]} mobile={mobile} />}
    </main>
  );
}
