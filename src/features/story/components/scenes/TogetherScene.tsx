import { Coffee, Heart, MapPin, Ticket } from "lucide-react";
import type { StoryScrollItem } from "../../data/story";
import { MemoryPhoto } from "../atoms/MemoryPhoto";
import { CloudSprite, FishSprite, LeafSprite } from "../atoms/SceneSprites";

interface TogetherSceneProps {
  chapter: StoryScrollItem;
  isActive: boolean;
}

/*
 * Scroll-effect hints read by usePartTwoScroll. Every value derives from the one scroll progress, so it all reverses cleanly:
 *   data-parallax  drift up/down through the scene (positive follows the scroll, negative counters it)
 *   data-drift     slide sideways through the scene (fish, clouds)
 *   data-wave      bob on a sine wave while drifting, in px of amplitude (fish, bubbles)
 *   data-rise      float upward and fade (bubbles)
 *   data-sink      settle downward (the sun)
 *   data-spin      rotate this many degrees over the scene (falling leaves)
 *   data-tilt      extra rotation while the scene is still entering (photos)
 *   data-glow      opacity that grows as the scene is scrolled into (lamps)
 *   data-delay     0..1 share of the entrance after which this prop pops in (staggered arrivals)
 *   data-sheen     a light sweep across the surface as the reader moves through the scene (photos)
 */
export function TogetherScene({ chapter, isActive }: TogetherSceneProps) {
  const className = `memory-scene together-scene together-scene-${chapter.threadState} ${isActive ? "is-active" : ""}`;
  const photoFx = (tilt: number) => ({ "data-parallax": 0.32, "data-tilt": tilt, "data-sheen": 1, "data-delay": 0.1 });

  if (chapter.threadState === "in-person") {
    return (
      <div className={className} aria-hidden="true">
        <div className="night-stars" data-parallax="-0.35"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
        <div className="night-street" data-parallax="-0.15" />
        <div className="night-street-lamps" data-parallax="0.1">
          <i data-glow="1" data-delay="0.15" /><i data-glow="1" data-delay="0.3" /><i data-glow="1" data-delay="0.45" />
        </div>
        <span className="offline-scene-caption" data-parallax="0.7" data-delay="0.35">{chapter.microcopy}</span>
        <MemoryPhoto src={chapter.image} alt={chapter.imageAlt} caption={chapter.microcopy} placeholderLabel={chapter.imageNote} size="medium" tilt="none" className="together-main-photo" attributes={photoFx(-7)} />
      </div>
    );
  }

  if (chapter.threadState === "dating") {
    return (
      <div className={className} aria-hidden="true">
        <div className="park-canopy park-canopy-left" data-parallax="-0.35" />
        <div className="park-canopy park-canopy-right" data-parallax="-0.25" />
        <div className="park-path" data-parallax="0.15" />
        <LeafSprite className="park-leaf park-leaf-one" data-sink="0.9" data-drift="0.35" data-spin="160" data-wave="10" />
        <LeafSprite className="park-leaf park-leaf-two" data-sink="1.25" data-drift="-0.3" data-spin="-220" data-wave="14" />
        <LeafSprite className="park-leaf park-leaf-three" data-sink="0.7" data-drift="0.2" data-spin="120" data-wave="8" />
        <LeafSprite className="park-leaf park-leaf-four" data-sink="1.05" data-drift="-0.15" data-spin="-140" data-wave="12" />
        <span className="offline-scene-caption" data-parallax="0.7" data-delay="0.35">{chapter.microcopy}</span>
        <MemoryPhoto src={chapter.image} alt={chapter.imageAlt} caption={chapter.shortTitle} placeholderLabel={chapter.imageNote} size="medium" tilt="right" className="date-memory-photo" attributes={photoFx(7)} />
      </div>
    );
  }

  if (chapter.threadState === "aquarium") {
    return (
      <div className={className} aria-hidden="true">
        <div className="aquarium-window" />
        <div className="aquarium-light aquarium-light-one" data-parallax="-0.25" />
        <div className="aquarium-light aquarium-light-two" data-parallax="-0.15" />
        <FishSprite className="aquarium-fish fish-one" data-drift="1" data-wave="9" data-delay="0.1" />
        <FishSprite className="aquarium-fish fish-two" data-drift="-1.3" data-wave="7" data-delay="0.25" />
        <FishSprite className="aquarium-fish fish-three" data-drift="0.7" data-wave="12" data-delay="0.4" />
        <FishSprite className="aquarium-fish fish-four" data-drift="-0.55" data-wave="6" data-delay="0.55" />
        <span className="aquarium-bubble bubble-one" data-rise="1" data-wave="6" />
        <span className="aquarium-bubble bubble-two" data-rise="1.4" data-wave="4" />
        <span className="aquarium-bubble bubble-three" data-rise="0.8" data-wave="8" />
        <span className="aquarium-bubble bubble-four" data-rise="1.15" data-wave="5" />
        <div className="aquarium-ticket" data-parallax="0.6" data-delay="0.3"><Ticket size={18} /><strong>VÉ THỦY CUNG</strong><small>điểm dừng 01</small></div>
        <MemoryPhoto src={chapter.image} alt={chapter.imageAlt} caption={chapter.microcopy} placeholderLabel={chapter.imageNote} size="medium" tilt="left" className="day-scene-photo aquarium-photo" attributes={photoFx(-6)} />
      </div>
    );
  }

  if (chapter.threadState === "cafe") {
    return (
      <div className={className} aria-hidden="true">
        <div className="cafe-table" data-parallax="0.2" />
        <div className="cafe-cup cafe-cup-one" data-parallax="0.5" data-delay="0.2">
          <span className="cafe-steam"><i /><i /><i /></span>
          <Coffee size={30} /><span>Hắt</span>
        </div>
        <div className="cafe-cup cafe-cup-two" data-parallax="0.65" data-delay="0.35">
          <span className="cafe-steam"><i /><i /><i /></span>
          <Coffee size={30} /><span>Nờ</span>
        </div>
        <div className="cafe-note"><span>café note · điểm dừng 02</span><strong>{chapter.microcopy}</strong></div>
        <MemoryPhoto src={chapter.image} alt={chapter.imageAlt} caption={chapter.microcopy} placeholderLabel={chapter.imageNote} size="medium" tilt="right" className="day-scene-photo cafe-photo" attributes={photoFx(6)} />
      </div>
    );
  }

  return (
    <div className={className} aria-hidden="true">
      <CloudSprite className="sunset-cloud sunset-cloud-one" data-drift="0.6" data-parallax="-0.08" />
      <CloudSprite className="sunset-cloud sunset-cloud-two" data-drift="-0.45" data-parallax="-0.05" />
      <CloudSprite className="sunset-cloud sunset-cloud-three" data-drift="0.3" data-parallax="-0.1" />
      <div className="sunset-disc" data-sink="1" data-delay="0.05"><i /></div>
      <div className="sunset-hill sunset-hill-back" data-parallax="-0.12" />
      <div className="sunset-hill sunset-hill-front" data-parallax="0.18" />
      <CoupleSilhouette className="sunset-couple" />
      <div className="sunset-place"><MapPin size={14} /><span>Điểm dừng cuối ngày</span></div>
      <MemoryPhoto src={chapter.image} alt={chapter.imageAlt} placeholderLabel={chapter.imageNote} size="warm" tilt="none" className="day-scene-photo sunset-photo" attributes={photoFx(-5)} />
      <p className="sunset-statement"><Heart aria-hidden="true" size={15} />Một ngày thoải mái nhất trên đời.</p>
    </div>
  );
}

function CoupleSilhouette({ className }: { className: string }) {
  return (
    <div className={`scene-couple ${className}`}>
      <span className="scene-person scene-person-hat"><i /><b>H</b></span>
      <span className="scene-person scene-person-no"><i /><b>N</b></span>
      <span className="scene-couple-heart"><Heart size={12} fill="currentColor" /></span>
    </div>
  );
}
