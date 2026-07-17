import { Send } from "lucide-react";
import type { StoryChapter } from "../../data/story";
import { MemoryPhoto } from "../atoms/MemoryPhoto";
import { ProfileNote } from "../atoms/ProfileNote";

interface MeetingSceneProps {
  chapter: StoryChapter;
  isActive: boolean;
}

export function MeetingScene({ chapter, isActive }: MeetingSceneProps) {
  return (
    <div className={`memory-scene meeting-scene ${isActive ? "is-active" : ""}`} aria-hidden="true">
      <ProfileNote name="Hắt" detail="năm hai / hơi mơ" position="left" />
      <ProfileNote name="Nở" detail="năm ba / hơi bận" position="right" />
      <div className="meeting-platform">
        <span>Bumble</span>
        <Send size={14} aria-hidden="true" />
        <span>Instagram</span>
      </div>
      <p className="scene-microcopy">{chapter.microcopy}</p>
      <MemoryPhoto
        src={chapter.image}
        alt={chapter.imageAlt}
        size="small"
        tilt="left"
        className="meeting-photo"
        eager={chapter.index === 1}
      />
    </div>
  );
}
