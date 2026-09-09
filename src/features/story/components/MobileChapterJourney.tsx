import type { StoryScrollItem } from "../data/story";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import { ChapterProgress } from "./ChapterProgress";
import { StoryStep } from "./StoryStep";
import { ChapterScene } from "./scenes/ChapterScene";

interface MobileChapterJourneyProps {
  items: StoryScrollItem[];
  activeId: string;
  playCue?: (cue: SoundCue) => void;
  reducedMotion: boolean;
  soundEnabled: boolean;
  visitedStoryIds?: ReadonlySet<string>;
}

export function MobileChapterJourney({
  items,
  activeId,
  playCue,
  reducedMotion,
  soundEnabled,
  visitedStoryIds,
}: MobileChapterJourneyProps) {
  return (
    <div className="mobile-chapter-journey" data-testid="mobile-chapter-journey">
      {items.map((chapter, index) => (
        <section
          key={chapter.id}
          className={`mobile-chapter-block ${chapter.id === activeId ? "is-active" : ""}`}
          data-story-step
          data-story-step-id={chapter.id}
          id={chapter.id}
        >
          <ChapterProgress items={items} activeId={chapter.id} visitedStoryIds={visitedStoryIds} />
          <header className="mobile-chapter-meta">
            <p>
              CHƯƠNG {String(chapter.chapterIndex).padStart(2, "0")}
              {chapter.sceneIndex ? ` · CẢNH ${String(chapter.sceneIndex).padStart(2, "0")}` : ""}
              {` · ${chapter.shortTitle.toUpperCase()}`}
            </p>
            <span>{chapter.year}</span>
          </header>
          <div className="mobile-scene-canvas">
            <ChapterScene chapter={chapter} isActive={chapter.id === activeId} reducedMotion={reducedMotion} />
          </div>
          <StoryStep
            chapter={chapter}
            index={index}
            isActive={chapter.id === activeId}
            playCue={playCue}
            soundEnabled={soundEnabled}
            variant="mobile"
          />
        </section>
      ))}
    </div>
  );
}
