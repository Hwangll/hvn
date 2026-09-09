import { ArrowDown } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { StoryPart } from "../data/story";
import { createStoryScrollItems, partTransitionCopy } from "../data/story";

interface StoryPartTransitionProps {
  onInView?: (partId: StoryPart["id"]) => void;
  part: StoryPart;
}

/** The title page of a part: a quiet lead, the title rising word by word, and the stops ahead. */
export function StoryPartTransition({ onInView, part }: StoryPartTransitionProps) {
  const transitionRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const words = useMemo(() => partTransitionCopy.title.split(" "), []);
  const accentCount = useMemo(() => partTransitionCopy.accent.split(" ").length, []);
  const stops = useMemo(() => createStoryScrollItems([part]).map((item) => ({ id: item.id, label: item.shortTitle })), [part]);

  useEffect(() => {
    const transition = transitionRef.current;
    if (!transition || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) setRevealed(true);
        if (entry.isIntersecting && entry.intersectionRatio >= 0.45) onInView?.(part.id);
      }
    }, { threshold: [0.2, 0.45] });
    observer.observe(transition);

    return () => observer.disconnect();
  }, [onInView, part.id]);

  return (
    <section
      className={`story-part-transition ${revealed ? "is-revealed" : ""}`}
      id={`part-${part.id}`}
      aria-labelledby={`${part.id}-transition-title`}
      data-reveal
      ref={transitionRef}
    >
      <span className="part-transition-numeral" aria-hidden="true">{part.number === 2 ? "II" : "I"}</span>
      <svg className="part-transition-descent" viewBox="0 0 120 240" aria-hidden="true">
        <path className="descent-thread" d="M60 0 C60 60 40 80 52 120 C64 160 44 190 60 228" pathLength={1} />
        <circle className="descent-knot" cx="60" cy="230" r="3.5" />
      </svg>
      <div className="part-transition-copy">
        {partTransitionCopy.lead.map((paragraph, index) => (
          <p key={paragraph} style={{ "--i": index } as CSSProperties}>{paragraph}</p>
        ))}
      </div>
      <div className="part-transition-title">
        <span className="part-transition-eyebrow"><i /> {partTransitionCopy.eyebrow} <i /></span>
        <h2 id={`${part.id}-transition-title`}>
          {words.map((word, index) => (
            // The space lives between the clipped word boxes, so the accessible name keeps its word breaks.
            <Fragment key={`${word}-${index}`}>
              {index > 0 ? " " : null}
              <span className={`title-word ${index < accentCount ? "is-accent" : ""}`} style={{ "--i": index } as CSSProperties}>
                <span>{word}</span>
              </span>
            </Fragment>
          ))}
        </h2>
        <p>{part.subtitle}</p>
      </div>
      <ol className="part-transition-stops" aria-hidden="true">
        {stops.map((stop, index) => (
          <li key={stop.id} style={{ "--i": index } as CSSProperties}><i />{stop.label}</li>
        ))}
      </ol>
      <ArrowDown className="part-transition-arrow" aria-hidden="true" size={22} />
    </section>
  );
}
