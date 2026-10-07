import { Heart } from "lucide-react";
import { useMemo } from "react";
import { loveCounterStart, type StoryScrollItem } from "../../data/story";
import { loveDuration } from "../../utils/loveCounter";
import { MemoryPhoto } from "../atoms/MemoryPhoto";
import { PartThreeAutumnScene } from "./PartThreeAutumnScene";
import { BirdSprite, CloudSprite, HeartSprite, LeafSprite, ScooterSprite } from "../atoms/SceneSprites";
import {
  CakeBoxSprite,
  FlagSprite,
  FruitTeaSprite,
  LotusPadSprite,
  LotusSprite,
  MoodJarSprite,
  MuseumSprite,
  MusicNoteSprite,
  NoodleBowlSprite,
  PagodaSprite,
  PaperBoatSprite,
  PetSprite,
  PrayerFlagsSprite,
  ProjectorSprite,
  PyjamasSprite,
  RedCarSprite,
  StallSprite,
  StoneBenchSprite,
  TreeSprite,
} from "../atoms/PartThreeSprites";

interface PartThreeSceneProps {
  chapter: StoryScrollItem;
  isActive: boolean;
}

const startedOn = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" })
  .format(new Date(loveCounterStart))
  .replaceAll("/", ".");

/** Inlove's counter, live: how long it has been since 24/4/26, the way the app shows it. */
function LoveCounter() {
  const duration = useMemo(() => loveDuration(loveCounterStart), []);
  const units = [
    { value: duration.years, label: "năm" },
    { value: duration.months, label: "tháng" },
    { value: duration.weeks, label: "tuần" },
    { value: duration.days, label: "ngày" },
  ];
  return (
    <div className="p3-counter" data-parallax="0.28" data-delay="0.16" data-tilt="-4">
      <span className="p3-counter-app"><Heart size={12} strokeWidth={2.6} />Inlove · hôm nay</span>
      <ol>
        {units.map((unit) => <li key={unit.label}><b>{unit.value}</b><small>{unit.label}</small></li>)}
      </ol>
      <p><b>{duration.totalDays}</b> ngày iu nhau</p>
      <small className="p3-counter-since">từ {startedOn}</small>
    </div>
  );
}

/** The stops of chapters 5 and 6, drawn in PartThreeAutumnScene. */
const autumnStates = new Set<StoryScrollItem["threadState"]>(["karaoke", "clinic", "lakeside", "notebook", "acoustic", "planner", "lantern", "bento", "birthday"]);

/*
 * The dioramas of Part III. They share Part II's stage, so they speak the same scroll hints (read by usePartTwoScroll and
 * listed in TogetherScene.tsx): data-parallax, data-drift, data-wave, data-rise, data-float, data-sink, data-spin,
 * data-sway, data-zoom, data-tilt, data-glow, data-delay, data-fade and data-sheen. A data-fade inside a data-fade shows
 * a prop only between the two points, which is how the projector screen runs through its two films and then the joke.
 */
export function PartThreeScene({ chapter, isActive }: PartThreeSceneProps) {
  const className = `memory-scene together-scene part-three-scene part-three-scene-${chapter.threadState} ${isActive ? "is-active" : ""}`;
  // The photo lands last and creeps toward the reader across the hold.
  const photoFx = (tilt: number) => ({ "data-parallax": 0.55, "data-tilt": tilt, "data-sheen": 1, "data-delay": 0.42, "data-zoom": 0.08, "data-develop": 1 });
  // Where a stop has a second photo, it takes over like the next slide in a projector: each fade takes 0.18 of the scene,
  // and the first is all but gone before the second comes up, so two prints and their captions are never seen half-faded
  // on top of each other. The screen's films and the sulk below change over the same way. Every change falls between 0.3
  // and 0.6 of a scene's progress: the stretch in which a scene holds the stage on a desktop, between the handoffs, and
  // in which its card is wholly on a phone's screen.
  const second = chapter.gallery.find((photo) => photo.src && photo.src !== chapter.image && !photo.screen);
  const mainPhoto = (tilt: number, extra = "") => (
    <MemoryPhoto
      src={chapter.image}
      alt={chapter.imageAlt}
      caption={chapter.memoryCaption}
      placeholderLabel={chapter.imageNote}
      size="medium"
      tilt="none"
      className={`p3-photo ${extra}`.trim()}
      attributes={{ ...photoFx(tilt), ...(second ? { "data-fade": -0.3 } : {}) }}
    />
  );
  const secondPhoto = (tilt: number) => second ? (
    <MemoryPhoto src={second.src} alt={second.alt} caption={second.caption} size="medium" tilt="none" className="p3-photo p3-photo-second" attributes={{ ...photoFx(tilt), "data-fade": 0.4 }} />
  ) : null;
  const caption = <span className="offline-scene-caption" data-parallax="0.7" data-delay="0.55">{chapter.microcopy}</span>;

  if (autumnStates.has(chapter.threadState)) {
    return <PartThreeAutumnScene chapter={chapter} parts={{ className, caption, mainPhoto, secondPhoto }} />;
  }

  if (chapter.threadState === "homestay") {
    return (
      <div className={className} aria-hidden="true">
        <div className="scene-sky p3-room" data-parallax="-0.3"><i className="p3-room-lamp" /></div>
        {/* The screen runs through the evening: the film they wanted, the one they settled on, and what happened instead. */}
        <div className="p3-screen" data-parallax="-0.12" data-delay="0.05">
          <span className="p3-screen-title" data-fade="-0.24"><b>Me Before You</b><small>không tìm được</small></span>
          <span className="p3-screen-slot" data-fade="0.32">
            <span className="p3-screen-title" data-fade="-0.46"><b>365 Days</b><small>cũng không xem được</small></span>
          </span>
          <span className="p3-screen-slot" data-fade="0.52"><PaperBoatSprite className="p3-boat" /></span>
        </div>
        <i className="p3-beam" data-parallax="-0.06" data-glow="1" />
        <ProjectorSprite className="p3-projector" data-parallax="0.14" data-delay="0.18" />
        <div className="p3-bed" data-parallax="0.2"><i className="p3-pillow" /><i className="p3-pillow is-two" /><i className="p3-blanket" /></div>
        <MusicNoteSprite className="p3-note p3-note-one" data-float="0.5" data-wave="7" data-drift="0.16" />
        <MusicNoteSprite className="p3-note p3-note-two" data-float="0.72" data-wave="5" data-drift="-0.12" />
        <MusicNoteSprite className="p3-note p3-note-three" data-float="0.4" data-wave="8" data-drift="0.1" />
        <HeartSprite className="p3-heart p3-heart-one" data-rise="0.9" data-wave="5" />
        <HeartSprite className="p3-heart p3-heart-two" data-rise="1.2" data-wave="4" />
        <div className="p3-clock" data-parallax="-0.2" data-delay="0.3"><b>23:00</b><small>hôm sau mới về</small></div>
        {caption}
        {mainPhoto(5)}
      </div>
    );
  }

  if (chapter.threadState === "apps") {
    return (
      <div className={className} aria-hidden="true">
        <div className="scene-sky p3-glow-sky" data-parallax="-0.3"><i className="star-layer star-layer-far" /></div>
        <div className="p3-bokeh" data-parallax="-0.14"><i /><i /><i /><i /><i /><i /></div>
        {/* "dỗi nhau suốt ngày" clears as the reader goes on, and a heart takes its place. */}
        <span className="p3-sulk" data-parallax="-0.1" data-fade="-0.34">dỗi</span>
        <HeartSprite className="p3-heart p3-heart-makeup" data-parallax="-0.1" data-fade="0.44" />
        <LoveCounter />
        <div className="p3-widget" data-parallax="0.22" data-delay="0.3" data-tilt="4">
          <MoodJarSprite className="p3-jar" />
          <span className="p3-widget-label">lọ tâm trạng</span>
        </div>
        {/* Feelings dropped into the jar, one after another. */}
        <i className="p3-drop is-pink" data-sink="1.7" data-delay="0.36" data-wave="3" />
        <i className="p3-drop is-gold" data-sink="1.5" data-delay="0.46" data-wave="4" />
        <i className="p3-drop is-lilac" data-sink="1.8" data-delay="0.56" data-wave="3" />
        <div className="p3-pets" data-parallax="0.4" data-delay="0.44">
          <span className="p3-pet is-bi" data-wave="4"><PetSprite /><b>Bi</b></span>
          <span className="p3-pet is-bo" data-wave="5"><PetSprite /><b>Bơ</b></span>
          <small>Bố Hoàng + Mẹ Ngọc</small>
        </div>
        {caption}
        {mainPhoto(-4, "p3-phone-shot")}
      </div>
    );
  }

  if (chapter.threadState === "office") {
    return (
      <div className={className} aria-hidden="true">
        <div className="scene-sky p3-afternoon" data-parallax="-0.34"><i className="p3-sun" /></div>
        <i className="p3-rays" data-parallax="-0.22" />
        {/* Ngọc's office, its windows catching the afternoon. */}
        <div className="p3-office" data-parallax="-0.16" />
        <LeafSprite className="p3-leaf p3-leaf-one" data-sink="0.9" data-drift="0.35" data-spin="160" data-wave="10" />
        <LeafSprite className="p3-leaf p3-leaf-two" data-sink="1.2" data-drift="-0.3" data-spin="-220" data-wave="14" />
        {/* The stall beside the bench arrives, and the kissing has to stop; then the red car. */}
        <StallSprite className="p3-stall" data-parallax="0.08" data-fade="0.3" />
        <StoneBenchSprite className="p3-bench" data-parallax="0.14" />
        <CakeBoxSprite className="p3-cakes" data-parallax="0.2" data-delay="0.2" />
        <div className="p3-tea" data-parallax="0.22" data-delay="0.28" data-tilt="-6"><FruitTeaSprite /><small>12/09 · 15:12</small></div>
        <HeartSprite className="p3-heart p3-heart-bench" data-rise="0.8" data-wave="5" data-fade="-0.3" />
        <HeartSprite className="p3-heart p3-heart-bench is-two" data-rise="1.1" data-wave="4" data-fade="-0.3" />
        <RedCarSprite className="p3-car" data-parallax="0.3" data-drift="0.18" data-sheen="1" />
        <span className="p3-car-tag" data-parallax="0.3" data-fade="0.42">cheap moment ở chiếc xe đỏ</span>
        {caption}
        {mainPhoto(-6)}
        {secondPhoto(5)}
      </div>
    );
  }

  if (chapter.threadState === "museum") {
    return (
      <div className={className} aria-hidden="true">
        <div className="scene-sky p3-clear-sky" data-parallax="-0.34"><i className="p3-sun is-high" /></div>
        <CloudSprite className="p3-cloud p3-cloud-one" data-drift="0.5" data-parallax="-0.1" />
        <CloudSprite className="p3-cloud p3-cloud-two" data-drift="-0.4" data-parallax="-0.08" />
        <BirdSprite className="p3-bird p3-bird-one" data-drift="0.9" data-wave="8" data-delay="0.2" />
        <BirdSprite className="p3-bird p3-bird-two" data-drift="0.75" data-wave="6" data-delay="0.3" />
        <TreeSprite className="p3-tree p3-tree-far" data-parallax="-0.06" />
        <MuseumSprite className="p3-museum" data-parallax="-0.08" data-delay="0.05" />
        <FlagSprite className="p3-flag" data-parallax="-0.06" data-sway="2.4" />
        <TreeSprite className="p3-tree p3-tree-near" data-parallax="0.06" />
        <i className="p3-plaza" data-parallax="0.12" />
        <span className="p3-weather" data-parallax="-0.2" data-delay="0.3">thời tiết · siêu siêu mê</span>
        {caption}
        {mainPhoto(-5)}
        {secondPhoto(6)}
      </div>
    );
  }

  if (chapter.threadState === "pagoda") {
    return (
      <div className={className} aria-hidden="true">
        <div className="scene-sky p3-jade-sky" data-parallax="-0.3" />
        <PrayerFlagsSprite className="p3-flags" data-parallax="-0.16" data-sway="1" />
        <PrayerFlagsSprite className="p3-flags is-two" data-parallax="-0.1" data-sway="1.4" />
        <TreeSprite className="p3-tree p3-tree-temple" data-parallax="-0.06" />
        <PagodaSprite className="p3-pagoda" data-parallax="-0.04" data-delay="0.05" />
        <div className="p3-pond" data-parallax="0.1"><i className="p3-pond-glint" /></div>
        <LotusPadSprite className="p3-pad p3-pad-one" data-parallax="0.12" data-wave="2" />
        <LotusPadSprite className="p3-pad p3-pad-two" data-parallax="0.14" data-wave="3" />
        <LotusPadSprite className="p3-pad p3-pad-three" data-parallax="0.16" data-wave="2" />
        <LotusSprite className="p3-lotus p3-lotus-one" data-parallax="0.16" data-wave="3" data-delay="0.2" />
        <LotusSprite className="p3-lotus p3-lotus-two" data-parallax="0.18" data-wave="2" data-delay="0.3" />
        <div className="p3-incense" data-parallax="0.18" data-delay="0.2">
          <span className="p3-smoke"><i /><i /><i /></span>
          <i className="p3-stick" /><i className="p3-stick" /><i className="p3-stick" />
          <i className="p3-censer" />
        </div>
        {/* Two wishes rise together. */}
        <i className="p3-wish is-one" data-float="0.8" data-wave="6" data-delay="0.4" />
        <i className="p3-wish is-two" data-float="0.86" data-wave="5" data-delay="0.46" />
        {caption}
        {mainPhoto(5)}
        {secondPhoto(-5)}
      </div>
    );
  }

  return (
    <div className={className} aria-hidden="true">
      <div className="scene-sky p3-rain-sky" data-parallax="-0.25" />
      {/* The noon rain clears in the second half, and the late afternoon comes in behind it. */}
      <i className="p3-dusk" data-fade="0.45" />
      <CloudSprite className="p3-cloud p3-cloud-dusk is-one" data-drift="0.6" data-parallax="-0.08" />
      <CloudSprite className="p3-cloud p3-cloud-dusk is-two" data-drift="-0.45" data-parallax="-0.05" />
      <CloudSprite className="p3-cloud p3-cloud-dusk is-three" data-drift="0.3" data-parallax="-0.1" />
      {/* Triệu Việt Vương: a row of narrow houses, their windows lit, a street lamp, the wet road shining. */}
      <i className="p3-rain-street" data-parallax="-0.14" />
      <i className="p3-street-lamp" data-parallax="-0.1" />
      <div className="p3-rain" data-fade="-0.42"><i /><i /></div>
      <span className="p3-street-sign" data-parallax="-0.1" data-delay="0.15">Triệu Việt Vương</span>
      <div className="p3-table" data-parallax="0.16"><i /></div>
      <div className="p3-bowl" data-parallax="0.3" data-delay="0.2">
        <span className="p3-steam"><i /><i /><i /></span>
        <NoodleBowlSprite />
      </div>
      <PyjamasSprite className="p3-pyjamas" data-parallax="0.36" data-delay="0.35" data-tilt="-8" />
      {/* Then the ride home at dusk. */}
      <ScooterSprite className="p3-scooter" data-drift="1.4" data-wave="2" data-fade="0.5" />
      {caption}
      {mainPhoto(-5)}
      <p className="p3-statement" data-fade="0.5"><Heart aria-hidden="true" size={15} />Mây trôi chiều tà.</p>
    </div>
  );
}
