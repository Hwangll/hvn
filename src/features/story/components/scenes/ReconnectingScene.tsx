import { MousePointer2 } from "lucide-react";
import type { StoryChapter } from "../../data/story";
import { MemoryPhoto } from "../atoms/MemoryPhoto";
import { MessageBubble } from "../atoms/MessageBubble";
import { RecommendationCard } from "../atoms/RecommendationCard";

interface ReconnectingSceneProps {
  chapter: StoryChapter;
  isActive: boolean;
}

export function ReconnectingScene({ chapter, isActive }: ReconnectingSceneProps) {
  return (
    <div className={`memory-scene reconnecting-scene ${isActive ? "is-active" : ""}`} aria-hidden="true">
      <RecommendationCard />
      <button type="button" className="add-friend-btn" tabIndex={-1} aria-hidden="true">
        <MousePointer2 size={15} aria-hidden="true" />
        Add friend
      </button>
      <MessageBubble tone="coral" className="reconnect-message">
        {chapter.microcopy}
      </MessageBubble>
      <MemoryPhoto
        src={chapter.image}
        alt={chapter.imageAlt}
        size="medium"
        tilt="left"
        className="reconnect-photo"
      />
    </div>
  );
}
