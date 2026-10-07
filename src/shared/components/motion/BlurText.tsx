import { Fragment, useCallback, useRef } from "react";
import { m } from "motion/react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { springs } from "../../motion/springs";
import { useRevealOnce } from "../../motion/useRevealOnce";

// Opacity, filter and a whole `transform` are what Motion can hand to the compositor (WAAPI). Back in focus, the word
// drops both, so a settled heading is plain text again.
const wordVariants = {
  hidden: { opacity: 0, filter: "blur(10px)", transform: "translateY(0.3em)" },
  shown: { opacity: 1, filter: "blur(0px)", transform: "translateY(0em)", transitionEnd: { filter: "none", transform: "none" } },
};
// On a phone the words only rise and fade in: a blur on every word of a heading at once was a pass per word, per frame,
// while the page was still moving under the reader's thumb.
const phoneWordVariants = {
  hidden: { opacity: 0, transform: "translateY(0.3em)" },
  // No blur to animate, but one left by a window narrowed mid-reveal is still cleared once the word is in.
  shown: { opacity: 1, transform: "translateY(0em)", transitionEnd: { filter: "none", transform: "none" } },
};

interface BlurTextProps {
  text: string;
  as?: "h2" | "h3" | "p" | "strong";
  id?: string;
  className?: string;
  /** Seconds between one word and the next. */
  stagger?: number;
}

/**
 * A line whose words surface one after another, out of a soft blur, the first time it is read (Blur Text, React Bits;
 * Text Generate Effect, Aceternity); on a phone they rise without the blur. The element keeps the whole sentence as its
 * accessible name, and readers who prefer reduced motion get the plain line.
 */
export function BlurText({ text, as: Tag = "h2", id, className, stagger = 0.08 }: BlurTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const attach = useCallback((element: HTMLElement | null) => {
    ref.current = element;
  }, []);
  const revealed = useRevealOnce(ref, 0.6);
  const reducedMotion = useReducedMotion();
  const phone = useMediaQuery("(max-width: 900px)");

  if (reducedMotion) return <Tag id={id} className={className}>{text}</Tag>;

  return (
    <Tag ref={attach} id={id} className={className} aria-label={text}>
      {text.split(" ").map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          {index > 0 ? " " : null}
          <m.span
            className="blur-word"
            aria-hidden="true"
            variants={phone ? phoneWordVariants : wordVariants}
            initial={revealed ? false : "hidden"}
            animate={revealed ? "shown" : "hidden"}
            // The blur eases rather than springs: a spring's overshoot would ask for a negative blur.
            transition={{ ...springs.arrive, delay: index * stagger, filter: { duration: 0.6, ease: "easeOut", delay: index * stagger } }}
          >
            {word}
          </m.span>
        </Fragment>
      ))}
    </Tag>
  );
}
