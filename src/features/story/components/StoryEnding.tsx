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

  // "Còn tiếp..." keeps its three dots as separate glyphs so they can breathe one after another.
  const trailingDots = endingCopy.title.match(/(\.{3}|…)$/)?.[0];
  const titleText = trailingDots ? endingCopy.title.slice(0, -trailingDots.length) : endingCopy.title;

  return (
    <section className="story-ending" aria-labelledby="ending-title">
      <div className="ending-sky" aria-hidden="true">
        <i className="star-layer star-layer-far" />
        <i className="aurora aurora-one" />
        <i className="aurora aurora-two" />
      </div>
      <div className="ending-copy" data-memory-reveal>
        <BlossomSprig className="ending-blossom" />
        <p className="kicker">open ending</p>
        <h2 id="ending-title">
          {titleText}
          {trailingDots ? <span className="ending-ellipsis"><i>.</i><i>.</i><i>.</i></span> : null}
        </h2>
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
