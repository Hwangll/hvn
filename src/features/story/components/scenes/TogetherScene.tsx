import { Heart, Ticket } from "lucide-react";
import type { StoryScrollItem } from "../../data/story";
import { MemoryPhoto } from "../atoms/MemoryPhoto";
import {
  BirdSprite,
  CloudSprite,
  CoffeeCupSprite,
  CoupleSittingSprite,
  DrinkCupSprite,
  FishSprite,
  HeartSprite,
  JellyfishSprite,
  KelpSprite,
  LeafSprite,
  SchoolSprite,
  ScooterSprite,
  SkylineSprite,
} from "../atoms/SceneSprites";

interface TogetherSceneProps {
  chapter: StoryScrollItem;
  isActive: boolean;
}

/*
 * Scroll-effect hints read by usePartTwoScroll. Every value derives from the one scroll progress, so it all reverses cleanly:
 *   data-parallax  drift up/down through the scene (positive follows the scroll, negative counters it)
 *   data-drift     slide sideways through the scene (fish, clouds, the scooter)
 *   data-wave      bob on a sine wave while drifting, in px of amplitude (fish, bubbles, birds)
 *   data-rise      float upward and fade (bubbles, small hearts)
 *   data-float     float upward without fading (jellyfish)
 *   data-sink      settle downward (the sun, falling leaves)
 *   data-spin      rotate this many degrees over the scene (leaves, clock hands)
 *   data-sway      rock back and forth, in degrees of amplitude (the hanging lamp)
 *   data-zoom      grow this share of its size across the scene (photos creep closer)
 *   data-tilt      extra rotation while the scene is still entering (photos)
 *   data-glow      opacity that grows as the scene is scrolled into (lamps)
 *   data-delay     0..1 share of the entrance after which this prop pops in (staggered arrivals)
 *   data-sheen     a light sweep across the surface as the reader moves through the scene (photos)
 */
export function TogetherScene({ chapter, isActive }: TogetherSceneProps) {
  const className = `memory-scene together-scene together-scene-${chapter.threadState} ${isActive ? "is-active" : ""}`;
  const photoFx = (tilt: number) => ({ "data-parallax": 0.3, "data-tilt": tilt, "data-sheen": 1, "data-delay": 0.1, "data-zoom": 0.035 });
  // A real photo carries its memory caption; a placeholder only names the stop, so the microcopy is never printed twice.
  const photoCaption = chapter.image ? chapter.memoryCaption : chapter.shortTitle;

  if (chapter.threadState === "in-person") {
    return (
      <div className={className} aria-hidden="true">
        <div className="scene-sky night-sky" data-parallax="-0.4">
          <i className="star-layer star-layer-far" />
          <i className="star-layer star-layer-near" />
        </div>
        <span className="night-moon" data-parallax="-0.55" data-delay="0.05"><i /></span>
        <SkylineSprite className="night-skyline" data-parallax="-0.2" />
        <div className="night-road" data-parallax="0.06"><i className="night-road-edge night-road-edge-left" /><i className="night-road-lane" /><i className="night-road-edge night-road-edge-right" /><i className="night-road-glow" /></div>
        <div className="night-bokeh" data-parallax="0.18"><i /><i /><i /><i /><i /><i /><i /></div>
        <div className="night-street-lamps" data-parallax="0.1">
          <i data-glow="1" data-delay="0.15" /><i data-glow="1" data-delay="0.3" /><i data-glow="1" data-delay="0.45" />
        </div>
        <ScooterSprite className="night-scooter" data-drift="0.5" data-wave="2.5" data-delay="0.25" />
        <span className="offline-scene-caption" data-parallax="0.7" data-delay="0.35">{chapter.microcopy}</span>
        <MemoryPhoto src={chapter.image} alt={chapter.imageAlt} caption={photoCaption} placeholderLabel={chapter.imageNote} size="medium" tilt="none" className="together-main-photo" attributes={photoFx(-7)} />
      </div>
    );
  }

  if (chapter.threadState === "dating") {
    return (
      <div className={className} aria-hidden="true">
        <div className="scene-sky date-sky" data-parallax="-0.35"><i className="star-layer star-layer-far" /></div>
        <div className="date-storefront" data-parallax="-0.18">
          <i className="date-awning" />
          <i className="date-window" />
          <i className="date-window date-window-two" />
        </div>
        {/* The wall clock turns with the reader: hands travel from nine in the evening to one in the morning. */}
        <div className="date-clock" data-parallax="-0.08" data-delay="0.1">
          <i className="date-clock-face" />
          <i className="date-clock-hand date-clock-hand-hour" data-spin="120" />
          <i className="date-clock-hand date-clock-hand-minute" data-spin="720" />
          <i className="date-clock-pin" />
          <small className="date-clock-label">21:00 → 01:00</small>
        </div>
        <div className="date-table" data-parallax="0.16"><i /></div>
        <DrinkCupSprite className="date-cup date-cup-one" data-parallax="0.3" data-delay="0.15" data-tilt="-4" />
        <DrinkCupSprite className="date-cup date-cup-two" data-parallax="0.34" data-delay="0.25" data-tilt="4" />
        <HeartSprite className="date-heart date-heart-one" data-rise="0.9" data-wave="5" />
        <HeartSprite className="date-heart date-heart-two" data-rise="1.25" data-wave="4" />
        <HeartSprite className="date-heart date-heart-three" data-rise="0.7" data-wave="6" />
        <LeafSprite className="park-leaf park-leaf-one" data-sink="0.9" data-drift="0.35" data-spin="160" data-wave="10" />
        <LeafSprite className="park-leaf park-leaf-two" data-sink="1.25" data-drift="-0.3" data-spin="-220" data-wave="14" />
        <LeafSprite className="park-leaf park-leaf-three" data-sink="0.7" data-drift="0.2" data-spin="120" data-wave="8" />
        <span className="offline-scene-caption" data-parallax="0.7" data-delay="0.35">{chapter.microcopy}</span>
        <MemoryPhoto src={chapter.image} alt={chapter.imageAlt} caption={photoCaption} placeholderLabel={chapter.imageNote} size="medium" tilt="right" className="date-memory-photo" attributes={photoFx(7)} />
      </div>
    );
  }

  if (chapter.threadState === "aquarium") {
    return (
      <div className={className} aria-hidden="true">
        <div className="aquarium-arch" data-parallax="-0.04"><i className="aquarium-glass" /><i className="aquarium-rim" /></div>
        <div className="aquarium-light aquarium-light-one" data-parallax="-0.25" />
        <div className="aquarium-light aquarium-light-two" data-parallax="-0.15" />
        <div className="aquarium-caustic" data-parallax="-0.1" />
        <SchoolSprite className="aquarium-school" data-drift="0.85" data-wave="6" data-delay="0.2" />
        <FishSprite className="aquarium-fish fish-one" data-drift="1" data-wave="9" data-delay="0.1" />
        <FishSprite className="aquarium-fish fish-two" data-drift="-1.3" data-wave="7" data-delay="0.25" />
        <FishSprite className="aquarium-fish fish-three" data-drift="0.7" data-wave="12" data-delay="0.4" />
        <FishSprite className="aquarium-fish fish-four" data-drift="-0.55" data-wave="6" data-delay="0.55" />
        <FishSprite className="aquarium-fish fish-five" data-drift="-0.9" data-wave="10" data-delay="0.35" />
        <JellyfishSprite className="aquarium-jelly jelly-one" data-float="0.35" data-wave="8" data-sway="6" data-delay="0.15" />
        <JellyfishSprite className="aquarium-jelly jelly-two" data-float="0.5" data-wave="6" data-sway="8" data-delay="0.3" />
        <div className="aquarium-floor" data-parallax="0.12">
          <KelpSprite className="aquarium-kelp kelp-one" />
          <KelpSprite className="aquarium-kelp kelp-two" />
          <KelpSprite className="aquarium-kelp kelp-three" />
          <KelpSprite className="aquarium-kelp kelp-four" />
        </div>
        <span className="aquarium-bubble bubble-one" data-rise="1" data-wave="6" />
        <span className="aquarium-bubble bubble-two" data-rise="1.4" data-wave="4" />
        <span className="aquarium-bubble bubble-three" data-rise="0.8" data-wave="8" />
        <span className="aquarium-bubble bubble-four" data-rise="1.15" data-wave="5" />
        <span className="aquarium-bubble bubble-five" data-rise="1.3" data-wave="7" />
        <span className="aquarium-bubble bubble-six" data-rise="0.9" data-wave="5" />
        <div className="aquarium-ticket" data-parallax="0.6" data-delay="0.3">
          <Ticket size={16} /><strong>VÉ THỦY CUNG</strong><small>điểm dừng 01 · hai người</small><i className="ticket-perforation" />
        </div>
        <span className="offline-scene-caption" data-parallax="0.7" data-delay="0.4">{chapter.microcopy}</span>
        <MemoryPhoto src={chapter.image} alt={chapter.imageAlt} caption={photoCaption} placeholderLabel={chapter.imageNote} size="medium" tilt="left" className="day-scene-photo aquarium-photo" attributes={photoFx(-6)} />
      </div>
    );
  }

  if (chapter.threadState === "cafe") {
    return (
      <div className={className} aria-hidden="true">
        <div className="cafe-room" data-parallax="-0.22"><i className="cafe-wall-light" /><i className="cafe-shelf" /><i className="cafe-shelf cafe-shelf-two" /></div>
        <div className="cafe-lamp" data-parallax="-0.3" data-sway="1.6" data-delay="0.05">
          <i className="cafe-lamp-cord" /><i className="cafe-lamp-shade" /><i className="cafe-lamp-bulb" /><i className="cafe-lamp-glow" data-glow="1" />
        </div>
        <div className="cafe-dust" data-parallax="0.05">
          <i data-float="0.25" data-wave="6" /><i data-float="0.4" data-wave="4" /><i data-float="0.3" data-wave="7" /><i data-float="0.5" data-wave="5" /><i data-float="0.35" data-wave="6" />
        </div>
        <div className="cafe-table" data-parallax="0.2"><i /></div>
        <div className="cafe-cup cafe-cup-one" data-parallax="0.45" data-delay="0.2">
          <span className="cafe-steam"><i /><i /><i /></span>
          <CoffeeCupSprite />
          <b>Hắt</b>
        </div>
        <div className="cafe-cup cafe-cup-two" data-parallax="0.55" data-delay="0.32">
          <span className="cafe-steam"><i /><i /><i /></span>
          <CoffeeCupSprite />
          <b>Nờ</b>
        </div>
        <div className="cafe-note" data-parallax="0.62" data-delay="0.4"><i className="cafe-note-pin" /><span>café note · 02</span><strong>{chapter.microcopy}</strong></div>
        <MemoryPhoto src={chapter.image} alt={chapter.imageAlt} caption={photoCaption} placeholderLabel={chapter.imageNote} size="medium" tilt="right" className="day-scene-photo cafe-photo" attributes={photoFx(6)} />
      </div>
    );
  }

  return (
    <div className={className} aria-hidden="true">
      <div className="scene-sky sunset-sky" data-parallax="-0.15"><i className="star-layer star-layer-far" /></div>
      <CloudSprite className="sunset-cloud sunset-cloud-one" data-drift="0.6" data-parallax="-0.08" />
      <CloudSprite className="sunset-cloud sunset-cloud-two" data-drift="-0.45" data-parallax="-0.05" />
      <CloudSprite className="sunset-cloud sunset-cloud-three" data-drift="0.3" data-parallax="-0.1" />
      <BirdSprite className="sunset-bird sunset-bird-one" data-drift="0.9" data-wave="8" data-delay="0.2" />
      <BirdSprite className="sunset-bird sunset-bird-two" data-drift="0.75" data-wave="6" data-delay="0.3" />
      <div className="sunset-disc" data-sink="1" data-delay="0.05"><i /></div>
      <div className="sunset-sea" data-parallax="-0.04"><i className="sunset-glitter" /><i className="sunset-glitter sunset-glitter-two" /></div>
      <div className="sunset-hill sunset-hill-back" data-parallax="-0.08" />
      <div className="sunset-hill sunset-hill-front" data-parallax="0.16" />
      <CoupleSittingSprite className="sunset-couple" data-parallax="0.16" data-delay="0.3" />
      <MemoryPhoto src={chapter.image} alt={chapter.imageAlt} placeholderLabel={chapter.imageNote} size="warm" tilt="none" className="day-scene-photo sunset-photo" attributes={photoFx(-5)} />
      <p className="sunset-statement"><Heart aria-hidden="true" size={15} />Một ngày thoải mái nhất trên đời.</p>
    </div>
  );
}
