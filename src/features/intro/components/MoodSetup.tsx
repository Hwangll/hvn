import { HeartHandshake, Sparkles } from "lucide-react";
import { moodSetupPhotos } from "../../story/data/story";
import { BlurText } from "../../../shared/components/motion/BlurText";
import { StoryPicture } from "../../../shared/components/visuals/StoryPicture";
import { Cloud } from "../../story/components/StoryArt";

export function MoodSetup() {
  return (
    <section className="mood-setup" aria-labelledby="mood-setup-title">
      <div className="mood-setup-copy" data-memory-reveal>
        <p className="kicker">LỜI MỞ ĐẦU</p>
        <BlurText id="mood-setup-title" text="Trước khi mọi thứ bắt đầu" />
        <p>
          Chưa có Bumble, chưa có Instagram, chưa có mấy đoạn var lịch sử. Chỉ có vài tấm ảnh rất xinh và một
          cảm giác kiểu: sắp có chuyện rồi đó.
        </p>
        <div className="mood-setup-tag">
          <HeartHandshake aria-hidden="true" size={17} />
          Vài tấm ảnh, trước một câu chuyện dài
        </div>
      </div>

      <div className="mood-scrapbook" aria-label="Scrapbook mở đầu bằng ảnh">
        {moodSetupPhotos.map((photo, index) => (
          <figure data-memory-reveal data-memory-order={index + 1} data-tilt className={`mood-photo mood-photo-${index + 1}`} key={photo.src}>
            <StoryPicture src={photo.src} alt={photo.alt} loading="lazy" />
            <figcaption>
              <Sparkles aria-hidden="true" size={14} />
              {photo.caption}
            </figcaption>
          </figure>
        ))}
        {/* A cloud drifting through the scrapbook, between its photos. */}
        <span className="story-weaver mood-weaver-cloud" aria-hidden="true" data-idle-zone><Cloud variant={2} /></span>
      </div>
    </section>
  );
}
