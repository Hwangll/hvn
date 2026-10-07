import { CalendarHeart, Heart, RefreshCw } from "lucide-react";
import type { StoryChapter } from "../../data/story";
import { MemoryPhoto } from "../atoms/MemoryPhoto";

interface StayingSceneProps {
  chapter: StoryChapter;
  isActive: boolean;
}

const streakDays = Array.from({ length: 14 }, (_, index) => index + 1);
// One cherry petal, centred on the origin with its notch at the top.
const PETAL = "M0 8 C-5.5 3 -6.5 -5 -3.5 -10.5 L0 -7.5 L3.5 -10.5 C6.5 -5 5.5 3 0 8 Z";
const blossomTurns = [0, 72, 144, 216, 288];
// Petals come loose and lie on the page: where, how turned and how large.
const loosePetals = [
  { x: 20, y: 40, turn: -35, size: 1 },
  { x: 50, y: 22, turn: 25, size: 0.8 },
  { x: 76, y: 46, turn: 70, size: 0.65 },
];

/** A cherry blossom pressed flat at the corner of the photograph. */
function PressedBlossom() {
  return (
    <svg className="staying-blossom" viewBox="0 0 48 48" aria-hidden="true">
      {blossomTurns.map((turn) => (
        <path className="blossom-petal" d={PETAL} transform={`rotate(${turn} 24 24) translate(24 16)`} key={turn} />
      ))}
      <circle className="blossom-heart" cx="24" cy="24" r="3.2" />
    </svg>
  );
}

/** A few of its petals, fallen loose on the page below. */
function LoosePetals() {
  return (
    <svg className="staying-petals" viewBox="0 0 96 64" aria-hidden="true">
      {loosePetals.map((petal) => (
        <path
          className="blossom-petal"
          d={PETAL}
          transform={`translate(${petal.x} ${petal.y}) rotate(${petal.turn}) scale(${petal.size})`}
          key={petal.x}
        />
      ))}
    </svg>
  );
}

/** Coming back is one day; staying is every day after. A desk calendar fills with hearts to say it plainly. */
export function StayingScene({ chapter, isActive }: StayingSceneProps) {
  return (
    <div className={`memory-scene staying-scene ${isActive ? "is-active" : ""}`} aria-hidden="true">
      <span className="staying-glow" />
      <LoosePetals />
      <div className="staying-frame">
        <span className="staying-tape" />
        <MemoryPhoto src={chapter.image} alt={chapter.imageAlt} size="warm" tilt="none" className="staying-keepsake" />
        <PressedBlossom />
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
        <small><span>không chỉ quay lại,</span> <span>mà còn ở lại</span></small>
      </div>
      <span className="plot-twist-sticker">
        <RefreshCw size={13} aria-hidden="true" />
        plot twist
      </span>
    </div>
  );
}
