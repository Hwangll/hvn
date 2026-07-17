import type { StoryChapter } from "../../data/story";
import { ConnectionThread } from "../ConnectionThread";
import { DisconnectedScene } from "./DisconnectedScene";
import { MeetingScene } from "./MeetingScene";
import { ParallelScene } from "./ParallelScene";
import { ReconnectingScene } from "./ReconnectingScene";
import { StayingScene } from "./StayingScene";

interface ChapterSceneProps {
  chapter: StoryChapter;
  isActive: boolean;
  reducedMotion: boolean;
}

export function ChapterScene({ chapter, isActive, reducedMotion }: ChapterSceneProps) {
  const renderScene = () => {
    switch (chapter.threadState) {
      case "meeting":
        return <MeetingScene chapter={chapter} isActive={isActive} />;
      case "disconnected":
        return <DisconnectedScene chapter={chapter} isActive={isActive} reducedMotion={reducedMotion} />;
      case "reconnecting":
        return <ReconnectingScene chapter={chapter} isActive={isActive} />;
      case "parallel":
        return <ParallelScene chapter={chapter} isActive={isActive} />;
      case "staying":
        return <StayingScene chapter={chapter} isActive={isActive} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`memory-scene-composite scene-${chapter.threadState} ${isActive ? "is-active" : ""}`}
      data-testid={`scene-${chapter.threadState}`}
      aria-hidden="true"
    >
      <ConnectionThread state={chapter.threadState} active={isActive} reducedMotion={reducedMotion} />
      {renderScene()}
    </div>
  );
}
