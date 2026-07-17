import type { CSSProperties } from "react";
import type { StoryThreadState } from "../data/story";
import { threadPaths } from "./threadPaths";

interface ConnectionThreadProps {
  state: StoryThreadState;
  active: boolean;
  reducedMotion: boolean;
  compact?: boolean;
}

export function ConnectionThread({ state, active, reducedMotion, compact = false }: ConnectionThreadProps) {
  const segments = threadPaths[state];
  const drawStyle = {
    "--thread-draw": active || reducedMotion ? 0 : 1,
  } as CSSProperties;

  return (
    <svg
      className={`connection-thread thread-${state} ${compact ? "is-compact" : ""} ${active ? "is-active" : ""}`}
      viewBox="0 0 420 560"
      aria-hidden="true"
      style={drawStyle}
    >
      <g className="thread-shadows">
        {segments.map((segment) => (
          <path
            key={`${segment.id}-shadow`}
            className={`thread-shadow tone-${segment.tone ?? "main"}`}
            d={segment.d}
            pathLength={1}
          />
        ))}
      </g>
      <g className="thread-paths">
        {segments.map((segment) => (
          <path
            key={segment.id}
            className={`thread-path tone-${segment.tone ?? "main"}`}
            d={segment.d}
            pathLength={1}
          />
        ))}
      </g>
      {state === "parallel" ? (
        <g className="thread-sync-nodes">
          <circle className="sync-node sync-node-a" cx="124" cy="228" r="4" />
          <circle className="sync-node sync-node-b" cx="296" cy="228" r="4" />
          <circle className="sync-node sync-node-c" cx="132" cy="388" r="4" />
          <circle className="sync-node sync-node-d" cx="288" cy="388" r="4" />
        </g>
      ) : null}
      {state === "reconnecting" ? <circle className="thread-knot" cx="210" cy="178" r="6" /> : null}
      {state === "staying" ? <path className="thread-exit" d="M210 540 C210 548 210 556 210 560" pathLength={1} /> : null}
    </svg>
  );
}
