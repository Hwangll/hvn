import type { SVGProps } from "react";

/* Small vector props for the Part III dioramas, drawn like the Part II ones (SceneSprites.tsx): colours live in
   story-part-three.css so each scene can light them, and extra props (data-* scroll hints) pass straight through. */
type SpriteProps = SVGProps<SVGSVGElement>;

const svg = (name: string, className: string) => `${name} ${className}`.trim();

/** The homestay's projector, film reels on top and the lens on the left, towards the screen. */
export function ProjectorSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("projector-sprite", className)} {...rest} viewBox="0 0 72 48" aria-hidden="true">
      <g className="projector-reels">
        <circle cx="34" cy="11" r="9" />
        <circle cx="54" cy="11" r="9" />
        <path className="projector-spokes" d="M34 4 V18 M27 11 H41 M54 4 V18 M47 11 H61" />
      </g>
      <rect className="projector-body" x="20" y="19" width="48" height="23" rx="5" />
      <rect className="projector-barrel" x="11" y="24" width="10" height="13" rx="2" />
      <circle className="projector-lens" cx="9" cy="30.5" r="6.5" />
      <circle className="projector-glint" cx="10.6" cy="28.6" r="1.8" />
      <path className="projector-vent" d="M39 27 H61 M39 32 H61" />
      <path className="projector-feet" d="M26 42 V46 M62 42 V46" />
    </svg>
  );
}

/** "Chỉ thuyền mới hiểu được biển": a paper boat on two waves. */
export function PaperBoatSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("boat-sprite", className)} {...rest} viewBox="0 0 80 52" aria-hidden="true">
      <path className="boat-sail boat-sail-back" d="M40 4 L40 30 L58 30 Z" />
      <path className="boat-sail" d="M40 6 L40 30 L20 30 Z" />
      <path className="boat-hull" d="M8 30 H72 L60 42 H20 Z" />
      <path className="boat-wave" d="M0 44 C8 40 14 40 20 44 S32 48 40 44 S52 40 60 44 S72 48 80 44" />
      <path className="boat-wave boat-wave-back" d="M4 50 C12 46 18 46 24 50 S36 54 44 50 S56 46 64 50 S74 53 80 50" />
    </svg>
  );
}

export function MusicNoteSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("note-sprite", className)} {...rest} viewBox="0 0 26 34" aria-hidden="true">
      <ellipse className="note-head" cx="8" cy="27" rx="6" ry="4.4" transform="rotate(-22 8 27)" />
      <path className="note-stem" d="M13 26 V4 C18 6 23 9.5 22.5 16 C20.5 12 17 11 13 11" />
    </svg>
  );
}

/** One of the two pets the couple raise in Widgetable, Bi or Bơ: a round little creature, coloured by CSS. */
export function PetSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("pet-sprite", className)} {...rest} viewBox="0 0 64 60" aria-hidden="true">
      <circle className="pet-ear" cx="16" cy="14" r="8" />
      <circle className="pet-ear" cx="48" cy="14" r="8" />
      <circle className="pet-ear-inner" cx="16" cy="14" r="4" />
      <circle className="pet-ear-inner" cx="48" cy="14" r="4" />
      <ellipse className="pet-body" cx="32" cy="34" rx="26" ry="23" />
      <ellipse className="pet-belly" cx="32" cy="42" rx="14" ry="10" />
      <circle className="pet-eye" cx="23" cy="31" r="2.8" />
      <circle className="pet-eye" cx="41" cy="31" r="2.8" />
      <circle className="pet-eye-glint" cx="24" cy="30" r="0.9" />
      <circle className="pet-eye-glint" cx="42" cy="30" r="0.9" />
      <ellipse className="pet-blush" cx="17" cy="37" rx="4" ry="2.4" />
      <ellipse className="pet-blush" cx="47" cy="37" rx="4" ry="2.4" />
      <path className="pet-mouth" d="M28.5 36 Q32 39 35.5 36" />
    </svg>
  );
}

/** The Widgetable mood jar the two of them drop their feelings into. */
export function MoodJarSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("jar-sprite", className)} {...rest} viewBox="0 0 70 90" aria-hidden="true">
      <rect className="jar-lid" x="17" y="4" width="36" height="10" rx="3" />
      <path className="jar-glass" d="M20 14 H50 V20 C62 24 64 34 64 46 V74 C64 82 58 86 50 86 H20 C12 86 6 82 6 74 V46 C6 34 8 24 20 20 Z" />
      <g className="jar-moods">
        <circle className="jar-mood is-pink" cx="22" cy="74" r="7" />
        <circle className="jar-mood is-gold" cx="38" cy="76" r="6" />
        <circle className="jar-mood is-lilac" cx="51" cy="72" r="7" />
        <circle className="jar-mood is-mint" cx="30" cy="63" r="6" />
        <circle className="jar-mood is-pink" cx="45" cy="61" r="5" />
      </g>
      <path className="jar-shine" d="M14 36 C12 46 12 62 14 74" />
    </svg>
  );
}

export function StoneBenchSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("bench-sprite", className)} {...rest} viewBox="0 0 160 46" aria-hidden="true">
      <rect className="bench-seat" x="4" y="8" width="152" height="14" rx="4" />
      <rect className="bench-edge" x="4" y="19" width="152" height="4" rx="2" />
      <rect className="bench-leg" x="20" y="23" width="18" height="22" rx="2" />
      <rect className="bench-leg" x="122" y="23" width="18" height="22" rx="2" />
    </svg>
  );
}

/** The muffins Hoàng brought, in their open box. */
export function CakeBoxSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("cakebox-sprite", className)} {...rest} viewBox="0 0 84 44" aria-hidden="true">
      <path className="cakebox-tray" d="M4 24 H80 L74 42 H10 Z" />
      <path className="cake-cup" d="M14 26 H36 L33 38 H17 Z" />
      <path className="cake-cup" d="M46 26 H68 L65 38 H49 Z" />
      <path className="cake-top" d="M12 27 C12 12 38 12 38 27 Z" />
      <path className="cake-top" d="M44 27 C44 12 70 12 70 27 Z" />
      <circle className="cake-chip" cx="20" cy="20" r="1.6" />
      <circle className="cake-chip" cx="29" cy="18" r="1.4" />
      <circle className="cake-chip" cx="54" cy="19" r="1.5" />
      <circle className="cake-chip" cx="62" cy="21" r="1.3" />
    </svg>
  );
}

/** A tall cup of fruit tea with its straw and the shop's date label. */
export function FruitTeaSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("tea-sprite", className)} {...rest} viewBox="0 0 36 70" aria-hidden="true">
      <path className="tea-straw" d="M22 2 L19 22" />
      <ellipse className="tea-lid" cx="18" cy="16" rx="15" ry="4" />
      <path className="tea-cup" d="M3 16 H33 L29 66 H7 Z" />
      <path className="tea-drink" d="M4.5 26 H31.5 L29 64 H7 Z" />
      <rect className="tea-label" x="9" y="36" width="18" height="10" rx="1.5" />
    </svg>
  );
}

/** The old lady's stall beside the bench, under a striped umbrella. */
export function StallSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("stall-sprite", className)} {...rest} viewBox="0 0 110 100" aria-hidden="true">
      <path className="stall-canopy" d="M6 34 C20 8 90 8 104 34 Z" />
      <path className="stall-stripe" d="M30 13 C28 20 27 27 27 34 H41 C41 25 42 17 44 10 Z M66 10 C68 17 69 25 69 34 H83 C83 27 82 20 80 13 Z" />
      <path className="stall-pole" d="M55 12 V98" />
      <rect className="stall-table" x="22" y="62" width="66" height="8" rx="2" />
      <path className="stall-legs" d="M28 70 V98 M82 70 V98" />
      <rect className="stall-goods is-a" x="28" y="50" width="16" height="12" rx="2" />
      <rect className="stall-goods is-b" x="47" y="54" width="14" height="8" rx="2" />
      <rect className="stall-goods is-c" x="64" y="47" width="18" height="15" rx="2" />
    </svg>
  );
}

/** The red car the two of them sat beside: side on, its paint holding a reflection. */
export function RedCarSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("car-sprite", className)} {...rest} viewBox="0 0 220 86" aria-hidden="true">
      <path className="car-body" d="M8 58 C8 48 14 44 26 42 L58 38 C70 22 86 14 112 14 H138 C158 14 172 24 184 38 L204 42 C212 44 214 50 214 58 V64 C214 68 210 70 206 70 H14 C10 70 8 68 8 64 Z" />
      <path className="car-window" d="M66 38 C76 25 88 20 108 20 H118 V38 Z" />
      <path className="car-window" d="M124 20 H136 C152 20 164 27 174 38 H124 Z" />
      <path className="car-door" d="M120 38 V66 M78 40 C76 50 76 58 78 66" />
      <path className="car-shine" d="M30 50 C80 44 140 44 196 50" />
      <circle className="car-wheel" cx="54" cy="68" r="14" />
      <circle className="car-wheel" cx="170" cy="68" r="14" />
      <circle className="car-rim" cx="54" cy="68" r="6" />
      <circle className="car-rim" cx="170" cy="68" r="6" />
      <rect className="car-light" x="200" y="47" width="10" height="5" rx="2" />
    </svg>
  );
}

/** Bảo tàng Hồ Chí Minh, drawn simply: a white hall on broad steps under a crown that opens like a lotus. */
export function MuseumSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("museum-sprite", className)} {...rest} viewBox="0 0 240 120" aria-hidden="true">
      <path className="museum-crown" d="M40 22 L200 22 L188 40 H52 Z" />
      <path className="museum-petals" d="M52 22 C60 12 72 12 80 22 C88 12 100 12 108 22 C116 12 128 12 136 22 C144 12 156 12 164 22 C172 12 184 12 192 22" />
      <rect className="museum-wall" x="52" y="40" width="136" height="50" />
      <path className="museum-columns" d="M66 44 V88 M84 44 V88 M102 44 V88 M138 44 V88 M156 44 V88 M174 44 V88" />
      <rect className="museum-door" x="110" y="58" width="20" height="32" rx="1" />
      <rect className="museum-step" x="40" y="90" width="160" height="8" />
      <rect className="museum-step" x="28" y="98" width="184" height="8" />
      <rect className="museum-step" x="16" y="106" width="208" height="8" />
    </svg>
  );
}

/** A flag on its pole, red with a gold star. */
export function FlagSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("flag-sprite", className)} {...rest} viewBox="0 0 60 120" aria-hidden="true">
      <path className="flag-pole" d="M8 6 V118" />
      <circle className="flag-finial" cx="8" cy="5" r="3" />
      <path className="flag-cloth" d="M9 10 C22 6 34 14 56 10 V42 C34 46 22 38 9 42 Z" />
      <path className="flag-star" d="M32 17 L34.4 23.6 L41.4 23.8 L35.9 28.1 L37.9 34.8 L32 30.9 L26.1 34.8 L28.1 28.1 L22.6 23.8 L29.6 23.6 Z" />
    </svg>
  );
}

export function TreeSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("tree-sprite", className)} {...rest} viewBox="0 0 100 120" aria-hidden="true">
      <path className="tree-trunk" d="M46 118 C48 96 47 82 44 70 H56 C53 82 52 96 54 118 Z" />
      <path className="tree-crown" d="M18 66 C4 62 4 40 20 36 C18 18 40 8 52 18 C64 6 90 14 86 34 C100 40 98 64 82 66 C78 78 60 80 52 72 C42 80 22 78 18 66 Z" />
      <path className="tree-light" d="M30 34 C36 26 46 24 54 28" />
    </svg>
  );
}

/** Chùa Một Cột: one small hall with curling eaves, standing on a single pillar in its pond. */
export function PagodaSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("pagoda-sprite", className)} {...rest} viewBox="0 0 120 140" aria-hidden="true">
      <path className="pagoda-roof" d="M8 46 C26 44 38 34 46 22 H74 C82 34 94 44 112 46 C100 52 88 52 80 50 H40 C32 52 20 52 8 46 Z" />
      <path className="pagoda-ridge" d="M44 22 C50 16 70 16 76 22 M44 22 C40 16 36 14 32 15 M76 22 C80 16 84 14 88 15" />
      <rect className="pagoda-hall" x="34" y="50" width="52" height="34" />
      <path className="pagoda-lattice" d="M42 56 V80 M52 56 V80 M68 56 V80 M78 56 V80 M38 68 H82" />
      <rect className="pagoda-door" x="54" y="58" width="12" height="26" />
      <path className="pagoda-platform" d="M24 84 H96 L88 94 H32 Z" />
      <path className="pagoda-brackets" d="M40 94 L58 108 M80 94 L62 108" />
      <rect className="pagoda-pillar" x="54" y="94" width="12" height="44" rx="2" />
    </svg>
  );
}

export function LotusSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("lotus-sprite", className)} {...rest} viewBox="0 0 48 36" aria-hidden="true">
      <path className="lotus-petal lotus-petal-back" d="M24 30 C14 26 8 16 10 6 C18 10 22 18 24 30 Z" />
      <path className="lotus-petal lotus-petal-back" d="M24 30 C34 26 40 16 38 6 C30 10 26 18 24 30 Z" />
      <path className="lotus-petal" d="M24 32 C16 28 14 16 24 2 C34 16 32 28 24 32 Z" />
      <path className="lotus-petal lotus-petal-side" d="M24 32 C12 32 4 26 2 18 C12 18 20 24 24 32 Z" />
      <path className="lotus-petal lotus-petal-side" d="M24 32 C36 32 44 26 46 18 C36 18 28 24 24 32 Z" />
    </svg>
  );
}

export function LotusPadSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("lotuspad-sprite", className)} {...rest} viewBox="0 0 60 26" aria-hidden="true">
      <path className="lotuspad-leaf" d="M30 13 L52 6 C58 10 60 16 54 20 C44 26 16 26 6 20 C0 16 2 10 8 6 Z" />
      <path className="lotuspad-vein" d="M30 13 L14 20 M30 13 L30 24 M30 13 L46 20" />
    </svg>
  );
}

const prayerFlags = Array.from({ length: 11 }, (_, index) => {
  const x = 12 + index * 26;
  // The string sags in the middle, so each flag hangs from the curve at its own height.
  const y = 8 + Math.sin((index / 10) * Math.PI) * 14;
  return { x, y, tone: ["blue", "gold", "red", "white", "orange"][index % 5] };
});

/** The strings of Buddhist flags across the pagoda's sky, in their five colours. */
export function PrayerFlagsSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("flags-sprite", className)} {...rest} viewBox="0 0 300 48" preserveAspectRatio="none" aria-hidden="true">
      <path className="flags-string" d="M0 4 C80 30 220 30 300 4" />
      {prayerFlags.map((flag) => (
        <path key={flag.x} className={`flags-flag is-${flag.tone}`} d={`M${flag.x} ${flag.y} h14 v12 l-7 -3 l-7 3 z`} />
      ))}
    </svg>
  );
}

/** The bowl of bún riêu from Triệu Việt Vương: red broth, tomato, tofu, herbs on top. */
export function NoodleBowlSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("bowl-sprite", className)} {...rest} viewBox="0 0 96 60" aria-hidden="true">
      <ellipse className="bowl-broth" cx="48" cy="20" rx="42" ry="11" />
      <circle className="bowl-tomato" cx="30" cy="18" r="5" />
      <circle className="bowl-tomato" cx="58" cy="22" r="4.5" />
      <rect className="bowl-tofu" x="40" y="12" width="9" height="7" rx="1.5" transform="rotate(-12 44 15)" />
      <rect className="bowl-tofu" x="66" y="14" width="8" height="6" rx="1.5" transform="rotate(10 70 17)" />
      <path className="bowl-herb" d="M18 22 C22 16 26 20 24 24 M70 24 C72 18 78 20 76 25 M46 26 C48 22 52 24 50 27" />
      <path className="bowl-body" d="M6 20 C8 42 26 56 48 56 C70 56 88 42 90 20 C80 28 64 31 48 31 C32 31 16 28 6 20 Z" />
      <path className="bowl-rim" d="M6 20 C16 28 32 31 48 31 C64 31 80 28 90 20" />
      <path className="bowl-band" d="M20 42 C36 48 60 48 76 42" />
    </svg>
  );
}

/** "Bộ hoa đỏ đầm ngủ": a folded set of red pyjamas printed with small white flowers. */
export function PyjamasSprite({ className = "", ...rest }: SpriteProps) {
  const flowers: Array<[number, number]> = [[16, 14], [34, 10], [50, 18], [22, 30], [42, 30], [58, 32]];
  return (
    <svg className={svg("pyjamas-sprite", className)} {...rest} viewBox="0 0 72 44" aria-hidden="true">
      <path className="pyjamas-cloth" d="M6 8 C6 4 10 2 14 2 H58 C64 2 68 6 68 10 V36 C68 40 64 42 60 42 H12 C8 42 6 40 6 36 Z" />
      <path className="pyjamas-fold" d="M6 22 C26 26 48 26 68 22" />
      {/* Folded with the collar on top and the buttons down the front. */}
      <path className="pyjamas-collar" d="M24 2 L36 13 L31 18 L20 5 Z M48 2 L36 13 L41 18 L52 5 Z" />
      <path className="pyjamas-placket" d="M36 13 V42" />
      {flowers.map(([x, y]) => (
        <g className="pyjamas-flower" key={`${x}-${y}`}>
          <circle cx={x} cy={y - 2.2} r="1.6" />
          <circle cx={x + 2.1} cy={y - 0.6} r="1.6" />
          <circle cx={x + 1.3} cy={y + 1.9} r="1.6" />
          <circle cx={x - 1.3} cy={y + 1.9} r="1.6" />
          <circle cx={x - 2.1} cy={y - 0.6} r="1.6" />
        </g>
      ))}
      {[22, 30, 38].map((y) => <circle className="pyjamas-button" key={y} cx="38.6" cy={y} r="1.3" />)}
    </svg>
  );
}
