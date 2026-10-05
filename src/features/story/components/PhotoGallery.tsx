import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { AnimatePresence, m, type Variants } from "motion/react";
import { type PointerEvent as ReactPointerEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import type { StoryPhoto } from "../data/story";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import { StoryPicture } from "../../../shared/components/visuals/StoryPicture";
import { springs } from "../../../shared/motion/springs";

/** Browsing turns the page the way the reader went: the next photo slides in from that side, the last one leaves. */
const photoTurn: Variants = {
  enter: (direction: number) => ({ opacity: 0, transform: `translateX(${direction * 48}px)` }),
  center: { opacity: 1, transform: "translateX(0px)", transition: springs.settle },
  leave: (direction: number) => ({ opacity: 0, transform: `translateX(${direction * -32}px)`, transition: { duration: 0.14, ease: "easeIn" } }),
};

interface PhotoGalleryProps {
  compact?: boolean;
  label: string;
  playCue?: (cue: SoundCue) => void;
  photos: StoryPhoto[];
}

export function PhotoGallery({ compact = false, label, playCue, photos }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const dialogRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const swipeRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const availableIndices = useMemo(() => photos.flatMap((photo, index) => photo.src ? [index] : []), [photos]);
  const activePhoto = activeIndex === null ? null : photos[activeIndex];

  const isOpen = Boolean(activePhoto);

  const openPhoto = (index: number, opener: HTMLButtonElement) => {
    openerRef.current = opener;
    playCue?.("galleryOpen");
    setActiveIndex(index);
  };

  const closePhoto = useCallback(() => {
    playCue?.("galleryClose");
    setActiveIndex(null);
  }, [playCue]);

  const movePhoto = useCallback((step: number) => {
    setDirection(step);
    setActiveIndex((current) => {
      if (current === null || availableIndices.length === 0) return current;
      const position = availableIndices.indexOf(current);
      return availableIndices[(position + step + availableIndices.length) % availableIndices.length];
    });
  }, [availableIndices]);

  // The viewer grows out of the thumbnail that opened it, so the photo reads as the same object picked up off the page.
  useLayoutEffect(() => {
    if (!isOpen) return undefined;
    const figure = figureRef.current;
    const opener = openerRef.current;
    if (!figure || !opener || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const from = opener.getBoundingClientRect();
    const to = figure.getBoundingClientRect();
    if (!from.width || !to.width || !to.height) return undefined;
    dialogRef.current?.classList.add("is-flip");
    const tween = gsap.fromTo(figure,
      { x: from.left + from.width / 2 - (to.left + to.width / 2), y: from.top + from.height / 2 - (to.top + to.height / 2), scaleX: from.width / to.width, scaleY: from.height / to.height, opacity: 0.4 },
      { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: 0.6, ease: "power3.out", clearProps: "transform,opacity" },
    );
    return () => { tween?.kill?.(); };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.setProperty("overflow", "hidden");
    dialogRef.current?.querySelector<HTMLButtonElement>(".photo-lightbox-close")?.focus();
    return () => {
      document.body.style.setProperty("overflow", previousOverflow);
      openerRef.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePhoto();
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        movePhoto(event.key === "ArrowLeft" ? -1 : 1);
      }
      if (event.key !== "Tab") return;
      const controls = dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not([tabindex='-1'])");
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closePhoto, movePhoto]);

  // Phones browse the album with a swipe; the photo follows the finger a little so the gesture reads as a page turn.
  const swipeFigure = (dx: number, settle = false) => {
    const figure = figureRef.current;
    if (!figure) return;
    figure.style.transition = settle ? "translate 260ms cubic-bezier(0.16, 1, 0.3, 1)" : "none";
    figure.style.translate = dx ? `${dx}px 0` : "";
  };
  const onSwipeStart = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" || availableIndices.length < 2 || (event.target as HTMLElement).closest("button")) return;
    swipeRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  };
  const onSwipeMove = (event: ReactPointerEvent<HTMLElement>) => {
    const swipe = swipeRef.current;
    if (!swipe || swipe.pointerId !== event.pointerId) return;
    const dx = event.clientX - swipe.x;
    if (Math.abs(dx) > Math.abs(event.clientY - swipe.y)) swipeFigure(dx * 0.35);
  };
  const onSwipeEnd = (event: ReactPointerEvent<HTMLElement>) => {
    const swipe = swipeRef.current;
    if (!swipe || swipe.pointerId !== event.pointerId) return;
    swipeRef.current = null;
    const dx = event.clientX - swipe.x;
    swipeFigure(0, true);
    if (event.type === "pointerup" && Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(event.clientY - swipe.y) * 1.2) movePhoto(dx < 0 ? 1 : -1);
  };

  // The neighbours load while the reader looks at this one, so the next photo is already there when they move on.
  const neighbourIndices = activeIndex === null || availableIndices.length < 2 ? [] : [-1, 1].map((step) => {
    const position = availableIndices.indexOf(activeIndex);
    return availableIndices[(position + step + availableIndices.length) % availableIndices.length];
  }).filter((index, position, all) => index !== activeIndex && all.indexOf(index) === position);

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className={`photo-gallery ${compact ? "is-compact" : ""}`}>
      <div className="photo-gallery-header">
        <span>{label}</span>
        <strong>{photos.length} tấm</strong>
      </div>
      <div className="photo-filmstrip" role="group" aria-label={label}>
        {photos.map((photo, index) => (
          photo.src ? (
            <button
              type="button"
              className="photo-thumb"
              data-tilt
              key={`${photo.src}-${photo.caption}`}
              onClick={(event) => openPhoto(index, event.currentTarget)}
              aria-label={`Mở ảnh: ${photo.caption}`}
            >
              <StoryPicture src={photo.src} alt={photo.alt} loading="lazy" />
              <span>{photo.caption}</span>
            </button>
          ) : (
            <div className="photo-thumb photo-thumb-placeholder" key={`${photo.alt}-${photo.caption}`}>
              <span>{photo.placeholderNote ?? "Thêm ảnh kỷ niệm tại đây."}</span>
              <small>{photo.caption}</small>
            </div>
          )
        ))}
      </div>

      {activePhoto ? createPortal(
        <div ref={dialogRef} className="photo-lightbox" data-lenis-prevent role="dialog" aria-modal="true" aria-label={activePhoto.caption}>
          {/* The open photo also lights the room around it: a blurred, softened copy fills the backdrop with its colours. */}
          {activePhoto.src ? (
            <div className="photo-lightbox-ambient" aria-hidden="true">
              <StoryPicture key={activePhoto.src} src={activePhoto.src} alt="" />
            </div>
          ) : null}
          <button className="photo-lightbox-backdrop" type="button" aria-hidden="true" tabIndex={-1} onClick={closePhoto} />
          <figure ref={figureRef} onPointerDown={onSwipeStart} onPointerMove={onSwipeMove} onPointerUp={onSwipeEnd} onPointerCancel={onSwipeEnd}>
            <button className="photo-lightbox-close" type="button" aria-label="Đóng ảnh" onClick={closePhoto}>
              <X aria-hidden="true" size={18} />
            </button>
            {activePhoto.src ? (
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <m.div className="photo-lightbox-frame" key={activePhoto.src} custom={direction} variants={photoTurn} initial="enter" animate="center" exit="leave">
                  <StoryPicture src={activePhoto.src} alt={activePhoto.alt} />
                </m.div>
              </AnimatePresence>
            ) : null}
            <figcaption>
              <span aria-live="polite">{activePhoto.caption}</span>
              <span className="photo-lightbox-count">{availableIndices.indexOf(activeIndex!) + 1} / {availableIndices.length}</span>
            </figcaption>
            {availableIndices.length > 1 ? (
              <div className="photo-lightbox-navigation" aria-label="Duyệt ảnh">
                <button type="button" aria-label="Ảnh trước" onClick={() => movePhoto(-1)}><ArrowLeft aria-hidden="true" size={18} /><span>Ảnh trước</span></button>
                <button type="button" aria-label="Ảnh tiếp theo" onClick={() => movePhoto(1)}><span>Ảnh tiếp theo</span><ArrowRight aria-hidden="true" size={18} /></button>
              </div>
            ) : null}
          </figure>
          <div className="photo-lightbox-preload" hidden>
            {neighbourIndices.map((index) => <StoryPicture key={photos[index].src} src={photos[index].src} alt="" />)}
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
