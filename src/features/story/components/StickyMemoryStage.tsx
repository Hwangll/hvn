import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import type { StoryScrollItem } from "../data/story";
import { ChapterProgress } from "./ChapterProgress";
import { MemoryJourneyRoute } from "./MemoryJourneyRoute";
import { ChapterScene } from "./scenes/ChapterScene";

interface StickyMemoryStageProps {
  chapter: StoryScrollItem;
  chapters: StoryScrollItem[];
  activeIndex: number;
  reducedMotion: boolean;
  visitedStoryIds?: ReadonlySet<string>;
}

export function StickyMemoryStage({ chapter, chapters, activeIndex, reducedMotion, visitedStoryIds }: StickyMemoryStageProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const previousIndexRef = useRef(activeIndex);

  useEffect(() => {
    const content = contentRef.current;
    if (chapter.partId === "together-offline" || !content || reducedMotion || previousIndexRef.current === activeIndex) {
      previousIndexRef.current = activeIndex;
      return undefined;
    }

    const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });
    timeline.fromTo(content, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.58 });
    previousIndexRef.current = activeIndex;

    return () => {
      timeline.kill();
    };
  }, [activeIndex, chapter.partId, reducedMotion]);

  return (
    <aside
      className={`sticky-memory-stage mood-${chapter.mood}`}
      ref={stageRef}
      style={{ "--chapter-accent": chapter.accent } as CSSProperties}
      aria-label={`Kỷ niệm: ${chapter.title}`}
    >
      <div className={`memory-canvas memory-canvas-${chapter.partId}`} data-testid="memory-canvas">
        <div className="memory-canvas-texture" aria-hidden="true" />
        <div className="memory-canvas-tape" aria-hidden="true" />
        <header className="memory-canvas-meta">
          <span>{chapter.partId === "together-offline" ? "Nhật ký ngoài đời" : chapter.year}</span>
          <strong><i aria-hidden="true" />{chapter.shortTitle}</strong>
        </header>
        {chapter.partId === "together-offline" ? (
          <div className="memory-canvas-scene offline-scene-stack">
            {chapters.map((item, index) => (
              <div className="offline-scene-panel" data-offline-panel={item.id} key={item.id} style={{ opacity: index === 0 ? 1 : 0 }}>
                <ChapterScene chapter={item} isActive={item.id === chapter.id} reducedMotion={reducedMotion} />
              </div>
            ))}
          </div>
        ) : (
          <div className="memory-canvas-scene" ref={contentRef} key={chapter.id}>
            <ChapterScene chapter={chapter} isActive reducedMotion={reducedMotion} />
          </div>
        )}
        {chapter.partId === "together-offline" ? (
          <MemoryJourneyRoute activeId={chapter.id} items={chapters} visitedStoryIds={visitedStoryIds} />
        ) : (
          <ChapterProgress items={chapters} activeId={chapter.id} visitedStoryIds={visitedStoryIds} />
        )}
      </div>
    </aside>
  );
}
