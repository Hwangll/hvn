import type { StoryChapter } from "../../data/story";
import { MemoryPhoto } from "../atoms/MemoryPhoto";
import { MessageBubble } from "../atoms/MessageBubble";

interface StayingSceneProps {
  chapter: StoryChapter;
  isActive: boolean;
}

export function StayingScene({ chapter, isActive }: StayingSceneProps) {
  return (
    <div className={`memory-scene staying-scene ${isActive ? "is-active" : ""}`} aria-hidden="true">
      <div className="staying-orbit" data-testid="staying-orbit">
        <span className="staying-path staying-path-left" />
        <span className="staying-path staying-path-right" />
        <span className="staying-loop-glow" />
      </div>
      <MemoryPhoto
        src={chapter.image}
        alt={chapter.imageAlt}
        size="warm"
        tilt="none"
        className="staying-keepsake"
        eager={false}
      />
      <MessageBubble tone="coral" className="staying-message">
        {chapter.microcopy}
      </MessageBubble>
      <span className="staying-thread-exit" aria-hidden="true" />
    </div>
  );
}
