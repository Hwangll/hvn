import { ArrowLeft, RotateCcw } from "lucide-react";
import { Fragment, memo, useEffect, useRef, useState, type CSSProperties } from "react";
import { nextPartCopy, partHrefs, partThreeEndingCopy } from "../data/story";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import { PolaroidPhoto } from "../../../shared/components/visuals/PolaroidPhoto";
import { SealedEnvelope } from "./SealedEnvelope";

interface StoryPartThreeEndingProps {
  onReturnToIntro: () => void;
  playCue?: (cue: SoundCue) => void;
}

const copy = partThreeEndingCopy;
// A trailing ellipsis keeps its three dots as separate glyphs so they can breathe one after another (as in Part II).
const trailingDots = copy.title.match(/(\.{3}|…)$/)?.[0];
const titleWords = (trailingDots ? copy.title.slice(0, -trailingDots.length) : copy.title).trim().split(" ");

/**
 * Part III ends the way the film it is named after would: the curtains close in from the sides, "Còn tiếp..." rises word
 * by word as Part II's ending does, and the credits roll up line by line as the reader scrolls (every name in them is
 * from Ngọc's letter). Then the next chapter's envelope, sealed with its countdown, and the ways back.
 */
export const StoryPartThreeEnding = memo(function StoryPartThreeEnding({ onReturnToIntro, playCue }: StoryPartThreeEndingProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.2)) setRevealed(true);
    }, { threshold: [0.2] });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const returnToIntro = () => {
    playCue?.("dissolve");
    onReturnToIntro();
  };

  return (
    <section className={`story-ending part-three-ending ${revealed ? "is-revealed" : ""}`} aria-labelledby="part-three-ending-title" ref={sectionRef} data-idle-zone>
      <svg className="ending-descent" viewBox="0 0 120 240" aria-hidden="true">
        <path className="descent-thread" d="M60 0 C60 60 40 80 52 120 C64 160 44 190 60 228" pathLength={1} />
        <circle className="descent-knot" cx="60" cy="230" r="3.5" />
      </svg>
      <div className="ending-sky p3-ending-sky" aria-hidden="true">
        <i className="star-layer star-layer-far" />
        <i className="aurora aurora-one" />
        <i className="aurora aurora-two" />
      </div>
      <div className="p3-curtains" aria-hidden="true"><i className="is-left" /><i className="is-right" /></div>
      <div className="ending-copy" data-memory-reveal>
        <p className="kicker">{copy.kicker}</p>
        <h2 id="part-three-ending-title" aria-label={copy.title}>
          {titleWords.map((word, index) => (
            // The space lives between the clipped word boxes, so the accessible name keeps its word breaks.
            <Fragment key={`${word}-${index}`}>
              {index > 0 ? " " : null}
              <span className="title-word" style={{ "--i": index } as CSSProperties} aria-hidden="true"><span>{word}</span></span>
            </Fragment>
          ))}
          {trailingDots ? <span className="ending-ellipsis" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span> : null}
        </h2>
        <div className="p3-credits">
          <p className="p3-credits-lead">{copy.creditsTitle}</p>
          <p className="p3-credits-stars">{copy.stars}</p>
          <dl>
            {copy.credits.map((credit) => (
              <div className="p3-credit" key={credit.role}>
                <dt>{credit.role}</dt>
                <dd>
                  {/* A name never breaks across lines, and its dot stays with it, so a line can't start with one. */}
                  {credit.names.map((name, index) => (
                    <Fragment key={name}>
                      {index > 0 ? "\u00a0· " : null}
                      <span className="p3-credit-name">{name}</span>
                    </Fragment>
                  ))}
                  {credit.note ? <small>{credit.note}</small> : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <SealedEnvelope copy={nextPartCopy} />
        <div className="ending-actions">
          <a className="replay-button story-page-link has-shimmer" href={partHrefs["before-meeting"]} data-magnetic onClick={() => playCue?.("replay")}>
            <RotateCcw aria-hidden="true" size={18} />
            <span>{copy.replayAllCta}</span>
          </a>
          <a className="dates-replay-button story-page-link previous-part-link" href={partHrefs["together-offline"]} data-magnetic onClick={() => playCue?.("replay")}>
            <ArrowLeft aria-hidden="true" size={16} />
            <span>{copy.previousPartCta}</span>
          </a>
          <button className="intro-return-button" type="button" data-magnetic onClick={returnToIntro}>
            Trở lại phòng ký ức
          </button>
        </div>
      </div>
      <PolaroidPhoto src={copy.image} alt={copy.imageAlt} caption={copy.footnote} tilt="right" />
    </section>
  );
});
