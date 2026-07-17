import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import type { StoryChapter } from "../data/story";
import { ChapterProgress } from "./ChapterProgress";
import { ChapterScene } from "./scenes/ChapterScene";

interface StickyMemoryStageProps {
  chapter: StoryChapter;
  chapters: StoryChapter[];
  activeIndex: number;
  reducedMotion: boolean;
}

export function StickyMemoryStage({ chapter, chapters, activeIndex, reducedMotion }: StickyMemoryStageProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const previousIndexRef = useRef(activeIndex);

  useEffect(() => {
    const content = contentRef.current;
    if (!content || reducedMotion || previousIndexRef.current === activeIndex) {
      previousIndexRef.current = activeIndex;
      return undefined;
    }

    const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });
    timeline.fromTo(content, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.58 });
    previousIndexRef.current = activeIndex;

    return () => {
      timeline.kill();
    };
  }, [activeIndex, reducedMotion]);

  return (
    <aside
      className={`sticky-memory-stage mood-${chapter.mood}`}
      ref={stageRef}
      style={{ "--chapter-accent": chapter.accent } as CSSProperties}
      aria-label={`Kỷ niệm: ${chapter.title}`}
    >
      <div className="memory-canvas" data-testid="memory-canvas">
        <div className="memory-canvas-texture" aria-hidden="true" />
        <header className="memory-canvas-meta">
          <span>{chapter.year}</span>
          <strong>{chapter.shortTitle}</strong>
        </header>
        <div className="memory-canvas-scene" ref={contentRef} key={chapter.id}>
          <ChapterScene chapter={chapter} isActive reducedMotion={reducedMotion} />
        </div>
        <ChapterProgress chapters={chapters} activeIndex={activeIndex} />
      </div>
    </aside>
  );
}
