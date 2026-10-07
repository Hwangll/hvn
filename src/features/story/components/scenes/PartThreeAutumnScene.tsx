import { Heart } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { StoryScrollItem } from "../../data/story";
import { StoryPicture } from "../../../../shared/components/visuals/StoryPicture";
import { RainWipe } from "../film/RainWipe";
import { HeartSprite, ScooterSprite } from "../atoms/SceneSprites";
import { MusicNoteSprite } from "../atoms/PartThreeSprites";
import {
  BirthdayCakeSprite,
  CalendarSprite,
  ChickenTraySprite,
  ClawMachineSprite,
  CouchCoupleSprite,
  CurryKatsuSprite,
  DeskLampSprite,
  FoldingChairSprite,
  GiftSprite,
  GhostSprite,
  GuitarSprite,
  HerbSoupSprite,
  KaraageSprite,
  KissNotebookSprite,
  LegoSprite,
  LilyBudSprite,
  LilySprite,
  LipsNoteSprite,
  MicSprite,
  MicStandSprite,
  PalmSprite,
  PartyPopperSprite,
  PenSprite,
  PharmacyBagSprite,
  PhoneDownSprite,
  RaincoatSprite,
  RedLanternSprite,
  SeedsDishSprite,
  SmoothieSprite,
  SnailDishSprite,
  StandFanSprite,
  StarFlagsSprite,
  StarLanternSprite,
  StoolSprite,
  StormCloudSprite,
  SunPatchSprite,
  TabletSprite,
  TacosSprite,
  XrayFootSprite,
  YogurtCupSprite,
} from "../atoms/PartThreeAutumnSprites";

/** The pieces every Part III diorama shares, made once by PartThreeScene. */
export interface AutumnSceneParts {
  className: string;
  caption: ReactNode;
  mainPhoto: (tilt: number, extra?: string) => ReactNode;
  secondPhoto: (tilt: number) => ReactNode;
}

/** The red lily bouquet of Part III: three open lilies, two buds and their leaves, tied with a ribbon. */
export function LilyBouquet({ className = "", ...hints }: { className?: string } & Record<`data-${string}`, string | number>) {
  return (
    <div className={`p3-lilies ${className}`.trim()} {...hints}>
      <i className="p3-lilies-leaf is-one" />
      <i className="p3-lilies-leaf is-two" />
      <i className="p3-lilies-leaf is-three" />
      <LilyBudSprite className="p3-lilies-bud is-one" />
      <LilyBudSprite className="p3-lilies-bud is-two" />
      <LilySprite className="p3-lilies-bloom is-one" />
      <LilySprite className="p3-lilies-bloom is-two" />
      <LilySprite className="p3-lilies-bloom is-three" />
      <i className="p3-lilies-wrap" />
      <i className="p3-lilies-ribbon" />
    </div>
  );
}

/*
 * The dioramas of chapters 5 and 6. They speak the same scroll hints as the others (see PartThreeScene), and keep the
 * same rule for things that change in place: every data-fade falls between 0.3 and 0.6 of the scene's progress.
 * The stops without a photo (the clinic day, the birthday plans, Trung thu and the birthday) are drawn across the whole
 * card; Ngọc asked for no pictures of the sore leg, so none of them shows it.
 */
export function PartThreeAutumnScene({ chapter, parts }: { chapter: StoryScrollItem; parts: AutumnSceneParts }) {
  const { className, caption, mainPhoto, secondPhoto } = parts;

  switch (chapter.threadState) {
    case "karaoke":
      return (
        <div className={className} aria-hidden="true">
          <div className="scene-sky p3-kara-wall" data-parallax="-0.3"><i className="p3-kara-disco" /></div>
          {/* Outside, the rain on Nguyễn Văn Lộc and the pharmacy they stopped at first. */}
          <div className="p3-rainpane" data-parallax="-0.16">
            <span className="p3-rainpane-glass">
              <i className="p3-rainpane-street" />
              <span className="p3-pharmacy"><i className="p3-pharmacy-cross" />Nhà thuốc</span>
              <i className="p3-rainpane-rain" />
              {/* Misted over from inside, to be wiped clear. */}
              <RainWipe />
            </span>
          </div>
          <i className="p3-coat-rail" data-parallax="-0.1" />
          <RaincoatSprite className="p3-raincoat is-one" data-parallax="-0.1" data-sway="2" />
          <RaincoatSprite className="p3-raincoat is-two" data-parallax="-0.1" data-sway="2.6" />
          <i className="p3-drip is-one" data-sink="1.4" data-delay="0.2" />
          <i className="p3-drip is-two" data-sink="1.7" data-delay="0.32" />
          <div className="p3-neon-pane" data-parallax="-0.12" data-glow="1"><LipsNoteSprite /></div>
          <i className="p3-kara-table" data-parallax="0.18" />
          <TabletSprite className="p3-tablet" data-parallax="0.24" data-delay="0.18" data-tilt="-6" />
          <MicSprite className="p3-mic" data-parallax="0.3" data-delay="0.26" data-tilt="10" />
          <PharmacyBagSprite className="p3-pharmacy-bag" data-parallax="0.28" data-delay="0.3" />
          <MusicNoteSprite className="p3-note p3-kara-note is-one" data-float="0.6" data-wave="7" data-drift="0.14" />
          <MusicNoteSprite className="p3-note p3-kara-note is-two" data-float="0.8" data-wave="5" data-drift="-0.1" />
          <MusicNoteSprite className="p3-note p3-kara-note is-three" data-float="0.5" data-wave="8" data-drift="0.08" />
          <span className="p3-promise" data-parallax="-0.18" data-fade="0.4">sư tử nói lời giữ lời</span>
          {caption}
          {mainPhoto(4)}
          {secondPhoto(-5)}
        </div>
      );

    case "clinic":
      return (
        <div className={className} aria-hidden="true">
          <div className="scene-sky p3-clinic-wall" data-parallax="-0.3"><i className="p3-clinic-window" /></div>
          {/* The afternoon at 59A comes in through the window, low and warm, across the sofa. */}
          <i className="p3-clinic-sun" data-parallax="-0.2" />
          {/* The morning, pinned to the wall: the clinic's X-ray, "không bị gì hết". */}
          <div className="p3-xray" data-parallax="-0.14" data-delay="0.08" data-tilt="-6">
            <XrayFootSprite />
            <small>X-Quang · không bị gì hết</small>
          </div>
          <span className="p3-door-plate" data-parallax="-0.18" data-delay="0.16">59A Yên Bình</span>
          {/* The afternoon: two films this time. */}
          <div className="p3-tv" data-parallax="-0.1" data-delay="0.1">
            <span className="p3-tv-title" data-fade="-0.3"><b>Phim 1</b><small>tựa vai nhau</small></span>
            <span className="p3-tv-slot" data-fade="0.38"><span className="p3-tv-title"><b>Phim 2</b><small>2 bộ phim lận</small></span></span>
          </div>
          <i className="p3-tv-glow" data-parallax="-0.06" data-glow="1" />
          <CouchCoupleSprite className="p3-couch" data-parallax="0.2" data-delay="0.12" />
          <i className="p3-coffee-table" data-parallax="0.3" />
          <div className="p3-soup" data-parallax="0.34" data-delay="0.22">
            <span className="p3-steam"><i /><i /><i /></span>
            <HerbSoupSprite />
          </div>
          <PhoneDownSprite className="p3-phone-down is-one" data-parallax="0.36" data-delay="0.3" />
          <PhoneDownSprite className="p3-phone-down is-two" data-parallax="0.36" data-delay="0.36" />
          <HeartSprite className="p3-heart p3-couch-heart is-one" data-rise="0.9" data-wave="5" />
          <HeartSprite className="p3-heart p3-couch-heart is-two" data-rise="1.1" data-wave="4" />
          {caption}
        </div>
      );

    case "lakeside":
      return (
        <div className={className} aria-hidden="true">
          <div className="scene-sky p3-lake-sky" data-parallax="-0.34"><i className="p3-lake-far" /><i className="p3-lake-towers" /></div>
          <i className="p3-lake" data-parallax="-0.12"><i className="p3-lake-shimmer" /></i>
          {/* The café's railing over the water, palms along it, and its lamp hung from the string of flags over the table. */}
          <i className="p3-lake-rail" data-parallax="-0.06" />
          <PalmSprite className="p3-palm is-one" data-parallax="-0.16" data-sway="1.2" />
          <PalmSprite className="p3-palm is-two" data-parallax="-0.14" data-sway="1.6" />
          <StarFlagsSprite className="p3-starflags" data-parallax="-0.2" data-sway="1" />
          <i className="p3-lake-lamp" data-parallax="-0.2" />
          <i className="p3-lake-cone" data-parallax="-0.12" />
          {/* The rain comes in harder as they talk, and catches the lamp's light on its way down. */}
          <div className="p3-rain p3-lake-rain" data-fade="0.36"><i /><i /><span className="p3-rain-lit"><i /></span></div>
          <i className="p3-stone-table" data-parallax="0.18" />
          <SnailDishSprite className="p3-snails" data-parallax="0.22" data-delay="0.12" />
          <SmoothieSprite className="p3-smoothie is-avocado" data-parallax="0.26" data-delay="0.2" />
          <YogurtCupSprite className="p3-yogurt" data-parallax="0.26" data-delay="0.26" />
          <SeedsDishSprite className="p3-seeds is-one" data-parallax="0.3" data-delay="0.3" />
          <SeedsDishSprite className="p3-seeds is-three" data-parallax="0.32" data-delay="0.34" />
          {/* And the ride home, laughing all the way. */}
          <ScooterSprite className="p3-lake-scooter" data-drift="1.2" data-wave="2" data-fade="0.48" />
          <span className="p3-laugh" data-parallax="-0.12" data-fade="0.5">ha hả</span>
          {caption}
          {mainPhoto(-4)}
          {secondPhoto(5)}
        </div>
      );

    case "notebook": {
      // The message itself, asking her father if he may come over; the album keeps it full size.
      const message = chapter.gallery.find((photo) => photo.screen);
      return (
        <div className={className} aria-hidden="true">
          <div className="scene-sky p3-tiny-wall" data-parallax="-0.3"><i className="p3-tiny-window" /></div>
          {/* The low sun through the café's window, in long beams with dust turning in them. */}
          <i className="p3-tiny-rays" data-parallax="-0.2" />
          <i className="p3-tiny-motes" data-parallax="-0.16" />
          <span className="p3-tiny-napkin" data-parallax="-0.12" data-delay="0.1">Tiny Cafe<small>Chúng tôi bán Bình yên</small></span>
          <div className="p3-chat" data-parallax="-0.06" data-delay="0.14" data-tilt="5">
            {message?.src ? <span className="p3-chat-phone"><StoryPicture src={message.src} alt="" loading="lazy" /></span> : null}
            <small>xin phép phụ huynh</small>
          </div>
          <i className="p3-rug" data-parallax="0.12" />
          <i className="p3-wood-table" data-parallax="0.18" />
          {/* The window again, laid across the tabletop by the sun. */}
          <SunPatchSprite className="p3-tiny-patch" data-parallax="0.18" />
          <KissNotebookSprite className="p3-notebook" data-parallax="0.24" data-delay="0.18" data-tilt="-4" />
          <PenSprite className="p3-pen" data-parallax="0.28" data-delay="0.26" data-tilt="12" />
          <LegoSprite className="p3-lego" data-parallax="0.3" data-delay="0.3" />
          <SmoothieSprite className="p3-smoothie is-cream is-one" data-parallax="0.22" data-delay="0.22" />
          <SmoothieSprite className="p3-smoothie is-cream is-two" data-parallax="0.22" data-delay="0.28" />
          {caption}
          {mainPhoto(5)}
          {secondPhoto(-4)}
        </div>
      );
    }

    case "acoustic":
      return (
        <div className={className} aria-hidden="true">
          <div className="scene-sky p3-stage-wall" data-parallax="-0.3"><i className="p3-stage-shutter is-one" /><i className="p3-stage-shutter is-two" /></div>
          <i className="p3-stage-lights" data-parallax="-0.18" />
          <i className="p3-stage-cone" data-parallax="-0.08" data-glow="1" />
          <i className="p3-stage-floor" data-parallax="0.08" />
          <GuitarSprite className="p3-guitar" data-parallax="-0.04" data-delay="0.1" />
          <MicStandSprite className="p3-micstand" data-parallax="0" data-delay="0.14" />
          <StandFanSprite className="p3-fan" data-parallax="0.04" data-delay="0.2" />
          {/* The evening's two songs, one after the other, and the singer who nearly sang them. */}
          <span className="p3-song is-one" data-parallax="-0.14" data-fade="-0.34">Mình Yêu Nhau Từ Kiếp Nào</span>
          <span className="p3-song-slot" data-fade="0.42"><span className="p3-song is-two">Em Là Không Thể</span></span>
          <FoldingChairSprite className="p3-chair is-one" data-parallax="0.22" />
          <FoldingChairSprite className="p3-chair is-two" data-parallax="0.24" />
          {/* The low table in front of the stage, where the tray sat and then the seeds and the matcha. */}
          <i className="p3-cafe-table" data-parallax="0.28" />
          <ChickenTraySprite className="p3-tray" data-parallax="0.34" data-delay="0.24" data-fade="-0.36" />
          <SeedsDishSprite className="p3-seeds is-two" data-parallax="0.34" data-delay="0.3" />
          {/* At Cúc cu, the seeds came with a matcha latte. */}
          <SmoothieSprite className="p3-smoothie is-matcha" data-parallax="0.32" data-fade="0.4" />
          <MusicNoteSprite className="p3-note p3-stage-note is-one" data-float="0.6" data-wave="7" data-drift="0.12" />
          <MusicNoteSprite className="p3-note p3-stage-note is-two" data-float="0.75" data-wave="6" data-drift="-0.1" />
          {caption}
          {mainPhoto(-5, "is-wide")}
          {secondPhoto(4)}
        </div>
      );

    case "planner":
      return (
        <div className={className} aria-hidden="true">
          <div className="scene-sky p3-planner-wall" data-parallax="-0.3"><i className="p3-planner-window" /></div>
          <CalendarSprite className="p3-calendar" data-parallax="-0.14" data-delay="0.08" data-tilt="-3" />
          <div className="p3-plan" data-parallax="-0.06" data-delay="0.16" data-tilt="4">
            <b>Sinh nhật anh iu · 01.10</b>
            {/* Only her own words; the rest of the plan stays a scribble. */}
            <ol>
              <li>lên lịch trước 1 tuần</li>
              <li><i /></li>
              <li><i /></li>
              <li><i /></li>
            </ol>
          </div>
          {/* The quarrel blows over, "như không có chuyện gì xảy ra". */}
          <StormCloudSprite className="p3-storm" data-parallax="-0.2" data-fade="-0.34" data-wave="4" />
          <div className="p3-calm" data-parallax="-0.2" data-fade="0.44"><HeartSprite /><small>như không có chuyện gì</small></div>
          <i className="p3-desk" data-parallax="0.16" />
          {/* The lamp she planned by, and its light on the desk. */}
          <i className="p3-lamp-light" data-parallax="0.16" />
          <DeskLampSprite className="p3-desklamp" data-parallax="0.2" data-delay="0.1" />
          <GiftSprite className="p3-gift" data-parallax="0.2" data-delay="0.24" />
          <PhoneDownSprite className="p3-phone-down is-desk" data-parallax="0.24" data-delay="0.2" />
          <PenSprite className="p3-pen is-desk" data-parallax="0.26" data-delay="0.26" data-tilt="-14" />
          <span className="p3-tay" data-parallax="-0.1" data-fade="0.5">thế mới tày</span>
          {caption}
        </div>
      );

    case "lantern":
      return (
        <div className={className} aria-hidden="true">
          {/* The full moon over Hà Đông, thin cloud drifting across it, and the far towers in its haze. */}
          <div className="scene-sky p3-autumn-sky" data-parallax="-0.34"><i className="p3-full-moon" /><i className="p3-moon-cloud" /><i className="p3-hadong-far" /></div>
          <i className="p3-hadong" data-parallax="-0.16" />
          <i className="p3-lantern-bokeh" data-parallax="-0.1" />
          <i className="p3-lantern-string" data-parallax="-0.1" />
          <RedLanternSprite className="p3-redlantern is-one" data-parallax="-0.1" data-sway="3" />
          <RedLanternSprite className="p3-redlantern is-two" data-parallax="-0.08" data-sway="2.4" />
          <RedLanternSprite className="p3-redlantern is-three" data-parallax="-0.12" data-sway="3.4" />
          <StarLanternSprite className="p3-starlantern" data-parallax="0.12" data-sway="2" data-delay="0.14" />
          <ClawMachineSprite className="p3-claw" data-parallax="0.08" data-delay="0.2" data-fade="0.3" />
          {/* The stall in ngõ Ao Sen: a low blue table, a red stool, and three tacos. */}
          <i className="p3-street-table" data-parallax="0.2" />
          <StoolSprite className="p3-stool" data-parallax="0.24" data-delay="0.12" />
          <TacosSprite className="p3-tacos" data-parallax="0.28" data-delay="0.16" />
          <span className="p3-alley" data-parallax="-0.1" data-delay="0.1">ngõ Ao Sen</span>
          {/* The night ends at a hotel "như ma". */}
          <div className="p3-hotel" data-parallax="-0.08" data-fade="0.5">
            <span className="p3-hotel-sign">H<i>O</i>TEL</span>
            <GhostSprite className="p3-ghost" data-wave="5" />
          </div>
          {caption}
        </div>
      );

    case "bento":
      return (
        <div className={className} aria-hidden="true">
          <div className="scene-sky p3-izakaya" data-parallax="-0.3" />
          <div className="p3-noren" data-parallax="-0.16"><i /><i /><i /></div>
          <RedLanternSprite className="p3-redlantern is-paper is-one" data-parallax="-0.1" data-sway="2" />
          <RedLanternSprite className="p3-redlantern is-paper is-two" data-parallax="-0.1" data-sway="2.6" />
          <span className="p3-saku" data-parallax="-0.2" data-delay="0.1">saku · siêu ngon siêu ưng</span>
          <i className="p3-pendant" data-parallax="-0.12" data-sway="1.4" />
          <i className="p3-counter-top" data-parallax="0.16" />
          {/* What they ate, as in the photo: curry with katsu, glazed karaage on cabbage and two cold drinks. */}
          <div className="p3-curry" data-parallax="0.24" data-delay="0.14">
            <span className="p3-steam"><i /><i /><i /></span>
            <CurryKatsuSprite />
          </div>
          <KaraageSprite className="p3-karaage" data-parallax="0.28" data-delay="0.2" />
          <SmoothieSprite className="p3-smoothie is-juice is-one" data-parallax="0.22" data-delay="0.24" />
          <SmoothieSprite className="p3-smoothie is-juice is-two" data-parallax="0.22" data-delay="0.28" />
          {/* Then the karaoke, "quán random mà siêu nhiều bài hát". */}
          <MicSprite className="p3-mic is-bento" data-parallax="0.12" data-fade="0.36" data-tilt="-12" />
          <MusicNoteSprite className="p3-note p3-bento-note is-one" data-float="0.7" data-wave="6" data-drift="0.12" data-fade="0.38" />
          <MusicNoteSprite className="p3-note p3-bento-note is-two" data-float="0.8" data-wave="5" data-drift="-0.1" data-fade="0.42" />
          <span className="p3-hanger" data-parallax="-0.12" data-fade="0.52" data-sway="3">chốn nghỉ chân</span>
          {caption}
          {mainPhoto(4)}
        </div>
      );

    default: {
      // The banner's letters hang along a drooping string: --k runs from -1 at one end to 1 at the other.
      const banner = "SINH NHẬT ANH IU".split("");
      return (
        <div className={className} aria-hidden="true">
          <div className="scene-sky p3-party-wall" data-parallax="-0.3"><i className="p3-party-spot" /></div>
          <ol className="p3-bunting" data-parallax="-0.16" data-sway="1">
            {banner.map((letter, index) => (
              <li key={`${letter}-${index}`} style={{ "--k": ((index / (banner.length - 1)) * 2 - 1).toFixed(3) } as CSSProperties}>{letter.trim()}</li>
            ))}
          </ol>
          <i className="p3-confetti" data-parallax="-0.08" />
          <i className="p3-balloon is-one" data-parallax="-0.1" data-wave="5" />
          <i className="p3-balloon is-two" data-parallax="-0.12" data-wave="4" />
          <i className="p3-balloon is-three" data-parallax="-0.08" data-wave="6" />
          <PartyPopperSprite className="p3-popper is-one" data-parallax="0.1" data-delay="0.2" data-tilt="-8" />
          <PartyPopperSprite className="p3-popper is-two" data-parallax="0.1" data-delay="0.28" data-tilt="8" />
          <LilyBouquet className="p3-birthday-lilies" data-parallax="0.12" data-delay="0.12" />
          <i className="p3-party-table" data-parallax="0.18" />
          <div className="p3-cake" data-parallax="0.24" data-delay="0.18">
            <span className="p3-flames"><i /><i /><i /></span>
            {/* What rises from the wicks once the candles are blown out (SceneMoment). */}
            <span className="p3-cake-smoke"><i /><i /><i /></span>
            <BirthdayCakeSprite />
          </div>
          {/* The page she left for him ("Tadaaaa"), now in his hand. It stays folded until the candles are out. */}
          <div className="p3-his-letter" data-parallax="0.3" data-delay="0.3" data-tilt="-5" data-fade="0.36">
            <small>01.10.2026</small>
            <b>Tadaaaa</b>
            <div className="p3-letter-fold">
              <div>
                <p>ngày tuyệt vời nhất trên đời</p>
                <p className="is-sign">tuyệt ơi là tuyệt hêhhe</p>
              </div>
            </div>
            <i className="p3-letter-seal" />
            <PenSprite className="p3-pen is-letter" />
          </div>
          {caption}
          <p className="sunset-statement p3-statement is-birthday"><Heart aria-hidden="true" size={15} />Em iu Anh.</p>
        </div>
      );
    }
  }
}
