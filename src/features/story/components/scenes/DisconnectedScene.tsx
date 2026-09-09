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
      <SceneScreen title="Nờ · Instagram" tone="blue" className="silent-chat">
        <div className="chat-log">
          <MessageBubble tone="coral" className="chat-right">mai nói tiếp nha...</MessageBubble>
          <span className="chat-meta">Đã xem · 23:41</span>
          <span className="chat-gap"><i />ba tháng trôi qua<i /></span>
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
      <div className="story-peek">
        <span className="story-ring">
          <SceneAvatar src={chapter.image} alt={chapter.imageAlt} initials="N" />
        </span>
        <small>story · 2 giờ trước<br />nhìn từ xa thôi</small>
      </div>
      <p className="scene-microcopy">{chapter.microcopy}</p>
    </div>
  );
}
