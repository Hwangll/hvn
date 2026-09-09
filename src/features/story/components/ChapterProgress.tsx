import type { CSSProperties } from "react";
import type { StoryScrollItem } from "../data/story";
import { jumpToStoryTarget } from "../utils/jumpToStoryTarget";

interface ChapterProgressProps {
  items: StoryScrollItem[];
  activeId: string;
  visitedStoryIds?: ReadonlySet<string>;
}

export function ChapterProgress({ items, activeId, visitedStoryIds = new Set() }: ChapterProgressProps) {
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];
  const chapters = items.filter((item, index) => items.findIndex((candidate) => candidate.chapterId === item.chapterId) === index);
  const activeChapterIndex = Math.max(0, chapters.findIndex((item) => item.chapterId === activeItem.chapterId));
  const progress = chapters.length <= 1 ? 1 : activeChapterIndex / (chapters.length - 1);
  const sceneLabel = activeItem.sceneIndex && activeItem.sceneCount
    ? ` · CẢNH ${String(activeItem.sceneIndex).padStart(2, "0")}/${String(activeItem.sceneCount).padStart(2, "0")}`
    : "";

  return (
    <nav className="story-chapter-progress" aria-label="Tiến trình câu chuyện">
      <span className="story-chapter-progress-count" aria-live="polite">
        {String(activeItem.chapterIndex).padStart(2, "0")} / {String(activeItem.chapterCount).padStart(2, "0")}
      </span>
      <div
        className="story-chapter-progress-track"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={chapters.length}
        aria-valuenow={activeItem.chapterIndex}
        aria-label="Tiến độ chương"
      >
        <span className="story-chapter-progress-fill" style={{ "--progress": progress } as CSSProperties} />
        <ol className="story-chapter-progress-dots">
          {chapters.map((chapter) => {
            const chapterItems = items.filter((item) => item.chapterId === chapter.chapterId);
            const hasVisitedChapter = chapterItems.some((item) => visitedStoryIds.has(item.id));
            const isActiveChapter = chapter.chapterId === activeItem.chapterId;

            return <li key={chapter.chapterId}>
              <a
                href={`#${chapter.id}`}
                className={`story-chapter-progress-dot ${isActiveChapter ? "is-active" : ""} ${hasVisitedChapter ? "is-seen" : ""}`}
                aria-label={`Chương ${String(chapter.chapterIndex).padStart(2, "0")}: ${chapter.shortTitle}`}
                aria-current={isActiveChapter ? "step" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  jumpToStoryTarget(chapter.id);
                }}
              >
                <span className="sr-only">{chapter.shortTitle}</span>
              </a>
            </li>;
          })}
        </ol>
      </div>
      <strong className="story-chapter-progress-label">{activeItem.shortTitle.toUpperCase()}{sceneLabel}</strong>
    </nav>
  );
}
