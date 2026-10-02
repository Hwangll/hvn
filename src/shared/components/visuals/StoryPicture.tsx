import type { ImgHTMLAttributes } from "react";

/**
 * Serves an AVIF, then a WebP, next to the original photo; browsers take the first format they can decode and
 * fall back to the JPEG/PNG. Every story photo has both twins (see scripts/optimize-images.mjs).
 * The `<img>` stays the element that loads, errors and reports `naturalWidth/Height`, so callers keep
 * using their own `onLoad` / `onError` exactly as before. `picture { display: contents }` keeps layout
 * identical to a bare `<img>`. Decoding is async so a large photo never holds up a scroll frame.
 */
export function StoryPicture({ src, decoding = "async", ...img }: ImgHTMLAttributes<HTMLImageElement>) {
  // Story photos may still be waiting for a real file; without a source there are no twins to offer.
  const twin = (extension: string) => src?.replace(/\.(jpe?g|png)$/i, extension);
  const avif = twin(".avif");
  const webp = twin(".webp");

  return (
    <picture>
      {avif && avif !== src ? <source srcSet={avif} type="image/avif" /> : null}
      {webp && webp !== src ? <source srcSet={webp} type="image/webp" /> : null}
      <img src={src} decoding={decoding} {...img} />
    </picture>
  );
}
