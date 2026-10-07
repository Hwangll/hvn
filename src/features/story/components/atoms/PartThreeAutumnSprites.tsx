import type { SVGProps } from "react";
import { url, useIds } from "./spriteIds";
import { Contact, Gloss } from "./SpriteLight";

/* The props of Part III's later chapters (5 and 6: the rain, the sore leg, the cafés, Mid-Autumn and the birthday), drawn
   like the others in PartThreeSprites.tsx: colours live in story-part-three-autumn.css, scroll hints pass straight
   through. They are lit, not just filled: each surface takes a gradient whose stops are coloured in CSS (the light on
   the side that faces the scene's lamp, the shade on the other), glass and glaze carry a highlight, and anything that
   stands on a table sits in its own soft contact shadow. */
type SpriteProps = SVGProps<SVGSVGElement>;

const svg = (name: string, className: string) => `${name} ${className}`.trim();

/** The karaoke mic, its head in the pink mesh cover from the photos, standing on its end on the table. */
export function MicSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("mic-sprite", className)} {...rest} viewBox="0 0 40 96" aria-hidden="true">
      <defs>
        <radialGradient id={id("cover")} cx="0.36" cy="0.3" r="0.8">
          <stop className="mic-cover-hi" />
          <stop className="mic-cover-mid" offset="0.48" />
          <stop className="mic-cover-lo" offset="1" />
        </radialGradient>
        <linearGradient id={id("ring")}>
          <stop className="mic-metal-lo" />
          <stop className="mic-metal-hi" offset="0.34" />
          <stop className="mic-metal-mid" offset="0.62" />
          <stop className="mic-metal-lo" offset="1" />
        </linearGradient>
        <linearGradient id={id("handle")}>
          <stop className="mic-handle-lo" />
          <stop className="mic-handle-hi" offset="0.3" />
          <stop className="mic-handle-mid" offset="0.56" />
          <stop className="mic-handle-lo" offset="1" />
        </linearGradient>
        <Gloss id={id("gloss")} />
        <clipPath id={id("ball")}><circle cx="20" cy="17" r="16" /></clipPath>
      </defs>
      <Contact id={id("contact")} cx={20} cy={93.4} rx={12} ry={2.8} />
      <path className="mic-handle" fill={url(id("handle"))} d="M13 34 H27 L24 92 C24 94 16 94 16 92 Z" />
      <path className="mic-handle-shine" d="M17.2 38 L18.6 89" />
      <rect className="mic-ring" fill={url(id("ring"))} x="11" y="31" width="18" height="6" rx="2" />
      <circle className="mic-cover" fill={url(id("cover"))} cx="20" cy="17" r="16" />
      {/* The mesh: lines of latitude and longitude bent round the ball, so it reads as round. */}
      <path
        className="mic-mesh"
        clipPath={url(id("ball"))}
        d="M5 7 Q20 1 35 7 M3 12 Q20 6 37 12 M3 17 Q20 11 37 17 M3 22 Q20 16 37 22 M5 27 Q20 21 35 27 M8 31 Q20 27 32 31 M9 2 Q3 17 9 32 M14 1 Q9 17 14 33 M20 0 V34 M26 1 Q31 17 26 33 M31 2 Q37 17 31 32"
      />
      <path className="mic-rim" d="M33.6 9 A16 16 0 0 1 28 31" />
      <ellipse className="mic-gloss" fill={url(id("gloss"))} cx="13.6" cy="9.4" rx="6" ry="3.6" transform="rotate(-34 13.6 9.4)" />
      <rect className="mic-button" x="18" y="50" width="4" height="8" rx="1.2" />
    </svg>
  );
}

/** The karaoke tablet: the app's green bar, "Baby" in the search box as in the photo, and a list of songs. */
export function TabletSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("tablet-sprite", className)} {...rest} viewBox="0 0 132 88" aria-hidden="true">
      <defs>
        <linearGradient id={id("case")} x1="0" y1="0" x2="0.35" y2="1">
          <stop className="tablet-case-hi" />
          <stop className="tablet-case-mid" offset="0.4" />
          <stop className="tablet-case-lo" offset="1" />
        </linearGradient>
        <linearGradient id={id("screen")} x2="0" y2="1">
          <stop className="tablet-screen-hi" />
          <stop className="tablet-screen-lo" offset="1" />
        </linearGradient>
        <linearGradient id={id("bar")} x2="0" y2="1">
          <stop className="tablet-bar-hi" />
          <stop className="tablet-bar-lo" offset="1" />
        </linearGradient>
        <Gloss id={id("glare")} x2={0.8} y2={0.7} />
      </defs>
      <Contact id={id("contact")} cx={66} cy={88} rx={70} ry={6} />
      <rect className="tablet-case" fill={url(id("case"))} x="1" y="1" width="130" height="86" rx="8" />
      <rect className="tablet-edge" x="1.7" y="1.7" width="128.6" height="84.6" rx="7.3" />
      <rect className="tablet-screen" fill={url(id("screen"))} x="7" y="7" width="118" height="74" rx="3" />
      <path className="tablet-bar" fill={url(id("bar"))} d="M10 7 H122 A3 3 0 0 1 125 10 V21 H7 V10 A3 3 0 0 1 10 7 Z" />
      <rect className="tablet-search" x="14" y="10" width="62" height="8" rx="4" />
      <path className="tablet-lens" d="M18.4 12.4 a1.7 1.7 0 1 0 0.01 0 M19.6 15.2 L21 16.6" />
      <text className="tablet-query" x="23.5" y="16.3">Baby</text>
      {/* The song they picked, lit on the list. */}
      <rect className="tablet-picked" x="10" y="24" width="112" height="14" rx="2" />
      {[26, 40, 54, 68].map((y) => (
        <g key={y}>
          <rect className="tablet-thumb" x="14" y={y} width="16" height="10" rx="1.5" />
          <rect className="tablet-line" x="35" y={y + 1.5} width="58" height="3" rx="1.5" />
          <rect className="tablet-line is-faint" x="35" y={y + 6.5} width="36" height="2.4" rx="1.2" />
        </g>
      ))}
      <path className="tablet-glare" fill={url(id("glare"))} d="M7 10 A3 3 0 0 1 10 7 H64 L38 81 H10 A3 3 0 0 1 7 78 Z" />
      <circle className="tablet-camera" cx="66" cy="4" r="1.1" />
    </svg>
  );
}

const raincoat = "M32 9 C25 9 21 13 20 18 L11 26 C8 36 6 50 6 60 L14 61 C15 52 16 46 17 41 L14 86 C24 91 40 91 50 86 L47 41 C48 46 49 52 50 61 L58 60 C58 50 56 36 53 26 L44 18 C43 13 39 9 32 9 Z";

/** A raincoat on a hook, sleeves hanging: clear wet plastic, still dripping from Nguyễn Văn Lộc. */
export function RaincoatSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("raincoat-sprite", className)} {...rest} viewBox="0 0 64 96" aria-hidden="true">
      <defs>
        <linearGradient id={id("coat")} x1="0" y1="0" x2="0.25" y2="1">
          <stop className="raincoat-hi" />
          <stop className="raincoat-mid" offset="0.5" />
          <stop className="raincoat-lo" offset="1" />
        </linearGradient>
        {/* The plastic folds away from the light at both sides, so the coat reads as hanging round, not flat. */}
        <linearGradient id={id("round")}>
          <stop className="raincoat-shade" />
          <stop className="raincoat-clear" offset="0.3" />
          <stop className="raincoat-clear" offset="0.62" />
          <stop className="raincoat-shade" offset="1" />
        </linearGradient>
      </defs>
      <path className="raincoat-hook" d="M32 1 V8 C32 12 38 12 38 8" />
      <path className="raincoat-body" fill={url(id("coat"))} d={raincoat} />
      <path className="raincoat-round" fill={url(id("round"))} d={raincoat} />
      <path className="raincoat-fold" d="M24 44 C23 58 21 72 20 87 M41 44 C42 60 44 74 45 87 M28 62 C27.4 72 27.6 80 28 89" />
      <path className="raincoat-hood" d="M23 20 C23 11 41 11 41 20 C37 26 27 26 23 20 Z" />
      <path className="raincoat-seam" d="M32 26 V87 M17 41 L20 22 M47 41 L44 22" />
      <path className="raincoat-shine" d="M21 30 C19 46 18 62 18 80 M9 34 C8 42 8 50 8 56 M37 14 C40 15 42 17 43 20" />
      <path className="raincoat-drops" d="M25 50 v0.1 M38 34 v0.1 M44 62 v0.1 M22 74 v0.1 M35 79 v0.1 M12 46 v0.1 M54 48 v0.1" />
      <circle className="raincoat-snap" cx="32" cy="40" r="1.6" />
      <circle className="raincoat-snap" cx="32" cy="54" r="1.6" />
      <circle className="raincoat-snap" cx="32" cy="68" r="1.6" />
    </svg>
  );
}

/** The karaoke room's glowing glass panel: a note and a pair of lips, as in the photo. */
export function LipsNoteSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("lipsnote-sprite", className)} {...rest} viewBox="0 0 80 104" aria-hidden="true">
      <path className="lipsnote-note" d="M30 8 V44 M30 8 C38 10 46 14 46 24 C43 18 38 17 30 17" />
      <ellipse className="lipsnote-note-head" cx="23" cy="46" rx="8.5" ry="6" transform="rotate(-22 23 46)" />
      <path className="lipsnote-lips" d="M14 78 C22 68 30 70 38 74 C46 70 54 68 62 78 C54 90 22 90 14 78 Z" />
      <path className="lipsnote-lips-line" d="M16 78 C28 80 50 80 60 78" />
      <path className="lipsnote-lips-gloss" d="M28 84.6 C34 86 42 86 48 84.4 M24 74.4 C27 72.6 30 72.6 32 73.6" />
    </svg>
  );
}

/** The paper bag from the pharmacy they stopped at first, its top folded over, the green cross on its front. */
export function PharmacyBagSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("pharmacy-bag-sprite", className)} {...rest} viewBox="0 0 60 70" aria-hidden="true">
      <defs>
        <linearGradient id={id("paper")} x1="0" y1="0" x2="1" y2="0.2">
          <stop className="pharmacy-bag-hi" />
          <stop className="pharmacy-bag-mid" offset="0.55" />
          <stop className="pharmacy-bag-lo" offset="1" />
        </linearGradient>
      </defs>
      <Contact id={id("contact")} cx={30} cy={66.4} rx={30} ry={4.2} />
      <path className="pharmacy-bag-side" d="M44 17 L53 20.5 L52 65 L44 66.6 Z" />
      <path className="pharmacy-bag-body" fill={url(id("paper"))} d="M7 17.6 L44 17 L44 66.6 L8 66 Z" />
      <path className="pharmacy-bag-under" d="M7 18.4 L44 17.8 L44 21.6 L7 22.4 Z" />
      <path className="pharmacy-bag-fold" d="M6 9.6 L45 8.4 L44.6 18 L6.6 18.6 Z" />
      <path className="pharmacy-bag-lip" d="M6.4 9.8 L44.6 8.6" />
      <path className="pharmacy-bag-crease" d="M12 24 L10 62 M39 24 L41 63 M14 54 L24 60 M30 28 L37 33 M46 26 L47 58" />
      <path className="pharmacy-bag-light" d="M7.8 19 L8.8 65" />
      <path className="pharmacy-bag-cross" d="M23 32 H28 V38 H34 V43 H28 V49 H23 V43 H17 V38 H23 Z" />
    </svg>
  );
}

/** "Chụp X-Quang": a film of a foot that, luckily, "không bị gì hết", glowing on the clinic's light box. */
export function XrayFootSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  const bones = (
    <>
      <path d="M30 6 L31 30 M40 6 L39 30" />
      <ellipse cx="35" cy="36" rx="8" ry="6" />
      <ellipse cx="29" cy="47" rx="7" ry="5" />
      <ellipse cx="41" cy="47" rx="6" ry="5" />
      <path d="M24 55 L18 76 M30 56 L27 79 M35 56 L35 80 M40 56 L43 79 M45 55 L51 75" />
      <path d="M17 80 L16 87 M26 83 L26 90 M35 84 L35 91 M44 83 L45 90 M52 79 L54 86" />
    </>
  );
  return (
    <svg className={svg("xray-sprite", className)} {...rest} viewBox="0 0 72 96" aria-hidden="true">
      <defs>
        <radialGradient id={id("film")} cx="0.5" cy="0.48" r="0.62">
          <stop className="xray-film-hi" />
          <stop className="xray-film-lo" offset="1" />
        </radialGradient>
      </defs>
      <rect className="xray-film" fill={url(id("film"))} x="1" y="1" width="70" height="94" rx="3" />
      {/* The bones twice: a wide soft stroke for the glow of the film, a fine one for the bone. */}
      <g className="xray-bones-glow">{bones}</g>
      <g className="xray-bones">{bones}</g>
      <text className="xray-mark" x="6" y="11">R</text>
    </svg>
  );
}

/** A bowl of gà tần: dark herbal broth, the chicken, red dates and goji berries, a china spoon, in a white bowl with a blue band. */
export function HerbSoupSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("herbsoup-sprite", className)} {...rest} viewBox="0 0 120 70" aria-hidden="true">
      <defs>
        <linearGradient id={id("bowl")} x2="0" y2="1">
          <stop className="herbsoup-bowl-hi" />
          <stop className="herbsoup-bowl-mid" offset="0.45" />
          <stop className="herbsoup-bowl-lo" offset="1" />
        </linearGradient>
        <radialGradient id={id("broth")} cx="0.4" cy="0.38" r="0.72">
          <stop className="herbsoup-broth-hi" />
          <stop className="herbsoup-broth-lo" offset="1" />
        </radialGradient>
        <linearGradient id={id("meat")} x2="0" y2="1">
          <stop className="herbsoup-meat-hi" />
          <stop className="herbsoup-meat-lo" offset="1" />
        </linearGradient>
      </defs>
      <Contact id={id("contact")} cx={60} cy={64} rx={58} ry={8} />
      <ellipse className="herbsoup-inside" cx="60" cy="24" rx="52" ry="12.5" />
      <ellipse className="herbsoup-broth" fill={url(id("broth"))} cx="60" cy="26" rx="47" ry="9.6" />
      <path className="herbsoup-sheen" d="M26 23 C36 19.6 48 18.6 58 19" />
      <path className="herbsoup-chicken" fill={url(id("meat"))} d="M42 24 C44 17 56 16 60 21 C62 25 56 29 48 29 C44 29 41 27 42 24 Z" />
      <path className="herbsoup-chicken" fill={url(id("meat"))} d="M64 22 C68 16 80 18 80 24 C78 29 68 29 64 26 Z" />
      <ellipse className="herbsoup-date" cx="34" cy="26" rx="3.6" ry="2.5" transform="rotate(-12 34 26)" />
      <ellipse className="herbsoup-date" cx="84" cy="28" rx="3.4" ry="2.4" transform="rotate(14 84 28)" />
      <circle className="herbsoup-goji" cx="38" cy="29.4" r="2.2" />
      <circle className="herbsoup-goji" cx="72" cy="29.4" r="2" />
      <circle className="herbsoup-goji" cx="88" cy="23.6" r="1.9" />
      <path className="herbsoup-glint" d="M37.4 28.6 h0.1 M71.4 28.6 h0.1 M87.4 22.8 h0.1" />
      <path className="herbsoup-spoon" d="M88 20 L112 5 C116 3 118 7 114 9 L90 24" />
      <path className="herbsoup-bowl" fill={url(id("bowl"))} d="M8 24 C8 52 30 66 60 66 C90 66 112 52 112 24 C102 34 18 34 8 24 Z" />
      <path className="herbsoup-band" d="M15 40 C32 52 88 52 105 40" />
      <path className="herbsoup-rim" d="M8 24 C18 34 102 34 112 24" />
      <path className="herbsoup-glaze" d="M100 33 C101 42 96 51 86 57" />
    </svg>
  );
}

const sofaBack = "M18 58 C18 48 26 44 38 44 H182 C194 44 202 48 202 58 V104 H18 Z";

/**
 * The sofa at 59A Yên Bình, seen from behind, and the two of them on it watching the film, her head on his shoulder:
 * two quiet silhouettes against the screen, edged in its light.
 */
export function CouchCoupleSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("couch-sprite", className)} {...rest} viewBox="0 0 220 120" aria-hidden="true">
      <defs>
        {/* Velvet in shade on the left, warmed by the window on the right. */}
        <linearGradient id={id("velvet")}>
          <stop className="couch-shade" />
          <stop className="couch-mid" offset="0.55" />
          <stop className="couch-lit" offset="1" />
        </linearGradient>
        <linearGradient id={id("fall")} x2="0" y2="1">
          <stop className="couch-fall-top" />
          <stop className="couch-fall-bottom" offset="1" />
        </linearGradient>
        <linearGradient id={id("people")} x2="0" y2="1">
          <stop className="couch-people-hi" />
          <stop className="couch-people-lo" offset="1" />
        </linearGradient>
      </defs>
      <Contact id={id("contact")} cx={110} cy={113} rx={120} ry={8} />
      <g className="couch-people" fill={url(id("people"))}>
        <path d="M62 60 C63 42 74 34.5 90 33 L102 33 C118 34.5 127 42 128 60 Z" />
        <path d="M91.4 25 C92 29.4 91.6 32.6 89.6 36 H102.4 C100.4 32.6 100 29.4 100.6 25 Z" />
        <path d="M83.6 18 C83 9.6 89 4.4 96.4 4.4 C103.6 4.4 109 9.4 108.6 17 C108.4 22.4 105.6 27 101 28.6 H91.4 C86.4 27 83.8 22.6 83.6 18 Z" />
        <path d="M100 60 C101 46 107 39.6 116 39.4 C127 39.4 137 45 141 60 Z" />
        <path d="M104.6 26 C104 16.4 110.6 10.4 118.4 10.6 C126.4 10.8 131.4 16.6 130.6 25 C130 33 132.6 43 137.6 60 H101.6 C105 49 105.6 36 104.6 26 Z" />
      </g>
      <path className="couch-rim" d="M84.4 14 C85.6 8.4 90.4 5 96.4 5 C101.6 5 105.6 7.6 107.4 11.6 M106.4 19 C107.4 13.6 112.2 10.8 118.4 11 C124.6 11.2 129.4 15 130.2 21.4 M64 50 C65.8 41.4 75.4 35.4 88 34.2 M130.4 43 C134.4 42 137.6 45 139.6 50" />
      <path className="couch-hair-sheen" d="M125.6 18.6 C127.2 29 128.8 39 132.6 52 M105.4 25.4 C105 19.6 107 15 110.6 12.6" />
      <path className="couch-arm" fill={url(id("velvet"))} d="M2 68 C2 61 7 58 16 58 H30 V106 H2 Z" />
      <path className="couch-arm" fill={url(id("velvet"))} d="M218 68 C218 61 213 58 204 58 H190 V106 H218 Z" />
      <path className="couch-arm-light" d="M193 59.4 H204 C211 59.4 216 62.4 216.6 68" />
      <path className="couch-back" fill={url(id("velvet"))} d={sofaBack} />
      <path className="couch-fall" fill={url(id("fall"))} d={sofaBack} />
      <path className="couch-tufts" d="M38 64 L70 84 L102 64 L134 84 L166 64 L182 74 M38 84 L70 64 L102 84 L134 64 L166 84 L182 74" />
      <g className="couch-buttons">
        {[54, 86, 118, 150].map((x) => <circle key={x} cx={x} cy="74" r="1.7" />)}
      </g>
      <path className="couch-piping" d="M20 55 C21 49 27 46.6 38 46.6 H182 C193 46.6 199 49 200 55" />
      <path className="couch-skirt" d="M18 97 H202 V104 H18 Z" />
      <path className="couch-legs" d="M26 104 L28.4 115 H31.8 L33 104 Z M187 104 L188.2 115 H191.6 L194 104 Z" />
    </svg>
  );
}

const phoneBack = "M6 10 L54 4 C60 3 64 6 64 12 L66 26 C66 31 63 34 58 35 L12 38 C7 38 4 35 4 30 L3 16 C3 13 4 11 6 10 Z";

/** A phone lying on its face, its glass back catching the light: "ko cả dùng điện thoại cho hôm í luôn". */
export function PhoneDownSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("phone-down-sprite", className)} {...rest} viewBox="0 0 70 40" aria-hidden="true">
      <defs>
        <linearGradient id={id("back")} x1="0" y1="0" x2="0.3" y2="1">
          <stop className="phone-down-hi" />
          <stop className="phone-down-lo" offset="1" />
        </linearGradient>
        <Gloss id={id("gloss")} x2={0.2} y2={1} />
      </defs>
      <Contact id={id("contact")} cx={36} cy={24} rx={36} ry={17} />
      <path className="phone-down-body" fill={url(id("back"))} d={phoneBack} />
      <path className="phone-down-sheen" fill={url(id("gloss"))} d="M8 12.4 L50 7.2 L51.4 14 L9.6 19.6 Z" />
      <path className="phone-down-edge" d="M6.6 10.6 L54 4.7 C58.6 4 62.4 6.2 63.2 10.6" />
      <rect className="phone-down-bump" x="48.4" y="6.8" width="11.4" height="20" rx="4" transform="rotate(-6 54 17)" />
      <circle className="phone-down-camera" cx="54" cy="12" r="3.2" />
      <circle className="phone-down-camera" cx="54" cy="21.4" r="3.2" />
      <path className="phone-down-glint" d="M53 11 h0.1 M53 20.4 h0.1" />
    </svg>
  );
}

/** "Ui nhớ gòi, là ăn ốc": a dish of snails in their chilli-and-tamarind sauce, herbs on top. */
export function SnailDishSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("snail-sprite", className)} {...rest} viewBox="0 0 120 52" aria-hidden="true">
      <defs>
        <linearGradient id={id("dish")} x2="0" y2="1">
          <stop className="snail-dish-hi" />
          <stop className="snail-dish-lo" offset="1" />
        </linearGradient>
        <radialGradient id={id("sauce")} cx="0.42" cy="0.36" r="0.7">
          <stop className="snail-sauce-hi" />
          <stop className="snail-sauce-lo" offset="1" />
        </radialGradient>
        <radialGradient id={id("shell")} cx="0.36" cy="0.3" r="0.8">
          <stop className="snail-shell-hi" />
          <stop className="snail-shell-mid" offset="0.55" />
          <stop className="snail-shell-lo" offset="1" />
        </radialGradient>
      </defs>
      <Contact id={id("contact")} cx={60} cy={41} rx={62} ry={11} />
      <ellipse className="snail-dish" fill={url(id("dish"))} cx="60" cy="34" rx="56" ry="16" />
      <ellipse className="snail-dish-rim" cx="60" cy="33" rx="54" ry="14.6" />
      <ellipse className="snail-dish-well" fill={url(id("sauce"))} cx="60" cy="32" rx="46" ry="11" />
      {[
        [30, 28, 1],
        [48, 24, 0.9],
        [64, 30, 1.05],
        [82, 25, 0.95],
        [94, 32, 0.85],
      ].map(([x, y, s]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
          <path className="snail-shell" fill={url(id("shell"))} d="M-9 4 C-11 -6 -2 -11 5 -8 C11 -5 11 3 5 6 C0 8 -4 4 -2 0 C0 -3 4 -2 4 1" />
          <path className="snail-shell-tip" d="M-9 4 L-15 9" />
          <path className="snail-shell-glint" d="M-5 -5 C-3 -7 0 -8 2.4 -7.6" />
        </g>
      ))}
      <path className="snail-herb" d="M22 38 C30 34 34 40 40 36 M78 40 C86 36 92 41 98 37 M54 40 C58 37 61 40 65 38" />
      <path className="snail-chilli" d="M40 30 h0.1 M70 36 h0.1 M88 30 h0.1 M57 27 h0.1" />
    </svg>
  );
}

/** A string of red flags with yellow stars, strung over the café by the lake: each one cloth, rippled by the wind. */
export function StarFlagsSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  const flags = [8, 52, 96, 140, 184, 228, 272, 316, 360];
  return (
    <svg className={svg("starflags-sprite", className)} {...rest} viewBox="0 0 400 64" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id("cloth")}>
          <stop className="starflags-lit" />
          <stop className="starflags-red" offset="0.3" />
          <stop className="starflags-fold" offset="0.52" />
          <stop className="starflags-lit" offset="0.78" />
          <stop className="starflags-red" offset="1" />
        </linearGradient>
      </defs>
      <path className="starflags-string" d="M0 8 Q200 30 400 8" />
      {flags.map((x, index) => {
        const y = 8 + 22 * (1 - ((x + 14 - 200) / 200) ** 2) * 0.98;
        return (
          <g key={x} transform={`translate(${x} ${y.toFixed(1)}) rotate(${index % 2 ? 3 : -3})`}>
            <rect className="starflags-flag" fill={url(id("cloth"))} x="0" y="0" width="28" height="22" />
            <path className="starflags-hem" d="M0 1 H28" />
            <path className="starflags-star" d="M14 4.5 L15.8 9.6 L21.2 9.7 L16.9 13 L18.5 18.2 L14 15.1 L9.5 18.2 L11.1 13 L6.8 9.7 L12.2 9.6 Z" />
          </g>
        );
      })}
    </svg>
  );
}

type Point = [number, number];

/**
 * A palm frond: a midrib curving from its base to its tip, and narrow leaflets swept toward the tip on both sides,
 * longest in the middle of the frond and drooping a little under their own weight.
 */
function frond([x0, y0]: Point, [cx, cy]: Point, [x1, y1]: Point, reach: number, count = 16) {
  const at = (t: number) => [(1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1];
  const along = (t: number) => {
    const dx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx);
    const dy = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy);
    const length = Math.hypot(dx, dy) || 1;
    return [dx / length, dy / length];
  };
  const f = (value: number) => value.toFixed(1);
  let leaves = "";
  for (let i = 0; i < count; i += 1) {
    const t = 0.14 + (i / (count - 1)) * 0.82;
    const [px, py] = at(t);
    const [ux, uy] = along(t);
    const size = reach * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, t * 1.05)));
    for (const side of [-1, 1]) {
      const dx = (-uy * side * 0.78 + ux * 0.62) * size;
      const dy = (ux * side * 0.78 + uy * 0.62) * size + size * 0.3;
      const length = Math.hypot(dx, dy) || 1;
      const [nx, ny] = [(-dy / length) * size * 0.15, (dx / length) * size * 0.15];
      const [mx, my] = [px + dx * 0.5, py + dy * 0.5 - size * 0.08];
      leaves += `M${f(px)} ${f(py)} Q${f(mx + nx)} ${f(my + ny)} ${f(px + dx)} ${f(py + dy)} Q${f(mx - nx)} ${f(my - ny)} ${f(px)} ${f(py)} Z `;
    }
  }
  return { rib: `M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}`, leaves: leaves.trim() };
}

const palmFronds = [
  { ...frond([60, 160], [20, 100], [-10, 100], 16, 20), front: false },
  { ...frond([60, 160], [40, 64], [14, 26], 15, 20), front: false },
  { ...frond([60, 160], [96, 70], [124, 48], 15, 20), front: false },
  { ...frond([60, 160], [78, 60], [96, 12], 14, 18), front: false },
  { ...frond([60, 160], [28, 120], [0, 142], 15, 18), front: true },
  { ...frond([60, 160], [58, 70], [60, 4], 16, 22), front: true },
  { ...frond([60, 160], [104, 116], [126, 130], 14, 18), front: true },
  { ...frond([60, 160], [36, 90], [8, 64], 15, 20), front: true },
  { ...frond([60, 160], [88, 92], [118, 84], 15, 20), front: true },
];

/** The palms at the water's edge of the café, dark against the city, their midribs edged by the lamp. */
export function PalmSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("palm-sprite", className)} {...rest} viewBox="0 0 120 160" aria-hidden="true">
      {palmFronds.map(({ rib, leaves, front }) => (
        <g className={`palm-frond ${front ? "is-front" : ""}`.trim()} key={rib}>
          <path className="palm-leaves" d={leaves} />
          <path className="palm-rib" d={rib} />
          {front ? <path className="palm-rim" d={rib} /> : null}
        </g>
      ))}
    </svg>
  );
}

/**
 * A tall glass: avocado smoothie by the lake (`.is-avocado`), the cream one with a sprig of rosemary at Tiny cf
 * (`.is-cream`), or the pale juice in a plastic cup that came with dinner at Phùng Khoang (`.is-juice`).
 */
export function SmoothieSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("smoothie-sprite", className)} {...rest} viewBox="0 0 44 96" aria-hidden="true">
      <defs>
        <linearGradient id={id("drink")} x2="0" y2="1">
          <stop className="smoothie-drink-hi" />
          <stop className="smoothie-drink-lo" offset="1" />
        </linearGradient>
        {/* Glass is clearest face on and thickest at its edges. */}
        <linearGradient id={id("glass")}>
          <stop className="smoothie-glass-edge" />
          <stop className="smoothie-glass-clear" offset="0.24" />
          <stop className="smoothie-glass-clear" offset="0.7" />
          <stop className="smoothie-glass-edge" offset="1" />
        </linearGradient>
        <Gloss id={id("gloss")} />
      </defs>
      <Contact id={id("contact")} cx={22} cy={91.2} rx={21} ry={4.2} />
      <ellipse className="smoothie-caustic" cx="36" cy="92.4" rx="11" ry="2.6" />
      <path className="smoothie-straw" d="M27 30 L35 2" />
      <path className="smoothie-sprig" d="M25 30 C26 22 30 16 34 12 M27 24 L23 20 M29 20 L33 21 M31 16 L28 13" />
      <path className="smoothie-drink" fill={url(id("drink"))} d="M7 28 H37 L33 80 C32 84 12 84 11 80 Z" />
      <path className="smoothie-foam" d="M7 28 H37 L36.4 35 C30 38 14 38 7.6 35 Z" />
      <path className="smoothie-glass" fill={url(id("glass"))} d="M5 26 H39 L34 82 C33 88 11 88 10 82 Z" />
      <path className="smoothie-shine" fill={url(id("gloss"))} d="M8.6 30 H12 L13 78 H11.4 Z" />
      <path className="smoothie-rim" d="M5 26 H39" />
      <path className="smoothie-stem" d="M17 88 H27 V92 H17 Z" />
    </svg>
  );
}

/** "Cốc gì đó cụa anh": a short glass of yoghurt with something golden on top. */
export function YogurtCupSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("yogurt-sprite", className)} {...rest} viewBox="0 0 44 60" aria-hidden="true">
      <defs>
        <linearGradient id={id("drink")} x2="0" y2="1">
          <stop className="yogurt-drink-hi" />
          <stop className="yogurt-drink-lo" offset="1" />
        </linearGradient>
        <linearGradient id={id("glass")}>
          <stop className="smoothie-glass-edge" />
          <stop className="smoothie-glass-clear" offset="0.24" />
          <stop className="smoothie-glass-clear" offset="0.7" />
          <stop className="smoothie-glass-edge" offset="1" />
        </linearGradient>
        <Gloss id={id("gloss")} />
      </defs>
      <Contact id={id("contact")} cx={22} cy={56.6} rx={22} ry={4.4} />
      <path className="yogurt-straw" d="M26 18 L33 2" />
      <path className="yogurt-drink" fill={url(id("drink"))} d="M7 16 H37 L34 54 C33 57 11 57 10 54 Z" />
      <path className="yogurt-top" d="M7 16 H37 L36 24 C28 26 16 26 8 24 Z" />
      <path className="yogurt-glass" fill={url(id("glass"))} d="M5 14 H39 L35 56 C34 59 10 59 9 56 Z" />
      <path className="smoothie-shine" fill={url(id("gloss"))} d="M8.4 18 H11.6 L12.4 52 H10.8 Z" />
      <path className="smoothie-rim" d="M5 14 H39" />
    </svg>
  );
}

/** A dish of sunflower seeds, black with pale stripes, in a terracotta bowl: the cafés of these chapters all had them. */
export function SeedsDishSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("seeds-sprite", className)} {...rest} viewBox="0 0 80 36" aria-hidden="true">
      <defs>
        <linearGradient id={id("clay")} x2="0" y2="1">
          <stop className="seeds-dish-hi" />
          <stop className="seeds-dish-lo" offset="1" />
        </linearGradient>
      </defs>
      <Contact id={id("contact")} cx={40} cy={32.6} rx={36} ry={4.6} />
      <path className="seeds-dish" fill={url(id("clay"))} d="M4 12 H76 L68 32 C60 34.4 20 34.4 12 32 Z" />
      <ellipse className="seeds-rim" cx="40" cy="12.4" rx="36" ry="3.2" />
      {[
        [16, 12, -30],
        [24, 10, 20],
        [32, 13, -10],
        [40, 9, 40],
        [48, 12, -25],
        [56, 10, 15],
        [63, 13, -40],
        [28, 15, 60],
        [50, 15, -60],
        [36, 7, -70],
        [45, 6, 10],
      ].map(([x, y, a]) => (
        <g key={`${x}-${y}`} transform={`rotate(${a} ${x} ${y})`}>
          <ellipse className="seeds-seed" cx={x} cy={y} rx="5" ry="2.1" />
          <path className="seeds-stripe" d={`M${x - 3.4} ${y} H${x + 3.6}`} />
        </g>
      ))}
      <path className="seeds-glaze" d="M10 16 C10.6 22 12 27 14 30.4" />
    </svg>
  );
}

const notebookPages = {
  left: "M8 7 C34 4.6 64 4 84 8.4 V107.6 C64 103.6 34 104.4 8 106.6 Z",
  right: "M86 8.4 C106 4 136 4.6 162 7 V106.6 C136 104.4 106 103.6 86 107.6 Z",
};

/**
 * The notebook from Tiny cf, lying open in the sun: two pages of squared paper curving into the gutter, lines of
 * handwriting, a lipstick kiss, and a satin ribbon marking the page.
 */
export function KissNotebookSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  const lines = [22, 31, 40, 49, 58, 67];
  return (
    <svg className={svg("notebook-sprite", className)} {...rest} viewBox="0 0 170 116" aria-hidden="true">
      <defs>
        <linearGradient id={id("left")}>
          <stop className="notebook-page-edge" />
          <stop className="notebook-page-face" offset="0.62" />
          <stop className="notebook-page-gutter" offset="1" />
        </linearGradient>
        <linearGradient id={id("right")} x1="1" x2="0">
          <stop className="notebook-page-edge" />
          <stop className="notebook-page-face" offset="0.62" />
          <stop className="notebook-page-gutter" offset="1" />
        </linearGradient>
        <linearGradient id={id("cover")} x2="0" y2="1">
          <stop className="notebook-cover-hi" />
          <stop className="notebook-cover-lo" offset="1" />
        </linearGradient>
        <radialGradient id={id("kiss")} cx="0.5" cy="0.46" r="0.6">
          <stop className="notebook-kiss-core" />
          <stop className="notebook-kiss-edge" offset="1" />
        </radialGradient>
        <clipPath id={id("pages")}>
          <path d={notebookPages.left} />
          <path d={notebookPages.right} />
        </clipPath>
      </defs>
      <Contact id={id("contact")} cx={86} cy={106} rx={94} ry={15} />
      <rect className="notebook-cover" fill={url(id("cover"))} x="3" y="9" width="164" height="104" rx="3" />
      <path className="notebook-stack" d="M7 109 C34 106.6 64 105.8 85 109.6 C106 105.8 136 106.6 163 109 M7 110.8 C34 108.4 64 107.6 85 111.4 C106 107.6 136 108.4 163 110.8" />
      <path className="notebook-page" fill={url(id("left"))} d={notebookPages.left} />
      <path className="notebook-page" fill={url(id("right"))} d={notebookPages.right} />
      <g clipPath={url(id("pages"))}>
        <path className="notebook-grid" d="M8 16 H84 M8 26 H84 M8 36 H84 M8 46 H84 M8 56 H84 M8 66 H84 M8 76 H84 M8 86 H84 M8 96 H84 M18 6 V108 M30 6 V108 M42 6 V108 M54 6 V108 M66 6 V108 M78 6 V108 M86 16 H162 M86 26 H162 M86 36 H162 M86 46 H162 M86 56 H162 M86 66 H162 M86 76 H162 M86 86 H162 M86 96 H162 M96 6 V108 M108 6 V108 M120 6 V108 M132 6 V108 M144 6 V108 M156 6 V108" />
        <path className="notebook-margin" d="M14 6 V108 M92 6 V108" />
      </g>
      {lines.map((y, index) => (
        <path
          className="notebook-ink"
          key={y}
          d={`M18 ${y} q4 -3 8 0 t8 0 t8 0 t8 0 t8 0 ${index % 3 === 2 ? "" : "t8 0 t8 0"}`}
        />
      ))}
      {[20, 29, 38].map((y) => (
        <path className="notebook-ink" key={`r-${y}`} d={`M96 ${y} q4 -3 8 0 t8 0 t8 0 t8 0 t8 0 t8 0`} />
      ))}
      <path className="notebook-kiss" fill={url(id("kiss"))} d="M104 70 C112 62 120 64 126 67 C132 64 140 62 148 70 C140 82 112 82 104 70 Z" />
      <path className="notebook-kiss-creases" d="M112 66.6 L113.4 69 M118 65.6 L118.6 68.6 M133 65.6 L132.4 68.6 M139 66.4 L137.8 69 M114 74 L115.4 76.6 M121 75.6 L121.4 78.6 M129 75.8 L128.8 78.8 M136 74.6 L135 77.4" />
      <path className="notebook-kiss-line" d="M106 70 C118 72 136 72 146 70" />
      <path className="notebook-ink is-signature" d="M128 92 c4 -8 8 -8 6 0 c-2 6 6 2 10 -4 c2 6 6 6 10 0" />
      <path className="notebook-gutter" d="M85 8.6 V108" />
      <path className="notebook-ribbon" d="M85.4 7 C87 34 83.6 62 86.4 92 C87 100 88.6 108 90.6 118" />
    </svg>
  );
}

/** The window, laid on the tabletop by the low sun: four warm panes, skewed by the angle of the light. */
export function SunPatchSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  const at = (u: number, v: number) => `${(18 + 58 * u + 34 * v).toFixed(1)} ${(46 * v + 2).toFixed(1)}`;
  const pane = (u0: number, u1: number, v0: number, v1: number) => `M${at(u0, v0)} L${at(u1, v0)} L${at(u1, v1)} L${at(u0, v1)} Z`;
  const panes = [pane(0, 0.46, 0, 0.45), pane(0.54, 1, 0, 0.45), pane(0, 0.46, 0.55, 1), pane(0.54, 1, 0.55, 1)].join(" ");
  return (
    <svg className={svg("sunpatch-sprite", className)} {...rest} viewBox="0 0 120 50" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id("light")} x1="0" y1="0" x2="1" y2="1">
          <stop className="sunpatch-far" />
          <stop className="sunpatch-near" offset="1" />
        </linearGradient>
      </defs>
      {/* A soft penumbra round the panes, then the panes themselves. */}
      <path className="sunpatch-glow" d={panes} />
      <path className="sunpatch" fill={url(id("light"))} d={panes} />
    </svg>
  );
}

/** A pen: lacquered barrel with a gold clip and band, a darker grip, and the light running down its length. */
export function PenSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("pen-sprite", className)} {...rest} viewBox="0 0 90 14" aria-hidden="true">
      <defs>
        <linearGradient id={id("barrel")} x2="0" y2="1">
          <stop className="pen-body-hi" />
          <stop className="pen-body-mid" offset="0.42" />
          <stop className="pen-body-lo" offset="1" />
        </linearGradient>
        <linearGradient id={id("metal")} x2="0" y2="1">
          <stop className="pen-metal-hi" />
          <stop className="pen-metal-lo" offset="1" />
        </linearGradient>
      </defs>
      <Contact id={id("contact")} cx={46} cy={12.4} rx={46} ry={3.4} />
      <path className="pen-body" fill={url(id("barrel"))} d="M10 3 H78 C82 3 84 5 84 7 C84 9 82 11 78 11 H10 Z" />
      <path className="pen-grip" d="M10 3.6 H21 V10.4 H10 Z" />
      <path className="pen-tip" fill={url(id("metal"))} d="M10 3 L1 7 L10 11 Z" />
      <path className="pen-band" fill={url(id("metal"))} d="M57 3 H60 V11 H57 Z" />
      <path className="pen-shine" d="M22 4.7 H77" />
      <path className="pen-clip" d="M62 3 V0.5 H80 V3" />
    </svg>
  );
}

/** Lego, half built: a little figure still waiting for a leg ("lắp lego chưa xong cí chân"), and the loose bricks. */
export function LegoSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  const bricks: Array<[number, number, number, string]> = [
    [4, 52, 16, "is-red"],
    [22, 56, 12, "is-green"],
    [36, 52, 16, "is-yellow"],
    [12, 44, 12, "is-green"],
    [54, 56, 12, "is-red"],
  ];
  // One sheen for every piece of plastic: lit along the top, shaded toward the table.
  const shade = url(id("shade"));
  return (
    <svg className={svg("lego-sprite", className)} {...rest} viewBox="0 0 100 70" aria-hidden="true">
      <defs>
        <linearGradient id={id("shade")} x2="0" y2="1">
          <stop className="lego-shade-hi" />
          <stop className="lego-shade-mid" offset="0.45" />
          <stop className="lego-shade-lo" offset="1" />
        </linearGradient>
      </defs>
      <Contact id={id("contact")} cx={50} cy={63} rx={52} ry={6} />
      {bricks.map(([x, y, w, tone]) => (
        <g className={`lego-brick ${tone}`} key={`${x}-${y}`}>
          <rect className="lego-face" x={x} y={y} width={w} height="8" rx="1" />
          <rect className="lego-sheen" fill={shade} x={x} y={y} width={w} height="8" rx="1" />
          <rect className="lego-stud" x={x + 2} y={y - 2.5} width="3.4" height="2.5" rx="0.8" />
          <rect className="lego-stud" x={x + w - 5.4} y={y - 2.5} width="3.4" height="2.5" rx="0.8" />
          <path className="lego-glint" d={`M${x + 1.2} ${y + 1.2} H${x + w - 1.2} M${x + 2.6} ${y - 1.8} h1.4 M${x + w - 4} ${y - 1.8} h1.4`} />
        </g>
      ))}
      <g className="lego-figure">
        <rect className="lego-leg" x="71" y="44" width="10" height="16" />
        <rect className="lego-leg-missing" x="83" y="44" width="10" height="16" />
        <rect className="lego-hip" x="71" y="40" width="22" height="4" />
        <path className="lego-torso" d="M72 22 H92 L94 40 H70 Z" />
        <rect className="lego-head" x="76" y="10" width="12" height="11" rx="3" />
        <rect className="lego-hat" x="74" y="5" width="16" height="6" rx="2" />
        <path className="lego-sheen" fill={shade} d="M72 22 H92 L94 40 H70 Z M76 13 A3 3 0 0 1 79 10 H85 A3 3 0 0 1 88 13 V18 A3 3 0 0 1 85 21 H79 A3 3 0 0 1 76 18 Z M71 44 H81 V60 H71 Z" />
        <path className="lego-glint" d="M74 24 H82 M77.4 12 H81 M75.6 6.6 H80" />
      </g>
    </svg>
  );
}

/** The Jollibee tray from the photo: fried chicken and spaghetti on two yellow plates, fries and two colas, all glossy. */
export function ChickenTraySprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("tray-sprite", className)} {...rest} viewBox="0 0 170 104" aria-hidden="true">
      <defs>
        <linearGradient id={id("tray")} x2="0" y2="1">
          <stop className="tray-base-hi" />
          <stop className="tray-base-lo" offset="1" />
        </linearGradient>
        <radialGradient id={id("plate")} cx="0.42" cy="0.36" r="0.7">
          <stop className="tray-plate-hi" />
          <stop className="tray-plate-lo" offset="1" />
        </radialGradient>
        <radialGradient id={id("chicken")} cx="0.36" cy="0.3" r="0.8">
          <stop className="tray-chicken-hi" />
          <stop className="tray-chicken-mid" offset="0.5" />
          <stop className="tray-chicken-lo" offset="1" />
        </radialGradient>
        <linearGradient id={id("cola")}>
          <stop className="tray-cola-lo" />
          <stop className="tray-cola-hi" offset="0.3" />
          <stop className="tray-cola-lo" offset="1" />
        </linearGradient>
        <Gloss id={id("gloss")} x2={0.6} y2={1} />
      </defs>
      <Contact id={id("contact")} cx={85} cy={98} rx={90} ry={11} />
      <rect className="tray-base" fill={url(id("tray"))} x="2" y="22" width="166" height="80" rx="9" />
      <rect className="tray-lip" x="3.4" y="23.4" width="163.2" height="77.2" rx="8" />
      <rect className="tray-liner" x="10" y="28" width="150" height="68" rx="5" />
      <path className="tray-liner-print" d="M16 90 h10 M30 90 h18 M52 90 h8 M120 90 h14 M138 90 h16" />
      {[44, 118].map((x, index) => (
        <g key={x}>
          <ellipse className="tray-plate-shadow" cx={x + 2} cy="65" rx="37" ry="26" />
          <ellipse className="tray-plate" fill={url(id("plate"))} cx={x} cy="62" rx="36" ry="26" />
          <ellipse className="tray-plate-well" cx={x} cy="63" rx="28" ry="19" />
          <path className="tray-noodles" d={`M${x - 24} 66 c4 -9 14 -12 22 -7 c7 -6 18 -3 22 5 c-6 9 -38 11 -44 2 z`} />
          <path className="tray-noodle-lines" d={`M${x - 20} 64 q5 -4 10 0 t10 0 t10 0 M${x - 16} 69 q5 -4 10 0 t10 0 t8 0`} />
          <path className="tray-sauce" d={`M${x - 14} 60 c3 -5 11 -6 15 -2 c3 3 0 7 -6 7 c-5 0 -10 -1 -9 -5 z`} />
          <path className="tray-sauce-gloss" d={`M${x - 10} 59.6 c2 -2 5 -2.6 7 -1.6`} />
          <path className="tray-chicken" fill={url(id("chicken"))} d={index ? `M${x + 2} 46 c8 -8 24 -6 26 4 c2 8 -8 13 -18 11 l-6 6 c-3 3 -7 0 -5 -3 l4 -6 c-5 -2 -6 -8 -1 -12 z` : `M${x - 4} 44 c8 -9 25 -7 27 3 c2 9 -9 14 -19 11 l-6 6 c-3 3 -7 0 -5 -3 l4 -6 c-5 -2 -6 -7 -1 -11 z`} />
          <path className="tray-crumb" d={index ? `M${x + 10} 48 h2 M${x + 16} 52 h2 M${x + 21} 47 h2 M${x + 13} 55 h1.6 M${x + 22} 53 h1.6` : `M${x + 4} 46 h2 M${x + 10} 50 h2 M${x + 15} 45 h2 M${x + 7} 53 h1.6 M${x + 18} 51 h1.6`} />
        </g>
      ))}
      <path className="tray-fries-box" d="M75 30 H95 L92 54 H78 Z" />
      <path className="tray-fries" d="M78 31 L76 17 M82 31 L82 13 M86 31 L88 15 M90 31 L93 19 M80 31 L79.4 20 M88 31 L90.4 22" />
      <path className="tray-fries-light" d="M81.4 15 L81.4 22 M87.6 17 L87 24" />
      <path className="tray-fries-box-shine" d="M77.6 33 L79.4 51" />
      {[68, 89].map((x, index) => (
        <g key={x}>
          <rect className="tray-cola" fill={url(id("cola"))} x={x} y={index ? 4 : 2} width="15" height="24" rx="2" />
          <path className="tray-cola-shine" fill={url(id("gloss"))} d={`M${x + 2.4} ${index ? 7 : 5} h2.6 v18 h-2.6 z`} />
          <path className="tray-cola-drops" d={`M${x + 9} ${index ? 12 : 10} v0.1 M${x + 11.6} ${index ? 18 : 16} v0.1 M${x + 7.4} ${index ? 21 : 19} v0.1`} />
        </g>
      ))}
      <path className="tray-cola-lid" d="M67 4 H84 M88 6 H105" />
      <path className="tray-cola-straw" d="M78 3 L81 -6 M99 5 L96 -4" />
      <path className="tray-gloss" fill={url(id("gloss"))} d="M10 25 H150 C120 27 40 27 10 31 Z" />
    </svg>
  );
}

/** Cúc cu's little stage: a mic on its chrome stand, on a tripod base. */
export function MicStandSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("micstand-sprite", className)} {...rest} viewBox="0 0 50 120" aria-hidden="true">
      <defs>
        <linearGradient id={id("chrome")}>
          <stop className="micstand-chrome-lo" />
          <stop className="micstand-chrome-hi" offset="0.35" />
          <stop className="micstand-chrome-mid" offset="0.6" />
          <stop className="micstand-chrome-lo" offset="1" />
        </linearGradient>
        <radialGradient id={id("grille")} cx="0.38" cy="0.3" r="0.8">
          <stop className="micstand-grille-hi" />
          <stop className="micstand-grille-lo" offset="1" />
        </radialGradient>
      </defs>
      <Contact id={id("contact")} cx={25} cy={115} rx={22} ry={3.6} />
      <path className="micstand-legs" d="M10 116 L25 108 L40 116 M25 108 V116" />
      <rect className="micstand-pole" fill={url(id("chrome"))} x="23.6" y="30" width="2.8" height="80" rx="1" />
      <rect className="micstand-clutch" fill={url(id("chrome"))} x="22.6" y="66" width="4.8" height="4" rx="1" />
      <path className="micstand-boom" d="M25 31 L36 18" />
      <g transform="rotate(38 37 14)">
        <rect className="micstand-mic" x="33" y="12" width="9" height="11" rx="2" />
        <rect className="micstand-head" fill={url(id("grille"))} x="32.4" y="5" width="10.2" height="9" rx="4.6" />
        <path className="micstand-mesh" d="M34 8.4 H41 M33.6 10.6 H41.4 M35 6.6 H40" />
      </g>
    </svg>
  );
}

const guitarBody = "M30 56 C18 56 14 64 16 74 C8 80 6 92 10 102 C16 120 44 120 50 102 C54 92 52 80 44 74 C46 64 42 56 30 56 Z";

/** An acoustic guitar leaning against the yellow wall: honey spruce, a dark rosette, its shadow thrown on the wall. */
export function GuitarSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("guitar-sprite", className)} {...rest} viewBox="0 0 60 130" aria-hidden="true">
      <defs>
        <radialGradient id={id("wood")} cx="0.36" cy="0.42" r="0.75">
          <stop className="guitar-wood-hi" />
          <stop className="guitar-wood-mid" offset="0.55" />
          <stop className="guitar-wood-lo" offset="1" />
        </radialGradient>
        <linearGradient id={id("neck")}>
          <stop className="guitar-neck-hi" />
          <stop className="guitar-neck-lo" offset="1" />
        </linearGradient>
        <Gloss id={id("gloss")} x2={0.4} y2={1} />
      </defs>
      <path className="guitar-cast" d={guitarBody} transform="translate(7 3)" />
      <path className="guitar-cast" d="M27 4 H33 V64 H27 Z" transform="translate(7 3)" />
      <Contact id={id("contact")} cx={31} cy={118} rx={20} ry={3.6} />
      <path className="guitar-neck" fill={url(id("neck"))} d="M27 4 H33 V64 H27 Z" />
      <path className="guitar-frets" d="M27 16 H33 M27 24 H33 M27 31 H33 M27 37.6 H33 M27 43.6 H33 M27 49 H33 M27 54 H33" />
      <rect className="guitar-head" x="25" y="0" width="10" height="10" rx="2" />
      <path className="guitar-pegs" d="M24 2.4 h-2 M24 5 h-2 M24 7.6 h-2 M36 2.4 h2 M36 5 h2 M36 7.6 h2" />
      <path className="guitar-body" fill={url(id("wood"))} d={guitarBody} />
      <path className="guitar-binding" d={guitarBody} />
      <path className="guitar-guard" d="M35 76 C42 77 44 84 41 90 C39 86 37 84 35 84 Z" />
      <circle className="guitar-rosette" cx="30" cy="84" r="8.6" />
      <circle className="guitar-hole" cx="30" cy="84" r="7" />
      <path className="guitar-strings" d="M28.6 6 V108 M29.6 6 V108 M30.4 6 V108 M31.4 6 V108" />
      <path className="guitar-bridge" d="M24 102 H36" />
      <path className="guitar-gloss" fill={url(id("gloss"))} d="M19 70 C16 76 13 86 15 96 C16 92 18 84 22 76 Z" />
    </svg>
  );
}

/** The standing fan that turned beside the stage all evening: a chrome cage, pale blue blades, a round base. */
export function StandFanSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("fan-sprite", className)} {...rest} viewBox="0 0 60 110" aria-hidden="true">
      <defs>
        <linearGradient id={id("metal")}>
          <stop className="fan-metal-lo" />
          <stop className="fan-metal-hi" offset="0.38" />
          <stop className="fan-metal-lo" offset="1" />
        </linearGradient>
        <radialGradient id={id("blade")} cx="0.5" cy="0.5" r="0.5">
          <stop className="fan-blade-in" />
          <stop className="fan-blade-out" offset="1" />
        </radialGradient>
      </defs>
      <Contact id={id("contact")} cx={30} cy={106.4} rx={20} ry={3.4} />
      <ellipse className="fan-base" fill={url(id("metal"))} cx="30" cy="104" rx="15" ry="3.6" />
      <rect className="fan-pole" fill={url(id("metal"))} x="28.4" y="48" width="3.2" height="56" rx="1" />
      <ellipse className="fan-motor" cx="30" cy="30" rx="9" ry="8" />
      <g className="fan-blades" fill={url(id("blade"))}>
        <path d="M30 28 C26 14 34 8 36 18 Z" />
        <path d="M30 28 C44 26 48 36 38 36 Z" />
        <path d="M30 28 C22 40 12 36 18 30 Z" />
      </g>
      <circle className="fan-cage" cx="30" cy="28" r="24" />
      <circle className="fan-ring" cx="30" cy="28" r="15" />
      <path className="fan-spokes" d="M30 4 V52 M6 28 H54 M13 11 L47 45 M47 11 L13 45" />
      <circle className="fan-hub" cx="30" cy="28" r="4" />
      <path className="fan-glint" d="M14 16 A20 20 0 0 1 24 7.6" />
    </svg>
  );
}

/** One of Cúc cu's folding chairs: green canvas sagging a little on its black frame. */
export function FoldingChairSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("chair-sprite", className)} {...rest} viewBox="0 0 70 80" aria-hidden="true">
      <defs>
        <linearGradient id={id("canvas")} x2="0" y2="1">
          <stop className="chair-canvas-hi" />
          <stop className="chair-canvas-lo" offset="1" />
        </linearGradient>
      </defs>
      <Contact id={id("contact")} cx={35} cy={77} rx={34} ry={3.6} />
      <path className="chair-frame" d="M10 4 V76 M60 4 V76 M10 50 L60 76 M60 50 L10 76" />
      <path className="chair-frame-light" d="M9 6 V74 M59 6 V48" />
      <path className="chair-canvas" fill={url(id("canvas"))} d="M10 8 H60 V30 C44 32.4 26 32.4 10 30 Z" />
      <path className="chair-canvas" fill={url(id("canvas"))} d="M8 44 H62 V52 C44 54.6 26 54.6 8 52 Z" />
      <path className="chair-seam" d="M12 10.4 H58 M10 45.6 H60" />
    </svg>
  );
}

/** A wall calendar open on October, the first circled in red: paper on wire rings, its lower corner lifting off the wall. */
export function CalendarSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  const days = Array.from({ length: 31 }, (_, index) => index + 1);
  // 1 October 2026 is a Thursday; the grid starts on Monday.
  const offset = 3;
  return (
    <svg className={svg("calendar-sprite", className)} {...rest} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id={id("sheet")} x1="0" y1="0" x2="0.4" y2="1">
          <stop className="calendar-sheet-hi" />
          <stop className="calendar-sheet-lo" offset="1" />
        </linearGradient>
        <linearGradient id={id("head")} x2="0" y2="1">
          <stop className="calendar-head-hi" />
          <stop className="calendar-head-lo" offset="1" />
        </linearGradient>
        <linearGradient id={id("ring")}>
          <stop className="calendar-ring-lo" />
          <stop className="calendar-ring-hi" offset="0.45" />
          <stop className="calendar-ring-lo" offset="1" />
        </linearGradient>
      </defs>
      <path className="calendar-under" d="M5 14 H117 V114 H5 Z" />
      <path className="calendar-sheet" fill={url(id("sheet"))} d="M2 14 A4 4 0 0 1 6 10 H114 A4 4 0 0 1 118 14 V104 L106 116 H6 A4 4 0 0 1 2 112 Z" />
      <path className="calendar-head" fill={url(id("head"))} d="M2 14 A4 4 0 0 1 6 10 H114 A4 4 0 0 1 118 14 V34 H2 Z" />
      <path className="calendar-curl" d="M118 104 L106 116 C108 110 110 106 118 104 Z" />
      {[30, 60, 90].map((x) => (
        <rect className="calendar-ring" fill={url(id("ring"))} key={x} x={x - 1.6} y="3" width="3.2" height="13" rx="1.6" />
      ))}
      <text className="calendar-month" x="60" y="27" textAnchor="middle">THÁNG 10</text>
      {days.map((day) => {
        const cell = day - 1 + offset;
        const x = 12 + (cell % 7) * 16;
        const y = 48 + Math.floor(cell / 7) * 14;
        return (
          <text className={`calendar-day ${day === 1 ? "is-birthday" : ""}`} key={day} x={x} y={y} textAnchor="middle">
            {day}
          </text>
        );
      })}
      <circle className="calendar-circle" cx={12 + offset * 16} cy="44.5" r="7.4" />
      <path className="calendar-heart" d="M66 36 c-2.4-3-6.4-1-5 1.8 .9 1.8 5 4.2 5 4.2 s4.1-2.4 5-4.2 c1.4-2.8-2.6-4.8-5-1.8z" />
    </svg>
  );
}

const stormCloud = "M22 44 C10 44 6 34 12 28 C10 18 22 12 30 18 C34 6 54 4 60 16 C70 10 84 16 82 28 C92 30 94 44 82 46 H24 Z";

/** A small storm cloud for the quarrel, heavy and lit from the dusk above it, which blows over as if nothing had happened. */
export function StormCloudSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("storm-sprite", className)} {...rest} viewBox="0 0 100 78" aria-hidden="true">
      <defs>
        <linearGradient id={id("cloud")} x2="0" y2="1">
          <stop className="storm-cloud-hi" />
          <stop className="storm-cloud-mid" offset="0.5" />
          <stop className="storm-cloud-lo" offset="1" />
        </linearGradient>
      </defs>
      <path className="storm-rain" d="M28 50 L24 62 M70 50 L66 62 M36 54 L33 64 M78 52 L75.4 60" />
      <path className="storm-bolt-glow" d="M50 46 L42 62 H52 L46 76 L64 56 H54 L60 46 Z" />
      <path className="storm-bolt" d="M50 46 L42 62 H52 L46 76 L64 56 H54 L60 46 Z" />
      <path className="storm-cloud" fill={url(id("cloud"))} d={stormCloud} />
      <path className="storm-cloud-edge" d="M14 27 C12 19 22 13.6 29.4 18.6 M33 13 C38 6 53 5.6 58.6 15 M62 14.6 C70 11 80 15.4 81 24" />
    </svg>
  );
}

/** A reading lamp on the desk, its shade turned down onto the plans: the key light of the room. */
export function DeskLampSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("desklamp-sprite", className)} {...rest} viewBox="0 0 100 120" aria-hidden="true">
      <defs>
        <linearGradient id={id("metal")} x1="0" y1="0" x2="1" y2="1">
          <stop className="desklamp-hi" />
          <stop className="desklamp-mid" offset="0.5" />
          <stop className="desklamp-lo" offset="1" />
        </linearGradient>
        <radialGradient id={id("bulb")} cx="0.5" cy="0.5" r="0.5">
          <stop className="desklamp-bulb-core" />
          <stop className="desklamp-bulb-edge" offset="1" />
        </radialGradient>
      </defs>
      <Contact id={id("contact")} cx={66} cy={115} rx={28} ry={4.6} />
      <ellipse className="desklamp-base" fill={url(id("metal"))} cx="66" cy="111" rx="20" ry="5.4" />
      <path className="desklamp-arm" d="M66 108 L80 70 L46 34" />
      <path className="desklamp-arm-light" d="M64.6 106 L78 70.6 M78.6 68.4 L46.8 35.8" />
      <circle className="desklamp-joint" cx="80" cy="70" r="3.2" />
      <circle className="desklamp-joint" cx="46" cy="34" r="3" />
      {/* The shade, tipped toward the desk, and the glowing mouth of it. */}
      <path className="desklamp-shade" fill={url(id("metal"))} d="M50 26 C44 18 30 14 20 22 L8 46 C18 54 34 54 42 44 Z" />
      <ellipse className="desklamp-mouth" fill={url(id("bulb"))} cx="25" cy="48" rx="17" ry="6" transform="rotate(-24 25 48)" />
      <path className="desklamp-rim" d="M21 21.4 C30 15.6 42 17.6 48.6 25" />
    </svg>
  );
}

/** The present, a week early: red paper, a gold satin ribbon tied in a bow, lit by the lamp from the right. */
export function GiftSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("gift-sprite", className)} {...rest} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id={id("front")}>
          <stop className="gift-front-lo" />
          <stop className="gift-front-hi" offset="1" />
        </linearGradient>
        <linearGradient id={id("satin")}>
          <stop className="gift-satin-lo" />
          <stop className="gift-satin-hi" offset="0.5" />
          <stop className="gift-satin-lo" offset="1" />
        </linearGradient>
        <radialGradient id={id("loop")} cx="0.4" cy="0.35" r="0.7">
          <stop className="gift-satin-hi" />
          <stop className="gift-satin-lo" offset="1" />
        </radialGradient>
      </defs>
      <Contact id={id("contact")} cx={50} cy={92} rx={48} ry={6.4} />
      <path className="gift-side" d="M70 40 L88 30 V82 L70 92 Z" />
      <path className="gift-front" fill={url(id("front"))} d="M10 40 H70 V92 H10 Z" />
      <path className="gift-top" d="M10 40 L28 30 H88 L70 40 Z" />
      <path className="gift-ribbon" fill={url(id("satin"))} d="M36 40 H44 V92 H36 Z" />
      <path className="gift-ribbon is-side" d="M70 64 L88 54 V60 L70 70 Z" />
      <path className="gift-ribbon is-top" d="M36 40 L54 30 H62 L44 40 Z M19 35 L22.6 33 H82 L78.4 35 Z" />
      <path className="gift-tail" d="M49 35 C44 42 40 48 36 54 L40 55 C44 49 47 43 51 37 Z M51 35 C57 41 61 47 66 51 L62 54 C58 49 54 43 50 37 Z" />
      <path className="gift-loop" fill={url(id("loop"))} d="M50 35 C40 22 26 22 28 31 C30 38 42 37 50 35 Z" />
      <path className="gift-loop" fill={url(id("loop"))} d="M50 35 C60 21 76 22 73 31 C70 38 58 37 50 35 Z" />
      <ellipse className="gift-knot" cx="50" cy="35" rx="4.4" ry="3.4" />
      <path className="gift-shine" d="M67.6 43 V88 M31 25.4 C34 24.4 38 25 41 27.4" />
    </svg>
  );
}

/**
 * A red lantern of the kind hung for Tết Trung thu: silk on bamboo ribs, lit from inside so it glows brightest at its
 * heart, gold caps and a tassel. The paper ones under the noren at Phùng Khoang are the same shape (`.is-paper`).
 */
export function RedLanternSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("redlantern-sprite", className)} {...rest} viewBox="0 0 54 104" aria-hidden="true">
      <defs>
        <radialGradient id={id("silk")} cx="0.44" cy="0.46" r="0.6">
          <stop className="redlantern-core" />
          <stop className="redlantern-silk" offset="0.48" />
          <stop className="redlantern-edge" offset="1" />
        </radialGradient>
        <linearGradient id={id("cap")}>
          <stop className="redlantern-cap-lo" />
          <stop className="redlantern-cap-hi" offset="0.4" />
          <stop className="redlantern-cap-lo" offset="1" />
        </linearGradient>
        <radialGradient id={id("flame")}>
          <stop className="redlantern-flame-core" />
          <stop className="redlantern-flame-edge" offset="1" />
        </radialGradient>
      </defs>
      <path className="redlantern-cord" d="M27 0 V12" />
      <ellipse className="redlantern-body" fill={url(id("silk"))} cx="27" cy="44" rx="25" ry="27" />
      {/* The candle's light inside, which breathes. */}
      <ellipse className="redlantern-flame" fill={url(id("flame"))} cx="26" cy="46" rx="15" ry="17" />
      <path className="redlantern-ribs" d="M27 17 V71 M15 20 C6 34 6 54 15 68 M39 20 C48 34 48 54 39 68 M21 18 C16 34 16 54 21 70 M33 18 C38 34 38 54 33 70" />
      <path className="redlantern-hoops" d="M7 28 C17 31.4 37 31.4 47 28 M3.4 37 C15 40.6 39 40.6 50.6 37 M2.2 46 C14 49.6 40 49.6 51.8 46 M3.4 55 C15 58.4 39 58.4 50.6 55 M7 64 C17 67 37 67 47 64" />
      <path className="redlantern-sheen" d="M10 34 C8 42 9 52 13 59" />
      <rect className="redlantern-cap" fill={url(id("cap"))} x="16" y="11" width="22" height="7" rx="2" />
      <rect className="redlantern-cap" fill={url(id("cap"))} x="16" y="70" width="22" height="7" rx="2" />
      <path className="redlantern-tassel" d="M27 77 V100 M23 82 V98 M31 82 V98 M25 80 V99 M29 80 V99" />
      <rect className="redlantern-knot" x="23.6" y="77" width="6.8" height="4" rx="1.6" />
    </svg>
  );
}

/** Đèn ông sao, the five-pointed star lantern carried at Trung thu: red cellophane on a bamboo frame, a candle glowing at its heart. */
export function StarLanternSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("starlantern-sprite", className)} {...rest} viewBox="0 0 100 120" aria-hidden="true">
      <defs>
        <radialGradient id={id("film")} cx="0.5" cy="0.56" r="0.56">
          <stop className="starlantern-core" />
          <stop className="starlantern-red" offset="0.42" />
          <stop className="starlantern-deep" offset="1" />
        </radialGradient>
        <linearGradient id={id("stick")}>
          <stop className="starlantern-stick-hi" />
          <stop className="starlantern-stick-lo" offset="1" />
        </linearGradient>
      </defs>
      <path className="starlantern-stick" stroke={url(id("stick"))} d="M50 56 L88 118" />
      <path className="starlantern-star" fill={url(id("film"))} d="M50 4 L61 37 L96 37 L68 57 L79 90 L50 70 L21 90 L32 57 L4 37 L39 37 Z" />
      <path className="starlantern-frame" d="M50 4 L50 70 M4 37 L68 57 M96 37 L32 57 M21 90 L61 37 M79 90 L39 37" />
      <path className="starlantern-edge" d="M50 4 L61 37 L96 37 M4 37 L39 37 L50 4" />
      <path className="starlantern-tassel" d="M21 90 L18 106 M19.6 90 L15 104 M79 90 L82 106 M80.4 90 L85 104 M4 37 L-4 44 M96 37 L104 44 M50 70 L50 84" />
    </svg>
  );
}

/** One of the little red plastic stools of every street stall in Hà Nội. */
export function StoolSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("stool-sprite", className)} {...rest} viewBox="0 0 60 60" aria-hidden="true">
      <defs>
        <linearGradient id={id("plastic")}>
          <stop className="stool-lo" />
          <stop className="stool-hi" offset="0.38" />
          <stop className="stool-mid" offset="0.7" />
          <stop className="stool-lo" offset="1" />
        </linearGradient>
      </defs>
      <Contact id={id("contact")} cx={30} cy={56} rx={28} ry={4} />
      <path className="stool-body" fill={url(id("plastic"))} d="M8 16 H52 L56 56 H44 L41 34 H19 L16 56 H4 Z" />
      <ellipse className="stool-seat" cx="30" cy="14" rx="23" ry="6" />
      <ellipse className="stool-grip" cx="30" cy="13.4" rx="6" ry="1.6" />
      <path className="stool-rim" d="M8.4 16.6 C16 20.4 44 20.4 51.6 16.6" />
    </svg>
  );
}

/** Tacos from ngõ Ao Sen: three folded shells seen from the side, the filling heaped on top, on a plate. */
export function TacosSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("tacos-sprite", className)} {...rest} viewBox="0 0 130 64" aria-hidden="true">
      <defs>
        <linearGradient id={id("shell")} x2="0" y2="1">
          <stop className="tacos-shell-hi" />
          <stop className="tacos-shell-lo" offset="1" />
        </linearGradient>
        <linearGradient id={id("plate")} x2="0" y2="1">
          <stop className="tacos-plate-hi" />
          <stop className="tacos-plate-lo" offset="1" />
        </linearGradient>
      </defs>
      <Contact id={id("contact")} cx={65} cy={58} rx={66} ry={8} />
      <ellipse className="tacos-plate" fill={url(id("plate"))} cx="65" cy="52" rx="62" ry="11" />
      <ellipse className="tacos-plate-rim" cx="65" cy="51" rx="56" ry="8.4" />
      {[6, 45, 84].map((x, index) => (
        <g key={x} transform={`translate(${x} ${index === 1 ? 6 : 12}) rotate(${(index - 1) * 6} 20 20)`}>
          <path className="tacos-filling" d="M3 22 C6 12 14 8 20 8 C26 8 34 12 37 22 Z" />
          <path className="tacos-lettuce" d="M4 20 c3 -5 6 -3 8 -6 c2 3 5 -2 8 1 c3 -3 6 1 8 -1 c2 3 5 2 8 6" />
          <path className="tacos-tomato" d="M11 15 h3 M19 12 h3 M27 15 h3" />
          <path className="tacos-cream" d="M8 18 q6 -3 12 0 t12 0" />
          <path className="tacos-shell" fill={url(id("shell"))} d="M0 22 H40 C40 34 31 42 20 42 C9 42 0 34 0 22 Z" />
          <path className="tacos-shell-edge" d="M3 26 C6 35 13 39 20 39 C27 39 34 35 37 26" />
          <path className="tacos-shell-light" d="M2 23.4 C4 30 8 35 13 37.4" />
        </g>
      ))}
    </svg>
  );
}

/** A claw machine at Playik, where they played after the tacos: a lit marquee, a glass case of plush, a glowing button. */
export function ClawMachineSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("claw-sprite", className)} {...rest} viewBox="0 0 80 132" aria-hidden="true">
      <defs>
        <linearGradient id={id("cabinet")}>
          <stop className="claw-cabinet-lo" />
          <stop className="claw-cabinet-hi" offset="0.3" />
          <stop className="claw-cabinet-mid" offset="0.7" />
          <stop className="claw-cabinet-lo" offset="1" />
        </linearGradient>
        <linearGradient id={id("glass")} x2="0" y2="1">
          <stop className="claw-glass-hi" />
          <stop className="claw-glass-lo" offset="1" />
        </linearGradient>
        <radialGradient id={id("plush")} cx="0.36" cy="0.3" r="0.8">
          <stop className="claw-plush-light" />
          <stop className="claw-plush-shade" offset="1" />
        </radialGradient>
        <Gloss id={id("gloss")} x2={1} y2={1} />
      </defs>
      <Contact id={id("contact")} cx={40} cy={130} rx={44} ry={5} />
      <rect className="claw-cabinet" fill={url(id("cabinet"))} x="4" y="2" width="72" height="128" rx="6" />
      <rect className="claw-marquee" x="8" y="6" width="64" height="14" rx="3" />
      <text className="claw-name" x="40" y="16.4" textAnchor="middle">PLAYIK</text>
      <rect className="claw-glass" fill={url(id("glass"))} x="10" y="24" width="60" height="56" rx="2" />
      {[
        [24, 72, 7, "is-pink"],
        [38, 74, 6, "is-gold is-prize"],
        [54, 72, 7, "is-blue"],
        [46, 66, 5, "is-pink"],
      ].map(([cx, cy, r, tone]) => (
        <g className={`claw-plush ${tone}`} key={`${cx}-${cy}`}>
          <circle className="claw-plush-body" cx={cx} cy={cy} r={r} />
          <circle className="claw-plush-sheen" fill={url(id("plush"))} cx={cx} cy={cy} r={r} />
        </g>
      ))}
      {/* The claw on its cable, in parts so a game can be played with it (SceneMoment): the rig runs along the top, the
          cable pays out, the head comes down, its prongs close on the gold one and carry it to the chute. */}
      <g className="claw-rig">
        <path className="claw-arm claw-cable" d="M40 24 V44" />
        <g className="claw-head">
          <g className="claw-plush is-gold claw-catch">
            <circle className="claw-plush-body" cx="40" cy="57" r="6" />
            <circle className="claw-plush-sheen" fill={url(id("plush"))} cx="40" cy="57" r="6" />
          </g>
          <path className="claw-arm claw-prongs" d="M34 50 L40 44 L46 50 M34 50 L32 56 M46 50 L48 56" />
        </g>
      </g>
      <path className="claw-reflection" fill={url(id("gloss"))} d="M13 26 H30 L18 78 H13 Z" />
      <rect className="claw-panel" x="10" y="84" width="60" height="18" rx="2" />
      <circle className="claw-button-glow" cx="52" cy="93" r="7" />
      <circle className="claw-button" cx="52" cy="93" r="4.4" />
      <path className="claw-stick" d="M26 93 V86" />
      <circle className="claw-knob" cx="26" cy="85" r="3" />
      <rect className="claw-chute" x="14" y="108" width="20" height="14" rx="2" />
      <path className="claw-edge" d="M6.4 10 V124 M73.6 10 V124" />
    </svg>
  );
}

/** "Mình ghé vào cái hotel như ma =)))": a friendly little ghost, faintly see-through and glowing. */
export function GhostSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("ghost-sprite", className)} {...rest} viewBox="0 0 54 64" aria-hidden="true">
      <defs>
        <radialGradient id={id("sheet")} cx="0.4" cy="0.3" r="0.8">
          <stop className="ghost-hi" />
          <stop className="ghost-lo" offset="1" />
        </radialGradient>
      </defs>
      <path className="ghost-body" fill={url(id("sheet"))} d="M6 30 C6 14 16 4 27 4 C38 4 48 14 48 30 V58 L41 52 L34 60 L27 52 L20 60 L13 52 L6 58 Z" />
      <ellipse className="ghost-eye" cx="20" cy="28" rx="3" ry="4" />
      <ellipse className="ghost-eye" cx="34" cy="28" rx="3" ry="4" />
      <ellipse className="ghost-blush" cx="15" cy="36" rx="3.6" ry="2" />
      <ellipse className="ghost-blush" cx="39" cy="36" rx="3.6" ry="2" />
      <path className="ghost-mouth" d="M24 38 Q27 41 30 38" />
    </svg>
  );
}

/**
 * Saku's curry, as in the photo: a speckled stoneware bowl, curry with carrot and potato on one side, rice on the other,
 * and a sliced katsu laid over the rice under a stripe of sauce, everything glossy under the lamp.
 */
export function CurryKatsuSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("curry-sprite", className)} {...rest} viewBox="0 0 160 96" aria-hidden="true">
      <defs>
        <linearGradient id={id("bowl")} x2="0" y2="1">
          <stop className="curry-bowl-hi" />
          <stop className="curry-bowl-lo" offset="1" />
        </linearGradient>
        <radialGradient id={id("sauce")} cx="0.4" cy="0.36" r="0.75">
          <stop className="curry-sauce-hi" />
          <stop className="curry-sauce-lo" offset="1" />
        </radialGradient>
        <radialGradient id={id("rice")} cx="0.5" cy="0.4" r="0.7">
          <stop className="curry-rice-hi" />
          <stop className="curry-rice-lo" offset="1" />
        </radialGradient>
        <linearGradient id={id("crumb")} x2="0" y2="1">
          <stop className="katsu-hi" />
          <stop className="katsu-lo" offset="1" />
        </linearGradient>
      </defs>
      <Contact id={id("contact")} cx={80} cy={90} rx={74} ry={9} />
      <path className="curry-bowl" fill={url(id("bowl"))} d="M4 38 C6 66 40 90 80 90 C120 90 154 66 156 38 A76 28 0 0 1 4 38 Z" />
      <path className="curry-speckle" d="M20 56 h0.1 M34 68 h0.1 M50 76 h0.1 M70 82 h0.1 M96 81 h0.1 M118 74 h0.1 M136 62 h0.1 M28 50 h0.1 M60 70 h0.1 M108 68 h0.1 M146 50 h0.1 M84 74 h0.1" />
      <ellipse className="curry-foot" cx="80" cy="90" rx="30" ry="3.4" />
      <ellipse className="curry-rim" cx="80" cy="38" rx="76" ry="28" />
      <ellipse className="curry-well" cx="80" cy="40" rx="70" ry="24" />
      <path className="curry-sauce" fill={url(id("sauce"))} d="M16 40 C16 28 42 20 76 19 C72 30 74 48 68 61 C40 60 16 52 16 40 Z" />
      <path className="curry-gloss" d="M24 35 C30 29 40 26 52 25 M30 46 C36 48 44 49 52 48" />
      <rect className="curry-carrot" x="32" y="30" width="10" height="9" rx="2.4" transform="rotate(-14 37 34)" />
      <path className="curry-potato" d="M48 42 C52 38 60 38 62 43 C63 48 56 51 51 49 C48 48 47 45 48 42 Z" />
      <rect className="curry-carrot" x="26" y="44" width="8" height="7" rx="2" transform="rotate(10 30 47)" />
      <path className="curry-veg-light" d="M33.6 31.4 l6 -1.4 M49.6 41 C52 39.4 56 39.4 58.4 40.6" />
      <path className="curry-rice" fill={url(id("rice"))} d="M76 19 C104 18 140 26 146 40 C146 52 124 62 96 63 C82 63 72 62 68 61 C74 48 72 30 76 19 Z" />
      <path className="curry-grain" d="M78 54 l3 1 M88 58 l3 -1 M136 46 l2 2 M140 38 l2 1 M126 54 l2.4 0.6 M80 46 l2 1.4 M142 46 l1.4 2" />
      {[0, 1, 2, 3, 4].map((index) => {
        // Five slices of the cutlet, side by side down the rice, each showing a sliver of its pale cut face.
        const x = 88 + index * 10.5;
        const y = 21 + index * 2.4;
        return (
          <g className="katsu-slice" key={index}>
            <path fill={url(id("crumb"))} d={`M${x} ${y} L${x + 9.5} ${y + 1.8} L${x + 4.5} ${y + 23.8} L${x - 5} ${y + 22} Z`} />
            <path className="katsu-face" d={`M${x + 8.6} ${y + 3} L${x + 4} ${y + 22.6}`} />
          </g>
        );
      })}
      <path className="katsu-crumb" d="M87 28 L139 40 M85 36 L137 48 M86 44 L134 55" />
      <path className="katsu-glaze" d="M85 31 C90 26 93 36 98 31 S106 37 110 33 S118 40 122 36 S131 43 135 39" />
      <path className="katsu-glaze-light" d="M88 29.4 C90 28 91.6 30 93 31 M108 33 C110 32 111.6 33.6 113 35" />
      <path className="curry-rim-light" d="M18 22 C40 12 72 9.6 102 11.4" />
    </svg>
  );
}

/** A lumpy round (fried chicken, a heap of cabbage): points that swell and dip, smoothed through their midpoints. */
const lump = (cx: number, cy: number, r: number, turn: number, count = 8, dip = 0.84) => {
  const points = Array.from({ length: count }, (_, index) => {
    const angle = turn + (index / count) * Math.PI * 2;
    const reach = r * (index % 2 ? dip : 1.04);
    return [cx + Math.cos(angle) * reach, cy + Math.sin(angle) * reach * 0.8];
  });
  const mid = (a: number[], b: number[]) => `${((a[0] + b[0]) / 2).toFixed(1)} ${((a[1] + b[1]) / 2).toFixed(1)}`;
  const start = mid(points[points.length - 1], points[0]);
  const curves = points.map((point, index) => `Q${point[0].toFixed(1)} ${point[1].toFixed(1)} ${mid(point, points[(index + 1) % points.length])}`);
  return `M${start} ${curves.join(" ")} Z`;
};

// Piled from the back of the plate to the front, so the nearer pieces overlap the farther ones.
const karaage: Array<[number, number, number, number]> = [
  [84, 27, 11, 1.1],
  [66, 32, 12, 0.3],
  [96, 40, 10.5, 2],
  [80, 46, 13, 0.7],
  [62, 52, 11, 1.6],
];

/** The karaage from the photo: glazed pieces of fried chicken on a black slate plate, beside a heap of shredded cabbage. */
export function KaraageSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("karaage-sprite", className)} {...rest} viewBox="0 0 120 84" aria-hidden="true">
      <defs>
        <linearGradient id={id("slate")} x1="0" y1="0" x2="1" y2="1">
          <stop className="karaage-slate-hi" />
          <stop className="karaage-slate-lo" offset="1" />
        </linearGradient>
        <radialGradient id={id("chicken")} cx="0.38" cy="0.32" r="0.8">
          <stop className="karaage-hi" />
          <stop className="karaage-mid" offset="0.5" />
          <stop className="karaage-lo" offset="1" />
        </radialGradient>
        <radialGradient id={id("cabbage")} cx="0.4" cy="0.36" r="0.7">
          <stop className="karaage-cabbage-hi" />
          <stop className="karaage-cabbage-lo" offset="1" />
        </radialGradient>
      </defs>
      <Contact id={id("contact")} cx={62} cy={70} rx={58} ry={11} />
      <path className="karaage-plate-side" d="M14 28 L98 18 L112 60 L22 74 Z" />
      <path className="karaage-plate" fill={url(id("slate"))} d="M14 24 L98 14 L112 56 L22 70 Z" />
      <path className="karaage-plate-well" d="M21 28 L94 19.5 L105.5 52.5 L27 64.5 Z" />
      <path className="karaage-plate-edge" d="M14.6 24.4 L97.6 14.6" />
      <path className="karaage-cabbage-heap" fill={url(id("cabbage"))} d={lump(38, 44, 15, 0.2, 12, 0.8)} />
      <path className="karaage-cabbage" d="M26 44 C30 40 34 42 38 38 M28 50 C33 46 37 49 42 45 M31 38 C35 34 40 37 44 33 M34 54 C38 50 43 52 47 48 M40 42 C44 39 47 42 51 38 M27 47 C31 45 35 47 39 44 M36 47 C40 44 44 46 48 43 M33 42 C36 39 39 41 42 38" />
      <path className="karaage-cabbage is-green" d="M29 41 C33 38 36 40 40 36 M38 51 C41 48 45 50 49 46 M43 37 C46 35 48 37 51 35" />
      <path className="karaage-cabbage is-red" d="M31 46 C34 43 37 45 40 42 M41 49 C44 47 46 48 48 46" />
      {karaage.map(([cx, cy, r, turn]) => (
        <g className="karaage-piece" key={`${cx}-${cy}`}>
          <path className="karaage-meat" fill={url(id("chicken"))} d={lump(cx, cy, r, turn)} />
          <path className="karaage-glaze" d={lump(cx + r * 0.05, cy - r * 0.12, r * 0.78, turn + 0.4)} />
          <ellipse className="karaage-shine" cx={cx - r * 0.3} cy={cy - r * 0.34} rx={r * 0.32} ry={r * 0.16} />
          <circle className="karaage-glint" cx={cx - r * 0.42} cy={cy - r * 0.38} r={r * 0.08} />
        </g>
      ))}
      <path className="karaage-mayo" d="M70 40 C73 36 76 42 79 38 S85 43 88 39" />
      <path className="karaage-sesame" d="M74 30 l1 0.4 M90 36 l1 -0.4 M68 48 l1 0.5 M86 50 l0.8 0.6 M60 36 l1 0.2" />
    </svg>
  );
}

/**
 * Cream poured over the front rim of a round tier (centre cx, rim at y, half-width rx, the rim's tilt ry): it follows the
 * curve of the rim and runs over in drips of two lengths, each rounded at its tip.
 */
function creamDrips(cx: number, y: number, rx: number, ry: number, count: number) {
  const rim = (x: number) => y + ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
  const at = (x: number, height: number) => `${x.toFixed(1)} ${height.toFixed(1)}`;
  const step = (rx * 2) / count;
  let d = `M${at(cx - rx, y)} C${at(cx - rx, y + ry * 1.33)} ${at(cx + rx, y + ry * 1.33)} ${at(cx + rx, y)} V${(y + 2).toFixed(1)}`;
  for (let index = 0; index < count; index += 1) {
    const from = cx + rx - index * step;
    const to = from - step;
    const middle = from - step / 2;
    const tip = rim(middle) + (index % 2 ? 4.6 : 8.4);
    d += ` C${at(from - step * 0.08, tip - 1)} ${at(middle + step * 0.34, tip)} ${at(middle, tip)}`;
    d += ` C${at(middle - step * 0.34, tip)} ${at(to + step * 0.08, tip - 1)} ${at(to, rim(to) + 2)}`;
  }
  return `${d} Z`;
}
const lowerTier = "M14 74 C14 80.7 126 80.7 126 74 V114 C126 120.7 14 120.7 14 114 Z";
const upperTier = "M34 44 C34 48.5 106 48.5 106 44 V74 C106 78.5 34 78.5 34 74 Z";
const lowerCream = creamDrips(70, 74, 56, 5, 9);
const upperCream = creamDrips(70, 44, 36, 3.4, 6);
const berries: Point[] = [[40, 44], [61, 45.3], [79, 45.3], [100, 44], [22, 74.4], [118, 74.4]];

/**
 * The birthday cake on its porcelain stand: two round tiers seen a little from above, cream running over their rims and
 * berries along them, lit warm from above by its own candles (their flames are separate, so they can flicker).
 */
export function BirthdayCakeSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("cake-sprite", className)} {...rest} viewBox="0 0 140 130" aria-hidden="true">
      <defs>
        <linearGradient id={id("sponge")} x2="0" y2="1">
          <stop className="cake-tier-hi" />
          <stop className="cake-tier-lo" offset="1" />
        </linearGradient>
        {/* Darker at both sides, so each tier reads as round. */}
        <linearGradient id={id("round")}>
          <stop className="cake-round-edge" />
          <stop className="cake-round-clear" offset="0.32" />
          <stop className="cake-round-clear" offset="0.68" />
          <stop className="cake-round-edge" offset="1" />
        </linearGradient>
        <linearGradient id={id("top")} x2="0" y2="1">
          <stop className="cake-top-hi" />
          <stop className="cake-top-lo" offset="1" />
        </linearGradient>
        <linearGradient id={id("stand")} x2="0" y2="1">
          <stop className="cake-stand-hi" />
          <stop className="cake-stand-lo" offset="1" />
        </linearGradient>
        <radialGradient id={id("berry")} cx="0.36" cy="0.32" r="0.75">
          <stop className="cake-berry-hi" />
          <stop className="cake-berry-lo" offset="1" />
        </radialGradient>
        <radialGradient id={id("glow")}>
          <stop className="cake-glow-core" />
          <stop className="cake-glow-edge" offset="1" />
        </radialGradient>
      </defs>
      <Contact id={id("contact")} cx={70} cy={126} rx={66} ry={6} />
      <ellipse className="cake-stand" fill={url(id("stand"))} cx="70" cy="122" rx="62" ry="7" />
      <path className="cake-stand-rim" d="M10 121 C26 116.6 114 116.6 130 121" />
      <path className="cake-tier" fill={url(id("sponge"))} d={lowerTier} />
      <path className="cake-round" fill={url(id("round"))} d={lowerTier} />
      <ellipse className="cake-top" fill={url(id("top"))} cx="70" cy="74" rx="56" ry="5" />
      <path className="cake-cream" d={lowerCream} />
      <path className="cake-tier is-top" fill={url(id("sponge"))} d={upperTier} />
      <path className="cake-round" fill={url(id("round"))} d={upperTier} />
      <ellipse className="cake-top" fill={url(id("top"))} cx="70" cy="44" rx="36" ry="3.4" />
      <path className="cake-cream" d={upperCream} />
      <ellipse className="cake-glow" fill={url(id("glow"))} cx="70" cy="44" rx="40" ry="9" />
      {berries.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle className="cake-berry" fill={url(id("berry"))} cx={x} cy={y} r="4.2" />
          <path className="cake-berry-glint" d={`M${x - 1.6} ${y - 1.6} h0.1`} />
        </g>
      ))}
      <path className="cake-script" d="M42 64 c4 -6 8 -6 8 0 c0 4 4 4 8 -2 c2 4 6 4 10 0 c2 4 8 4 12 -4 c2 6 8 6 12 0" />
      {[52, 70, 88].map((x) => (
        <g key={x}>
          <rect className="cake-candle" x={x - 2.5} y="22" width="5" height="22" rx="1.5" />
          <path className="cake-wick" d={`M${x} 22 V18.6`} />
        </g>
      ))}
    </svg>
  );
}

/** A red lily seen face on: six tepals deepening to crimson at their tips, dark speckles toward the throat, six stamens with rust anthers, the pistil. */
export function LilySprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  const petal = "M50 50 C42 38 41 20 50 3 C59 20 58 38 50 50 Z";
  const inner = "M50 50 C45 40 45 26 50 12 C55 26 55 40 50 50 Z";
  return (
    <svg className={svg("lily-sprite", className)} {...rest} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id={id("front")} x2="0" y2="1">
          <stop className="lily-tip" />
          <stop className="lily-mid" offset="0.55" />
          <stop className="lily-base" offset="1" />
        </linearGradient>
        <linearGradient id={id("back")} x2="0" y2="1">
          <stop className="lily-back-tip" />
          <stop className="lily-back-base" offset="1" />
        </linearGradient>
      </defs>
      {[30, 90, 150, 210, 270, 330].map((angle) => (
        <path className="lily-tepal is-back" fill={url(id("back"))} key={`b-${angle}`} d={petal} transform={`rotate(${angle} 50 50)`} />
      ))}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <g key={`f-${angle}`} transform={`rotate(${angle} 50 50)`}>
          <path className="lily-tepal" fill={url(id("front"))} d={petal} />
          <path className="lily-throat" d={inner} />
          <path className="lily-rib" d="M50 46 C49 34 49 22 50 10" />
          <circle className="lily-spot" cx="48.4" cy="36" r="0.9" />
          <circle className="lily-spot" cx="51.8" cy="31" r="0.8" />
          <circle className="lily-spot" cx="49" cy="27" r="0.7" />
        </g>
      ))}
      {[15, 75, 135, 195, 255, 315].map((angle) => (
        <g className="lily-stamen" key={`s-${angle}`} transform={`rotate(${angle} 50 50)`}>
          <path d="M50 50 C50 42 52 34 51 27" />
          <ellipse cx="51" cy="26" rx="1.6" ry="3.6" />
        </g>
      ))}
      <path className="lily-pistil" d="M50 50 C52 42 47 36 49 29" />
      <circle className="lily-stigma" cx="49" cy="28.4" r="2" />
    </svg>
  );
}

/** A bud of the same lily, still closed, green at its foot and blushing red toward the tip. */
export function LilyBudSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("lilybud-sprite", className)} {...rest} viewBox="0 0 30 90" aria-hidden="true">
      <defs>
        <linearGradient id={id("bud")} x2="0" y2="1">
          <stop className="lilybud-tip" />
          <stop className="lilybud-mid" offset="0.6" />
          <stop className="lilybud-foot" offset="1" />
        </linearGradient>
      </defs>
      <path className="lilybud-stem" d="M15 88 C15 70 16 58 15 50" />
      <path className="lilybud-body" fill={url(id("bud"))} d="M15 4 C24 18 24 38 15 52 C6 38 6 18 15 4 Z" />
      <path className="lilybud-seam" d="M15 6 C17 20 17 36 15 50 M11 14 C10 26 11 38 14 48" />
    </svg>
  );
}

/** A party popper going off, "Tadaaaa": a gold foil cone, curling streamers, confetti. */
export function PartyPopperSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("popper-sprite", className)} {...rest} viewBox="0 0 80 80" aria-hidden="true">
      <defs>
        <linearGradient id={id("foil")} x1="0" y1="1" x2="1" y2="0">
          <stop className="popper-foil-lo" />
          <stop className="popper-foil-hi" offset="0.45" />
          <stop className="popper-foil-mid" offset="0.7" />
          <stop className="popper-foil-lo" offset="1" />
        </linearGradient>
      </defs>
      <path className="popper-cone" fill={url(id("foil"))} d="M6 74 L22 34 L46 58 Z" />
      <path className="popper-stripe" d="M14 54 L30 62 M18 44 L38 56" />
      <path className="popper-rim" d="M22 34 L46 58" />
      <path className="popper-streamer is-red" d="M34 40 C36 32 32 28 38 22 C42 18 40 14 44 10" />
      <path className="popper-streamer is-gold" d="M40 46 C46 42 50 46 56 40 C60 36 64 38 68 34" />
      <path className="popper-streamer is-pink" d="M30 34 C26 28 32 24 28 18 C26 14 30 12 28 8" />
      <path className="popper-burst" d="M44 52 L66 54" />
      <circle className="popper-dot is-gold" cx="44" cy="14" r="3" />
      <circle className="popper-dot is-pink" cx="66" cy="26" r="2.6" />
      <rect className="popper-dot is-red" x="56" y="8" width="5" height="5" rx="1" transform="rotate(20 58 10)" />
      <rect className="popper-dot is-gold" x="70" y="44" width="5" height="5" rx="1" transform="rotate(-18 72 46)" />
      <circle className="popper-dot is-red" cx="52" cy="24" r="1.8" />
    </svg>
  );
}
