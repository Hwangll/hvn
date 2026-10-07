import type { CSSProperties } from "react";
import type { StoryScrollItem } from "../data/story";
import { jumpToStoryTarget } from "../utils/jumpToStoryTarget";
import { partThreeKit } from "../../../app/pageKits";
import { stopDay } from "./film/slateShots";
import { routeIcons, routeLabels } from "./routeStops";

interface MemoryJourneyRouteProps {
  activeId: string;
  items: StoryScrollItem[];
  visitedStoryIds?: ReadonlySet<string>;
}

/** Past this many stops the labels no longer fit under their icons; the route then reads like a strip of film. */
const COMPACT_FROM = 9;

export function MemoryJourneyRoute({ activeId, items, visitedStoryIds = new Set() }: MemoryJourneyRouteProps) {
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));
  const progress = items.length <= 1 ? 1 : activeIndex / (items.length - 1);
  // A long route keeps its stops in a row of small frames, grouped by chapter: only the stop in hand is named, in the
  // heading, with its chapter.
  const compact = items.length >= COMPACT_FROM;
  const active = items[activeIndex];
  // Part III ("Quá nhanh, quá nguy hiểm") drives its route: the red car on a road under the stops, and a speedometer.
  const driven = items[0]?.partId === "too-fast";
  // The birthday, the last stop: the needle in the red, the car at full tilt.
  const redline = driven && activeIndex === items.length - 1;

  return (
    <nav
      className={`memory-journey-route ${compact ? "is-compact" : ""} ${driven ? "is-driven" : ""} ${redline ? "is-redline" : ""}`.replace(/\s+/g, " ").trim()}
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
      {driven && active && partThreeKit.RouteSpeedometer ? <partThreeKit.RouteSpeedometer redline={redline} date={stopDay(active)} /> : null}
      <div className="memory-route-track">
        {driven ? <><i className="memory-route-road" aria-hidden="true" />{partThreeKit.RouteCar ? <partThreeKit.RouteCar /> : null}</> : <span className="memory-route-traveler" aria-hidden="true"><i /></span>}
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
