import type { CSSProperties } from "react";
import { CakeSlice, CalendarDays, CalendarHeart, CloudSunRain, Coffee, CupSoda, Film, Fish, Flower2, Gift, Guitar, HeartHandshake, Landmark, Mic, Moon, NotebookPen, Smartphone, Stethoscope, Sunset, Utensils } from "lucide-react";
import type { StoryScrollItem, StoryThreadState } from "../data/story";
import { jumpToStoryTarget } from "../utils/jumpToStoryTarget";

interface MemoryJourneyRouteProps {
  activeId: string;
  items: StoryScrollItem[];
  visitedStoryIds?: ReadonlySet<string>;
}

const routeLabels: Partial<Record<StoryThreadState, string>> = {
  "in-person": "Đi lượn",
  dating: "Mixue",
  aquarium: "Thủy cung",
  cafe: "Café",
  sunset: "Hoàng hôn",
  homestay: "Homestay",
  apps: "Bi & Bơ",
  office: "Hoàng Mai",
  museum: "Lăng Bác",
  pagoda: "Chùa",
  rain: "Chiều tà",
  karaoke: "Đi hát",
  clinic: "Phòng khám",
  lakeside: "Văn Quán",
  notebook: "Tiny cf",
  acoustic: "Cúc cu",
  planner: "Lên lịch",
  lantern: "Trung thu",
  bento: "Phùng Khoang",
  birthday: "Sinh nhật",
};

const routeIcons = {
  "in-person": HeartHandshake,
  dating: CalendarHeart,
  aquarium: Fish,
  cafe: Coffee,
  sunset: Sunset,
  homestay: Film,
  apps: Smartphone,
  office: CakeSlice,
  museum: Landmark,
  pagoda: Flower2,
  rain: CloudSunRain,
  karaoke: Mic,
  clinic: Stethoscope,
  lakeside: CupSoda,
  notebook: NotebookPen,
  acoustic: Guitar,
  planner: CalendarDays,
  lantern: Moon,
  bento: Utensils,
  birthday: Gift,
} as const;

/** Past this many stops the labels no longer fit under their icons; the route then reads like a strip of film. */
const COMPACT_FROM = 9;

export function MemoryJourneyRoute({ activeId, items, visitedStoryIds = new Set() }: MemoryJourneyRouteProps) {
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));
  const progress = items.length <= 1 ? 1 : activeIndex / (items.length - 1);
  // A long route keeps its stops in a row of small frames, grouped by chapter: only the stop in hand is named, in the
  // heading, with its chapter.
  const compact = items.length >= COMPACT_FROM;
  const active = items[activeIndex];

  return (
    <nav
      className={`memory-journey-route ${compact ? "is-compact" : ""}`.trim()}
      aria-label="Hành trình ngoài đời"
      style={{ "--route-progress": progress, "--route-stops": items.length } as CSSProperties}
    >
      <div className="memory-route-heading">
        <span>
          {compact && active
            ? <>Chương {String(active.chapterIndex).padStart(2, "0")} <i aria-hidden="true">·</i> <b>{routeLabels[active.threadState] ?? active.shortTitle}</b></>
            : "Hành trình của chúng mình"}
        </span>
        <strong>{String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</strong>
      </div>
      <div className="memory-route-track">
        <span className="memory-route-traveler" aria-hidden="true"><i /></span>
        <ol>
        {items.map((item, index) => {
          const Icon = routeIcons[item.threadState as keyof typeof routeIcons];
          const isActive = item.id === activeId;
          const isSeen = visitedStoryIds.has(item.id) || index <= activeIndex;
          const label = routeLabels[item.threadState] ?? item.shortTitle;
          const opensChapter = index > 0 && items[index - 1].chapterIndex !== item.chapterIndex;

          return (
            <li key={item.id} className={opensChapter ? "opens-chapter" : undefined} data-chapter={String(item.chapterIndex).padStart(2, "0")}>
              <a
                href={`#${item.id}`}
                className={`${isActive ? "is-active" : ""} ${isSeen ? "is-seen" : ""}`}
                aria-current={isActive ? "step" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  jumpToStoryTarget(item.id);
                }}
              >
                <span className="memory-route-icon" aria-hidden="true">
                  {Icon ? <Icon size={15} strokeWidth={2.2} /> : <span />}
                </span>
                <span className="memory-route-label">{label}</span>
              </a>
            </li>
          );
        })}
        </ol>
      </div>
    </nav>
  );
}
