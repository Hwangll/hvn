import { ArrowRight } from "lucide-react";
import { partOneEndingCopy } from "../data/story";
import { BlurText } from "../../../shared/components/motion/BlurText";
import { BlossomSprig } from "../../../shared/components/visuals/BlossomSprig";
import { PolaroidPhoto } from "../../../shared/components/visuals/PolaroidPhoto";

export function StoryPartOneEnding() {
  return (
    <section className="story-ending part-one-ending" aria-labelledby="part-one-ending-title" data-idle-zone>
      <div className="ending-copy" data-memory-reveal>
        <BlossomSprig className="ending-blossom" />
        <p className="kicker">hết phần i</p>
        <BlurText id="part-one-ending-title" text={partOneEndingCopy.title} stagger={0.1} />
        <p>{partOneEndingCopy.body}</p>
        <div className="ending-actions">
          <a className="replay-button part-two-page-link has-shimmer" href="/part-2/" data-magnetic>
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
