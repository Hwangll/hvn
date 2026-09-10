import { ArrowDown, ArrowRight, ChevronDown } from "lucide-react";
import { Fragment, type CSSProperties } from "react";
import { jumpToStoryTarget } from "../../story/utils/jumpToStoryTarget";
import { heroPhotos, introCopy } from "../../story/data/story";
import { BlossomSprig } from "../../../shared/components/visuals/BlossomSprig";

interface StoryIntroProps {
  reducedMotion: boolean;
}

export function StoryIntro({ reducedMotion }: StoryIntroProps) {
  const words = introCopy.title.split(" ");

  return (
    <section className="story-intro" aria-labelledby="story-title">
      <header className="diary-masthead">
        <a href="#top" aria-label="Hát Và Nờ — đầu trang">h<span>&</span>n<span className="diary-brand-dot">.</span></a>
        <span>MỘT CUỐN NHẬT KÝ CỦA HAI NGƯỜI</span>
      </header>
      <div className="intro-orbit" aria-hidden="true">
        <span className="intro-dot intro-dot-left" />
        <span className="intro-thread" />
        <span className="intro-dot intro-dot-right" />
      </div>
      <BlossomSprig className="intro-blossom" />

      <div className="intro-layout">
        <div className="intro-copy">
          <p className="kicker">NHỮNG ĐIỀU MÌNH GIỮ LẠI · 2023—2026</p>
          <h1 id="story-title" className="intro-title" aria-label={introCopy.title}>
            {words.map((word, index) => (
              <Fragment key={`${word}-${index}`}>
                {index > 0 ? " " : null}
                <span
                  aria-hidden="true"
                  className={`intro-title-word ${index === words.length - 1 ? "is-accent" : ""} ${reducedMotion ? "" : "is-animated"}`}
                  style={{ "--word-index": index } as CSSProperties}
                >
                  {word}
                </span>
              </Fragment>
            ))}
          </h1>
          <p className="intro-subtitle" data-memory-reveal data-memory-order="2">{introCopy.subtitle}</p>
          <div className="intro-actions" data-memory-reveal data-memory-order="3">
            <a className="diary-read-button" href="#first-meeting" onClick={(event) => {
              event.preventDefault();
              jumpToStoryTarget("first-meeting");
            }}>
              Bắt đầu đọc <ArrowDown aria-hidden="true" size={16} />
            </a>
            <a className="scroll-hint" href="#keepsake-title">
              <ChevronDown aria-hidden="true" size={18} />
              {introCopy.hint}
            </a>
            <a className="intro-part-two-link" href="/part-2/">
              Đọc nhanh Phần II
              <ArrowRight aria-hidden="true" size={18} />
            </a>
          </div>
        </div>

        <div className="intro-photo-booth" aria-label="Ảnh kỷ niệm nổi bật">
          <span className="booth-sticker booth-heart" aria-hidden="true">
            ♥
          </span>
          <span className="booth-sticker booth-flower" aria-hidden="true">
            ✿
          </span>
          <span className="diary-photo-note" aria-hidden="true">những ngày mình thương</span>
          {heroPhotos.map((photo, index) => (
            <figure data-memory-reveal data-memory-order={index + 1} className={`booth-photo booth-photo-${index + 1}`} key={photo.src}>
              <img src={photo.src} alt={photo.alt} />
              <figcaption>{photo.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="diary-colophon">
        <span>01 / NHỮNG LẦN TÌM THẤY NHAU</span>
        <span>Cuộn chậm thôi, chuyện mình còn dài. <ChevronDown aria-hidden="true" size={14} /></span>
      </div>
    </section>
  );
}
