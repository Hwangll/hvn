import { Sparkles } from "lucide-react";
import { Fragment, memo, useState, type CSSProperties } from "react";
import { romanNumeral, type StoryScrollItem } from "../data/story";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import { MemoryPhoto } from "./atoms/MemoryPhoto";
import { PhotoGallery } from "./PhotoGallery";

interface StoryStepProps {
  chapter: StoryScrollItem;
  index: number;
  isActive: boolean;
  playCue?: (cue: SoundCue) => void;
  soundEnabled: boolean;
  variant?: "desktop" | "mobile";
}

const stepHeights = ["92vh", "100vh", "88vh", "105vh", "95vh"];

/**
 * Splits a paragraph into word spans so the scroll paint can surface it word by word (`--i` / `--words`).
 * Text wrapped in `==double equals==` becomes a highlighted phrase drawn in the chapter accent.
 *
 * Punctuation written straight after a phrase (`==…==,`) rides in the box of the phrase's last word: every word is a
 * box of its own, and a line may break between any two boxes, so on its own the comma could start the next line.
 */
function renderProse(paragraph: string) {
  const segments: Array<{ text: string; marked: boolean; tail?: string }> = [];
  for (const part of paragraph.split(/(==.+?==)/g)) {
    if (!part) continue;
    if (part.startsWith("==") && part.endsWith("==")) {
      segments.push({ text: part.slice(2, -2), marked: true });
      continue;
    }
    const previous = segments.at(-1);
    const tail = previous?.marked ? part.match(/^[^\s\p{L}\p{N}]+/u)?.[0] : undefined;
    if (previous && tail) previous.tail = tail;
    if (part.length > (tail?.length ?? 0)) segments.push({ text: tail ? part.slice(tail.length) : part, marked: false });
  }

  let wordIndex = 0;
  const nodes = segments.map((segment, segmentIndex) => {
    const start = wordIndex;
    const tokens = segment.text.split(/(\s+)/);
    let lastWord = tokens.length - 1;
    while (lastWord > 0 && !/\S/.test(tokens[lastWord])) lastWord -= 1;
    const words = tokens.map((token, tokenIndex) => {
      if (!token) return null;
      if (/^\s+$/.test(token)) return token;
      return (
        <span key={tokenIndex} className="story-word" style={{ "--i": wordIndex++ } as CSSProperties}>
          {token}
          {tokenIndex === lastWord && segment.tail ? <span className="story-ink-tail">{segment.tail}</span> : null}
        </span>
      );
    });
    // The marker stroke knows its first word and its length, so it can draw as one continuous line across wraps; it
    // stops about where a carried tail of punctuation begins (`--ink-tail`, roughly 0.3em a mark).
    const markStyle = { "--mi": start, "--mn": wordIndex - start, "--ink-tail": segment.tail ? `${segment.tail.length * 0.3}em` : undefined };
    return segment.marked
      ? <mark key={segmentIndex} className="story-ink-mark" style={markStyle as CSSProperties}>{words}</mark>
      : <Fragment key={segmentIndex}>{words}</Fragment>;
  });
  return { nodes, words: wordIndex };
}

/** Title words rise one after another through a clipped box; the scroll paint drives them from `--reveal`. */
function renderTitle(title: string) {
  let wordIndex = 0;
  const nodes = title.split(/(\s+)/).map((token, tokenIndex) => {
    if (!token) return null;
    if (/^\s+$/.test(token)) return token;
    return (
      <span key={tokenIndex} className="story-title-word" style={{ "--i": wordIndex++ } as CSSProperties}>
        <span>{token}</span>
      </span>
    );
  });
  return { nodes, words: wordIndex };
}

export const StoryStep = memo(function StoryStep({ chapter, index, isActive, playCue, variant = "desktop" }: StoryStepProps) {
  const [secretOpen, setSecretOpen] = useState(false);
  const zigzag = index % 2 === 0 ? "left" : "right";

  const toggleSecret = () => {
    playCue?.(secretOpen ? "secretClose" : "secretOpen");
    setSecretOpen((current) => !current);
  };

  return (
    <article
      className={`story-step zigzag-${zigzag} ${isActive ? "is-active" : ""} variant-${variant}`}
      id={variant === "desktop" ? chapter.id : `${chapter.id}-copy`}
      data-story-step={variant === "desktop" ? true : undefined}
      data-story-step-id={variant === "desktop" ? chapter.id : undefined}
      data-reveal
      style={{ ...(variant === "desktop" ? { minHeight: stepHeights[index] ?? "90vh" } : {}), "--ink-accent": chapter.accent } as CSSProperties}
      aria-current={isActive ? "step" : undefined}
    >
      <div className="story-step-layout">
        <div className="story-step-year-tab" aria-label={`Năm ${chapter.year}`}>
          {chapter.partNumber === 1 ? <span className="diary-step-number" aria-hidden="true">{String(chapter.chapterIndex).padStart(2, "0")}</span> : null}
          <span>{chapter.year}</span>
        </div>

        <div className="story-step-arrow">
          <header className="story-step-header">
            {/* Both parts carry the chapter numeral as a watermark behind the heading. */}
            <span className="story-step-numeral" aria-hidden="true">
              {String(chapter.chapterIndex).padStart(2, "0")}{chapter.sceneIndex ? <small>.{chapter.sceneIndex}</small> : null}
            </span>
            <p className="story-step-eyebrow" data-step-reveal>
              PHẦN {romanNumeral(chapter.partNumber)} · CHƯƠNG {String(chapter.chapterIndex).padStart(2, "0")}
              {chapter.sceneIndex ? ` · CẢNH ${String(chapter.sceneIndex).padStart(2, "0")}` : ""}
            </p>
            {chapter.sceneIndex ? <p className="story-step-day-title" data-step-reveal>{chapter.chapterTitle.toUpperCase()}</p> : null}
            <h2 className="story-step-title" data-step-reveal="words" style={{ "--words": renderTitle(chapter.title).words } as CSSProperties}>
              {renderTitle(chapter.title).nodes}
            </h2>
          </header>

          <div className="story-step-body">
            {/* Each paragraph reveals on its own, and its words surface one after another like ink being written. */}
            {chapter.paragraphs.map((paragraph) => {
              const prose = renderProse(paragraph);
              return (
                <p key={paragraph} data-step-reveal="words" style={{ "--words": prose.words } as CSSProperties}>
                  {prose.nodes}
                </p>
              );
            })}
          </div>

          {/* Where she left a page for him, his own words, on paper of their own. */}
          {chapter.reply ? (
            <figure className="story-step-reply">
              <figcaption data-step-reveal>{chapter.reply.label}</figcaption>
              {chapter.reply.paragraphs.map((paragraph) => {
                const prose = renderProse(paragraph);
                return (
                  <p key={paragraph} data-step-reveal="words" style={{ "--words": prose.words } as CSSProperties}>
                    {prose.nodes}
                  </p>
                );
              })}
            </figure>
          ) : null}

          <blockquote className="story-step-quote" data-step-reveal>
            <Sparkles aria-hidden="true" size={16} />
            {chapter.quote}
            {/* A hand-drawn stroke under the quote draws itself from `--reveal` as the reader reaches it. */}
            <svg className="story-quote-stroke" viewBox="0 0 240 14" preserveAspectRatio="none" aria-hidden="true">
              <path d="M3 9 C40 3 70 12 110 6 S170 2 205 8 S230 9 237 6" pathLength={1} />
            </svg>
          </blockquote>

          {chapter.gallery.length ? (
            <div data-step-reveal>
              <PhotoGallery compact={variant === "mobile"} label={`Album ${chapter.shortTitle}`} photos={chapter.gallery} playCue={playCue} />
            </div>
          ) : null}

          {chapter.secretNote ? <div className={`story-secret-note secret-tone-${chapter.secretTone} ${secretOpen ? "is-open" : ""}`}>
            <button
              type="button"
              aria-expanded={secretOpen}
              aria-label="Mở tin nhắn bí mật"
              onClick={toggleSecret}
            >
              <Sparkles aria-hidden="true" size={15} />
              {chapter.secretNote.label}
            </button>
            <div className="story-secret-panel" aria-live="polite">
              {secretOpen ? (
                <div className="story-secret-paper">
                  <span>psst, thật ra là...</span>
                  <p>{chapter.secretNote.text}</p>
                </div>
              ) : null}
            </div>
          </div> : null}
        </div>

        <MemoryPhoto
          src={chapter.image}
          alt={chapter.imageAlt}
          caption={chapter.memoryCaption}
          size="keepsake"
          tilt={zigzag === "left" ? "right" : "left"}
          className="story-step-keepsake"
          eager={chapter.id === "first-meeting"}
          placeholderLabel={chapter.imageNote}
        />
      </div>
    </article>
  );
});
