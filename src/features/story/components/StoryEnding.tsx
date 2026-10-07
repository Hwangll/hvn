import { ArrowRight, RotateCcw } from "lucide-react";
import { Fragment, memo, useEffect, useRef, useState, type CSSProperties } from "react";
import { endingCopy, partThreeCopy } from "../data/story";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import { splitParagraphs } from "../../../shared/utils/format";
import { BlossomSprig } from "../../../shared/components/visuals/BlossomSprig";
import { Meteors } from "../../../shared/components/motion/Meteors";
import { Lantern } from "./StoryArt";

/** Paper lanterns rising behind the ending, each on its own slow clock: wishes for the chapter still sealed. */
const endingLanterns = [
  { left: "9%", size: 34, life: 46, delay: -6 },
  { left: "24%", size: 24, life: 58, delay: -30 },
  { left: "71%", size: 30, life: 52, delay: -14 },
  { left: "86%", size: 22, life: 64, delay: -44 },
  { left: "48%", size: 20, life: 70, delay: -58 },
];
import { PolaroidPhoto } from "../../../shared/components/visuals/PolaroidPhoto";
import { useHasPassed } from "../../../shared/hooks/useCountdown";
import { JourneyMap } from "./JourneyMap";
import { SealedEnvelope } from "./SealedEnvelope";

interface StoryEndingProps {
  onReturnToIntro: () => void;
  playCue?: (cue: SoundCue) => void;
  reducedMotion: boolean;
  separatePartPages?: boolean;
}

export const StoryEnding = memo(function StoryEnding({ onReturnToIntro, playCue, reducedMotion, separatePartPages = false }: StoryEndingProps) {
  const replay = (targetId: "part-before-meeting" | "our-dates") => {
    playCue?.("replay");
    document.getElementById(targetId)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  const returnToIntro = () => {
    playCue?.("dissolve");
    onReturnToIntro();
  };

  // Part III came as a sealed envelope, so the heading tells the reader which state they are looking at; once it is open
  // the envelope leads on to Part III's own page.
  const partThreeOpen = useHasPassed(partThreeCopy.opensAt);
  const nextPart = partThreeOpen ? partThreeCopy.link : undefined;
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
    <section className={`story-ending ${revealed ? "is-revealed" : ""}`} aria-labelledby="ending-title" ref={sectionRef} data-idle-zone>
      <svg className="ending-descent" viewBox="0 0 120 240" aria-hidden="true">
        <path className="descent-thread" d="M60 0 C60 60 40 80 52 120 C64 160 44 190 60 228" pathLength={1} />
        <circle className="descent-knot" cx="60" cy="230" r="3.5" />
      </svg>
      <div className="ending-sky" aria-hidden="true">
        <i className="star-layer star-layer-far" />
        <i className="aurora aurora-one" />
        <i className="aurora aurora-two" />
      </div>
      {/* Beside the sky rather than in it: under the sky's fade mask each streak would repaint the whole sky. */}
      <Meteors />
      <div className="ending-lanterns" aria-hidden="true">
        {endingLanterns.map((lantern) => (
          <span
            className="ending-lantern"
            style={{ left: lantern.left, "--size": `${lantern.size}px`, "--life": `${lantern.life}s`, "--delay": `${lantern.delay}s` } as CSSProperties}
            key={lantern.left}
          >
            <Lantern />
          </span>
        ))}
      </div>
      <span className="story-weaver ending-firefly is-a" aria-hidden="true" />
      <span className="story-weaver ending-firefly is-b" aria-hidden="true" />
      <span className="story-weaver ending-firefly is-c" aria-hidden="true" />
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
        <SealedEnvelope copy={partThreeCopy} />
        {splitParagraphs(endingCopy.body).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <JourneyMap />
        <div className="ending-actions">
          {nextPart ? (
            <a className="replay-button next-part-link story-page-link has-shimmer" href={nextPart.href} data-magnetic onClick={() => playCue?.("select")}>
              <span>{nextPart.label}</span>
              <ArrowRight aria-hidden="true" size={18} />
            </a>
          ) : null}
          {separatePartPages ? (
            <a className={`replay-button story-page-link ${nextPart ? "is-quiet" : "has-shimmer"}`} href="/" data-magnetic onClick={() => playCue?.("replay")}>
              <RotateCcw aria-hidden="true" size={18} />
              <span>{endingCopy.replayAllCta}</span>
            </a>
          ) : (
            <button className={`replay-button ${nextPart ? "is-quiet" : "has-shimmer"}`} type="button" data-magnetic onClick={() => replay("part-before-meeting")}>
              <RotateCcw aria-hidden="true" size={18} />
              <span>{endingCopy.replayAllCta}</span>
            </button>
          )}
          <button className="dates-replay-button" type="button" data-magnetic onClick={() => replay("our-dates")}>
            <span>{endingCopy.replayDatesCta}</span>
          </button>
          <button className="intro-return-button" type="button" data-magnetic onClick={returnToIntro}>
            Trở lại phòng ký ức
          </button>
        </div>
      </div>
      <PolaroidPhoto src={endingCopy.image} alt="Hai người đứng cạnh nhau trước ô kính thủy cung, tấm ảnh đôi khép lại câu chuyện" caption={endingCopy.footnote} tilt="right" />
    </section>
  );
});
