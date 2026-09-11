import { useState } from "react";
import { StoryPicture } from "../../../../shared/components/visuals/StoryPicture";

interface MemoryPhotoProps {
  src?: string;
  alt: string;
  caption?: string;
  size?: "small" | "medium" | "warm" | "keepsake";
  tilt?: "left" | "right" | "none";
  className?: string;
  eager?: boolean;
  placeholderLabel?: string;
  /** Extra data-* attributes, e.g. scroll-effect hints read by usePartTwoScroll. */
  attributes?: Record<string, string | number>;
}

export function MemoryPhoto({
  src,
  alt,
  caption,
  size = "small",
  tilt = "none",
  className = "",
  eager = false,
  placeholderLabel,
  attributes,
}: MemoryPhotoProps) {
  const [failed, setFailed] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const showPlaceholder = !src || failed;

  return (
    <figure className={`memory-photo size-${size} tilt-${tilt} ${portrait ? "is-portrait" : ""} ${className}`.trim()} {...attributes}>
      {showPlaceholder ? (
        <div className="memory-photo-fallback" role="img" aria-label={alt}>
          <span>{placeholderLabel ?? "ảnh kỷ niệm đang chờ thay"}</span>
        </div>
      ) : (
        <StoryPicture
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          onLoad={(event) => setPortrait(event.currentTarget.naturalHeight > event.currentTarget.naturalWidth * 1.15)}
        />
      )}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
