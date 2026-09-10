import { ArrowRight } from "lucide-react";
import { partOneEndingCopy } from "../data/story";
import { BlossomSprig } from "../../../shared/components/visuals/BlossomSprig";
import { PolaroidPhoto } from "../../../shared/components/visuals/PolaroidPhoto";

export function StoryPartOneEnding() {
  return (
    <section className="story-ending part-one-ending" aria-labelledby="part-one-ending-title">
      <div className="ending-copy" data-memory-reveal>
        <BlossomSprig className="ending-blossom" />
        <p className="kicker">hết phần i</p>
        <h2 id="part-one-ending-title">{partOneEndingCopy.title}</h2>
        <p>{partOneEndingCopy.body}</p>
        <div className="ending-actions">
          <a className="replay-button part-two-page-link" href="/part-2/">
            <span>{partOneEndingCopy.cta}</span>
            <ArrowRight aria-hidden="true" size={18} />
          </a>
        </div>
      </div>
      <PolaroidPhoto
        src={partOneEndingCopy.image}
        alt="Người yêu chụp ảnh cạnh hoa hồng ở cuối Phần I"
        caption={partOneEndingCopy.footnote}
        tilt="right"
      />
    </section>
  );
}
