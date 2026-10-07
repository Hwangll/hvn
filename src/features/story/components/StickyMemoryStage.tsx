import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import type { StoryScrollItem } from "../data/story";
import { PartOneChapterIndex } from "./PartOneChapterIndex";
import { ChapterProgress } from "./ChapterProgress";
import { MemoryJourneyRoute } from "./MemoryJourneyRoute";
import { ChapterScene } from "./scenes/ChapterScene";
import { partThreeKit } from "../../../app/pageKits";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import { usePointerParallax } from "../../../shared/hooks/usePointerParallax";

/** What the stage is called in the parts written as a diary of days together; Part I's names each chapter's year. */
const diaryLabels: Partial<Record<StoryScrollItem["partId"], string>> = {
  "together-offline": "Nhật ký ngoài đời",
  "too-fast": "Thước phim mùa thu",
};

interface StickyMemoryStageProps {
  chapter: StoryScrollItem;
  chapters: StoryScrollItem[];
  activeIndex: number;
  playCue?: (cue: SoundCue) => void;
  reducedMotion: boolean;
  visitedStoryIds?: ReadonlySet<string>;
}

export function StickyMemoryStage({ chapter, chapters, activeIndex, playCue, reducedMotion, visitedStoryIds }: StickyMemoryStageProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const previousIndexRef = useRef(activeIndex);
  // Parts II and III hold every scene in one stack that the scroll engine crossfades (usePartTwoScroll).
  const stacked = chapter.partNumber > 1;
  // Their layers lean toward the cursor (CSS reads --mx/--my); the scroll engine keeps owning `transform`.
  usePointerParallax(stageRef, stacked && !reducedMotion);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (stacked || !content || reducedMotion || previousIndexRef.current === activeIndex) {
      previousIndexRef.current = activeIndex;
      return undefined;
    }

    const direction = activeIndex > previousIndexRef.current ? 1 : -1;
    const context = gsap.context(() => {
      gsap.fromTo(content,
        { autoAlpha: 0.2, y: 18 * direction, scale: 0.985 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.72, ease: "power3.out" },
      );
    }, content);
    previousIndexRef.current = activeIndex;

    // Revert also restores visibility when reduced motion is enabled mid-transition.
    return () => context.revert();

  }, [activeIndex, stacked, reducedMotion]);

  return (
    <aside
      className={`sticky-memory-stage mood-${chapter.mood}`}
      ref={stageRef}
      style={{ "--chapter-accent": chapter.accent } as CSSProperties}
      aria-label={`Kỷ niệm: ${chapter.title}`}
    >
      {/* Part III's canvas also takes Part II's class: it goes on in the same diary (see pageScopes). */}
      <div
        className={`memory-canvas memory-canvas-${chapter.partId} ${chapter.partId === "too-fast" ? "memory-canvas-together-offline" : ""}`.trim()}
        data-testid="memory-canvas"
      >
        <div className="memory-canvas-texture" aria-hidden="true" />
        <div className="memory-canvas-tape" aria-hidden="true" />
        <header className="memory-canvas-meta">
          <span>{diaryLabels[chapter.partId] ?? chapter.year}</span>
          <strong><i aria-hidden="true" />{chapter.shortTitle}</strong>
        </header>
        {stacked ? (
          <div className="memory-canvas-scene offline-scene-stack">
            {chapters.map((item, index) => (
              <div className="offline-scene-panel" data-offline-panel={item.id} key={item.id} style={{ opacity: index === 0 ? 1 : 0 }}>
                {/* Every stage panel stays live: idle loops breathe through the dissolve and pause via .is-hidden when a panel is gone. */}
                <ChapterScene chapter={item} isActive reducedMotion={reducedMotion} />
                {/* Part III's scenes with something to touch: the birthday candles, the claw machine at Playik. */}
                {item.partId === "too-fast" && partThreeKit.SceneMoment ? <partThreeKit.SceneMoment chapter={item} playCue={playCue} /> : null}
              </div>
            ))}
            {/* Part III is a film: a slate claps in front of the stage as each of its chapters begins. */}
            {chapter.partId === "too-fast" && !reducedMotion && partThreeKit.StageSlate ? <partThreeKit.StageSlate items={chapters} activeIndex={activeIndex} /> : null}
          </div>
        ) : (
          <div className="memory-canvas-scene" ref={contentRef} key={chapter.id}>
            <ChapterScene chapter={chapter} isActive reducedMotion={reducedMotion} />
          </div>
        )}
        {stacked ? (
          <MemoryJourneyRoute activeId={chapter.id} items={chapters} visitedStoryIds={visitedStoryIds} />
        ) : (
          <div className="diary-stage-navigation">
            <ChapterProgress items={chapters} activeId={chapter.id} visitedStoryIds={visitedStoryIds} />
            <PartOneChapterIndex items={chapters} activeId={chapter.id} compact />
          </div>
        )}
      </div>
    </aside>
  );
}
