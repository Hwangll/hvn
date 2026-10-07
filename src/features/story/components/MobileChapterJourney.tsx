import type { CSSProperties } from "react";
import type { StoryScrollItem } from "../data/story";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import { ChapterProgress } from "./ChapterProgress";
import { StoryStep } from "./StoryStep";
import { ChapterScene } from "./scenes/ChapterScene";
import { CanvasSlate } from "./film/ChapterSlate";
import { RouteSpeedometer } from "./film/RouteDashboard";
import { SceneMoment } from "./film/SceneMoment";
import { opensChapter } from "./film/slateShots";

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
  // Part III drives its chapters (as its route does on a desktop): the red car on the progress line, and a speedometer
  // whose needle stands at each stop's place in the month.
  const driven = items[0]?.partId === "too-fast";

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
          <ChapterProgress items={items} activeId={chapter.id} visitedStoryIds={visitedStoryIds} vehicle={driven} />
          <header className="mobile-chapter-meta">
            <p>
              CHƯƠNG {String(chapter.chapterIndex).padStart(2, "0")}
              {chapter.sceneIndex ? ` · CẢNH ${String(chapter.sceneIndex).padStart(2, "0")}` : ""}
              {` · ${chapter.shortTitle.toUpperCase()}`}
            </p>
            <span>{chapter.year}</span>
            {driven ? (
              <span className="mobile-speedometer" style={{ "--route-progress": index / Math.max(1, items.length - 1) } as CSSProperties}>
                <RouteSpeedometer redline={index === items.length - 1} />
              </span>
            ) : null}
          </header>
          {/* The canvas is its own idle zone: it scrolls away well before the reader leaves the chapter's copy. */}
          <div className="mobile-scene-canvas" data-idle-zone>
            <ChapterScene chapter={chapter} isActive={chapter.id === activeId} reducedMotion={reducedMotion} />
            {chapter.partId === "too-fast" ? <SceneMoment chapter={chapter} playCue={playCue} /> : null}
            {/* Part III's chapters each open on a slate that claps over their first scene. */}
            {chapter.partId === "too-fast" && !reducedMotion && opensChapter(items, index) ? <CanvasSlate item={chapter} /> : null}
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
