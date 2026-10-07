import { useId, type SVGProps } from "react";

/* Small vector props for the Part III dioramas, drawn like the Part II ones (SceneSprites.tsx): colours live in
   story-part-three.css so each scene can light them, and extra props (data-* scroll hints) pass straight through.
   The props are lit rather than flat: a sprite defines its own gradients, but every stop takes its colour from a class,
   so a scene relights a prop from CSS alone. Props that other scenes recolour (the notes, the pets, the pyjamas, the
   lotus) keep their flat fills and lay their light and shade over them instead. */
type SpriteProps = SVGProps<SVGSVGElement>;
type Stops = Array<[offset: number, className: string]>;

const svg = (name: string, className: string) => `${name} ${className}`.trim();

/** An id for a sprite's own gradients, safe inside url(#…). */
const useSpriteId = () => useId().replace(/[^\w-]/g, "");

const stops = (list: Stops) => list.map(([offset, className]) => <stop key={offset} className={className} offset={offset} />);

/** The soft shadow a prop rests in: darkest under it, gone at its edge. */
const shadowStops = stops([[0, "p3-shadow-core"], [0.55, "p3-shadow-mid"], [1, "p3-shadow-edge"]]);

const point = (cx: number, cy: number, r: number, angle: number) => `${(cx + Math.cos(angle) * r).toFixed(1)} ${(cy + Math.sin(angle) * r).toFixed(1)}`;

/** A leafy outline: small bumps of uneven size around an ellipse, the same unevenness every render (seeded). */
const foliage = (cx: number, cy: number, rx: number, ry: number, bumps: number, seed: number) => {
  const at = Array.from({ length: bumps }, (_, i) => {
    const angle = (i / bumps) * Math.PI * 2 - Math.PI / 2;
    const wobble = 1 + 0.1 * Math.sin(i * 2.7 + seed) + 0.05 * Math.sin(i * 5.3 + seed * 2);
    return [cx + Math.cos(angle) * rx * wobble, cy + Math.sin(angle) * ry * wobble];
  });
  const xy = ([x, y]: number[]) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  return `M${xy(at[0])} ${at.map((from, i) => {
    const to = at[(i + 1) % bumps];
    const bulge = (Math.hypot(to[0] - from[0], to[1] - from[1]) * (0.56 + 0.14 * Math.sin(i * 3.1 + seed))).toFixed(1);
    return `A${bulge} ${bulge} 0 0 1 ${xy(to)}`;
  }).join(" ")} Z`;
};

/** The homestay's projector, the one lamp in the red room: film reels on top, the lens on the left alight toward the screen. */
export function ProjectorSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  const fill = (name: string) => `url(#${id}-${name})`;
  return (
    <svg className={svg("projector-sprite", className)} {...rest} viewBox="0 0 120 80" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-body`} x2="0" y2="1">{stops([[0, "projector-body-hi"], [0.4, "projector-body"], [1, "projector-body-lo"]])}</linearGradient>
        <linearGradient id={`${id}-barrel`} x2="0" y2="1">{stops([[0, "projector-barrel-hi"], [0.4, "projector-barrel"], [1, "projector-barrel-lo"]])}</linearGradient>
        <radialGradient id={`${id}-reel`} cx="0.42" cy="0.38">{stops([[0, "projector-reel-hi"], [1, "projector-reel-lo"]])}</radialGradient>
        <radialGradient id={`${id}-glass`} cx="0.42" cy="0.42">{stops([[0, "projector-glass-core"], [0.5, "projector-glass"], [1, "projector-glass-edge"]])}</radialGradient>
        <radialGradient id={`${id}-halo`}>{stops([[0, "projector-halo-core"], [0.3, "projector-halo"], [1, "projector-halo-edge"]])}</radialGradient>
        <radialGradient id={`${id}-shadow`}>{shadowStops}</radialGradient>
      </defs>
      <ellipse cx="70" cy="75" rx="52" ry="4.6" fill={fill("shadow")} />
      <path className="projector-feet" d="M38 70 h8 v5.5 h-8 Z M96 70 h8 v5.5 h-8 Z" />
      <path className="projector-arm" d="M50 41 L54 23 M100 41 L94 25" />
      <path className="projector-strip" d="M38 22 C34 28 34 35 38 41 M108 24 C112 30 112 35 109 41" />
      {/* Each reel turns on its own hub; the light on their rims stays where it is. */}
      <g className="projector-reel">
        <circle className="projector-reel-disc" cx="54" cy="21" r="17" fill={fill("reel")} />
        <circle className="projector-film" cx="54" cy="21" r="10.5" />
        <path className="projector-hole" d="M54 7.5 a4 4 0 1 0 0.01 0 Z M62.2 21.8 a4 4 0 1 0 0.01 0 Z M45.8 21.8 a4 4 0 1 0 0.01 0 Z" />
        <circle className="projector-hub" cx="54" cy="21" r="2.6" />
      </g>
      <g className="projector-reel">
        <circle className="projector-reel-disc" cx="94" cy="23" r="15" fill={fill("reel")} />
        <circle className="projector-film" cx="94" cy="23" r="9.2" />
        <path className="projector-hole" d="M94 11 a3.6 3.6 0 1 0 0.01 0 Z M101.3 23.6 a3.6 3.6 0 1 0 0.01 0 Z M86.7 23.6 a3.6 3.6 0 1 0 0.01 0 Z" />
        <circle className="projector-hub" cx="94" cy="23" r="2.4" />
      </g>
      <path className="projector-shine" d="M39.8 12.8 A16.4 16.4 0 0 1 51.2 4.9 M81.5 15.8 A14.4 14.4 0 0 1 91.5 8.8" />
      <rect x="30" y="40" width="84" height="32" rx="6" fill={fill("body")} />
      <path className="projector-rim" d="M31.4 47 C31.4 43 33.6 41.2 37 41.2 H96" />
      <rect className="projector-panel" x="62" y="47" width="44" height="19" rx="3" />
      {/* Light leaks out of the lamp house through the vents. */}
      <path className="projector-vent" d="M67 51.5 H101 M67 56.5 H101 M67 61.5 H101" />
      <rect className="projector-badge" x="40" y="47" width="15" height="5" rx="1.2" />
      <circle className="projector-led-glow" cx="44" cy="63" r="4" />
      <circle className="projector-led" cx="44" cy="63" r="1.4" />
      <rect x="16" y="47" width="16" height="18" rx="2" fill={fill("barrel")} />
      <path className="projector-ring" d="M21 47.6 V64.4 M26.5 47.6 V64.4" />
      <ellipse className="projector-bezel" cx="15" cy="56" rx="4.6" ry="10.6" />
      <ellipse cx="14" cy="56" rx="3.3" ry="8.6" fill={fill("glass")} />
      <ellipse className="projector-glint" cx="13" cy="51" rx="0.9" ry="2.2" />
      <circle cx="13" cy="56" r="26" fill={fill("halo")} />
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
      {/* A glint on the head, whatever colour a scene inks the note. */}
      <ellipse className="note-glint" cx="6.3" cy="25.3" rx="2.3" ry="1.1" transform="rotate(-22 6.3 25.3)" />
    </svg>
  );
}

/** One of the two pets the couple raise in Widgetable, Bi or Bơ: a round little creature, coloured by CSS and lit from above. */
export function PetSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  return (
    <svg className={svg("pet-sprite", className)} {...rest} viewBox="0 0 64 60" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-lit`} cx="0.38" cy="0.26" r="0.8">{stops([[0, "pet-light"], [0.45, "pet-light-fade"], [1, "pet-dusk"]])}</radialGradient>
      </defs>
      <circle className="pet-ear" cx="16" cy="14" r="8" />
      <circle className="pet-ear" cx="48" cy="14" r="8" />
      <circle className="pet-ear-inner" cx="16" cy="14" r="4" />
      <circle className="pet-ear-inner" cx="48" cy="14" r="4" />
      <ellipse className="pet-body" cx="32" cy="34" rx="26" ry="23" />
      <ellipse cx="32" cy="34" rx="26" ry="23" fill={`url(#${id}-lit)`} />
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

const jarOutline = "M20 14 H50 V20 C62 24 64 34 64 46 V74 C64 82 58 86 50 86 H20 C12 86 6 82 6 74 V46 C6 34 8 24 20 20 Z";
const jarMoods: Array<[tone: string, cx: number, cy: number, r: number]> = [["pink", 22, 74, 7], ["gold", 38, 76, 6], ["lilac", 51, 72, 7], ["mint", 30, 63, 6], ["pink", 45, 61, 5]];

/** The Widgetable mood jar the two of them drop their feelings into: clear glass, a gold lid, the moods glowing inside. */
export function MoodJarSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  const fill = (name: string) => `url(#${id}-${name})`;
  return (
    <svg className={svg("jar-sprite", className)} {...rest} viewBox="0 0 70 90" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-glass`} cx="0.5" cy="0.56" r="0.62">{stops([[0.58, "jar-glass-clear"], [1, "jar-glass-edge"]])}</radialGradient>
        <linearGradient id={`${id}-lid`} x2="0" y2="1">{stops([[0, "jar-lid-hi"], [0.55, "jar-lid"], [1, "jar-lid-lo"]])}</linearGradient>
        <radialGradient id={`${id}-orb`} cx="0.34" cy="0.3" r="0.8">{stops([[0, "jar-orb-gloss"], [0.34, "jar-orb-clear"], [1, "jar-orb-shade"]])}</radialGradient>
        <radialGradient id={`${id}-glow`}>{stops([[0, "jar-glow-core"], [1, "jar-glow-edge"]])}</radialGradient>
        <radialGradient id={`${id}-shadow`}>{shadowStops}</radialGradient>
      </defs>
      <ellipse cx="35" cy="87.5" rx="32" ry="4" fill={fill("shadow")} />
      <path d={jarOutline} fill={fill("glass")} />
      <ellipse cx="36" cy="70" rx="27" ry="17" fill={fill("glow")} />
      <g className="jar-moods">
        {jarMoods.map(([tone, cx, cy, r]) => <circle key={`${cx}-${cy}`} className={`jar-mood is-${tone}`} cx={cx} cy={cy} r={r} />)}
        {jarMoods.map(([, cx, cy, r]) => <circle key={`${cx}-${cy}-lit`} cx={cx} cy={cy} r={r} fill={fill("orb")} />)}
      </g>
      <path className="jar-glass" d={jarOutline} />
      <path className="jar-shine" d="M13.5 37 C11.5 47 11.5 62 13.5 74" />
      <path className="jar-shine is-small" d="M57 42 C58.4 48 58.4 54 57.4 60" />
      <path className="jar-shine is-shoulder" d="M21 23.5 C16.5 25.5 13.5 29 12.2 33" />
      <ellipse className="jar-rim" cx="35" cy="20" rx="15" ry="2.1" />
      <rect x="17" y="4" width="36" height="10" rx="3" fill={fill("lid")} />
      <path className="jar-lid-ridges" d="M22 5.6 V12.4 M27 5.6 V12.4 M32 5.6 V12.4 M37 5.6 V12.4 M42 5.6 V12.4 M47 5.6 V12.4" />
      <path className="jar-lid-shine" d="M20.5 6.3 H49.5" />
    </svg>
  );
}

/** The stone bench outside Ngọc's office: a thick polished granite slab on two blocks, warm on top where the sun reaches it. */
export function StoneBenchSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  const fill = (name: string) => `url(#${id}-${name})`;
  const legs = [16, 120];
  return (
    <svg className={svg("bench-sprite", className)} {...rest} viewBox="0 0 160 60" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-top`} x2="0" y2="1">{stops([[0, "bench-top-back"], [1, "bench-top-front"]])}</linearGradient>
        <linearGradient id={`${id}-front`} x2="0" y2="1">{stops([[0, "bench-front-hi"], [1, "bench-front-lo"]])}</linearGradient>
        <linearGradient id={`${id}-leg`} x2="0" y2="1">{stops([[0, "bench-leg-top"], [0.24, "bench-leg"], [1, "bench-leg-lo"]])}</linearGradient>
        <radialGradient id={`${id}-shadow`}>{shadowStops}</radialGradient>
        {/* Granite: flecks dark and light, scattered unevenly across a tile that repeats. */}
        <pattern id={`${id}-grain`} width="9" height="7" patternUnits="userSpaceOnUse">
          <circle className="bench-speck" cx="1.2" cy="1.4" r="0.5" />
          <circle className="bench-speck is-light" cx="4.8" cy="3.6" r="0.45" />
          <circle className="bench-speck" cx="7.6" cy="0.9" r="0.35" />
          <circle className="bench-speck is-light" cx="2.9" cy="5.6" r="0.3" />
          <circle className="bench-speck" cx="6.4" cy="6.1" r="0.4" />
          <circle className="bench-speck is-light" cx="8.4" cy="4.2" r="0.25" />
        </pattern>
      </defs>
      <ellipse cx="72" cy="56" rx="86" ry="4.6" fill={fill("shadow")} />
      {legs.map((x) => (
        <g key={x}>
          <rect x={x} y="25" width="24" height="29" fill={fill("leg")} />
          <rect x={x} y="25" width="24" height="29" fill={fill("grain")} />
          <path className="bench-leg-side" d={`M${x + 24} 25 L${x + 27} 24 V52 L${x + 24} 54 Z`} />
        </g>
      ))}
      <path d="M12 4 H148 L156 11 H4 Z" fill={fill("top")} />
      <rect x="4" y="11" width="152" height="14" rx="1.5" fill={fill("front")} />
      <path d="M12 4 H148 L156 11 H4 Z M4 11 H156 V25 H4 Z" fill={fill("grain")} />
      <path className="bench-edge" d="M5.5 11.4 H154.5" />
      <ellipse className="bench-gloss" cx="114" cy="7.6" rx="28" ry="1.7" />
    </svg>
  );
}

/** The muffins Hoàng brought, in their open box: paper cups and domed tops catching the afternoon. */
export function CakeBoxSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  const fill = (name: string) => `url(#${id}-${name})`;
  return (
    <svg className={svg("cakebox-sprite", className)} {...rest} viewBox="0 0 84 48" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-box`} x2="0" y2="1">{stops([[0, "cakebox-hi"], [1, "cakebox-lo"]])}</linearGradient>
        <linearGradient id={`${id}-cup`}>{stops([[0, "cake-cup-lo"], [0.62, "cake-cup-hi"], [1, "cake-cup-lo"]])}</linearGradient>
        <radialGradient id={`${id}-top`} cx="0.64" cy="0.2" r="0.9">{stops([[0, "cake-top-hi"], [0.45, "cake-top-mid"], [1, "cake-top-lo"]])}</radialGradient>
        <radialGradient id={`${id}-shadow`}>{shadowStops}</radialGradient>
      </defs>
      <ellipse cx="40" cy="45" rx="43" ry="3.4" fill={fill("shadow")} />
      <path className="cakebox-inside" d="M7 30 L13 22 H71 L77 30 Z" />
      {[14, 46].map((x) => (
        <g key={x}>
          <path className="cake-cup" d={`M${x} 25 H${x + 24} L${x + 21} 37 H${x + 3} Z`} fill={fill("cup")} />
          <path className="cake-pleats" d={`M${x + 4} 26 L${x + 5.5} 36 M${x + 8.5} 26 L${x + 9.2} 36 M${x + 12} 26 V36 M${x + 15.5} 26 L${x + 14.8} 36 M${x + 20} 26 L${x + 18.5} 36`} />
          <path className="cake-top" d={`M${x - 2} 26.5 C${x - 3} 10 ${x + 27} 10 ${x + 26} 26.5 C${x + 18} 28.6 ${x + 6} 28.6 ${x - 2} 26.5 Z`} fill={fill("top")} />
        </g>
      ))}
      <path className="cake-chip" d="M19 19.5 a1.6 1.4 0 1 0 0.01 0 Z M27 16 a1.4 1.2 0 1 0 0.01 0 Z M31.5 21 a1.5 1.3 0 1 0 0.01 0 Z M52 18.5 a1.5 1.3 0 1 0 0.01 0 Z M59.5 15.6 a1.3 1.1 0 1 0 0.01 0 Z M64 21 a1.4 1.2 0 1 0 0.01 0 Z" />
      <path className="cake-sugar" d="M25 13.6 h0.01 M33.4 16.4 h0.01 M57.6 13.4 h0.01 M65.4 16.6 h0.01" />
      <path className="cakebox-tray" d="M4 30 H80 L75 44 H9 Z" fill={fill("box")} />
      <path className="cakebox-edge" d="M5 30.4 H79" />
      <rect className="cakebox-sticker" x="34" y="34.6" width="16" height="5" rx="2.5" />
    </svg>
  );
}

/** A tall cup of fruit tea: peach tea over ice and a slice of orange, a red straw, the shop's label with the date. */
export function FruitTeaSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  const fill = (name: string) => `url(#${id}-${name})`;
  return (
    <svg className={svg("tea-sprite", className)} {...rest} viewBox="0 0 36 70" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-drink`} x2="0" y2="1">{stops([[0, "tea-drink-hi"], [1, "tea-drink-lo"]])}</linearGradient>
        <radialGradient id={`${id}-shadow`}>{shadowStops}</radialGradient>
      </defs>
      <ellipse cx="18" cy="67.5" rx="16" ry="2.6" fill={fill("shadow")} />
      <path className="tea-cup" d="M3 16 H33 L29 66 H7 Z" />
      <path className="tea-drink" d="M4.6 25 H31.4 L28.9 64.4 H7.1 Z" fill={fill("drink")} />
      <circle className="tea-fruit" cx="12" cy="42" r="5" />
      <path className="tea-fruit-segments" d="M12 37.6 V46.4 M7.6 42 H16.4 M8.9 38.9 L15.1 45.1 M15.1 38.9 L8.9 45.1" />
      <circle className="tea-fruit is-pale" cx="24" cy="56" r="3.6" />
      <rect className="tea-ice" x="15" y="27.5" width="7" height="6" rx="1.4" transform="rotate(-12 18.5 30.5)" />
      <rect className="tea-ice" x="21.5" y="33" width="6" height="5" rx="1.2" transform="rotate(14 24.5 35.5)" />
      <ellipse className="tea-surface" cx="18" cy="25" rx="13.4" ry="1.5" />
      <rect className="tea-label" x="9" y="47" width="18" height="9" rx="1.5" />
      <path className="tea-gloss" d="M6.4 20 L9.4 61" />
      <path className="tea-gloss is-small" d="M28.4 22 L26.8 40" />
      <path className="tea-dew" d="M11 30 h0.01 M23 59 h0.01 M14.5 61 h0.01 M26.4 45 h0.01 M8.6 35 h0.01" />
      <ellipse className="tea-lid" cx="18" cy="16" rx="15" ry="4" />
      <path className="tea-lid-shine" d="M7 14.6 C12 13 24 13 29 14.6" />
      <path className="tea-straw" d="M22 2 L19 24" />
      <path className="tea-straw-shine" d="M21.4 3.6 L19.9 15" />
    </svg>
  );
}

const parasol = "M6 36 C14 22 36 13 60 12 C84 13 106 22 114 36 Z";

/** The old lady's tea stall beside the bench: a striped parasol over a little table of jars, a thermos and two glasses of
    tea, with plastic stools tucked beside it. */
export function StallSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  const fill = (name: string) => `url(#${id}-${name})`;
  return (
    <svg className={svg("stall-sprite", className)} {...rest} viewBox="0 0 120 104" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-dome`}>{stops([[0, "stall-dome-shade"], [0.55, "stall-dome-clear"], [1, "stall-dome-light"]])}</linearGradient>
        <linearGradient id={`${id}-thermos`}>{stops([[0, "stall-thermos-lo"], [0.64, "stall-thermos-hi"], [1, "stall-thermos-lo"]])}</linearGradient>
        <linearGradient id={`${id}-wood`} x2="0" y2="1">{stops([[0, "stall-wood-hi"], [1, "stall-wood-lo"]])}</linearGradient>
        <radialGradient id={`${id}-shadow`}>{shadowStops}</radialGradient>
      </defs>
      <ellipse cx="56" cy="100" rx="58" ry="4.2" fill={fill("shadow")} />
      <path className="stall-pole" d="M60 12 V98" />
      <path className="stall-stool is-red" d="M5 84 H22 V87.4 H5 Z M6.6 87.4 L8.6 98 H10.8 L9.8 87.4 Z M20.4 87.4 L18.4 98 H16.2 L17.2 87.4 Z" />
      <path className="stall-stool is-blue" d="M99 86 H115 V89.2 H99 Z M100.5 89.2 L102.3 98 H104.2 L103.2 89.2 Z M113.5 89.2 L111.7 98 H109.8 L110.8 89.2 Z" />
      <path className="stall-leg" d="M28 76 V98 M92 76 V98" />
      <path className="stall-table-top" d="M26 64 H94 L98 69 H22 Z" />
      <rect x="22" y="69" width="76" height="7" rx="1" fill={fill("wood")} />
      <rect className="stall-jar" x="29" y="51" width="11" height="13" rx="2" />
      <path className="stall-candy is-pink" d="M33 60 a2 2 0 1 0 0.01 0 Z M36.4 55.6 a1.7 1.7 0 1 0 0.01 0 Z" />
      <path className="stall-candy is-gold" d="M37 59 a1.8 1.8 0 1 0 0.01 0 Z M31.6 55 a1.5 1.5 0 1 0 0.01 0 Z" />
      <rect className="stall-jar-lid" x="29.5" y="48.6" width="10" height="3" rx="1" />
      <rect className="stall-jar" x="44" y="54" width="10" height="10" rx="2" />
      <path className="stall-candy is-green" d="M47 59.8 a1.8 1.8 0 1 0 0.01 0 Z M51 58.6 a1.6 1.6 0 1 0 0.01 0 Z" />
      <rect className="stall-jar-lid" x="44.5" y="51.6" width="9" height="3" rx="1" />
      <path className="stall-jar-shine" d="M31 53 V62 M45.8 56 V62" />
      <rect x="61" y="40" width="9" height="24" rx="2.5" fill={fill("thermos")} />
      <rect className="stall-thermos-cap" x="61.5" y="37" width="8" height="4.2" rx="1.6" />
      <path className="stall-thermos-handle" d="M70 44 C74.4 44 74.4 52 70 52" />
      <path className="stall-glass" d="M76 56 H82 L81.2 64 H76.8 Z M85 56 H91 L90.2 64 H85.8 Z" />
      <path className="stall-tea" d="M76.4 59 H81.6 L81.2 64 H76.8 Z M85.4 59.6 H90.6 L90.2 64 H85.8 Z" />
      {/* The parasol, sunlit on its right, its striped panels meeting at the top. */}
      <path className="stall-canopy" d={parasol} />
      <path className="stall-stripe" d="M6 36 C14 22 36 13 60 12 C44 15 30 24 24 36 Z M42 36 C45 26 52 16 60 12 V36 Z M78 36 C75 26 68 16 60 12 C76 15 90 24 96 36 Z" />
      <path d={parasol} fill={fill("dome")} />
      <path className="stall-under" d="M6 36 C30 42.5 90 42.5 114 36 C90 39.5 30 39.5 6 36 Z" />
      <path className="stall-seams" d="M60 12 C44 15 30 24 24 36 M60 12 C52 16 45 26 42 36 M60 12 V36 M60 12 C68 16 75 26 78 36 M60 12 C76 15 90 24 96 36" />
      <circle className="stall-finial" cx="60" cy="10.6" r="2" />
    </svg>
  );
}

const carBody = "M12 60 C10 52 16 47 28 45 L68 39 C80 25 94 18 114 17 H166 C184 17 198 25 210 37 L226 42 C233 44 236 50 236 58 V65 C236 70 233 72 228 72 H207 A21 21 0 0 0 165 72 H75 A21 21 0 0 0 33 72 H18 C14 72 12 70 12 66 Z";
const carWindows = "M80 39 C90 27 100 22 116 22 H137 V39 Z M142 22 H164 C177 22 188 28 197 37 L142 39 Z";
const carSpokes = (cx: number) => Array.from({ length: 5 }, (_, i) => {
  const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
  return `M${point(cx, 72, 3.6, angle)} L${point(cx, 72, 9.2, angle)}`;
}).join(" ");

/** The red car they sat in, side on and facing into the scene: its paint holds the afternoon sky above a dark horizon
    line, and a sheen runs along it with the reader's scroll (--sheen-x, written by data-sheen). */
export function RedCarSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  const fill = (name: string) => `url(#${id}-${name})`;
  return (
    <svg className={svg("car-sprite", className)} {...rest} viewBox="0 0 240 96" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-paint`} x2="0" y2="1">{stops([[0, "car-paint-sky"], [0.4, "car-paint-hi"], [0.5, "car-paint-horizon"], [0.535, "car-paint-ground"], [0.78, "car-paint"], [1, "car-paint-lo"]])}</linearGradient>
        <linearGradient id={`${id}-glass`} x2="0" y2="1">{stops([[0, "car-glass-sky"], [0.55, "car-glass"], [1, "car-glass-lo"]])}</linearGradient>
        <radialGradient id={`${id}-rim`} cx="0.4" cy="0.34">{stops([[0, "car-rim-hi"], [1, "car-rim-lo"]])}</radialGradient>
        <radialGradient id={`${id}-tyre`}>{stops([[0.6, "car-tyre-hi"], [1, "car-tyre"]])}</radialGradient>
        <linearGradient id={`${id}-sheen`}>{stops([[0, "car-sheen-edge"], [0.5, "car-sheen-core"], [1, "car-sheen-edge"]])}</linearGradient>
        <radialGradient id={`${id}-shadow`}>{shadowStops}</radialGradient>
        <clipPath id={`${id}-body`}><path d={carBody} /></clipPath>
      </defs>
      <ellipse cx="124" cy="88" rx="120" ry="6.6" fill={fill("shadow")} />
      <circle className="car-well" cx="54" cy="72" r="19" />
      <circle className="car-well" cx="186" cy="72" r="19" />
      <path d={carBody} fill={fill("paint")} />
      <g clipPath={`url(#${id}-body)`}>
        <rect className="car-sheen" x="-34" y="0" width="34" height="96" fill={fill("sheen")} />
        <path className="car-sill" d="M30 66.5 H240 V76 H30 Z" />
      </g>
      <path d={carWindows} fill={fill("glass")} />
      <path className="car-glass-streak" d="M106 22 L94 39 H101 L113 22 Z M151 22 L142 34 V39 L156 22 Z" />
      <path className="car-trim" d={carWindows} />
      <path className="car-seam" d="M139.5 41 V67 M77 43 C75 52 75 60 77 66 M200 40 C202 50 202 58 200 64 M16 62 H30" />
      <path className="car-handle" d="M121 47 H129 M183 46 H191" />
      <path className="car-shine" d="M30 47.2 C80 42.6 160 42.6 222 46.2" />
      <path d="M76 40 C72 35.5 66 35.5 63.6 38.6 C63.6 41.6 70 42.6 76 42.6 Z" fill={fill("paint")} />
      <path className="car-light" d="M14 50 C18 47 26 46 32 46 C30 50 26 53 18 54 C15 54 13.5 52.5 14 50 Z" />
      <path className="car-tail" d="M226 44 C231 45 234 48 235 52 L229 52 C228 49 227 46 226 44 Z" />
      {[54, 186].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="72" r="16" fill={fill("tyre")} />
          <circle cx={cx} cy="72" r="10" fill={fill("rim")} />
          <path className="car-spokes" d={carSpokes(cx)} />
          <circle className="car-hub" cx={cx} cy="72" r="2.6" />
        </g>
      ))}
    </svg>
  );
}

/** Where a window catches the low sun on the office's glass: [column, floor]. */
const towerGlints: Array<[number, number]> = [[3, 3], [4, 4], [5, 2], [2, 6], [5, 7], [4, 9], [3, 11], [5, 12]];

/** Ngọc's office in Hoàng Mai: a glass tower in its own shade, its sunward side warm and a few of its windows holding
    the sun. The facade is cropped, never stretched, as the card changes shape. */
export function OfficeTowerSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  const fill = (name: string) => `url(#${id}-${name})`;
  return (
    <svg className={svg("tower-sprite", className)} {...rest} viewBox="0 0 200 400" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
      <defs>
        <pattern id={`${id}-floors`} width="25" height="26" patternUnits="userSpaceOnUse" y="6">
          <rect className="tower-glass" x="2" y="0" width="21" height="18" />
          <rect className="tower-spandrel" x="0" y="18" width="25" height="8" />
        </pattern>
        <pattern id={`${id}-side-floors`} width="9.5" height="26" patternUnits="userSpaceOnUse" y="6">
          <rect className="tower-side-glass" x="1.5" y="0" width="6.5" height="18" />
        </pattern>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="1" y2="1">{stops([[0, "tower-sky-dim"], [0.42, "tower-sky-gold"], [0.6, "tower-sky-dim"], [1, "tower-sky-dark"]])}</linearGradient>
        <linearGradient id={`${id}-side`} x2="0" y2="1">{stops([[0, "tower-side-hi"], [1, "tower-side-lo"]])}</linearGradient>
        <linearGradient id={`${id}-haze`} x2="0" y2="1">{stops([[0.5, "tower-haze-clear"], [1, "tower-haze"]])}</linearGradient>
      </defs>
      <rect className="tower-front" x="0" y="0" width="150" height="400" />
      <rect x="0" y="6" width="150" height="358" fill={fill("floors")} />
      <path className="tower-glint" d={towerGlints.map(([column, floor]) => `M${column * 25 + 2} ${6 + floor * 26} h21 v18 h-21 Z`).join(" ")} />
      <rect x="0" y="0" width="150" height="400" fill={fill("sky")} />
      <path d="M150 0 L188 14 V400 H150 Z" fill={fill("side")} />
      <path d="M150 6 L188 20 V364 H150 Z" fill={fill("side-floors")} />
      <path className="tower-edge" d="M150.5 0 V364" />
      <rect className="tower-lobby" x="0" y="364" width="150" height="36" />
      <path className="tower-lobby-light" d="M10 372 h24 v28 h-24 Z M44 372 h24 v28 h-24 Z M82 372 h24 v28 h-24 Z M116 372 h24 v28 h-24 Z" />
      <rect className="tower-canopy" x="0" y="360" width="160" height="5" />
      <rect x="0" y="0" width="200" height="400" fill={fill("haze")} />
    </svg>
  );
}

/** A far row of rooftops for the haze on the horizon, a few windows lit. */
export function FarRowSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("farrow-sprite", className)} {...rest} viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">
      <path className="farrow-blocks" d="M0 100 V46 H22 V30 H48 V52 H60 V20 H84 V40 H102 V58 H118 V26 H140 V44 H158 V14 H176 V36 H196 V50 H214 V28 H240 V42 H252 V18 H272 V48 H290 V34 H312 V56 H326 V24 H348 V40 H366 V30 H386 V50 H400 V100 Z" />
      <path className="farrow-windows" d="M28 40 h3 M38 46 h3 M66 30 h3 M72 38 h3 M124 36 h3 M130 52 h3 M162 24 h3 M166 32 h3 M220 38 h3 M230 50 h3 M258 28 h3 M262 40 h3 M332 34 h3 M340 46 h3 M372 40 h3" />
    </svg>
  );
}

/** Bảo tàng Hồ Chí Minh in the morning sun: a white hall whose upper storey reaches out over the lower on rows of fins,
    under a crown of arches that opens like a lotus, at the top of broad steps. Lit from the upper right. */
export function MuseumSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  const fill = (name: string) => `url(#${id}-${name})`;
  const steps: Array<[from: number, to: number, y: number]> = [[62, 198, 104], [52, 208, 112], [42, 218, 120], [32, 228, 128], [22, 238, 136]];
  return (
    <svg className={svg("museum-sprite", className)} {...rest} viewBox="0 0 260 150" aria-hidden="true">
      <defs>
        <pattern id={`${id}-fins`} width="9" height="40" patternUnits="userSpaceOnUse" x="42">
          <rect className="museum-fin-shade" x="0" y="0" width="3.2" height="40" />
          <rect className="museum-fin-light" x="3.2" y="0" width="1.3" height="40" />
        </pattern>
        <linearGradient id={`${id}-upper`} x2="0" y2="1">{stops([[0, "museum-wall-hi"], [1, "museum-wall"]])}</linearGradient>
        <linearGradient id={`${id}-lower`} x2="0" y2="1">{stops([[0, "museum-shade-deep"], [0.4, "museum-shade"], [1, "museum-shade-lit"]])}</linearGradient>
        <linearGradient id={`${id}-crown`} x2="0" y2="1">{stops([[0, "museum-crown-hi"], [1, "museum-crown-lo"]])}</linearGradient>
        <linearGradient id={`${id}-riser`} x2="0" y2="1">{stops([[0, "museum-riser-hi"], [1, "museum-riser-lo"]])}</linearGradient>
        <radialGradient id={`${id}-shadow`}>{shadowStops}</radialGradient>
      </defs>
      <ellipse cx="132" cy="146" rx="122" ry="5" fill={fill("shadow")} />
      {/* The ground floor, set back in the shade of the storey above. */}
      <rect x="66" y="66" width="128" height="38" fill={fill("lower")} />
      <path className="museum-glass" d="M80 72 h10 v32 h-10 Z M100 72 h12 v32 h-12 Z M148 72 h12 v32 h-12 Z M170 72 h10 v32 h-10 Z" />
      <rect className="museum-door" x="118" y="74" width="24" height="30" rx="1" />
      <path className="museum-door-light" d="M121 78 h8 v26 h-8 Z M131 78 h8 v26 h-8 Z" />
      <path className="museum-pillar" d="M70 70 h6 v34 h-6 Z M92 70 h6 v34 h-6 Z M113 70 h4 v34 h-4 Z M143 70 h4 v34 h-4 Z M162 70 h6 v34 h-6 Z M184 70 h6 v34 h-6 Z" />
      <path className="museum-pillar-lit" d="M74.6 70 h1.4 v34 h-1.4 Z M96.6 70 h1.4 v34 h-1.4 Z M166.6 70 h1.4 v34 h-1.4 Z M188.6 70 h1.4 v34 h-1.4 Z" />
      {/* The upper storey: a white face ribbed with fins, its sunward end catching the light. */}
      <rect x="40" y="28" width="180" height="38" fill={fill("upper")} />
      <rect x="42" y="30" width="176" height="27" fill={fill("fins")} />
      <path className="museum-letters" d="M78 60.5 H182" />
      <path className="museum-side" d="M220 28 L230 32 V69 L220 66 Z" />
      <path className="museum-soffit" d="M40 66 H220 L216 70 H44 Z" />
      <path className="museum-cornice" d="M38 26.5 H222 V29 H38 Z" />
      {/* The crown of arches, like petals opening. */}
      <path d="M40 27 C40 16 58 16 58 27 C58 16 76 16 76 27 C76 16 94 16 94 27 C94 16 112 16 112 27 C112 16 130 16 130 27 C130 16 148 16 148 27 C148 16 166 16 166 27 C166 16 184 16 184 27 C184 16 202 16 202 27 C202 16 220 16 220 27 Z" fill={fill("crown")} />
      <path className="museum-arches" d="M42.5 27 C43 19.5 55 19.5 55.5 27 M60.5 27 C61 19.5 73 19.5 73.5 27 M78.5 27 C79 19.5 91 19.5 91.5 27 M96.5 27 C97 19.5 109 19.5 109.5 27 M114.5 27 C115 19.5 127 19.5 127.5 27 M132.5 27 C133 19.5 145 19.5 145.5 27 M150.5 27 C151 19.5 163 19.5 163.5 27 M168.5 27 C169 19.5 181 19.5 181.5 27 M186.5 27 C187 19.5 199 19.5 199.5 27 M204.5 27 C205 19.5 217 19.5 217.5 27" />
      {steps.map(([from, to, y]) => (
        <g key={y}>
          <rect className="museum-tread" x={from} y={y} width={to - from} height="2.2" />
          <rect x={from} y={y + 2.2} width={to - from} height="5.8" fill={fill("riser")} />
        </g>
      ))}
    </svg>
  );
}

/** A flag on its pole, red with a gold star, its cloth falling into folds as it waves. */
export function FlagSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  const cloth = "M9 10 C22 6 34 14 56 10 V42 C34 46 22 38 9 42 Z";
  return (
    <svg className={svg("flag-sprite", className)} {...rest} viewBox="0 0 60 120" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-pole`}>{stops([[0, "flag-pole-lo"], [0.6, "flag-pole-hi"], [1, "flag-pole-lo"]])}</linearGradient>
        <linearGradient id={`${id}-folds`}>{stops([[0, "flag-fold-clear"], [0.22, "flag-fold-shade"], [0.4, "flag-fold-clear"], [0.58, "flag-fold-light"], [0.78, "flag-fold-shade"], [1, "flag-fold-clear"]])}</linearGradient>
      </defs>
      <rect x="6.6" y="6" width="2.8" height="112" fill={`url(#${id}-pole)`} />
      <circle className="flag-finial" cx="8" cy="5" r="3" />
      <g className="flag-wave">
        <path className="flag-cloth" d={cloth} />
        <path className="flag-star" d="M32 17 L34.4 23.6 L41.4 23.8 L35.9 28.1 L37.9 34.8 L32 30.9 L26.1 34.8 L28.1 28.1 L22.6 23.8 L29.6 23.6 Z" />
        <path d={cloth} fill={`url(#${id}-folds)`} />
      </g>
    </svg>
  );
}

/* The tree's leaf masses: the whole crown, the shade gathering under it, the patches the light finds, a few leaves. */
const treeCrown = foliage(50, 42, 44, 33, 26, 1);
const treeShade = [foliage(34, 57, 25, 13, 13, 2), foliage(68, 61, 19, 10, 11, 3)].join(" ");
const treeLight = [foliage(60, 27, 25, 14, 15, 4), foliage(32, 33, 15, 9, 10, 5), foliage(81, 45, 12, 9, 9, 6)].join(" ");

/** A broad-crowned tree: one leafy mass lit from the upper right, its top edge caught by the light, shade pooling beneath,
    on a trunk that forks. */
export function TreeSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  const fill = (name: string) => `url(#${id}-${name})`;
  return (
    <svg className={svg("tree-sprite", className)} {...rest} viewBox="0 0 100 120" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-crown`} cx="0.66" cy="0.2" r="0.95">{stops([[0, "tree-leaf-hi"], [0.44, "tree-leaf"], [1, "tree-leaf-lo"]])}</radialGradient>
        <radialGradient id={`${id}-light`} cx="0.66" cy="0.22" r="0.8">{stops([[0, "tree-glow"], [1, "tree-glow-edge"]])}</radialGradient>
        <linearGradient id={`${id}-shade`} x2="0" y2="1">{stops([[0, "tree-shade-clear"], [0.7, "tree-shade"]])}</linearGradient>
        <linearGradient id={`${id}-rim`} x1="0.7" y1="0" x2="0.45" y2="0.62">{stops([[0, "tree-rim-light"], [1, "tree-rim-fade"]])}</linearGradient>
        <linearGradient id={`${id}-bark`}>{stops([[0, "tree-bark-lo"], [0.72, "tree-bark-hi"], [1, "tree-bark-lo"]])}</linearGradient>
        <radialGradient id={`${id}-shadow`}>{shadowStops}</radialGradient>
      </defs>
      <ellipse cx="52" cy="117" rx="38" ry="3.8" fill={fill("shadow")} />
      <path d="M46 118 C48 104 48 92 46 84 C42 78 38 74 33 70 L37 67 C42 71 46 74 49 78 C50 74 51 70 52 64 H56 C55 70 54 76 53 81 C56 76 60 72 65 68 L68 71 C62 76 57 82 55 88 C53 98 53 108 55 118 Z" fill={fill("bark")} />
      <path d={treeCrown} fill={fill("crown")} />
      <path d={treeShade} fill={fill("shade")} />
      <path d={treeLight} fill={fill("light")} />
      <path className="tree-rim" d={treeCrown} stroke={fill("rim")} />
    </svg>
  );
}

const treelineCrowns = Array.from({ length: 14 }, (_, i) => foliage(i * 30 + 6, 40 - ((i * 7) % 5) * 3.4, 21 + ((i * 5) % 4) * 3, 17 + ((i * 3) % 4) * 2.4, 15, i * 1.7)).join(" ");

/** A wooded horizon: the crowns of far trees, paler where the light catches them, hazy at their feet. */
export function TreelineSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  return (
    <svg className={svg("treeline-sprite", className)} {...rest} viewBox="0 0 400 80" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-crowns`} x2="0" y2="1">{stops([[0.15, "treeline-hi"], [0.55, "treeline"], [1, "treeline-lo"]])}</linearGradient>
      </defs>
      <path d={`${treelineCrowns} M0 36 H400 V80 H0 Z`} fill={`url(#${id}-crowns)`} />
    </svg>
  );
}

/* The duvet's far edge, and its near edge where it rounds over and falls to the floor. */
const duvetTop = "M0 40 C0 24 10 16 26 15 C60 13 90 20 130 20 C175 20 205 10 250 11 C300 12 330 20 400 16";
const duvetEdge = "M0 54 C0 42 8 37 22 37 C60 36 96 40 136 40 C180 40 210 32 254 33 C304 34 334 40 400 36";
const duvetTopSurface = `${duvetTop} V36 C334 40 304 34 254 33 C210 32 180 40 136 40 C96 40 60 36 22 37 C8 37 0 42 0 54 Z`;
/* Where it falls, it hangs in soft troughs and ridges. */
const duvetFolds = ["M112 40 C122 60 114 80 120 100 H150 C142 80 150 60 142 40 Z", "M222 33 C234 56 224 78 230 100 H256 C250 78 258 56 250 33 Z", "M322 37 C330 58 322 80 328 100 H350 C344 80 352 58 344 37 Z"];
const duvetCrests = ["M48 36 C58 58 50 80 56 100 H80 C72 80 80 58 72 36 Z", "M172 39 C182 60 174 80 180 100 H202 C194 80 204 60 196 38 Z", "M280 34 C290 56 282 80 286 100 H306 C300 80 308 56 302 34 Z"];
/* Two plump pillows, the stuffing pulling their sides in and their corners out into soft ears. */
const pillows = ["M158 2 C190 -6 236 -7 266 0 C262 8 263 16 270 24 C238 30 190 30 156 25 C161 17 162 9 158 2 Z", "M186 10 C218 2 264 1 294 8 C290 16 291 24 298 32 C266 38 218 38 184 33 C189 25 190 17 186 10 Z"];

/** The homestay's bed, side on: a quilted red duvet in soft ridges with the screen's light along its top, and two pillows
    at its head. Cloth may stretch, so the drawing stretches with the card. */
export function BedSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  const fill = (name: string) => `url(#${id}-${name})`;
  return (
    <svg className={svg("bed-sprite", className)} {...rest} viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-top`} x2="0" y2="1">{stops([[0, "duvet-top-hi"], [1, "duvet-top"]])}</linearGradient>
        <linearGradient id={`${id}-duvet`} x2="0" y2="1">{stops([[0, "duvet-hi"], [0.32, "duvet"], [1, "duvet-lo"]])}</linearGradient>
        <linearGradient id={`${id}-rim`}>{stops([[0, "duvet-rim-hi"], [0.7, "duvet-rim-lo"], [1, "duvet-rim-end"]])}</linearGradient>
        <linearGradient id={`${id}-fold`}>{stops([[0, "duvet-fold-clear"], [0.5, "duvet-fold"], [1, "duvet-fold-clear"]])}</linearGradient>
        <linearGradient id={`${id}-crest`}>{stops([[0, "duvet-crest-clear"], [0.5, "duvet-crest"], [1, "duvet-crest-clear"]])}</linearGradient>
        <radialGradient id={`${id}-pillow`} cx="0.3" cy="0.2" r="0.9">{stops([[0, "pillow-hi"], [0.46, "pillow"], [1, "pillow-lo"]])}</radialGradient>
        <linearGradient id={`${id}-pillow-shade`} x2="0" y2="1">{stops([[0.4, "pillow-shade-clear"], [1, "pillow-shade"]])}</linearGradient>
      </defs>
      <path d={`${duvetEdge} V100 H0 Z`} fill={fill("duvet")} />
      {duvetFolds.map((d) => <path key={d} d={d} fill={fill("fold")} />)}
      {duvetCrests.map((d) => <path key={d} d={d} fill={fill("crest")} />)}
      <path className="duvet-stitch" d="M6 66 C90 62 170 64 250 58 C310 54 352 58 400 55 M4 86 C90 82 180 84 260 79 C320 75 360 79 400 76" />
      <path d={duvetTopSurface} fill={fill("top")} />
      <path className="duvet-stitch" d="M24 27 C70 26 100 30 136 30 C180 30 210 22 254 22 C304 23 334 29 380 27" />
      <path className="duvet-edge" d={duvetEdge} />
      <path className="duvet-rim" d={duvetTop} stroke={fill("rim")} />
      <ellipse className="pillow-shadow" cx="227" cy="27" rx="72" ry="8" />
      {pillows.map((d) => (
        <g key={d}>
          <path d={d} fill={fill("pillow")} />
          <path d={d} fill={fill("pillow-shade")} />
        </g>
      ))}
      <path className="pillow-crease" d="M161 5 C168 8 172 9 177 9 M263 3 C257 6 252 7 247 7 M189 13 C196 16 200 17 205 17 M291 11 C285 14 280 15 275 15 M295 29 C288 27 283 27 278 28 M187 30 C194 28 198 28 203 29" />
      <path className="pillow-seam" d="M166 3 C194 -3 234 -4 259 1 M194 11 C222 5 262 4 287 9" />
    </svg>
  );
}

const cumulus = "M22 72 C8 72 4 58 16 53 C12 40 26 31 38 38 C42 22 62 15 74 26 C82 10 110 8 120 24 C130 14 152 16 156 32 C170 28 186 40 182 54 C194 58 192 72 178 72 Z";

/** A fair-weather cloud: a heap of rounded puffs, sunlit on top and blue-grey underneath. */
export function CumulusSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  return (
    <svg className={svg("cumulus-sprite", className)} {...rest} viewBox="0 0 200 80" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-body`} x2="0" y2="1">{stops([[0.2, "cumulus-hi"], [0.66, "cumulus"], [1, "cumulus-lo"]])}</linearGradient>
      </defs>
      <path d={cumulus} fill={`url(#${id}-body)`} />
      <path className="cumulus-rim" d="M16 53 C12 40 26 31 38 38 C42 22 62 15 74 26 C82 10 110 8 120 24 C130 14 152 16 156 32 C170 28 186 40 182 54" />
    </svg>
  );
}

const plazaRows = [0, 5, 11, 18, 27, 38, 52, 70, 92];
const plazaJoints = [
  ...plazaRows.map((y) => `M0 ${y} H400`),
  // The joints toward the hall all run to one vanishing point above the plaza.
  ...Array.from({ length: 15 }, (_, i) => {
    const near = -560 + i * 80;
    return `M${(200 + (near - 200) * (120 / 220)).toFixed(1)} 0 L${near} 100`;
  }),
].join(" ");

/** Paving in perspective, the joints closing up with distance toward one vanishing point, a pool of light across it. */
export function PlazaSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  return (
    <svg className={svg("plaza-sprite", className)} {...rest} viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-ground`} x2="0" y2="1">{stops([[0, "plaza-far"], [0.4, "plaza-mid"], [1, "plaza-near"]])}</linearGradient>
        <radialGradient id={`${id}-light`} cx="0.42" cy="0.18" r="0.62">{stops([[0, "plaza-light"], [1, "plaza-light-edge"]])}</radialGradient>
      </defs>
      <rect width="400" height="100" fill={`url(#${id}-ground)`} />
      <path className="plaza-joints" d={plazaJoints} />
      <rect width="400" height="100" fill={`url(#${id}-light)`} />
    </svg>
  );
}

/** Chùa Một Cột: one small hall under curling eaves, on a platform of brackets that fans out from a single stone pillar.
    The light comes from the upper left; the hall glows inside, where the offerings are. */
export function PagodaSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  const fill = (name: string) => `url(#${id}-${name})`;
  return (
    <svg className={svg("pagoda-sprite", className)} {...rest} viewBox="0 0 140 160" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-roof`} x2="0" y2="1">{stops([[0, "pagoda-roof-hi"], [1, "pagoda-roof-lo"]])}</linearGradient>
        <linearGradient id={`${id}-wall`}>{stops([[0, "pagoda-wall-hi"], [1, "pagoda-wall-lo"]])}</linearGradient>
        <linearGradient id={`${id}-pillar`}>{stops([[0, "pagoda-pillar-hi"], [0.36, "pagoda-pillar"], [1, "pagoda-pillar-lo"]])}</linearGradient>
        <linearGradient id={`${id}-glow`} x2="0" y2="1">{stops([[0, "pagoda-glow-hi"], [1, "pagoda-glow-lo"]])}</linearGradient>
      </defs>
      <path className="pagoda-ornament" d="M58 16.5 C60 11 64 10 66.4 12.6 M82 16.5 C80 11 76 10 73.6 12.6" />
      <circle className="pagoda-pearl" cx="70" cy="10" r="3.2" />
      <path d="M44 18 C40 28 28 38 10 42 C6 42.6 4 40 2 36 C6 44 14 48 26 48 H114 C126 48 134 44 138 36 C136 40 134 42.6 130 42 C112 38 100 28 96 18 Z" fill={fill("roof")} />
      <path className="pagoda-tiles" d="M52 19 C49 30 42 40 32 46 M60 18.4 C58 30 54 40 48 47 M70 18 V48 M80 18.4 C82 30 86 40 92 47 M88 19 C91 30 98 40 108 46" />
      <path className="pagoda-ridge" d="M44 18 C56 15 84 15 96 18 M44 18 C40 14 36 12 32 13 M96 18 C100 14 104 12 108 13" />
      <path className="pagoda-eave" d="M3 37 C7 44.5 15 48 26 48 H114 C125 48 133 44.5 137 37" />
      <path className="pagoda-soffit" d="M20 48 H120 L112 53 H28 Z" />
      <rect x="40" y="52" width="60" height="34" fill={fill("wall")} />
      <path d="M45 58 h12 v26 h-12 Z M62 58 h16 v26 h-16 Z M83 58 h12 v26 h-12 Z" fill={fill("glow")} />
      <path className="pagoda-lattice" d="M45 64.5 H57 M45 71 H57 M45 77.5 H57 M51 58 V84 M62 64.5 H78 M62 71 H78 M62 77.5 H78 M67.3 58 V84 M72.7 58 V84 M83 64.5 H95 M83 71 H95 M83 77.5 H95 M89 58 V84" />
      <path className="pagoda-post" d="M40 52 h4 v34 h-4 Z M96 52 h4 v34 h-4 Z M58.5 52 h3 v34 h-3 Z M78.5 52 h3 v34 h-3 Z" />
      <rect className="pagoda-eave-shadow" x="40" y="52" width="60" height="6" />
      <path className="pagoda-rail" d="M30 86 H110 V88.4 H30 Z M30 93 H110 V94.4 H30 Z" />
      <path className="pagoda-balusters" d="M34 88.4 V93 M42 88.4 V93 M50 88.4 V93 M58 88.4 V93 M66 88.4 V93 M74 88.4 V93 M82 88.4 V93 M90 88.4 V93 M98 88.4 V93 M106 88.4 V93" />
      <path className="pagoda-platform" d="M26 94.4 H114 L110 100.5 H30 Z" />
      <path className="pagoda-brackets" d="M70 118 L34 100.5 M70 118 L46 100.5 M70 118 L58 100.5 M70 118 L82 100.5 M70 118 L94 100.5 M70 118 L106 100.5 M42 104.5 H98" />
      <rect x="63" y="100.5" width="14" height="57.5" fill={fill("pillar")} />
      <rect className="pagoda-collar" x="61" y="111" width="18" height="3" rx="1" />
      <ellipse className="pagoda-ripple" cx="70" cy="158" rx="13" ry="2" />
    </svg>
  );
}

export function LotusSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  const lit = `url(#${id}-lit)`;
  const petals = {
    back: ["M24 30 C14 26 8 16 10 6 C18 10 22 18 24 30 Z", "M24 30 C34 26 40 16 38 6 C30 10 26 18 24 30 Z"],
    front: "M24 32 C16 28 14 16 24 2 C34 16 32 28 24 32 Z",
    side: ["M24 32 C12 32 4 26 2 18 C12 18 20 24 24 32 Z", "M24 32 C36 32 44 26 46 18 C36 18 28 24 24 32 Z"],
  };
  return (
    <svg className={svg("lotus-sprite", className)} {...rest} viewBox="0 0 48 36" aria-hidden="true">
      {/* Each petal pales toward its tip and deepens toward the heart of the flower, whatever pink it is inked. */}
      <defs>
        <linearGradient id={`${id}-lit`} x2="0" y2="1">{stops([[0, "lotus-tip"], [0.5, "lotus-mid"], [1, "lotus-base"]])}</linearGradient>
      </defs>
      {petals.back.map((d) => <g key={d}><path className="lotus-petal lotus-petal-back" d={d} /><path d={d} fill={lit} /></g>)}
      <path className="lotus-petal" d={petals.front} />
      <path d={petals.front} fill={lit} />
      <path className="lotus-vein" d="M24 6 C23 14 23 22 24 30" />
      {petals.side.map((d) => <g key={d}><path className="lotus-petal lotus-petal-side" d={d} /><path d={d} fill={lit} /></g>)}
    </svg>
  );
}

export function LotusPadSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  return (
    <svg className={svg("lotuspad-sprite", className)} {...rest} viewBox="0 0 60 26" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-leaf`} cx="0.46" cy="0.36" r="0.7">{stops([[0, "lotuspad-hi"], [0.62, "lotuspad-mid"], [1, "lotuspad-lo"]])}</radialGradient>
      </defs>
      <ellipse className="lotuspad-water" cx="30" cy="19.5" rx="30" ry="6.2" />
      <path className="lotuspad-leaf" d="M30 13 L52 6 C58 10 60 16 54 20 C44 26 16 26 6 20 C0 16 2 10 8 6 Z" fill={`url(#${id}-leaf)`} />
      <path className="lotuspad-vein" d="M30 13 L14 20 M30 13 L30 24 M30 13 L46 20 M30 13 L7 13 M30 13 L54 13" />
      <path className="lotuspad-rim" d="M8 6 C2 10 0 16 6 20 C16 26 44 26 54 20" />
    </svg>
  );
}

const prayerFlags = Array.from({ length: 11 }, (_, index) => {
  const x = 12 + index * 26;
  // The string sags in the middle, so each flag hangs from the curve at its own height.
  const y = 8 + Math.sin((index / 10) * Math.PI) * 14;
  return { x, y, tone: ["blue", "gold", "red", "white", "orange"][index % 5] };
});

/** The strings of Buddhist flags across the pagoda's sky, in their five colours, each pennant fluttering on its own. */
export function PrayerFlagsSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  return (
    <svg className={svg("flags-sprite", className)} {...rest} viewBox="0 0 300 48" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-cloth`} x2="0" y2="1">{stops([[0, "flags-light"], [0.45, "flags-clear"], [1, "flags-shade"]])}</linearGradient>
      </defs>
      <path className="flags-string" d="M0 4 C80 30 220 30 300 4" />
      {prayerFlags.map((flag) => {
        const d = `M${flag.x} ${flag.y} h14 v12 l-7 -3 l-7 3 z`;
        return (
          <g key={flag.x} className="flags-pennant">
            <path className={`flags-flag is-${flag.tone}`} d={d} />
            <path d={d} fill={`url(#${id}-cloth)`} />
          </g>
        );
      })}
    </svg>
  );
}

type Roof = "tank" | "flat" | "pitch" | "antenna";
/** The houses of the row, left to right: [width, height, what stands on the roof]. Their paints cycle through five. */
const houseRow: Array<[number, number, Roof]> = [
  [34, 132, "tank"], [28, 154, "flat"], [40, 116, "pitch"], [30, 148, "antenna"], [36, 126, "tank"], [26, 160, "flat"],
  [42, 112, "pitch"], [30, 142, "tank"], [36, 122, "flat"], [28, 152, "antenna"], [38, 130, "tank"], [32, 144, "flat"],
  [40, 118, "pitch"], [28, 156, "tank"], [36, 128, "antenna"], [30, 146, "flat"], [42, 120, "tank"], [24, 138, "pitch"],
];
const paints = ["a", "b", "c", "d", "e"];
const box = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}Z`;

/** The whole row as one path per material: each house floor by floor, its windows (some lit), sills, balconies and air
    conditioners, the shop on its ground floor with its light on the wet road, and what stands on its roof. Every choice
    follows from the house's place in the row, so the street is the same on every visit. */
const street = (() => {
  const paths: Record<string, string[]> = {};
  const add = (key: string, d: string) => (paths[key] ??= []).push(d);
  let x = 0;
  houseRow.forEach(([w, h, roof], i) => {
    const top = 200 - h;
    const paint = paints[i % paints.length];
    const wide = w >= 32;
    const pane = wide ? (w - 14) / 2 : w - 12;
    add(`house-${paint}`, box(x, top, w, h));
    add("shade", box(x + w - 3, top, 3, h));
    add("cornice", box(x - 0.5, top, w + 1, 2.4));
    for (let floor = 0; 170 - (floor + 1) * 22 >= top + 6; floor += 1) {
      const y = 170 - (floor + 1) * 22;
      (wide ? [x + 5, x + 9 + pane] : [x + 6]).forEach((left, column) => {
        add((i * 7 + floor * 3 + column) % 5 < 2 ? "lit" : "dark", box(left, y + 4, pane, 12));
        add("sill", box(left - 1, y + 16, pane + 2, 1.4));
      });
      if (i % 3 !== 1) {
        add("ledge", `${box(x - 1, y + 18, w + 2, 2)} ${box(x + 1, y + 12, w - 2, 0.9)}`);
        add("rail", box(x + 1, y + 12, w - 2, 6));
      }
      if ((i + floor) % 4 === 0) add("unit", box(x + w - 10, y + 9, 7, 5));
    }
    add("shop", box(x + 3, 176, w - 6, 24));
    add("shutter", box(x + 3, 176, w - 6, 3));
    add("goods", `${box(x + 6, 192, 6, 8)} ${box(x + w - 13, 190, 7, 10)}`);
    add(`awning-${paint}`, `M${x + 1} 171H${x + w - 1}L${x + w - 3} 177H${x + 3}Z`);
    add(`sign-${i % 4}`, box(x + 4, 163, w - 8, 6));
    add("reflection", box(x + 4, 202, w - 8, 30));
    if (roof === "tank") {
      add("tank", box(x + w * 0.5, top - 9, 11, 8));
      add("tank-shine", `M${x + w * 0.5 + 3} ${top - 8}v6`);
    }
    if (roof === "flat") add("parapet", box(x - 1, top - 2, w + 2, 3));
    if (roof === "pitch") add("roof", `M${x - 2} ${top + 1}L${x + w / 2} ${top - 12}L${x + w + 2} ${top + 1}Z`);
    if (roof === "antenna") add("antenna", `M${x + w * 0.3} ${top}v-16m-4 4h8m-7 4h6`);
    x += w;
  });
  return Object.fromEntries(Object.entries(paths).map(([key, list]) => [key, list.join(" ")]));
})();

/** Triệu Việt Vương in the rain: a row of narrow tube houses, their windows lit against the grey, shops open below with
    their light lying on the wet road, water tanks and aerials on the roofs and the street's cables sagging across.
    Cropped at the sides as the card narrows, never stretched; the sky above the roofs is spare, so the top may crop too. */
export function StreetRowSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  const fill = (name: string) => `url(#${id}-${name})`;
  return (
    <svg className={svg("street-sprite", className)} {...rest} viewBox="0 0 600 236" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-wet`} x2="0" y2="1">{stops([[0, "street-wet-top"], [0.62, "street-wet-mid"], [1, "street-wet-low"]])}</linearGradient>
        <linearGradient id={`${id}-shop`} x2="0" y2="1">{stops([[0, "street-shop-hi"], [1, "street-shop-lo"]])}</linearGradient>
        <linearGradient id={`${id}-road`} x2="0" y2="1">{stops([[0, "street-road-hi"], [1, "street-road-lo"]])}</linearGradient>
        <linearGradient id={`${id}-reflection`} x2="0" y2="1">{stops([[0, "street-reflection-hi"], [1, "street-reflection-lo"]])}</linearGradient>
        <pattern id={`${id}-rail`} width="3" height="6" patternUnits="userSpaceOnUse">
          <rect className="street-rail" width="0.8" height="6" />
        </pattern>
      </defs>
      {paints.map((paint) => <path key={paint} className={`street-house is-${paint}`} d={street[`house-${paint}`]} />)}
      <path className="street-shade" d={street.shade} />
      <path className="street-cornice" d={street.cornice} />
      <path className="street-window" d={street.dark} />
      <path className="street-window is-lit" d={street.lit} />
      <path className="street-sill" d={street.sill} />
      <path d={street.rail} fill={fill("rail")} />
      <path className="street-ledge" d={street.ledge} />
      <path className="street-unit" d={street.unit} />
      <path className="street-roof" d={`${street.roof} ${street.parapet}`} />
      <path className="street-tank" d={street.tank} />
      <path className="street-tank-shine" d={street["tank-shine"]} />
      <path className="street-antenna" d={street.antenna} />
      <path d={street.shop} fill={fill("shop")} />
      <path className="street-shutter" d={street.shutter} />
      <path className="street-goods" d={street.goods} />
      {paints.map((paint) => <path key={paint} className={`street-awning is-${paint}`} d={street[`awning-${paint}`]} />)}
      {[0, 1, 2, 3].map((tone) => <path key={tone} className={`street-sign is-${tone}`} d={street[`sign-${tone}`]} />)}
      <rect width="600" height="200" fill={fill("wet")} />
      <rect y="200" width="600" height="36" fill={fill("road")} />
      <path className="street-curb" d="M0 200.6H600" />
      <path d={street.reflection} fill={fill("reflection")} />
      <path className="street-cables" d="M0 66 Q150 88 300 72 T600 70 M0 76 Q170 96 330 82 T600 84 M0 60 Q140 74 280 64 T600 60" />
    </svg>
  );
}

/** A street lamp of the old quarter: a dark pole, a curved arm and a hooded lamp whose light falls in a cone to the road. */
export function StreetLampSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  const fill = (name: string) => `url(#${id}-${name})`;
  return (
    <svg className={svg("lamp-sprite", className)} {...rest} viewBox="0 0 60 200" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-pole`}>{stops([[0, "lamp-pole-lo"], [0.62, "lamp-pole-hi"], [1, "lamp-pole-lo"]])}</linearGradient>
        <linearGradient id={`${id}-cone`} x2="0" y2="1">{stops([[0, "lamp-cone-top"], [1, "lamp-cone-low"]])}</linearGradient>
        <radialGradient id={`${id}-halo`}>{stops([[0, "lamp-halo-core"], [0.35, "lamp-halo"], [1, "lamp-halo-edge"]])}</radialGradient>
        <radialGradient id={`${id}-pool`}>{stops([[0, "lamp-pool-core"], [1, "lamp-pool-edge"]])}</radialGradient>
      </defs>
      <path d="M42 21 H55 L84 200 H14 Z" fill={fill("cone")} />
      <ellipse cx="50" cy="199" rx="44" ry="6" fill={fill("pool")} />
      <rect x="12" y="38" width="4.4" height="156" fill={fill("pole")} />
      <path className="lamp-base" d="M9 186 H19.4 L21 200 H7.4 Z" />
      <path className="lamp-arm" d="M14.2 42 C14.2 26 22 18 36 18 H46" />
      <path className="lamp-head" d="M38 14.4 C44 11.6 54 12.6 58 17 C56 20.4 47 21.4 38 20.4 Z" />
      <ellipse className="lamp-lens" cx="48.6" cy="20.4" rx="7.4" ry="1.7" />
      <circle cx="48.6" cy="22" r="17" fill={fill("halo")} />
    </svg>
  );
}

/** The bowl of bún riêu from Triệu Việt Vương: a white bowl ringed in blue, red broth with tomato, tofu, crab and herbs,
    chopsticks across the rim. */
export function NoodleBowlSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  const fill = (name: string) => `url(#${id}-${name})`;
  return (
    <svg className={svg("bowl-sprite", className)} {...rest} viewBox="0 0 120 80" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-glaze`} cx="0.3" cy="0.18" r="0.95">{stops([[0, "bowl-glaze-hi"], [0.55, "bowl-glaze"], [1, "bowl-glaze-lo"]])}</radialGradient>
        <radialGradient id={`${id}-broth`} cx="0.42" cy="0.4" r="0.7">{stops([[0, "bowl-broth-hi"], [0.7, "bowl-broth-mid"], [1, "bowl-broth-lo"]])}</radialGradient>
        <linearGradient id={`${id}-stick`} x2="0" y2="1">{stops([[0, "bowl-stick-hi"], [1, "bowl-stick-lo"]])}</linearGradient>
        <radialGradient id={`${id}-shadow`}>{shadowStops}</radialGradient>
      </defs>
      <ellipse cx="62" cy="75" rx="50" ry="5" fill={fill("shadow")} />
      <path className="bowl-foot" d="M42 67 H78 L76 75 H44 Z" />
      <path className="bowl-body" d="M6 26 C8 50 30 70 60 70 C90 70 112 50 114 26 C102 35 82 39 60 39 C38 39 18 35 6 26 Z" fill={fill("glaze")} />
      <path className="bowl-band" d="M15 44 C34 54 86 54 105 44 M22 53 C38 60.5 82 60.5 98 53" />
      <path className="bowl-motif" d="M38 49.6 q2.5 -3.4 5 0 M57.5 51.4 q2.5 -3.4 5 0 M77 49.6 q2.5 -3.4 5 0" />
      <path className="bowl-gloss" d="M14 36 C18 46 26 54 36 59" />
      <ellipse className="bowl-inner" cx="60" cy="26" rx="54" ry="13" />
      <ellipse className="bowl-broth" cx="60" cy="28" rx="49" ry="10.5" fill={fill("broth")} />
      <path className="bowl-oil" d="M38 25 a6 1.4 0 1 0 0.01 0 Z M76 31 a5 1.2 0 1 0 0.01 0 Z M58 33.6 a4 1 0 1 0 0.01 0 Z" />
      <path className="bowl-noodle" d="M24 32 C30 29 36 33 42 30 M66 34 C72 31 78 35 84 32 M46 35 C50 33 54 35.5 58 34" />
      <path className="bowl-rieu" d="M49 21.5 C51 18.4 57.6 18.6 58.6 21.8 C59.4 24.8 53 25.6 49.6 23.8 Z M64 25 C66.4 22.6 72 23 72.4 26 C72.6 28.6 67 29 64.6 27.4 Z" />
      <path className="bowl-tomato" d="M26 26 C26 20.4 37 20.4 37 26 Z M78 29 C78 23.6 88 23.6 88 29 Z" />
      <path className="bowl-tomato-flesh" d="M28.2 25.4 C28.2 22.4 34.8 22.4 34.8 25.4 Z M80 28.4 C80 25.6 86 25.6 86 28.4 Z" />
      <path className="bowl-tofu" d="M40 26 l8 -2 l1.6 6 l-8 2 Z M88 20 l7 1.2 l-1 5.6 l-7 -1.2 Z" />
      <path className="bowl-tofu-top" d="M40 26 l8 -2 l1 -2.6 l-8 2 Z M88 20 l7 1.2 l1.6 -2.4 l-7 -1.2 Z" />
      <path className="bowl-herb" d="M18 28 C21 23.4 26 25 24.4 29.4 Z M56 23 C60 19.6 64 22 62 25.4 Z M96 30 C99.6 26.6 104 28.4 101.6 32 Z" />
      <path className="bowl-scallion" d="M33 30.6 a1.6 1.1 0 1 0 0.01 0 M70 22.4 a1.6 1.1 0 1 0 0.01 0 M91 33 a1.5 1 0 1 0 0.01 0" />
      <path className="bowl-rim" d="M7.4 27 C20 37.6 100 37.6 112.6 27" />
      <path className="bowl-rim-back" d="M8 24.4 C22 11.6 98 11.6 112 24.4" />
      {/* Chopsticks resting across the rim. */}
      <path d="M36.6 10.6 L121 38.4 L120.2 40.6 L35.8 12.8 Z M42.4 8.6 L123.4 34.4 L122.7 36.6 L41.7 10.8 Z" fill={fill("stick")} />
    </svg>
  );
}

/** "Bộ hoa đỏ đầm ngủ": a folded set of red pyjamas printed with small white flowers, soft in the fold. */
export function PyjamasSprite({ className = "", ...rest }: SpriteProps) {
  const id = useSpriteId();
  const flowers: Array<[number, number]> = [[16, 14], [34, 10], [50, 18], [22, 30], [42, 30], [58, 32]];
  const cloth = "M6 8 C6 4 10 2 14 2 H58 C64 2 68 6 68 10 V36 C68 40 64 42 60 42 H12 C8 42 6 40 6 36 Z";
  return (
    <svg className={svg("pyjamas-sprite", className)} {...rest} viewBox="0 0 72 44" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-fold`} x2="0" y2="1">{stops([[0, "pyjamas-light"], [0.4, "pyjamas-clear"], [0.5, "pyjamas-crease"], [0.6, "pyjamas-clear"], [1, "pyjamas-dusk"]])}</linearGradient>
        <radialGradient id={`${id}-shadow`}>{shadowStops}</radialGradient>
      </defs>
      <ellipse cx="38" cy="42.5" rx="37" ry="3.4" fill={`url(#${id}-shadow)`} />
      <path className="pyjamas-cloth" d={cloth} />
      {flowers.map(([x, y]) => (
        <g className="pyjamas-flower" key={`${x}-${y}`}>
          <circle cx={x} cy={y - 2.2} r="1.6" />
          <circle cx={x + 2.1} cy={y - 0.6} r="1.6" />
          <circle cx={x + 1.3} cy={y + 1.9} r="1.6" />
          <circle cx={x - 1.3} cy={y + 1.9} r="1.6" />
          <circle cx={x - 2.1} cy={y - 0.6} r="1.6" />
        </g>
      ))}
      {/* Light on the top fold, a crease where the set is folded in half, shade toward the table. */}
      <path d={cloth} fill={`url(#${id}-fold)`} />
      <path className="pyjamas-fold" d="M6 22 C26 26 48 26 68 22" />
      {/* Folded with the collar on top and the buttons down the front. */}
      <path className="pyjamas-collar" d="M24 2 L36 13 L31 18 L20 5 Z M48 2 L36 13 L41 18 L52 5 Z" />
      <path className="pyjamas-placket" d="M36 13 V42" />
      {[22, 30, 38].map((y) => <circle className="pyjamas-button" key={y} cx="38.6" cy={y} r="1.3" />)}
    </svg>
  );
}
