import type { CSSProperties } from "react";
import { CalendarHeart, Coffee, Fish, HeartHandshake, Sunset } from "lucide-react";
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
};

const routeIcons = {
  "in-person": HeartHandshake,
  dating: CalendarHeart,
  aquarium: Fish,
  cafe: Coffee,
  sunset: Sunset,
} as const;

export function MemoryJourneyRoute({ activeId, items, visitedStoryIds = new Set() }: MemoryJourneyRouteProps) {
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));
  const progress = items.length <= 1 ? 1 : activeIndex / (items.length - 1);

  return (
    <nav
      className="memory-journey-route"
      aria-label="Hành trình ngoài đời"
      style={{ "--route-progress": progress } as CSSProperties}
    >
      <div className="memory-route-heading">
        <span>Hành trình của chúng mình</span>
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

          return (
            <li key={item.id}>
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
