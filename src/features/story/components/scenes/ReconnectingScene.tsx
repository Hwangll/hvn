import { Check, UserPlus } from "lucide-react";
import type { StoryChapter } from "../../data/story";
import { MemoryPhoto } from "../atoms/MemoryPhoto";
import { MessageBubble } from "../atoms/MessageBubble";
import { SceneAvatar } from "../atoms/SceneAvatar";
import { SceneScreen } from "../atoms/SceneScreen";

interface ReconnectingSceneProps {
  chapter: StoryChapter;
  isActive: boolean;
}

/** The algorithm suggests an old name; one small button later, the chat picks up mid-sentence. */
export function ReconnectingScene({ chapter, isActive }: ReconnectingSceneProps) {
  return (
    <div className={`memory-scene reconnecting-scene ${isActive ? "is-active" : ""}`} aria-hidden="true">
      <div className="reconnect-desk">
        {/* Her photo is tucked in behind the phone, so it never covers the conversation. */}
        <MemoryPhoto src={chapter.image} alt={chapter.imageAlt} size="small" className="reconnect-photo" />
        <SceneScreen title="Facebook · Gợi ý kết bạn" tone="paper">
          <div className="suggest-card">
            <SceneAvatar src={chapter.image} alt={chapter.imageAlt} initials="N" className="suggest-avatar" />
            <div className="suggest-copy">
              <strong>Nờ</strong>
              <span>Người có thể bạn biết</span>
              <small>12 bạn chung · và từng lỡ mất</small>
            </div>
            <span className="add-friend">
              <button type="button" className="add-friend-btn" tabIndex={-1} aria-hidden="true">
                <span className="label-add"><UserPlus size={13} aria-hidden="true" />Add friend</span>
                <span className="label-sent"><Check size={13} aria-hidden="true" />Đã gửi</span>
              </button>
              {/* A few glints fly off the button the moment the request goes out. */}
              <span className="add-friend-sparks"><i /><i /><i /><i /></span>
            </span>
          </div>
          <div className="chat-log">
            <span className="chat-meta">Nờ đã chấp nhận lời mời</span>
            <MessageBubble tone="paper" className="chat-left">{chapter.microcopy}</MessageBubble>
            <MessageBubble tone="coral" className="chat-right">ờ, lại gặp :))</MessageBubble>
            <MessageBubble tone="paper" className="chat-left">như chưa từng mất kết nối</MessageBubble>
          </div>
        </SceneScreen>
      </div>
    </div>
  );
}
