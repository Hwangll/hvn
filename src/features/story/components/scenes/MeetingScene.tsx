import { ArrowRight, Heart } from "lucide-react";
import type { StoryChapter } from "../../data/story";
import { MessageBubble } from "../atoms/MessageBubble";
import { SceneAvatar } from "../atoms/SceneAvatar";

interface MeetingSceneProps {
  chapter: StoryChapter;
  isActive: boolean;
}

// Small hearts that float up out of the match, and the glints that twinkle around it.
const floatingHearts = [1, 2, 3];
const matchSparks = [1, 2, 3];

/** Two profile cards taped side by side lean together, a match glows between them, and the chat moves to Instagram. */
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
        <span className="match-glow" />
        {matchSparks.map((spark) => <i className={`match-spark match-spark-${spark}`} key={spark} />)}
        {floatingHearts.map((heart) => (
          <span className={`match-heart match-heart-${heart}`} key={heart}>
            <Heart aria-hidden="true" fill="currentColor" />
          </span>
        ))}
        <span className="match-badge">
          <Heart size={14} aria-hidden="true" fill="currentColor" />
          match!
        </span>
      </div>
      <div className="meeting-platform">
        <span className="platform-chip platform-bumble"><i />Bumble</span>
        <ArrowRight size={13} aria-hidden="true" />
        <span className="platform-chip platform-instagram"><i />Instagram</span>
      </div>
      <div className="meeting-chat">
        <MessageBubble tone="paper" className="chat-left">hi, match rồi nè</MessageBubble>
        <MessageBubble tone="coral" className="chat-right">qua insta nói tiếp nha</MessageBubble>
      </div>
      <p className="scene-microcopy">{chapter.microcopy}</p>
    </div>
  );
}
