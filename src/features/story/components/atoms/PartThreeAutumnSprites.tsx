import type { SVGProps } from "react";

/* The props of Part III's later chapters (5 and 6: the rain, the sore leg, the cafés, Mid-Autumn and the birthday), drawn
   like the others in PartThreeSprites.tsx: colours live in story-part-three-autumn.css, scroll hints pass straight
   through. */
type SpriteProps = SVGProps<SVGSVGElement>;

const svg = (name: string, className: string) => `${name} ${className}`.trim();

/** The karaoke mic, its head in the pink mesh cover from the photos. */
export function MicSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("mic-sprite", className)} {...rest} viewBox="0 0 40 96" aria-hidden="true">
      <path className="mic-handle" d="M13 34 H27 L24 92 C24 94 16 94 16 92 Z" />
      <rect className="mic-ring" x="11" y="31" width="18" height="6" rx="2" />
      <circle className="mic-cover" cx="20" cy="17" r="16" />
      <path className="mic-mesh" d="M7 11 Q20 5 33 11 M5 17 Q20 11 35 17 M7 23 Q20 17 33 23 M14 3 Q10 17 14 31 M20 1 V33 M26 3 Q30 17 26 31" />
      <path className="mic-button" d="M18 50 H22 V58 H18 Z" />
    </svg>
  );
}

/** The karaoke tablet: the app's green bar and a list of songs. */
export function TabletSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("tablet-sprite", className)} {...rest} viewBox="0 0 132 88" aria-hidden="true">
      <rect className="tablet-case" x="1" y="1" width="130" height="86" rx="8" />
      <rect className="tablet-screen" x="7" y="7" width="118" height="74" rx="3" />
      <rect className="tablet-bar" x="7" y="7" width="118" height="14" rx="3" />
      <rect className="tablet-search" x="14" y="10" width="62" height="8" rx="4" />
      {[26, 40, 54, 68].map((y) => (
        <g key={y}>
          <rect className="tablet-thumb" x="14" y={y} width="16" height="10" rx="1.5" />
          <rect className="tablet-line" x="35" y={y + 1.5} width="58" height="3" rx="1.5" />
          <rect className="tablet-line is-faint" x="35" y={y + 6.5} width="36" height="2.4" rx="1.2" />
        </g>
      ))}
    </svg>
  );
}

/** A raincoat on a hook, sleeves hanging, still dripping from Nguyễn Văn Lộc. */
export function RaincoatSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("raincoat-sprite", className)} {...rest} viewBox="0 0 64 96" aria-hidden="true">
      <path className="raincoat-hook" d="M32 1 V8 C32 12 38 12 38 8" />
      <path className="raincoat-body" d="M32 9 C25 9 21 13 20 18 L11 26 C8 36 6 50 6 60 L14 61 C15 52 16 46 17 41 L14 86 C24 91 40 91 50 86 L47 41 C48 46 49 52 50 61 L58 60 C58 50 56 36 53 26 L44 18 C43 13 39 9 32 9 Z" />
      <path className="raincoat-hood" d="M23 20 C23 11 41 11 41 20 C37 26 27 26 23 20 Z" />
      <path className="raincoat-seam" d="M32 26 V87 M17 41 L20 22 M47 41 L44 22" />
      <path className="raincoat-shine" d="M21 30 C19 46 18 62 18 80 M9 34 C8 42 8 50 8 56" />
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
    </svg>
  );
}

/** "Chụp X-Quang": a film of a foot that, luckily, "không bị gì hết". */
export function XrayFootSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("xray-sprite", className)} {...rest} viewBox="0 0 72 96" aria-hidden="true">
      <rect className="xray-film" x="1" y="1" width="70" height="94" rx="3" />
      <g className="xray-bones">
        <path d="M30 6 L31 30 M40 6 L39 30" />
        <ellipse cx="35" cy="36" rx="8" ry="6" />
        <ellipse cx="29" cy="47" rx="7" ry="5" />
        <ellipse cx="41" cy="47" rx="6" ry="5" />
        <path d="M24 55 L18 76 M30 56 L27 79 M35 56 L35 80 M40 56 L43 79 M45 55 L51 75" />
        <path d="M17 80 L16 87 M26 83 L26 90 M35 84 L35 91 M44 83 L45 90 M52 79 L54 86" />
      </g>
    </svg>
  );
}

/** A bowl of gà tần: dark herbal broth, the chicken, goji berries and a spoon. */
export function HerbSoupSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("herbsoup-sprite", className)} {...rest} viewBox="0 0 120 70" aria-hidden="true">
      <ellipse className="herbsoup-broth" cx="60" cy="24" rx="50" ry="11" />
      <path className="herbsoup-chicken" d="M42 22 C44 15 56 14 60 19 C62 23 56 27 48 27 C44 27 41 25 42 22 Z" />
      <path className="herbsoup-chicken" d="M64 20 C68 14 80 16 80 22 C78 27 68 27 64 24 Z" />
      <circle className="herbsoup-goji" cx="38" cy="27" r="2.4" />
      <circle className="herbsoup-goji" cx="74" cy="27" r="2.2" />
      <circle className="herbsoup-goji" cx="86" cy="22" r="2" />
      <path className="herbsoup-spoon" d="M88 18 L112 4 C116 2 118 6 114 8 L90 22" />
      <path className="herbsoup-bowl" d="M8 24 C8 52 30 66 60 66 C90 66 112 52 112 24 C102 34 18 34 8 24 Z" />
      <path className="herbsoup-rim" d="M8 24 C18 34 102 34 112 24" />
    </svg>
  );
}

/** The sofa at 59A Yên Bình, and the two of them on it, leaning shoulder to shoulder. */
export function CouchCoupleSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("couch-sprite", className)} {...rest} viewBox="0 0 220 120" aria-hidden="true">
      <path className="couch-back" d="M24 30 C24 20 32 16 44 16 H176 C188 16 196 20 196 30 V74 H24 Z" />
      <g className="couch-people">
        <circle cx="96" cy="40" r="15" />
        <circle cx="122" cy="44" r="14" />
        <path d="M70 92 C70 66 82 56 98 56 C110 56 112 62 112 70 L112 92 Z" />
        <path d="M106 92 C106 70 112 60 124 60 C140 60 150 68 150 92 Z" />
        <path className="couch-hair" d="M108 34 C112 24 132 24 136 38 C138 48 136 60 132 66 C130 54 126 44 108 34 Z" />
      </g>
      <path className="couch-seat" d="M18 72 H202 V96 H18 Z" />
      <path className="couch-arm" d="M4 58 C4 50 10 46 18 46 C26 46 30 50 30 58 V104 H4 Z" />
      <path className="couch-arm" d="M190 58 C190 50 194 46 202 46 C210 46 216 50 216 58 V104 H190 Z" />
      <path className="couch-cushion" d="M30 74 H108 M112 74 H190" />
      <path className="couch-legs" d="M14 104 V114 M206 104 V114" />
    </svg>
  );
}

/** A phone lying on its face: "ko cả dùng điện thoại cho hôm í luôn". */
export function PhoneDownSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("phone-down-sprite", className)} {...rest} viewBox="0 0 70 40" aria-hidden="true">
      <path className="phone-down-body" d="M6 10 L54 4 C60 3 64 6 64 12 L66 26 C66 31 63 34 58 35 L12 38 C7 38 4 35 4 30 L3 16 C3 13 4 11 6 10 Z" />
      <circle className="phone-down-camera" cx="54" cy="12" r="3.4" />
      <circle className="phone-down-camera" cx="54" cy="21" r="3.4" />
    </svg>
  );
}

/** "Ui nhớ gòi, là ăn ốc": a dish of snails. */
export function SnailDishSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("snail-sprite", className)} {...rest} viewBox="0 0 120 52" aria-hidden="true">
      <ellipse className="snail-dish" cx="60" cy="34" rx="56" ry="16" />
      <ellipse className="snail-dish-well" cx="60" cy="32" rx="46" ry="11" />
      {[
        [30, 28, 1],
        [48, 24, 0.9],
        [64, 30, 1.05],
        [82, 25, 0.95],
        [94, 32, 0.85],
      ].map(([x, y, s]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
          <path className="snail-shell" d="M-9 4 C-11 -6 -2 -11 5 -8 C11 -5 11 3 5 6 C0 8 -4 4 -2 0 C0 -3 4 -2 4 1" />
          <path className="snail-shell-tip" d="M-9 4 L-15 9" />
        </g>
      ))}
      <path className="snail-herb" d="M22 38 C30 34 34 40 40 36 M78 40 C86 36 92 41 98 37" />
    </svg>
  );
}

/** A string of red flags with yellow stars, strung over the café by the lake. */
export function StarFlagsSprite({ className = "", ...rest }: SpriteProps) {
  const flags = [8, 52, 96, 140, 184, 228, 272, 316, 360];
  return (
    <svg className={svg("starflags-sprite", className)} {...rest} viewBox="0 0 400 64" preserveAspectRatio="none" aria-hidden="true">
      <path className="starflags-string" d="M0 8 Q200 30 400 8" />
      {flags.map((x, index) => {
        const y = 8 + 22 * (1 - ((x + 14 - 200) / 200) ** 2) * 0.98;
        return (
          <g key={x} transform={`translate(${x} ${y.toFixed(1)}) rotate(${index % 2 ? 3 : -3})`}>
            <rect className="starflags-flag" x="0" y="0" width="28" height="22" />
            <path className="starflags-star" d="M14 4.5 L15.8 9.6 L21.2 9.7 L16.9 13 L18.5 18.2 L14 15.1 L9.5 18.2 L11.1 13 L6.8 9.7 L12.2 9.6 Z" />
          </g>
        );
      })}
    </svg>
  );
}

/**
 * A tall glass: avocado smoothie by the lake, the cream one with a sprig of rosemary at Tiny cf (`.is-cream`), or the
 * pale juice that came with dinner at Phùng Khoang (`.is-juice`).
 */
export function SmoothieSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("smoothie-sprite", className)} {...rest} viewBox="0 0 44 96" aria-hidden="true">
      <path className="smoothie-straw" d="M27 30 L35 2" />
      <path className="smoothie-sprig" d="M25 30 C26 22 30 16 34 12 M27 24 L23 20 M29 20 L33 21 M31 16 L28 13" />
      <path className="smoothie-drink" d="M7 28 H37 L33 80 C32 84 12 84 11 80 Z" />
      <path className="smoothie-foam" d="M7 28 H37 L36.4 35 C30 38 14 38 7.6 35 Z" />
      <path className="smoothie-glass" d="M5 26 H39 L34 82 C33 88 11 88 10 82 Z" />
      <path className="smoothie-stem" d="M17 88 H27 V92 H17 Z" />
    </svg>
  );
}

/** "Cốc gì đó cụa anh": a short glass of yoghurt with something golden on top. */
export function YogurtCupSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("yogurt-sprite", className)} {...rest} viewBox="0 0 44 60" aria-hidden="true">
      <path className="yogurt-straw" d="M26 18 L33 2" />
      <path className="yogurt-drink" d="M7 16 H37 L34 54 C33 57 11 57 10 54 Z" />
      <path className="yogurt-top" d="M7 16 H37 L36 24 C28 26 16 26 8 24 Z" />
      <path className="yogurt-glass" d="M5 14 H39 L35 56 C34 59 10 59 9 56 Z" />
    </svg>
  );
}

/** A dish of sunflower seeds: the cafés of these chapters all had them. */
export function SeedsDishSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("seeds-sprite", className)} {...rest} viewBox="0 0 80 36" aria-hidden="true">
      <path className="seeds-dish" d="M4 12 H76 L68 32 H12 Z" />
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
      ].map(([x, y, a]) => (
        <ellipse className="seeds-seed" key={`${x}-${y}`} cx={x} cy={y} rx="5" ry="2.1" transform={`rotate(${a} ${x} ${y})`} />
      ))}
    </svg>
  );
}

/** The notebook from Tiny cf, open: two pages of squared paper, lines of handwriting, and a lipstick kiss. */
export function KissNotebookSprite({ className = "", ...rest }: SpriteProps) {
  const lines = [22, 31, 40, 49, 58, 67];
  return (
    <svg className={svg("notebook-sprite", className)} {...rest} viewBox="0 0 170 116" aria-hidden="true">
      <path className="notebook-cover" d="M4 10 H166 V112 H4 Z" />
      <path className="notebook-page" d="M8 6 H84 V108 H8 Z" />
      <path className="notebook-page" d="M86 6 H162 V108 H86 Z" />
      <path className="notebook-grid" d="M8 16 H84 M8 26 H84 M8 36 H84 M8 46 H84 M8 56 H84 M8 66 H84 M8 76 H84 M8 86 H84 M8 96 H84 M18 6 V108 M30 6 V108 M42 6 V108 M54 6 V108 M66 6 V108 M78 6 V108 M86 16 H162 M86 26 H162 M86 36 H162 M86 46 H162 M86 56 H162 M86 66 H162 M86 76 H162 M86 86 H162 M86 96 H162 M96 6 V108 M108 6 V108 M120 6 V108 M132 6 V108 M144 6 V108 M156 6 V108" />
      <path className="notebook-margin" d="M14 6 V108 M92 6 V108" />
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
      <path className="notebook-kiss" d="M104 70 C112 62 120 64 126 67 C132 64 140 62 148 70 C140 82 112 82 104 70 Z" />
      <path className="notebook-kiss-line" d="M106 70 C118 72 136 72 146 70" />
      <path className="notebook-ink is-signature" d="M128 92 c4 -8 8 -8 6 0 c-2 6 6 2 10 -4 c2 6 6 6 10 0" />
    </svg>
  );
}

export function PenSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("pen-sprite", className)} {...rest} viewBox="0 0 90 14" aria-hidden="true">
      <path className="pen-body" d="M10 3 H78 C82 3 84 5 84 7 C84 9 82 11 78 11 H10 Z" />
      <path className="pen-tip" d="M10 3 L1 7 L10 11 Z" />
      <path className="pen-clip" d="M62 3 V0.5 H80 V3" />
    </svg>
  );
}

/** Lego, half built: a little figure still waiting for a leg ("lắp lego chưa xong cí chân"), and the loose bricks. */
export function LegoSprite({ className = "", ...rest }: SpriteProps) {
  const bricks: Array<[number, number, number, string]> = [
    [4, 52, 16, "is-red"],
    [22, 56, 12, "is-green"],
    [36, 52, 16, "is-yellow"],
    [12, 44, 12, "is-green"],
    [54, 56, 12, "is-red"],
  ];
  return (
    <svg className={svg("lego-sprite", className)} {...rest} viewBox="0 0 100 70" aria-hidden="true">
      {bricks.map(([x, y, w, tone]) => (
        <g className={`lego-brick ${tone}`} key={`${x}-${y}`}>
          <rect x={x} y={y} width={w} height="8" rx="1" />
          <rect className="lego-stud" x={x + 2} y={y - 2.5} width="3.4" height="2.5" rx="0.8" />
          <rect className="lego-stud" x={x + w - 5.4} y={y - 2.5} width="3.4" height="2.5" rx="0.8" />
        </g>
      ))}
      <g className="lego-figure">
        <rect className="lego-head" x="76" y="10" width="12" height="11" rx="3" />
        <rect className="lego-hat" x="74" y="5" width="16" height="6" rx="2" />
        <path className="lego-torso" d="M72 22 H92 L94 40 H70 Z" />
        <rect className="lego-hip" x="71" y="40" width="22" height="4" />
        <rect className="lego-leg" x="71" y="44" width="10" height="16" />
        <rect className="lego-leg-missing" x="83" y="44" width="10" height="16" />
      </g>
    </svg>
  );
}

/** The Jollibee tray from the photo: fried chicken and spaghetti on two yellow plates, fries and two colas. */
export function ChickenTraySprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("tray-sprite", className)} {...rest} viewBox="0 0 170 104" aria-hidden="true">
      <rect className="tray-base" x="2" y="22" width="166" height="80" rx="9" />
      <rect className="tray-liner" x="10" y="28" width="150" height="68" rx="5" />
      {[44, 118].map((x, index) => (
        <g key={x}>
          <ellipse className="tray-plate" cx={x} cy="62" rx="36" ry="26" />
          <ellipse className="tray-plate-well" cx={x} cy="63" rx="28" ry="19" />
          <path className="tray-noodles" d={`M${x - 24} 66 c4 -9 14 -12 22 -7 c7 -6 18 -3 22 5 c-6 9 -38 11 -44 2 z`} />
          <path className="tray-noodle-lines" d={`M${x - 20} 64 q5 -4 10 0 t10 0 t10 0 M${x - 16} 69 q5 -4 10 0 t10 0 t8 0`} />
          <path className="tray-sauce" d={`M${x - 14} 60 c3 -5 11 -6 15 -2 c3 3 0 7 -6 7 c-5 0 -10 -1 -9 -5 z`} />
          <path className="tray-chicken" d={index ? `M${x + 2} 46 c8 -8 24 -6 26 4 c2 8 -8 13 -18 11 l-6 6 c-3 3 -7 0 -5 -3 l4 -6 c-5 -2 -6 -8 -1 -12 z` : `M${x - 4} 44 c8 -9 25 -7 27 3 c2 9 -9 14 -19 11 l-6 6 c-3 3 -7 0 -5 -3 l4 -6 c-5 -2 -6 -7 -1 -11 z`} />
          <path className="tray-crumb" d={index ? `M${x + 10} 48 h2 M${x + 16} 52 h2 M${x + 21} 47 h2` : `M${x + 4} 46 h2 M${x + 10} 50 h2 M${x + 15} 45 h2`} />
        </g>
      ))}
      <path className="tray-fries-box" d="M75 30 H95 L92 54 H78 Z" />
      <path className="tray-fries" d="M78 31 L76 17 M82 31 L82 13 M86 31 L88 15 M90 31 L93 19" />
      <rect className="tray-cola" x="68" y="2" width="15" height="24" rx="2" />
      <rect className="tray-cola" x="89" y="4" width="15" height="24" rx="2" />
      <path className="tray-cola-lid" d="M67 4 H84 M88 6 H105" />
      <path className="tray-cola-straw" d="M78 3 L81 -6 M99 5 L96 -4" />
    </svg>
  );
}

/** Cúc cu's little stage: a mic on its stand. */
export function MicStandSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("micstand-sprite", className)} {...rest} viewBox="0 0 50 120" aria-hidden="true">
      <path className="micstand-pole" d="M25 30 V112 M10 116 L25 108 L40 116" />
      <path className="micstand-boom" d="M25 30 L36 18" />
      <rect className="micstand-mic" x="33" y="6" width="9" height="16" rx="4.5" transform="rotate(38 37 14)" />
    </svg>
  );
}

/** An acoustic guitar leaning against the yellow wall. */
export function GuitarSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("guitar-sprite", className)} {...rest} viewBox="0 0 60 130" aria-hidden="true">
      <path className="guitar-neck" d="M27 4 H33 V64 H27 Z" />
      <rect className="guitar-head" x="25" y="0" width="10" height="10" rx="2" />
      <path className="guitar-body" d="M30 56 C18 56 14 64 16 74 C8 80 6 92 10 102 C16 120 44 120 50 102 C54 92 52 80 44 74 C46 64 42 56 30 56 Z" />
      <circle className="guitar-hole" cx="30" cy="84" r="7" />
      <path className="guitar-strings" d="M29 6 V108 M31 6 V108" />
      <path className="guitar-bridge" d="M24 102 H36" />
    </svg>
  );
}

/** The standing fan that turned beside the stage all evening. */
export function StandFanSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("fan-sprite", className)} {...rest} viewBox="0 0 60 110" aria-hidden="true">
      <path className="fan-pole" d="M30 48 V100 M14 106 L30 98 L46 106" />
      <circle className="fan-cage" cx="30" cy="28" r="24" />
      <g className="fan-blades">
        <path d="M30 28 C26 14 34 8 36 18 Z" />
        <path d="M30 28 C44 26 48 36 38 36 Z" />
        <path d="M30 28 C22 40 12 36 18 30 Z" />
      </g>
      <circle className="fan-hub" cx="30" cy="28" r="4" />
    </svg>
  );
}

/** One of Cúc cu's folding chairs, in green canvas. */
export function FoldingChairSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("chair-sprite", className)} {...rest} viewBox="0 0 70 80" aria-hidden="true">
      <path className="chair-frame" d="M10 4 V76 M60 4 V76 M10 50 L60 76 M60 50 L10 76" />
      <rect className="chair-canvas" x="10" y="8" width="50" height="22" rx="2" />
      <rect className="chair-canvas" x="8" y="44" width="54" height="8" rx="2" />
    </svg>
  );
}

/** A wall calendar open on October, the first circled in red. */
export function CalendarSprite({ className = "", ...rest }: SpriteProps) {
  const days = Array.from({ length: 31 }, (_, index) => index + 1);
  // 1 October 2026 is a Thursday; the grid starts on Monday.
  const offset = 3;
  return (
    <svg className={svg("calendar-sprite", className)} {...rest} viewBox="0 0 120 120" aria-hidden="true">
      <rect className="calendar-sheet" x="2" y="10" width="116" height="106" rx="4" />
      <rect className="calendar-head" x="2" y="10" width="116" height="24" rx="4" />
      <path className="calendar-rings" d="M30 4 V16 M60 4 V16 M90 4 V16" />
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

/** A small storm cloud for the quarrel, which blows over as if nothing had happened. */
export function StormCloudSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("storm-sprite", className)} {...rest} viewBox="0 0 100 78" aria-hidden="true">
      <path className="storm-cloud" d="M22 44 C10 44 6 34 12 28 C10 18 22 12 30 18 C34 6 54 4 60 16 C70 10 84 16 82 28 C92 30 94 44 82 46 H24 Z" />
      <path className="storm-bolt" d="M50 46 L42 62 H52 L46 76 L64 56 H54 L60 46 Z" />
      <path className="storm-rain" d="M28 52 L24 62 M70 52 L66 62 M36 56 L33 64" />
    </svg>
  );
}

/** A red lantern of the kind hung for Tết Trung thu. */
export function RedLanternSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("redlantern-sprite", className)} {...rest} viewBox="0 0 54 104" aria-hidden="true">
      <path className="redlantern-cord" d="M27 0 V12" />
      <rect className="redlantern-cap" x="16" y="11" width="22" height="7" rx="2" />
      <ellipse className="redlantern-body" cx="27" cy="44" rx="25" ry="27" />
      <path className="redlantern-ribs" d="M27 17 V71 M15 20 C6 34 6 54 15 68 M39 20 C48 34 48 54 39 68" />
      <ellipse className="redlantern-glow" cx="23" cy="38" rx="9" ry="12" />
      <rect className="redlantern-cap" x="16" y="70" width="22" height="7" rx="2" />
      <path className="redlantern-tassel" d="M27 77 V100 M23 82 V98 M31 82 V98" />
    </svg>
  );
}

/** Đèn ông sao, the five-pointed star lantern carried at Trung thu, on its stick. */
export function StarLanternSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("starlantern-sprite", className)} {...rest} viewBox="0 0 100 120" aria-hidden="true">
      <path className="starlantern-stick" d="M50 56 L88 118" />
      <path className="starlantern-star" d="M50 4 L61 37 L96 37 L68 57 L79 90 L50 70 L21 90 L32 57 L4 37 L39 37 Z" />
      <path className="starlantern-frame" d="M50 4 L50 70 M4 37 L68 57 M96 37 L32 57 M21 90 L61 37 M79 90 L39 37" />
      <path className="starlantern-tassel" d="M21 90 L18 106 M79 90 L82 106 M50 70 L50 84" />
      <circle className="starlantern-glow" cx="50" cy="50" r="10" />
    </svg>
  );
}

/** Tacos from ngõ Ao Sen: three folded shells seen from the side, the filling heaped on top. */
export function TacosSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("tacos-sprite", className)} {...rest} viewBox="0 0 130 64" aria-hidden="true">
      <ellipse className="tacos-plate" cx="65" cy="52" rx="62" ry="11" />
      {[6, 45, 84].map((x, index) => (
        <g key={x} transform={`translate(${x} ${index === 1 ? 6 : 12}) rotate(${(index - 1) * 6} 20 20)`}>
          <path className="tacos-filling" d="M3 22 C6 12 14 8 20 8 C26 8 34 12 37 22 Z" />
          <path className="tacos-lettuce" d="M4 20 c3 -5 6 -3 8 -6 c2 3 5 -2 8 1 c3 -3 6 1 8 -1 c2 3 5 2 8 6" />
          <path className="tacos-tomato" d="M11 15 h3 M19 12 h3 M27 15 h3" />
          <path className="tacos-cream" d="M8 18 q6 -3 12 0 t12 0" />
          <path className="tacos-shell" d="M0 22 H40 C40 34 31 42 20 42 C9 42 0 34 0 22 Z" />
          <path className="tacos-shell-edge" d="M3 26 C6 35 13 39 20 39 C27 39 34 35 37 26" />
        </g>
      ))}
    </svg>
  );
}

/** A claw machine at Playik, where they played after the tacos. */
export function ClawMachineSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("claw-sprite", className)} {...rest} viewBox="0 0 80 132" aria-hidden="true">
      <rect className="claw-cabinet" x="4" y="2" width="72" height="128" rx="6" />
      <rect className="claw-marquee" x="8" y="6" width="64" height="14" rx="3" />
      <text className="claw-name" x="40" y="16.4" textAnchor="middle">PLAYIK</text>
      <rect className="claw-glass" x="10" y="24" width="60" height="56" rx="2" />
      <path className="claw-arm" d="M40 24 V44 M34 50 L40 44 L46 50 M34 50 L32 56 M46 50 L48 56" />
      <circle className="claw-plush is-pink" cx="24" cy="72" r="7" />
      <circle className="claw-plush is-gold" cx="38" cy="74" r="6" />
      <circle className="claw-plush is-blue" cx="54" cy="72" r="7" />
      <circle className="claw-plush is-pink" cx="46" cy="66" r="5" />
      <rect className="claw-panel" x="10" y="84" width="60" height="18" rx="2" />
      <circle className="claw-button" cx="52" cy="93" r="4.4" />
      <path className="claw-stick" d="M26 93 V86" />
      <circle className="claw-knob" cx="26" cy="85" r="3" />
      <rect className="claw-chute" x="14" y="108" width="20" height="14" rx="2" />
    </svg>
  );
}

/** "Mình ghé vào cái hotel như ma =)))": a friendly little ghost. */
export function GhostSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("ghost-sprite", className)} {...rest} viewBox="0 0 54 64" aria-hidden="true">
      <path className="ghost-body" d="M6 30 C6 14 16 4 27 4 C38 4 48 14 48 30 V58 L41 52 L34 60 L27 52 L20 60 L13 52 L6 58 Z" />
      <ellipse className="ghost-eye" cx="20" cy="28" rx="3" ry="4" />
      <ellipse className="ghost-eye" cx="34" cy="28" rx="3" ry="4" />
      <ellipse className="ghost-blush" cx="15" cy="36" rx="3.6" ry="2" />
      <ellipse className="ghost-blush" cx="39" cy="36" rx="3.6" ry="2" />
      <path className="ghost-mouth" d="M24 38 Q27 41 30 38" />
    </svg>
  );
}

/**
 * Saku's curry, as in the photo: a stoneware bowl, curry with carrot and potato on one side, rice on the other, and a
 * sliced katsu laid over the rice under a stripe of sauce.
 */
export function CurryKatsuSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("curry-sprite", className)} {...rest} viewBox="0 0 160 96" aria-hidden="true">
      <path className="curry-bowl" d="M4 38 C6 66 40 90 80 90 C120 90 154 66 156 38 A76 28 0 0 1 4 38 Z" />
      <ellipse className="curry-foot" cx="80" cy="90" rx="30" ry="3.4" />
      <ellipse className="curry-rim" cx="80" cy="38" rx="76" ry="28" />
      <ellipse className="curry-well" cx="80" cy="40" rx="70" ry="24" />
      <path className="curry-sauce" d="M16 40 C16 28 42 20 76 19 C72 30 74 48 68 61 C40 60 16 52 16 40 Z" />
      <path className="curry-gloss" d="M24 35 C30 29 40 26 52 25" />
      <rect className="curry-carrot" x="32" y="30" width="10" height="9" rx="2.4" transform="rotate(-14 37 34)" />
      <path className="curry-potato" d="M48 42 C52 38 60 38 62 43 C63 48 56 51 51 49 C48 48 47 45 48 42 Z" />
      <rect className="curry-carrot" x="26" y="44" width="8" height="7" rx="2" transform="rotate(10 30 47)" />
      <path className="curry-rice" d="M76 19 C104 18 140 26 146 40 C146 52 124 62 96 63 C82 63 72 62 68 61 C74 48 72 30 76 19 Z" />
      <path className="curry-grain" d="M78 54 l3 1 M88 58 l3 -1 M136 46 l2 2 M140 38 l2 1" />
      {[0, 1, 2, 3, 4].map((index) => {
        // Five slices of the cutlet, side by side down the rice, each showing a sliver of its pale cut face.
        const x = 88 + index * 10.5;
        const y = 21 + index * 2.4;
        return (
          <g className="katsu-slice" key={index}>
            <path d={`M${x} ${y} L${x + 9.5} ${y + 1.8} L${x + 4.5} ${y + 23.8} L${x - 5} ${y + 22} Z`} />
            <path className="katsu-face" d={`M${x + 8.6} ${y + 3} L${x + 4} ${y + 22.6}`} />
          </g>
        );
      })}
      <path className="katsu-crumb" d="M87 28 L139 40 M85 36 L137 48" />
      <path className="katsu-glaze" d="M85 31 C90 26 93 36 98 31 S106 37 110 33 S118 40 122 36 S131 43 135 39" />
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

/** The karaage from the photo: glazed pieces of fried chicken on a black plate, beside a heap of shredded cabbage. */
export function KaraageSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("karaage-sprite", className)} {...rest} viewBox="0 0 120 84" aria-hidden="true">
      <path className="karaage-plate-side" d="M14 28 L98 18 L112 60 L22 74 Z" />
      <path className="karaage-plate" d="M14 24 L98 14 L112 56 L22 70 Z" />
      <path className="karaage-plate-well" d="M21 28 L94 19.5 L105.5 52.5 L27 64.5 Z" />
      <path className="karaage-cabbage-heap" d={lump(38, 44, 15, 0.2, 12, 0.8)} />
      <path className="karaage-cabbage" d="M26 44 C30 40 34 42 38 38 M28 50 C33 46 37 49 42 45 M31 38 C35 34 40 37 44 33 M34 54 C38 50 43 52 47 48 M40 42 C44 39 47 42 51 38 M27 47 C31 45 35 47 39 44 M36 47 C40 44 44 46 48 43 M33 42 C36 39 39 41 42 38" />
      <path className="karaage-cabbage is-green" d="M29 41 C33 38 36 40 40 36 M38 51 C41 48 45 50 49 46 M43 37 C46 35 48 37 51 35" />
      <path className="karaage-cabbage is-red" d="M31 46 C34 43 37 45 40 42 M41 49 C44 47 46 48 48 46" />
      {karaage.map(([cx, cy, r, turn]) => (
        <g className="karaage-piece" key={`${cx}-${cy}`}>
          <path d={lump(cx, cy, r, turn)} />
          <path className="karaage-glaze" d={lump(cx + r * 0.05, cy - r * 0.12, r * 0.78, turn + 0.4)} />
          <ellipse className="karaage-shine" cx={cx - r * 0.3} cy={cy - r * 0.34} rx={r * 0.32} ry={r * 0.16} />
          <circle className="karaage-glint" cx={cx - r * 0.42} cy={cy - r * 0.38} r={r * 0.08} />
        </g>
      ))}
      <path className="karaage-mayo" d="M70 40 C73 36 76 42 79 38 S85 43 88 39" />
    </svg>
  );
}

/** The birthday cake: two tiers, cream and berries, and the candles (their flames are separate, so they can flicker). */
export function BirthdayCakeSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("cake-sprite", className)} {...rest} viewBox="0 0 140 130" aria-hidden="true">
      <ellipse className="cake-stand" cx="70" cy="122" rx="62" ry="7" />
      <path className="cake-tier" d="M14 74 H126 V114 C126 120 14 120 14 114 Z" />
      <path className="cake-cream" d="M14 74 H126 V82 C118 90 110 80 102 88 C94 80 86 90 78 82 C70 90 62 80 54 88 C46 80 38 90 30 82 C24 88 18 84 14 82 Z" />
      <path className="cake-tier is-top" d="M34 44 H106 V74 H34 Z" />
      <path className="cake-cream" d="M34 44 H106 V50 C100 56 94 48 88 54 C82 48 76 56 70 50 C64 56 58 48 52 54 C46 48 40 56 34 50 Z" />
      {[40, 58, 82, 100].map((x) => (
        <circle className="cake-berry" key={x} cx={x} cy="44" r="4.2" />
      ))}
      <path className="cake-script" d="M42 64 c4 -6 8 -6 8 0 c0 4 4 4 8 -2 c2 4 6 4 10 0 c2 4 8 4 12 -4 c2 6 8 6 12 0" />
      {[52, 70, 88].map((x) => (
        <rect className="cake-candle" key={x} x={x - 2.5} y="22" width="5" height="22" rx="1.5" />
      ))}
    </svg>
  );
}

/** A red lily seen face on: six tepals with dark speckles toward the throat, six stamens with rust anthers, the pistil. */
export function LilySprite({ className = "", ...rest }: SpriteProps) {
  const petal = "M50 50 C42 38 41 20 50 3 C59 20 58 38 50 50 Z";
  const inner = "M50 50 C45 40 45 26 50 12 C55 26 55 40 50 50 Z";
  return (
    <svg className={svg("lily-sprite", className)} {...rest} viewBox="0 0 100 100" aria-hidden="true">
      {[30, 90, 150, 210, 270, 330].map((angle) => (
        <path className="lily-tepal is-back" key={`b-${angle}`} d={petal} transform={`rotate(${angle} 50 50)`} />
      ))}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <g key={`f-${angle}`} transform={`rotate(${angle} 50 50)`}>
          <path className="lily-tepal" d={petal} />
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

/** A bud of the same lily, still closed. */
export function LilyBudSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("lilybud-sprite", className)} {...rest} viewBox="0 0 30 90" aria-hidden="true">
      <path className="lilybud-stem" d="M15 88 C15 70 16 58 15 50" />
      <path className="lilybud-body" d="M15 4 C24 18 24 38 15 52 C6 38 6 18 15 4 Z" />
      <path className="lilybud-seam" d="M15 6 C17 20 17 36 15 50 M11 14 C10 26 11 38 14 48" />
    </svg>
  );
}

/** A party popper going off: "Tadaaaa". */
export function PartyPopperSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("popper-sprite", className)} {...rest} viewBox="0 0 80 80" aria-hidden="true">
      <path className="popper-cone" d="M6 74 L22 34 L46 58 Z" />
      <path className="popper-stripe" d="M14 54 L30 62 M18 44 L38 56" />
      <path className="popper-burst" d="M34 40 L40 22 M40 46 L60 36 M30 34 L28 14 M44 52 L66 54" />
      <circle className="popper-dot is-gold" cx="44" cy="14" r="3" />
      <circle className="popper-dot is-pink" cx="66" cy="26" r="2.6" />
      <rect className="popper-dot is-red" x="56" y="8" width="5" height="5" rx="1" transform="rotate(20 58 10)" />
      <rect className="popper-dot is-gold" x="70" y="44" width="5" height="5" rx="1" transform="rotate(-18 72 46)" />
    </svg>
  );
}
