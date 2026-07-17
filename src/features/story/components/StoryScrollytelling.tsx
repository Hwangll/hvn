import { useEffect } from "react";
import type { StoryChapter } from "../data/story";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import { useActiveStoryStep } from "../hooks/useActiveStoryStep";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { MobileChapterJourney } from "./MobileChapterJourney";
import { StickyMemoryStage } from "./StickyMemoryStage";
import { StoryStep } from "./StoryStep";

interface StoryScrollytellingProps {
  chapters: StoryChapter[];
  onActiveIndexChange?: (index: number) => void;
  playCue?: (cue: SoundCue) => void;
  reducedMotion: boolean;
  soundEnabled: boolean;
}

export function StoryScrollytelling({
  chapters,
  onActiveIndexChange,
  playCue,
  reducedMotion,
  soundEnabled,
}: StoryScrollytellingProps) {
  const isMobile = useMediaQuery("(max-width: 900px)");
  const activeIndex = useActiveStoryStep({ count: chapters.length, disabled: reducedMotion || isMobile });
  const mobileActiveIndex = useActiveStoryStep({ count: chapters.length, disabled: reducedMotion || !isMobile });
  const resolvedIndex = isMobile ? mobileActiveIndex : activeIndex;
  const activeChapter = chapters[resolvedIndex] ?? chapters[0];
  const scope = useScrollAnimation<HTMLDivElement>(!reducedMotion && !isMobile);

  useEffect(() => {
    onActiveIndexChange?.(resolvedIndex);
  }, [resolvedIndex, onActiveIndexChange]);

  return (
    <section id="story" className="story-scrollytelling" ref={scope} aria-label="Các chương câu chuyện">
      {isMobile ? (
        <MobileChapterJourney
          chapters={chapters}
          activeIndex={resolvedIndex}
          playCue={playCue}
          reducedMotion={reducedMotion}
          soundEnabled={soundEnabled}
        />
      ) : (
        <div className="story-scrollytelling-desktop">
          <StickyMemoryStage
            chapter={activeChapter}
            chapters={chapters}
            activeIndex={resolvedIndex}
            reducedMotion={reducedMotion}
          />
          <div className="story-steps">
            {chapters.map((chapter, index) => (
              <StoryStep
                chapter={chapter}
                index={index}
                isActive={index === resolvedIndex}
                key={chapter.id}
                playCue={playCue}
                soundEnabled={soundEnabled}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
