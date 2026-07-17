import { useEffect, useState } from "react";
import type { StoryChapter } from "../../data/story";
import { MemoryPhoto } from "../atoms/MemoryPhoto";
import { MessageBubble } from "../atoms/MessageBubble";

interface DisconnectedSceneProps {
  chapter: StoryChapter;
  isActive: boolean;
  reducedMotion: boolean;
}

const typingSequence = ["mai nói tiếp nha...", "đợi tí...", ""];

export function DisconnectedScene({ chapter, isActive, reducedMotion }: DisconnectedSceneProps) {
  const [animatedText, setAnimatedText] = useState("");
  const typedText = reducedMotion ? typingSequence[0] : animatedText;

  useEffect(() => {
    if (!isActive || reducedMotion) {
      return undefined;
    }

    let frame = 0;
    let charIndex = 0;
    let current = typingSequence[0];
    const interval = window.setInterval(() => {
      if (charIndex < current.length) {
        setAnimatedText(current.slice(0, charIndex + 1));
        charIndex += 1;
        return;
      }

      frame += 1;
      if (frame >= typingSequence.length) {
        window.clearInterval(interval);
        return;
      }

      current = typingSequence[frame];
      charIndex = 0;
      setAnimatedText("");
    }, 90);

    return () => window.clearInterval(interval);
  }, [isActive, reducedMotion]);

  return (
    <div className={`memory-scene disconnected-scene ${isActive ? "is-active" : ""}`} aria-hidden="true">
      <MessageBubble tone="typing" className="disconnected-typing">
        đang nhập...
        {typedText ? <em>{typedText}</em> : null}
      </MessageBubble>
      <div className="unsent-note">
        <small>chưa gửi</small>
        <span>mai nói tiếp nha...</span>
      </div>
      <MessageBubble tone="muted" className="disconnected-seen">
        seen từ một vũ trụ khác
      </MessageBubble>
      <MemoryPhoto
        src={chapter.image}
        alt={chapter.imageAlt}
        size="small"
        tilt="right"
        className="disconnected-photo"
      />
      <p className="scene-microcopy">{chapter.microcopy}</p>
    </div>
  );
}
