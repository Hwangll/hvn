import { RotateCcw } from "lucide-react";
import { endingCopy } from "../data/story";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import { splitParagraphs } from "../../../shared/utils/format";
import { BlossomSprig } from "../../../shared/components/visuals/BlossomSprig";
import { PolaroidPhoto } from "../../../shared/components/visuals/PolaroidPhoto";

interface StoryEndingProps {
  onReturnToIntro: () => void;
  playCue?: (cue: SoundCue) => void;
  reducedMotion: boolean;
  separatePartPages?: boolean;
}

export function StoryEnding({ onReturnToIntro, playCue, reducedMotion, separatePartPages = false }: StoryEndingProps) {
  const replay = (targetId: "part-before-meeting" | "our-dates") => {
    playCue?.("replay");
    document.getElementById(targetId)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  const returnToIntro = () => {
    playCue?.("dissolve");
    onReturnToIntro();
  };

  return (
    <section className="story-ending" aria-labelledby="ending-title">
      <div className="ending-copy" data-reveal>
        <BlossomSprig className="ending-blossom" />
        <p className="kicker">open ending</p>
        <h2 id="ending-title">{endingCopy.title}</h2>
        {splitParagraphs(endingCopy.body).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <div className="ending-actions">
          {separatePartPages ? (
            <a className="replay-button story-page-link" href="/" onClick={() => playCue?.("replay")}>
              <RotateCcw aria-hidden="true" size={18} />
              <span>{endingCopy.replayAllCta}</span>
            </a>
          ) : (
            <button className="replay-button" type="button" onClick={() => replay("part-before-meeting")}>
              <RotateCcw aria-hidden="true" size={18} />
              <span>{endingCopy.replayAllCta}</span>
            </button>
          )}
          <button className="dates-replay-button" type="button" onClick={() => replay("our-dates")}>
            <span>{endingCopy.replayDatesCta}</span>
          </button>
          <button className="intro-return-button" type="button" onClick={returnToIntro}>
            Trở lại phòng ký ức
          </button>
        </div>
      </div>
      <PolaroidPhoto src={endingCopy.image} alt="Người yêu chụp ảnh cạnh hoa hồng cho chương kết" caption={endingCopy.footnote} tilt="right" />
    </section>
  );
}
