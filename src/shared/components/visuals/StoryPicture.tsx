import type { ImgHTMLAttributes } from "react";

/**
 * Serves a WebP next to the original photo, falling back to the JPEG/PNG on browsers without it.
 * The `<img>` stays the element that loads, errors and reports `naturalWidth/Height`, so callers keep
 * using their own `onLoad` / `onError` exactly as before. `picture { display: contents }` keeps layout
 * identical to a bare `<img>`.
 */
export function StoryPicture({ src, ...img }: ImgHTMLAttributes<HTMLImageElement>) {
  // Story photos may still be waiting for a real file; without a source there is no WebP twin to offer.
  const webp = src?.replace(/\.(jpe?g|png)$/i, ".webp");

  return (
    <picture>
      {webp && webp !== src ? <source srcSet={webp} type="image/webp" /> : null}
      <img src={src} {...img} />
    </picture>
  );
}
