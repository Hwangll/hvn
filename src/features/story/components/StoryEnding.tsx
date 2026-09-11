import { RotateCcw } from "lucide-react";
import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import { endingCopy, partThreeCopy } from "../data/story";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import { splitParagraphs } from "../../../shared/utils/format";
import { BlossomSprig } from "../../../shared/components/visuals/BlossomSprig";
import { PolaroidPhoto } from "../../../shared/components/visuals/PolaroidPhoto";
import { useCountdown } from "../../../shared/hooks/useCountdown";
import { JourneyMap } from "./JourneyMap";
import { SealedEnvelope } from "./SealedEnvelope";

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

  // Part III is a sealed envelope, so the heading tells the reader which state they are looking at.
  const partThreeOpen = useCountdown(partThreeCopy.opensAt).isPast;
  const title = partThreeOpen ? partThreeCopy.openTitle : partThreeCopy.sealedTitle;
  // A trailing ellipsis keeps its three dots as separate glyphs so they can breathe one after another.
  const trailingDots = title.match(/(\.{3}|…)$/)?.[0];
  const titleText = trailingDots ? title.slice(0, -trailingDots.length) : title;
  const titleWords = titleText.trim().split(" ");
  const sectionRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  // The ending reuses the title page's vocabulary: a thread knots, then the words rise one by one.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.2)) setRevealed(true);
    }, { threshold: [0.2] });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={`story-ending ${revealed ? "is-revealed" : ""}`} aria-labelledby="ending-title" ref={sectionRef}>
      <svg className="ending-descent" viewBox="0 0 120 240" aria-hidden="true">
        <path className="descent-thread" d="M60 0 C60 60 40 80 52 120 C64 160 44 190 60 228" pathLength={1} />
        <circle className="descent-knot" cx="60" cy="230" r="3.5" />
      </svg>
      <div className="ending-sky" aria-hidden="true">
        <i className="star-layer star-layer-far" />
        <i className="aurora aurora-one" />
        <i className="aurora aurora-two" />
      </div>
      <div className="ending-copy" data-memory-reveal>
        <BlossomSprig className="ending-blossom" />
        <p className="kicker">{partThreeOpen ? "phần iii" : "open ending"}</p>
        <h2 id="ending-title" aria-label={title}>
          {titleWords.map((word, index) => (
            // The space lives between the clipped word boxes, so the accessible name keeps its word breaks.
            <Fragment key={`${word}-${index}`}>
              {index > 0 ? " " : null}
              <span className="title-word" style={{ "--i": index } as CSSProperties} aria-hidden="true"><span>{word}</span></span>
            </Fragment>
          ))}
          {trailingDots ? <span className="ending-ellipsis" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span> : null}
        </h2>
        <SealedEnvelope />
        {splitParagraphs(endingCopy.body).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <JourneyMap />
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
      <PolaroidPhoto src={endingCopy.image} alt="Hai người đứng cạnh nhau trước ô kính thủy cung, tấm ảnh đôi khép lại câu chuyện" caption={endingCopy.footnote} tilt="right" />
    </section>
  );
}
