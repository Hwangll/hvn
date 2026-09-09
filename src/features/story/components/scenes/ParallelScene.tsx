import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import type { StoryChapter } from "../../data/story";
import { MessageBubble } from "../atoms/MessageBubble";
import { SceneAvatar } from "../atoms/SceneAvatar";

interface ParallelSceneProps {
  chapter: StoryChapter;
  isActive: boolean;
}

const chatFragments = ["hôm nay drama hơi dài", "nghe tôi kể cái này", "ủa 8 tiếng rồi hả"];
const FULL_SHIFT_SECONDS = 8 * 3600;

function formatTimer(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return [hours, minutes, rest].map((part) => String(part).padStart(2, "0")).join(":");
}

/** Two separate roads, one long call between them: eight hours, like a shift at work. */
export function ParallelScene({ chapter, isActive }: ParallelSceneProps) {
  const [elapsed, setElapsed] = useState(FULL_SHIFT_SECONDS);

  useEffect(() => {
    // Only the active scene counts up; an inactive scene simply keeps showing the full shift.
    if (!isActive || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
  }, [isActive]);

  return (
    <div className={`memory-scene parallel-scene ${isActive ? "is-active" : ""}`} aria-hidden="true">
      <div className="parallel-lanes" data-testid="parallel-lanes">
        <div className="lane lane-hat">
          <SceneAvatar initials="H" alt="Hắt" className="lane-avatar lane-avatar-hat" />
          <strong>Hắt</strong>
          <small>đường riêng</small>
          <i className="lane-line" />
        </div>
        <div className="call-card">
          <span className="call-title"><Phone size={13} aria-hidden="true" />Cuộc gọi đang diễn ra</span>
          <strong className="call-timer">{formatTimer(elapsed)}</strong>
          <div className="call-bar"><i style={{ width: `${(elapsed / FULL_SHIFT_SECONDS) * 100}%` }} /></div>
          <div className="call-hours"><span>9:00</span><span>17:00</span></div>
          <small>{chapter.microcopy}</small>
        </div>
        <div className="lane lane-no">
          <SceneAvatar src={chapter.image} alt={chapter.imageAlt} initials="N" className="lane-avatar" />
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
