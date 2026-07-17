import { HeartHandshake, Sparkles } from "lucide-react";
import { moodSetupPhotos } from "../../story/data/story";

export function MoodSetup() {
  return (
    <section className="mood-setup" aria-labelledby="mood-setup-title">
      <div className="mood-setup-copy">
        <p className="kicker">before the match</p>
        <h2 id="mood-setup-title">Trước khi mọi thứ bắt đầu</h2>
        <p>
          Chưa có Bumble, chưa có Instagram, chưa có mấy đoạn var lịch sử. Chỉ có vài tấm ảnh rất xinh và một
          cảm giác kiểu: sắp có chuyện rồi đó.
        </p>
        <div className="mood-setup-tag">
          <HeartHandshake aria-hidden="true" size={17} />
          Mở mood trước khi vào câu chuyện chính
        </div>
      </div>

      <div className="mood-scrapbook" aria-label="Scrapbook mở đầu bằng ảnh">
        {moodSetupPhotos.map((photo, index) => (
          <figure className={`mood-photo mood-photo-${index + 1}`} key={photo.src}>
            <img src={photo.src} alt={photo.alt} loading="lazy" />
            <figcaption>
              <Sparkles aria-hidden="true" size={14} />
              {photo.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
