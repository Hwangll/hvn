import { CalendarHeart, Heart, RefreshCw } from "lucide-react";
import type { StoryChapter } from "../../data/story";
import { MemoryPhoto } from "../atoms/MemoryPhoto";

interface StayingSceneProps {
  chapter: StoryChapter;
  isActive: boolean;
}

const streakDays = Array.from({ length: 14 }, (_, index) => index + 1);

/** Coming back is one day; staying is every day after. A streak calendar says it plainly. */
export function StayingScene({ chapter, isActive }: StayingSceneProps) {
  return (
    <div className={`memory-scene staying-scene ${isActive ? "is-active" : ""}`} aria-hidden="true">
      <span className="staying-glow" />
      <div className="staying-frame">
        <span className="staying-tape" />
        <MemoryPhoto src={chapter.image} alt={chapter.imageAlt} size="warm" tilt="none" className="staying-keepsake" />
        <span className="staying-note">{chapter.microcopy}</span>
      </div>
      <div className="staying-calendar" data-testid="staying-calendar">
        <header>
          <CalendarHeart size={14} aria-hidden="true" />
          <span>2026 · mỗi ngày</span>
        </header>
        <ol>
          {streakDays.map((day) => (
            <li key={day} className={day === streakDays.length ? "is-today" : ""} style={{ "--day": day } as React.CSSProperties}>
              <Heart size={10} aria-hidden="true" fill="currentColor" />
            </li>
          ))}
        </ol>
        <small>không chỉ quay lại, mà còn ở lại</small>
      </div>
      <span className="plot-twist-sticker">
        <RefreshCw size={13} aria-hidden="true" />
        plot twist
      </span>
    </div>
  );
}
