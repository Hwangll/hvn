import { Sparkles } from "lucide-react";
import { Fragment, useState, type CSSProperties } from "react";
import type { StoryScrollItem } from "../data/story";
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
 */
function renderProse(paragraph: string) {
  let wordIndex = 0;
  const nodes = paragraph.split(/(==.+?==)/g).filter(Boolean).map((segment, segmentIndex) => {
    const marked = segment.startsWith("==") && segment.endsWith("==");
    const words = (marked ? segment.slice(2, -2) : segment).split(/(\s+)/).map((token, tokenIndex) => {
      if (!token) return null;
      if (/^\s+$/.test(token)) return token;
      return (
        <span key={tokenIndex} className="story-word" style={{ "--i": wordIndex++ } as CSSProperties}>
          {token}
        </span>
      );
    });
    return marked ? <mark key={segmentIndex} className="story-ink-mark">{words}</mark> : <Fragment key={segmentIndex}>{words}</Fragment>;
  });
  return { nodes, words: wordIndex };
}

export function StoryStep({ chapter, index, isActive, playCue, variant = "desktop" }: StoryStepProps) {
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
          <span>{chapter.year}</span>
        </div>

        <div className="story-step-arrow">
          <header className="story-step-header">
            <p className="story-step-eyebrow" data-step-reveal>
              PHẦN {chapter.partNumber === 1 ? "I" : "II"} · CHƯƠNG {String(chapter.chapterIndex).padStart(2, "0")}
              {chapter.sceneIndex ? ` · CẢNH ${String(chapter.sceneIndex).padStart(2, "0")}` : ""}
            </p>
            {chapter.sceneIndex ? <p className="story-step-day-title" data-step-reveal>MỘT NGÀY THOẢI MÁI NHẤT TRÊN ĐỜI</p> : null}
            <h2 className="story-step-title" data-step-reveal>{chapter.title}</h2>
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

          <blockquote className="story-step-quote" data-step-reveal>
            <Sparkles aria-hidden="true" size={16} />
            {chapter.quote}
          </blockquote>

          <div data-step-reveal>
            <PhotoGallery compact={variant === "mobile"} label={`Album ${chapter.shortTitle}`} photos={chapter.gallery} playCue={playCue} />
          </div>

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
}
