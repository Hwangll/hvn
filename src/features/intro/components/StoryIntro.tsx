import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { heroPhotos, introCopy } from "../../story/data/story";
import { BlossomSprig } from "../../../shared/components/visuals/BlossomSprig";

interface StoryIntroProps {
  reducedMotion: boolean;
}

export function StoryIntro({ reducedMotion }: StoryIntroProps) {
  const letters = Array.from(introCopy.title);

  return (
    <section className="story-intro" aria-labelledby="story-title">
      <div className="intro-orbit" aria-hidden="true">
        <span className="intro-dot intro-dot-left" />
        <span className="intro-thread" />
        <span className="intro-dot intro-dot-right" />
      </div>
      <BlossomSprig className="intro-blossom" />

      <div className="intro-layout">
        <div className="intro-copy">
          <p className="kicker">interactive diary / 2023-2026</p>
          <h1 id="story-title" className="intro-title" aria-label={introCopy.title}>
            {letters.map((letter, index) => (
              <motion.span
                aria-hidden="true"
                initial={reducedMotion ? false : { opacity: 0, y: 36, rotate: index % 2 === 0 ? -2 : 2 }}
                animate={reducedMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.72, delay: index * 0.035, ease: [0.16, 1, 0.3, 1] }}
                key={`${letter}-${index}`}
              >
                {letter}
              </motion.span>
            ))}
          </h1>
          <p className="intro-subtitle">{introCopy.subtitle}</p>
          <a className="scroll-hint" href="#keepsake-title">
            <ChevronDown aria-hidden="true" size={18} />
            {introCopy.hint}
          </a>
        </div>

        <div className="intro-photo-booth" aria-label="Ảnh kỷ niệm nổi bật">
          <span className="booth-sticker booth-heart" aria-hidden="true">
            ♥
          </span>
          <span className="booth-sticker booth-flower" aria-hidden="true">
            ✿
          </span>
          {heroPhotos.map((photo, index) => (
            <figure className={`booth-photo booth-photo-${index + 1}`} key={photo.src}>
              <img src={photo.src} alt={photo.alt} />
              <figcaption>{photo.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
