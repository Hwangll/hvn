import { useState } from "react";
import { StoryPicture } from "./StoryPicture";

interface PolaroidPhotoProps {
  src: string;
  alt: string;
  caption: string;
  tilt: "left" | "right";
}

export function PolaroidPhoto({ src, alt, caption, tilt }: PolaroidPhotoProps) {
  const [failed, setFailed] = useState(false);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");

  return (
    <figure data-memory-reveal data-memory-order="1" className={`polaroid tilt-${tilt} is-${orientation}`}>
      {failed ? (
        <div className="photo-fallback" role="img" aria-label={alt}>
          <span>ảnh kỷ niệm đang chờ thay</span>
          <strong>vẫn giữ chỗ thật xinh ở đây</strong>
        </div>
      ) : (
        <StoryPicture
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          onLoad={(event) => {
            const image = event.currentTarget;
            setOrientation(image.naturalHeight > image.naturalWidth ? "portrait" : "landscape");
          }}
        />
      )}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
