import { ArrowUpRight } from "lucide-react";
import { m } from "motion/react";
import type { StoryScrollItem } from "../data/story";
import { springs } from "../../../shared/motion/springs";
import { jumpToStoryTarget } from "../utils/jumpToStoryTarget";

interface PartOneChapterIndexProps {
  items: readonly StoryScrollItem[];
  activeId?: string;
  compact?: boolean;
}

export function PartOneChapterIndex({ items, activeId, compact = false }: PartOneChapterIndexProps) {
  if (!items.length) return null;
  return (
    <nav className={`diary-chapter-index ${compact ? "is-compact" : ""}`} aria-label={compact ? "Chọn chương Phần I" : "Mục lục Phần I"}>
      {!compact ? (
        <div className="diary-index-heading">
          <span>MỤC LỤC / PHẦN I</span>
          <strong>Năm chương, một hành trình</strong>
        </div>
      ) : null}
      <ol>
        {items.map((item, index) => (
          <li key={item.id}>
            <a href={`#${item.id}`} aria-current={item.id === activeId ? "step" : undefined} onClick={(event) => {
              event.preventDefault();
              jumpToStoryTarget(item.id);
            }}>
              {/* The current chapter's marker glides along the index as the reader moves on (shared layout, Motion). */}
              {compact && item.id === activeId ? <m.span className="diary-index-marker" layoutId="diary-index-marker" transition={springs.settle} aria-hidden="true" /> : null}
              <span className="diary-index-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span className="diary-index-name">{item.shortTitle}</span>
              {!compact ? <span className="diary-index-year">{item.year}</span> : null}
              {!compact ? <ArrowUpRight size={15} aria-hidden="true" /> : null}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
