import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { StoryPhoto } from "../data/story";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";

interface PhotoGalleryProps {
  compact?: boolean;
  label: string;
  playCue?: (cue: SoundCue) => void;
  photos: StoryPhoto[];
}

export function PhotoGallery({ compact = false, label, playCue, photos }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activePhoto = activeIndex === null ? null : photos[activeIndex];

  const openPhoto = (index: number) => {
    playCue?.("galleryOpen");
    setActiveIndex(index);
  };

  const closePhoto = useCallback(() => {
    playCue?.("galleryClose");
    setActiveIndex(null);
  }, [playCue]);

  useEffect(() => {
    if (!activePhoto) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePhoto();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhoto, closePhoto]);

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className={`photo-gallery ${compact ? "is-compact" : ""}`}>
      <div className="photo-gallery-header">
        <span>{label}</span>
        <strong>{photos.length} tấm</strong>
      </div>
      <div className="photo-filmstrip" role="list" aria-label={label}>
        {photos.map((photo, index) => (
          <button
            type="button"
            className="photo-thumb"
            key={`${photo.src}-${photo.caption}`}
            onClick={() => openPhoto(index)}
            aria-label={`Mở ảnh: ${photo.caption}`}
          >
            <img src={photo.src} alt={photo.alt} loading="lazy" />
            <span>{photo.caption}</span>
          </button>
        ))}
      </div>

      {activePhoto ? (
        <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={activePhoto.caption}>
          <button className="photo-lightbox-backdrop" type="button" aria-label="Đóng ảnh" onClick={closePhoto} />
          <figure>
            <button className="photo-lightbox-close" type="button" aria-label="Đóng ảnh" onClick={closePhoto}>
              <X aria-hidden="true" size={18} />
            </button>
            <img src={activePhoto.src} alt={activePhoto.alt} />
            <figcaption>{activePhoto.caption}</figcaption>
          </figure>
        </div>
      ) : null}
    </div>
  );
}
