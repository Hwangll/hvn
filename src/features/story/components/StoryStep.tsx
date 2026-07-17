import { Sparkles } from "lucide-react";
import { Howl } from "howler";
import { useEffect, useState, type CSSProperties } from "react";
import type { StoryChapter } from "../data/story";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import { MemoryPhoto } from "./atoms/MemoryPhoto";
import { PhotoGallery } from "./PhotoGallery";

interface StoryStepProps {
  chapter: StoryChapter;
  index: number;
  isActive: boolean;
  playCue?: (cue: SoundCue) => void;
  soundEnabled: boolean;
  variant?: "desktop" | "mobile";
}

const stepHeights = ["92vh", "100vh", "88vh", "105vh", "95vh"];

export function StoryStep({ chapter, index, isActive, playCue, soundEnabled, variant = "desktop" }: StoryStepProps) {
  const [secretOpen, setSecretOpen] = useState(false);
  const zigzag = index % 2 === 0 ? "left" : "right";

  const toggleSecret = () => {
    playCue?.(secretOpen ? "secretClose" : "secretOpen");
    setSecretOpen((current) => !current);
  };

  useEffect(() => {
    if (!isActive || !soundEnabled || !chapter.optionalSound) {
      return undefined;
    }

    const audio = new Howl({ src: [chapter.optionalSound], html5: true, preload: true, volume: 0.24 });
    audio.play();

    return () => {
      audio.stop();
    };
  }, [chapter.optionalSound, isActive, soundEnabled]);

  return (
    <article
      className={`story-step zigzag-${zigzag} ${isActive ? "is-active" : ""} variant-${variant}`}
      id={variant === "desktop" ? chapter.id : `${chapter.id}-copy`}
      data-story-step={variant === "desktop" ? true : undefined}
      data-reveal
      style={variant === "desktop" ? ({ minHeight: stepHeights[index] ?? "90vh" } as CSSProperties) : undefined}
      aria-current={isActive ? "step" : undefined}
    >
      <div className="story-step-layout">
        <div className="story-step-year-tab" aria-label={`Năm ${chapter.year}`}>
          <span>{chapter.year}</span>
        </div>

        <div className="story-step-arrow">
          <header className="story-step-header">
            <p className="story-step-eyebrow">
              CHƯƠNG {String(index + 1).padStart(2, "0")} · {chapter.shortTitle.toUpperCase()}
            </p>
            <h2 className="story-step-title">{chapter.title}</h2>
          </header>

          <div className="story-step-body">
            {chapter.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <blockquote className="story-step-quote">
            <Sparkles aria-hidden="true" size={16} />
            {chapter.quote}
          </blockquote>

          {variant === "desktop" ? <PhotoGallery label={`Album ${chapter.shortTitle}`} photos={chapter.gallery} playCue={playCue} /> : null}

          <div className={`story-secret-note secret-tone-${chapter.secretTone} ${secretOpen ? "is-open" : ""}`}>
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
          </div>
        </div>

        <MemoryPhoto
          src={chapter.image}
          alt={chapter.imageAlt}
          caption={chapter.memoryCaption}
          size="keepsake"
          tilt={zigzag === "left" ? "right" : "left"}
          className="story-step-keepsake"
          eager={chapter.index === 1}
        />
      </div>
    </article>
  );
}
