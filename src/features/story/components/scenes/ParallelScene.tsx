import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Phone } from "lucide-react";
import type { StoryChapter } from "../../data/story";
import { MessageBubble } from "../atoms/MessageBubble";
import { SceneAvatar } from "../atoms/SceneAvatar";

interface ParallelSceneProps {
  chapter: StoryChapter;
  isActive: boolean;
  reducedMotion?: boolean;
}

const chatFragments = ["hôm nay drama hơi dài", "nghe tôi kể cái này", "ủa 8 tiếng rồi hả"];
const FULL_SHIFT_SECONDS = 8 * 3600;
// The voice line of the call: each bar's height as a share of the strip.
const callWave = [0.35, 0.6, 0.9, 0.55, 1, 0.7, 0.45, 0.8, 0.4];

function formatTimer(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return [hours, minutes, rest].map((part) => String(part).padStart(2, "0")).join(":");
}

/** Two separate days ticking side by side, one long call between them: eight hours, like a shift at work. */
export function ParallelScene({ chapter, isActive, reducedMotion = false }: ParallelSceneProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Only the active scene counts up; an inactive scene simply keeps showing the full shift.
    if (!isActive || reducedMotion) {
      return undefined;
    }
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / 1600);
      const eased = 1 - Math.pow(1 - progress, 3);
      setElapsed(Math.round(eased * FULL_SHIFT_SECONDS));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [isActive, reducedMotion]);

  const displayedSeconds = reducedMotion || !isActive ? FULL_SHIFT_SECONDS : elapsed;

  return (
    <div className={`memory-scene parallel-scene ${isActive ? "is-active" : ""}`} aria-hidden="true">
      <div className="parallel-lanes" data-testid="parallel-lanes">
        <div className="lane lane-hat">
          <SceneAvatar initials="H" alt="Hắt" className="lane-avatar lane-avatar-hat" />
          {/* Each road keeps its own clock; the light on it walks down the day at the same pace as the other's. */}
          <i className="lane-clock" />
          <strong>Hắt</strong>
          <small>đường riêng</small>
          <i className="lane-line" />
        </div>
        <div className="call-card">
          <span className="call-title"><Phone size={13} aria-hidden="true" />Cuộc gọi đang diễn ra</span>
          <span className="call-wave">
            {callWave.map((level) => <i key={level} style={{ "--level": level } as CSSProperties} />)}
          </span>
          <strong className="call-timer">{formatTimer(displayedSeconds)}</strong>
          <div className="call-bar"><i style={{ width: `${(displayedSeconds / FULL_SHIFT_SECONDS) * 100}%` }} /></div>
          <div className="call-hours"><span>9:00</span><span>17:00</span></div>
          <small>{chapter.microcopy}</small>
        </div>
        <div className="lane lane-no">
          <SceneAvatar src={chapter.image} alt={chapter.imageAlt} initials="N" className="lane-avatar" />
          <i className="lane-clock" />
          <strong>Nờ</strong>
          <small>đường riêng</small>
          <i className="lane-line" />
        </div>
      </div>
      <div className="parallel-chats">
        {chatFragments.map((fragment, index) => (
          <MessageBubble key={fragment} tone={index % 2 ? "coral" : "paper"} className={index % 2 ? "chat-right" : "chat-left"}>
            {fragment}
          </MessageBubble>
        ))}
      </div>
    </div>
  );
}
