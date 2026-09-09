import { ArrowRight, Heart } from "lucide-react";
import type { StoryChapter } from "../../data/story";
import { MessageBubble } from "../atoms/MessageBubble";
import { SceneAvatar } from "../atoms/SceneAvatar";

interface MeetingSceneProps {
  chapter: StoryChapter;
  isActive: boolean;
}

/** Two swipe cards drift together, a match lands, and the chat moves over to Instagram. */
export function MeetingScene({ chapter, isActive }: MeetingSceneProps) {
  return (
    <div className={`memory-scene meeting-scene ${isActive ? "is-active" : ""}`} aria-hidden="true">
      <div className="match-stage">
        <article className="swipe-card swipe-card-left">
          <SceneAvatar initials="H" alt="Hắt" className="swipe-avatar swipe-avatar-hat" />
          <strong>Hắt</strong>
          <small>năm hai · hơi mơ</small>
        </article>
        <article className="swipe-card swipe-card-right">
          <SceneAvatar src={chapter.image} alt={chapter.imageAlt} initials="N" className="swipe-avatar" />
          <strong>Nờ</strong>
          <small>năm ba · hơi bận</small>
        </article>
        <span className="match-badge">
          <Heart size={14} aria-hidden="true" fill="currentColor" />
          match!
        </span>
      </div>
      <div className="meeting-platform">
        <span>Bumble</span>
        <ArrowRight size={13} aria-hidden="true" />
        <span>Instagram</span>
      </div>
      <div className="meeting-chat">
        <MessageBubble tone="paper" className="chat-left">hi, match rồi nè</MessageBubble>
        <MessageBubble tone="coral" className="chat-right">qua insta nói tiếp nha</MessageBubble>
      </div>
      <p className="scene-microcopy">{chapter.microcopy}</p>
    </div>
  );
}
