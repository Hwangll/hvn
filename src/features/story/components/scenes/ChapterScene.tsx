import { memo } from "react";
import type { StoryScrollItem } from "../../data/story";
import { ConnectionThread } from "../ConnectionThread";
import { DisconnectedScene } from "./DisconnectedScene";
import { MeetingScene } from "./MeetingScene";
import { ParallelScene } from "./ParallelScene";
import { ReconnectingScene } from "./ReconnectingScene";
import { StayingScene } from "./StayingScene";
import { TogetherScene } from "./TogetherScene";
import { partThreeKit } from "../../../../app/pageKits";

interface ChapterSceneProps {
  chapter: StoryScrollItem;
  isActive: boolean;
  reducedMotion: boolean;
}

export const ChapterScene = memo(function ChapterScene({ chapter, isActive, reducedMotion }: ChapterSceneProps) {
  const renderScene = () => {
    switch (chapter.threadState) {
      case "meeting":
        return <MeetingScene chapter={chapter} isActive={isActive} />;
      case "disconnected":
        return <DisconnectedScene chapter={chapter} isActive={isActive} reducedMotion={reducedMotion} />;
      case "reconnecting":
        return <ReconnectingScene chapter={chapter} isActive={isActive} />;
      case "parallel":
        return <ParallelScene chapter={chapter} isActive={isActive} reducedMotion={reducedMotion} />;
      case "staying":
        return <StayingScene chapter={chapter} isActive={isActive} />;
      case "in-person":
      case "dating":
      case "aquarium":
      case "cafe":
      case "sunset":
        return <TogetherScene chapter={chapter} isActive={isActive} />;
      case "homestay":
      case "apps":
      case "office":
      case "museum":
      case "pagoda":
      case "rain":
      case "karaoke":
      case "clinic":
      case "lakeside":
      case "notebook":
      case "acoustic":
      case "planner":
      case "lantern":
      case "bento":
      case "birthday":
        return partThreeKit.Scene ? <partThreeKit.Scene chapter={chapter} isActive={isActive} /> : null;
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
});
