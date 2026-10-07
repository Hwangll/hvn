import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import type { StoryChapter } from "../../data/story";
import { MessageBubble } from "../atoms/MessageBubble";
import { SceneAvatar } from "../atoms/SceneAvatar";
import { SceneScreen } from "../atoms/SceneScreen";

interface DisconnectedSceneProps {
  chapter: StoryChapter;
  isActive: boolean;
  reducedMotion: boolean;
}

// Drafts that get typed, hesitated over, and deleted: the things never quite said.
const draftSequence = ["à mà dạo này...", "hôm đó thật ra...", ""];

/** A forget-me-not pressed under the phone: the silence was never forgetting. */
function ForgetMeNot() {
  return (
    <svg className="silent-flower" viewBox="0 0 64 64" aria-hidden="true">
      <path className="flower-stem" d="M31 36 C29 45 22 53 11 60 M36 44 C40 45 43 46 46 48" />
      <path className="flower-leaf" d="M23 50 C15 46 9 49 5 55 C12 57 18 56 23 50 Z" />
      <circle className="flower-bud" cx="48" cy="49" r="3.4" />
      <g className="flower-petals">
        <circle cx="32" cy="20.4" r="6.6" />
        <circle cx="39.2" cy="25.6" r="6.6" />
        <circle cx="36.5" cy="34.2" r="6.6" />
        <circle cx="27.5" cy="34.2" r="6.6" />
        <circle cx="24.8" cy="25.6" r="6.6" />
      </g>
      <circle className="flower-eye" cx="32" cy="28" r="3.3" />
    </svg>
  );
}

export function DisconnectedScene({ chapter, isActive, reducedMotion }: DisconnectedSceneProps) {
  const [draft, setDraft] = useState("");
  const shownDraft = reducedMotion ? draftSequence[0] : draft;

  useEffect(() => {
    if (!isActive || reducedMotion) {
      return undefined;
    }

    let step = 0;
    let index = 0;
    let deleting = false;
    let current = draftSequence[0];
    const interval = window.setInterval(() => {
      if (!deleting && index < current.length) {
        index += 1;
        setDraft(current.slice(0, index));
        if (index === current.length) deleting = true;
        return;
      }
      if (deleting && index > 0) {
        index -= 1;
        setDraft(current.slice(0, index));
        return;
      }
      deleting = false;
      step += 1;
      if (step >= draftSequence.length - 1) {
        window.clearInterval(interval);
        return;
      }
      current = draftSequence[step];
    }, 95);

    return () => window.clearInterval(interval);
  }, [isActive, reducedMotion]);

  return (
    <div className={`memory-scene disconnected-scene ${isActive ? "is-active" : ""}`} aria-hidden="true">
      <div className="silent-desk">
        <ForgetMeNot />
        {/* Her story ring sits in the chat's header: the only thing still watched, from afar. */}
        <SceneScreen
          title="Nờ · Instagram"
          subtitle="story · 2 giờ trước"
          tone="blue"
          className="silent-chat"
          avatar={(
            <span className="story-ring">
              <SceneAvatar src={chapter.image} alt={chapter.imageAlt} initials="N" />
            </span>
          )}
        >
          <div className="chat-log">
            <MessageBubble tone="coral" className="chat-right">mai nói tiếp nha...</MessageBubble>
            <span className="chat-meta">Đã xem · 23:41</span>
            <span className="chat-gap"><i />ba tháng trôi qua<i /></span>
            {/* Three moons for the three months. */}
            <span className="silence-moons"><i /><i /><i /></span>
            <MessageBubble tone="typing" className="chat-left chat-typing">
              <span className="typing-dots"><i /><i /><i /></span>
            </MessageBubble>
            <span className="chat-gap"><i />rồi cả hai đều im<i /></span>
          </div>
          <div className="chat-draft">
            <span>{shownDraft || <em>Nhắn gì đó...</em>}</span>
            <Send size={13} aria-hidden="true" />
          </div>
        </SceneScreen>
        <span className="story-peek">nhìn từ xa thôi</span>
      </div>
      <p className="scene-microcopy">{chapter.microcopy}</p>
    </div>
  );
}
