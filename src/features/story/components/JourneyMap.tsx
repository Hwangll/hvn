import type { CSSProperties } from "react";
import { journeyMapCopy, journeyMapStops } from "../data/story";
import { jumpToStoryTarget } from "../utils/jumpToStoryTarget";

/** The route across the city, in the order the five stops happened. */
const ROUTE = "M76 416 C82 392 96 358 108 330 C138 258 84 170 72 96 C80 132 104 178 160 212 C198 228 238 202 268 172";

/**
 * A stylised map of Hà Nội carrying the five places Part II actually happened. The map itself holds only
 * numbers, so nothing collides at any size; the names live in the index beside it, where each stop is a
 * real link back to its chapter. The route draws itself once the ending scrolls into view.
 */
export function JourneyMap() {
  return (
    <figure className="journey-map">
      <figcaption className="journey-map-heading">
        <span>{journeyMapCopy.eyebrow}</span>
        <strong>{journeyMapCopy.title}</strong>
      </figcaption>

      <div className="journey-map-body">
        <svg className="journey-map-canvas" viewBox="52 58 316 386" aria-hidden="true">
          <defs>
            <linearGradient id="journey-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2d6c93" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#123c5c" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="journey-thread" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffc48f" />
              <stop offset="55%" stopColor="#ffd9a8" />
              <stop offset="100%" stopColor="#ffe9c8" />
            </linearGradient>
          </defs>

          <g className="journey-map-water">
            {/* Hồ Tây and Trúc Bạch, drawn with the shoulders the real lakes have. */}
            <path d="M117 130 C117 96 152 76 195 76 C238 76 273 100 273 132 C273 160 246 180 210 180 C170 180 117 164 117 130 Z" />
            <path d="M276 176 C276 166 288 161 301 163 C314 165 321 177 319 190 C317 203 304 209 292 205 C280 201 276 188 276 176 Z" />
            <path className="journey-map-river" d="M356 52 C342 126 352 222 332 312 C318 380 324 416 316 450" />
          </g>
          <g className="journey-map-place">
            <text x="196" y="132" textAnchor="middle">HỒ TÂY</text>
            <text x="344" y="238" textAnchor="middle" transform="rotate(80 344 238)">SÔNG HỒNG</text>
          </g>

          <path className="journey-map-shadow" d={ROUTE} pathLength={1} />
          <path className="journey-map-thread" d={ROUTE} pathLength={1} />

          {journeyMapStops.map((stop, index) => (
            <g className="journey-map-pin" key={stop.id} style={{ "--i": index } as CSSProperties}>
              <circle className="journey-map-halo" cx={stop.x} cy={stop.y} r="14" />
              <circle className="journey-map-dot" cx={stop.x} cy={stop.y} r="9" />
              <text className="journey-map-index" x={stop.x} y={stop.y + 3.6} textAnchor="middle">{index + 1}</text>
            </g>
          ))}
        </svg>

        <ol className="journey-map-index-list">
          {journeyMapStops.map((stop, index) => (
            <li key={stop.id} style={{ "--i": index } as CSSProperties}>
              <a
                href={`#${stop.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  jumpToStoryTarget(stop.id);
                }}
              >
                <b aria-hidden="true">{index + 1}</b>
                <span>
                  <strong>{stop.name}</strong>
                  <small>{stop.place}</small>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>

      <p className="journey-map-note">{journeyMapCopy.note}</p>
    </figure>
  );
}
