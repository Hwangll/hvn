import { ArrowUpRight } from "lucide-react";
import type { StoryScrollItem } from "../data/story";
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
