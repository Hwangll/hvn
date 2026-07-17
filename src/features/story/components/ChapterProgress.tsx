import type { CSSProperties } from "react";
import type { StoryChapter } from "../data/story";

interface ChapterProgressProps {
  chapters: StoryChapter[];
  activeIndex: number;
}

export function ChapterProgress({ chapters, activeIndex }: ChapterProgressProps) {
  const activeChapter = chapters[activeIndex] ?? chapters[0];
  const progress = chapters.length <= 1 ? 1 : activeIndex / (chapters.length - 1);

  return (
    <nav className="story-chapter-progress" aria-label="Tiến trình câu chuyện">
      <span className="story-chapter-progress-count" aria-live="polite">
        {String(activeChapter.index).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}
      </span>
      <div
        className="story-chapter-progress-track"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={chapters.length}
        aria-valuenow={activeChapter.index}
        aria-label="Tiến độ chương"
      >
        <span className="story-chapter-progress-fill" style={{ "--progress": progress } as CSSProperties} />
        <ol className="story-chapter-progress-dots">
          {chapters.map((chapter, index) => (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                className={`story-chapter-progress-dot ${index === activeIndex ? "is-active" : ""} ${index < activeIndex ? "is-seen" : ""}`}
                aria-label={`Chương ${String(chapter.index).padStart(2, "0")}: ${chapter.shortTitle}`}
                aria-current={index === activeIndex ? "step" : undefined}
              >
                <span className="sr-only">{chapter.shortTitle}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
      <strong className="story-chapter-progress-label">{activeChapter.shortTitle.toUpperCase()}</strong>
    </nav>
  );
}
