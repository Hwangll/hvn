import { Clock3 } from "lucide-react";
import type { StoryChapter } from "../../data/story";
import { MemoryPhoto } from "../atoms/MemoryPhoto";
import { MessageBubble } from "../atoms/MessageBubble";

interface ParallelSceneProps {
  chapter: StoryChapter;
  isActive: boolean;
}

const chatFragments = ["hôm nay drama hơi dài", "nghe tôi kể cái này", "8 tiếng như đi làm"];

export function ParallelScene({ chapter, isActive }: ParallelSceneProps) {
  return (
    <div className={`memory-scene parallel-scene ${isActive ? "is-active" : ""}`} aria-hidden="true">
      <div className="parallel-scene-label">
        <span>Hai đường riêng</span>
        <strong>cùng một nhịp</strong>
      </div>
      <div className="parallel-lanes" data-testid="parallel-lanes">
        <div className="parallel-lane lane-hat">
          <span className="lane-label">Hắt</span>
          <svg className="lane-path" viewBox="0 0 200 24" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 12 C40 8 80 16 120 12 C160 8 180 14 200 12" />
          </svg>
          <span className="lane-node lane-node-1" />
          <span className="lane-node lane-node-2" />
        </div>
        <div className="parallel-clock" aria-label="Thời gian nói chuyện">
          <Clock3 size={18} aria-hidden="true" />
          <strong>
            <span className="clock-from">0h</span>
            <span className="clock-to">8h</span>
          </strong>
          <small>{chapter.microcopy}</small>
        </div>
        <div className="parallel-lane lane-no">
          <span className="lane-label">Nở</span>
          <svg className="lane-path" viewBox="0 0 200 24" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 12 C35 16 75 8 115 12 C155 16 175 10 200 12" />
          </svg>
          <span className="lane-node lane-node-1" />
          <span className="lane-node lane-node-2" />
        </div>
        <MemoryPhoto
          src={chapter.image}
          alt={chapter.imageAlt}
          size="small"
          tilt="right"
          className="parallel-photo"
        />
      </div>
      <div className="parallel-chats">
        {chatFragments.map((fragment) => (
          <MessageBubble key={fragment} tone="paper">
            {fragment}
          </MessageBubble>
        ))}
      </div>
    </div>
  );
}
