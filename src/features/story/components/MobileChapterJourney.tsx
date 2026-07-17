import type { StoryChapter } from "../data/story";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import { ChapterProgress } from "./ChapterProgress";
import { StoryStep } from "./StoryStep";
import { ChapterScene } from "./scenes/ChapterScene";

interface MobileChapterJourneyProps {
  chapters: StoryChapter[];
  activeIndex: number;
  playCue?: (cue: SoundCue) => void;
  reducedMotion: boolean;
  soundEnabled: boolean;
}

export function MobileChapterJourney({
  chapters,
  activeIndex,
  playCue,
  reducedMotion,
  soundEnabled,
}: MobileChapterJourneyProps) {
  return (
    <div className="mobile-chapter-journey" data-testid="mobile-chapter-journey">
      {chapters.map((chapter, index) => (
        <section
          key={chapter.id}
          className={`mobile-chapter-block ${index === activeIndex ? "is-active" : ""}`}
          data-story-step
          id={chapter.id}
        >
          <ChapterProgress chapters={chapters} activeIndex={activeIndex} />
          <header className="mobile-chapter-meta">
            <p>
              CHƯƠNG {String(index + 1).padStart(2, "0")} · {chapter.shortTitle.toUpperCase()}
            </p>
            <span>{chapter.year}</span>
          </header>
          <div className="mobile-scene-canvas">
            <ChapterScene chapter={chapter} isActive={index === activeIndex} reducedMotion={reducedMotion} />
          </div>
          <StoryStep
            chapter={chapter}
            index={index}
            isActive={index === activeIndex}
            playCue={playCue}
            soundEnabled={soundEnabled}
            variant="mobile"
          />
        </section>
      ))}
    </div>
  );
}
