import { useState } from "react";

interface MemoryPhotoProps {
  src?: string;
  alt: string;
  caption?: string;
  size?: "small" | "medium" | "warm" | "keepsake";
  tilt?: "left" | "right" | "none";
  className?: string;
  eager?: boolean;
}

export function MemoryPhoto({
  src,
  alt,
  caption,
  size = "small",
  tilt = "none",
  className = "",
  eager = false,
}: MemoryPhotoProps) {
  const [failed, setFailed] = useState(false);

  if (!src) {
    return null;
  }

  return (
    <figure className={`memory-photo size-${size} tilt-${tilt} ${className}`.trim()}>
      {failed ? (
        <div className="memory-photo-fallback" role="img" aria-label={alt}>
          <span>ảnh kỷ niệm đang chờ thay</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          onError={() => setFailed(true)}
        />
      )}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
