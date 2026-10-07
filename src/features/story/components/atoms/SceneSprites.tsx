import { useId, type CSSProperties, type SVGProps } from "react";
import { url, useIds } from "./spriteIds";
import { Contact, Gloss, Glow } from "./SpriteLight";

/* Small vector props for the Part II dioramas. Colours live in CSS so each scene can tint them;
   extra props (data-* scroll hints) pass straight through to the <svg>. The richer ones are lit rather than filled:
   each surface takes a gradient whose stops are coloured in CSS (light on the side that faces the scene's key light,
   shade on the other), glass and glaze carry a highlight, and whatever rests on a surface sits in its own soft shadow. */
type SpriteProps = SVGProps<SVGSVGElement>;

const svg = (name: string, className: string) => `${name} ${className}`.trim();

const round = (value: number) => Math.round(value * 10) / 10;

/**
 * Foliage seen from a little way off: a circle broken into round lobes of uneven size, so a crown reads as leaves
 * rather than a disc. Deterministic, so a tree keeps its shape from one render to the next.
 */
function crown(cx: number, cy: number, r: number, lobes: number, seed = 0) {
  const points = Array.from({ length: lobes }, (_, i) => {
    const angle = (i / lobes) * Math.PI * 2 + seed;
    const reach = r * (0.86 + 0.16 * Math.sin(i * 2.3 + seed * 5));
    return [round(cx + Math.cos(angle) * reach), round(cy + Math.sin(angle) * reach)];
  });
  return `${points.map(([x, y], i) => {
    const [nx, ny] = points[(i + 1) % lobes];
    const bulge = round(Math.hypot(nx - x, ny - y) * (0.6 + 0.16 * Math.sin(i * 1.7 + seed * 3)));
    return `${i ? "" : `M${x} ${y}`}A${bulge} ${bulge} 0 0 1 ${nx} ${ny}`;
  }).join("")}Z`;
}

/** Sprigs of single leaves fanning out from points along a crown's edge, so its silhouette ends in leaves. */
function sprigs(points: number[][], size: number) {
  return points.map(([x, y, angle], i) => [-38, 0, 34].map((spread, k) => {
    const a = ((angle + spread + Math.sin(i * 3 + k) * 8) * Math.PI) / 180;
    const length = size * (0.8 + 0.3 * Math.abs(Math.sin(i + k * 1.3)));
    const tipX = round(x + Math.cos(a) * length);
    const tipY = round(y + Math.sin(a) * length);
    const sideX = round(-Math.sin(a) * length * 0.3);
    const sideY = round(Math.cos(a) * length * 0.3);
    const midX = round(x + Math.cos(a) * length * 0.5);
    const midY = round(y + Math.sin(a) * length * 0.5);
    return `M${x} ${y}Q${round(midX + sideX)} ${round(midY + sideY)} ${tipX} ${tipY}Q${round(midX - sideX)} ${round(midY - sideY)} ${x} ${y}Z`;
  }).join("")).join("");
}

/**
 * A fringe of grass blades between x0 and x1, each leaning a little its own way. They stand on y = base, which rises by
 * `arch` towards the middle, so the fringe can follow the gentle crown of a lawn.
 */
function grass(x0: number, x1: number, base: number, height: number, step: number, arch = 0) {
  let d = "";
  for (let x = x0, i = 0; x < x1; x += step, i++) {
    const foot = round(base - arch * Math.sin(((x - x0) / (x1 - x0)) * Math.PI));
    const h = height * (0.5 + 0.5 * Math.abs(Math.sin(i * 1.9)));
    const lean = Math.sin(i * 0.8) * step * 1.1;
    d += `M${round(x)} ${foot}Q${round(x + lean * 0.3)} ${round(foot - h * 0.6)} ${round(x + lean)} ${round(foot - h)}Q${round(x + step * 0.45 + lean * 0.2)} ${round(foot - h * 0.45)} ${round(x + step * 0.8)} ${foot}Z`;
  }
  return d;
}

const FISH_BODY = "M4 16 C10 4 34 2 48 16 C34 30 10 28 4 16 Z";

/** A fish lit from the surface: its colour (CSS) under a sheen that is bright along the back and dark along the belly. */
export function FishSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("fish-sprite", className)} {...rest} viewBox="0 0 64 32" aria-hidden="true">
      <defs>
        <linearGradient id={id("shade")} x2="0" y2="1">
          <stop className="fish-shade-top" />
          <stop className="fish-shade-mid" offset="0.46" />
          <stop className="fish-shade-low" offset="1" />
        </linearGradient>
      </defs>
      {/* Mirrored fish flip this group in CSS, so the scroll engine can own the outer transform. */}
      <g className="fish-shape">
        <g className="fish-tail">
          <path d="M45 16 L62 5 L57 16 L62 27 Z" />
        </g>
        <path className="fish-fin" d="M22 9.5 C26 3 34 3 37 8 C31 9 26 10 22 9.5 Z" />
        <path className="fish-body" d={FISH_BODY} />
        <path className="fish-belly" d="M10 18.5 C18 24.5 34 26 46 17.5 C34 23.5 18 22.5 10 18.5 Z" />
        <path className="fish-shade" fill={url(id("shade"))} d={FISH_BODY} />
        <path className="fish-line" d="M17 14.6 C25 12.6 35 12.8 45 15.6" />
        <path className="fish-gill" d="M15.4 10.4 C17.8 13.4 17.8 18.6 15.4 21.6" />
        <path className="fish-fin fish-fin-low" d="M24 22 C27 27 33 27.5 36 24 C31 24 27 23.5 24 22 Z" />
        <circle className="fish-eye" cx="12.5" cy="14" r="2.1" />
        <circle className="fish-glint" cx="13.2" cy="13.3" r="0.75" />
      </g>
    </svg>
  );
}

/** A loose school of small fish, drawn as one prop so it drifts as a group. */
export function SchoolSprite({ className = "", ...rest }: SpriteProps) {
  const fish = [[8, 14], [26, 8], [30, 22], [48, 12], [54, 26], [70, 18], [76, 6], [92, 16]];
  return (
    <svg className={`school-sprite ${className}`.trim()} {...rest} viewBox="0 0 104 34" aria-hidden="true">
      {fish.map(([x, y], index) => (
        <path key={index} className="school-fish" style={{ "--k": index } as CSSProperties} d={`M${x} ${y} c3 -3.4 8.6 -3.4 11 0 c-2.4 3.4 -8 3.4 -11 0 z M${x + 11} ${y} l4 -2.4 v4.8 z`} />
      ))}
    </svg>
  );
}

/** A moon jelly giving off its own light: an aura, a bell that glows from within, a frilled rim and fading tentacles. */
export function JellyfishSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("jelly-sprite", className)} {...rest} viewBox="0 0 60 90" aria-hidden="true">
      <defs>
        <Glow id={id("aura")} name="jelly-aura" />
        <radialGradient id={id("bell")} cx="0.42" cy="0.32" r="0.72">
          <stop className="jelly-bell-core" />
          <stop className="jelly-bell-mid" offset="0.58" />
          <stop className="jelly-bell-rim" offset="1" />
        </radialGradient>
        <linearGradient id={id("trail")} gradientUnits="userSpaceOnUse" x1="0" y1="42" x2="0" y2="90">
          <stop className="jelly-trail-top" />
          <stop className="jelly-trail-end" offset="1" />
        </linearGradient>
      </defs>
      <circle className="jelly-aura" fill={url(id("aura"))} cx="30" cy="30" r="40" />
      <g className="jelly-tentacles" stroke={url(id("trail"))}>
        <path d="M18 44 C14 56 22 62 16 74 C12 82 18 86 15 90" />
        <path d="M26 46 C24 58 30 64 26 76 C24 82 28 86 26 90" />
        <path d="M34 46 C36 58 30 64 34 76 C36 82 32 86 34 90" />
        <path d="M42 44 C46 56 38 62 44 74 C48 82 42 86 45 90" />
      </g>
      <path className="jelly-arms" d="M25 44 C21 52 30 58 25.6 66 C24.6 70 27.6 72.4 30 70 C33.4 66 28.4 60 32.4 52 C34.4 48 33.4 45 30 44 Z" />
      <g className="jelly-bell">
        <path className="jelly-body" fill={url(id("bell"))} d="M4 40 C4 14 18 2 30 2 C42 2 56 14 56 40 C50 46 44 42 40 46 C36 42 34 44 30 48 C26 44 24 42 20 46 C16 42 10 46 4 40 Z" />
        <path className="jelly-inner" d="M12 37 C12 22 20 12.6 30 12.6 C40 12.6 48 22 48 37" />
        <path className="jelly-frill" d="M4 40 C10 46 16 42 20 46 C24 42 26 44 30 48 C34 44 36 42 40 46 C44 42 50 46 56 40" />
        <path className="jelly-shine" d="M14 30 C14 18 20 10 28 8 C22 14 19 22 19 32 Z" />
        <circle className="jelly-spot" cx="24" cy="26" r="2.2" />
        <circle className="jelly-spot" cx="36" cy="22" r="1.6" />
        <circle className="jelly-spot" cx="40" cy="32" r="1.3" />
      </g>
    </svg>
  );
}

const KELP_BLADE = "M20 120 C4 100 34 86 14 66 C0 50 30 40 18 22 C10 10 24 4 22 0 C34 10 20 24 30 40 C40 56 12 66 26 82 C38 96 10 106 20 120 Z";

/** Kelp with the light coming through it: pale at the tips that reach for the surface, dark at the root, a bright rib. */
export function KelpSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("kelp-sprite", className)} {...rest} viewBox="0 0 40 120" aria-hidden="true">
      <defs>
        <linearGradient id={id("blade")} x2="0" y2="1">
          <stop className="kelp-tip" />
          <stop className="kelp-root" offset="1" />
        </linearGradient>
      </defs>
      <path className="kelp-blade kelp-blade-back" transform="translate(8 0)" d={KELP_BLADE} />
      <path className="kelp-blade" fill={url(id("blade"))} d={KELP_BLADE} />
      <path className="kelp-rib" d="M20 118 C11 102 29 88 20 74 C11 58 28 46 23 30 C19.4 18 23 8 22 2" />
    </svg>
  );
}

/**
 * The floor of the tank: a bank of sand lit where the shafts of light land on it, ripples drawn in by the current,
 * and rocks that catch the light on their crowns and sit in their own shadow.
 */
export function SeabedSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  const rocks = [
    { d: "M22 65 C22 55 32 49 42 50 C52 51 59 57 59 65 Z", cx: 40, w: 22 },
    { d: "M220 61 C220 49 234 43 245 44 C257 45 266 53 264 61 Z", cx: 242, w: 26 },
    { d: "M259 65 C259 59 265 56 270 57 C276 58 279 62 278 65 Z", cx: 268.6, w: 12 },
  ];
  return (
    <svg className={svg("seabed-sprite", className)} {...rest} viewBox="0 0 300 96" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id("sand")} x2="0" y2="1">
          <stop className="seabed-sand-top" />
          <stop className="seabed-sand-mid" offset="0.4" />
          <stop className="seabed-sand-deep" offset="1" />
        </linearGradient>
        <radialGradient id={id("rock")} cx="0.38" cy="0.16" r="0.95">
          <stop className="seabed-rock-hi" />
          <stop className="seabed-rock-lo" offset="1" />
        </radialGradient>
        <Glow id={id("sun")} name="seabed-sun" />
      </defs>
      <path className="seabed-sand" fill={url(id("sand"))} d="M-4 58 C40 46 100 40 150 42 C200 44 260 48 304 56 V96 H-4 Z" />
      <ellipse className="seabed-sun" fill={url(id("sun"))} cx="116" cy="50" rx="72" ry="13" />
      <ellipse className="seabed-sun" fill={url(id("sun"))} cx="198" cy="52" rx="50" ry="10" />
      <path className="seabed-ripples" d="M16 66 C30 62 46 62 60 65 M72 58 C90 54 108 54 124 57 M150 56 C170 52 190 53 206 56 M222 66 C238 63 252 64 266 67 M40 78 C58 74 80 74 96 77 M120 72 C140 68 164 68 180 71 M196 79 C214 76 236 76 252 79" />
      {rocks.map((rock) => (
        <g key={rock.cx}>
          <Contact id={id(`rock-${rock.cx}`)} cx={rock.cx} cy={65} rx={rock.w} ry={3} />
          <path className="seabed-rock" fill={url(id("rock"))} d={rock.d} />
        </g>
      ))}
      <g className="seabed-pebbles">
        <ellipse cx="84" cy="70" rx="3.4" ry="1.6" /><ellipse cx="92" cy="73" rx="2.2" ry="1.1" /><ellipse cx="170" cy="66" rx="2.8" ry="1.3" /><ellipse cx="206" cy="74" rx="3" ry="1.4" />
      </g>
    </svg>
  );
}

/* Caustic light: a honeycomb of light whose corners are nudged off the grid and whose edges bow a little, the way light
   bent by a moving surface draws itself on sand. */
const CAUSTIC_NET = (() => {
  const noise = (a: number, b: number, salt: number) => {
    const value = Math.sin(a * 12.9898 + b * 78.233 + salt) * 43758.5453;
    return value - Math.floor(value) - 0.5;
  };
  const point = (k: number, j: number) => [round(k * 10 + noise(k, j, 1) * 5), round(j * 9 + (Math.abs((k + j) % 2) ? 3 : 0) + noise(k, j, 2) * 3.6)];
  const edge = ([x1, y1]: number[], [x2, y2]: number[]) => {
    const bow = noise(x1, y2, 3) * 4;
    const length = Math.hypot(x2 - x1, y2 - y1) || 1;
    return `M${x1} ${y1}Q${round((x1 + x2) / 2 - ((y2 - y1) / length) * bow)} ${round((y1 + y2) / 2 + ((x2 - x1) / length) * bow)} ${x2} ${y2}`;
  };
  let d = "";
  for (let j = -1; j <= 7; j++) {
    for (let k = -1; k <= 21; k++) {
      d += edge(point(k, j), point(k + 1, j));
      // Each low corner of a row joins the high corner beneath it, closing the cells.
      if (Math.abs((k + j) % 2)) d += edge(point(k, j), point(k, j + 1));
    }
  }
  return d;
})();

/** The caustic net, drawn twice a little apart: the scene drifts the two copies against each other, so the light
    on the sand keeps re-forming the way real caustics do, while the layer the engine moves stays still. */
export function CausticSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("caustic-sprite", className)} {...rest} viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
      <g className="caustic-net">
        <path d={CAUSTIC_NET} />
      </g>
      <g className="caustic-net is-second">
        <path d={CAUSTIC_NET} transform="translate(-6 -4) scale(1.12)" />
      </g>
    </svg>
  );
}

export function LeafSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={`leaf-sprite ${className}`.trim()} {...rest} viewBox="0 0 40 24" aria-hidden="true">
      <path className="leaf-blade" d="M2 12 C10 -1 30 -1 38 12 C30 25 10 25 2 12 Z" />
      <path className="leaf-rib" d="M4 12 C14 11 26 11 36 12" />
      <path className="leaf-vein" d="M12 11 C14 7 17 5 20 4 M20 11 C22 7 25 5 28 4 M12 13 C14 17 17 19 20 20 M20 13 C22 17 25 19 28 20" />
    </svg>
  );
}

/** A lenticular dusk cloud: long and thin, with a lit underside painted in CSS. */
export function CloudSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={`cloud-sprite ${className}`.trim()} {...rest} viewBox="0 0 200 44" aria-hidden="true">
      <path d="M6 30 C24 16 64 12 112 18 C144 22 172 18 196 26 C172 34 124 38 74 36 C42 35 18 36 6 30 Z" />
    </svg>
  );
}

export function BirdSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={`bird-sprite ${className}`.trim()} {...rest} viewBox="0 0 40 18" aria-hidden="true">
      <path className="bird-wing bird-wing-left" d="M20 12 C14 4 8 2 1 6 C8 6 14 9 20 12 Z" />
      <path className="bird-wing bird-wing-right" d="M20 12 C26 4 32 2 39 6 C32 6 26 9 20 12 Z" />
    </svg>
  );
}

const CANOPY_BACK = [crown(70, 58, 50, 17, 0.3), crown(142, 46, 46, 16, 1.1), crown(194, 84, 32, 11, 2.2)].join(" ");
const CANOPY_FRONT = [crown(52, 108, 38, 13, 0.7), crown(116, 102, 42, 14, 1.9), crown(172, 122, 28, 10, 2.9)].join(" ");
/* Smaller clumps of leaves hanging lowest, nearest the lamp, so the lit edge breaks up instead of running smooth. */
const CANOPY_CLUMPS = [crown(84, 136, 13, 7, 0.4), crown(136, 138, 15, 8, 1.4), crown(186, 146, 10, 6, 2.6), crown(30, 134, 11, 6, 3.1)].join(" ");
const CANOPY_SPRIGS = sprigs([[22, 136, 110], [42, 140, 95], [66, 141, 80], [92, 143, 100], [120, 141, 85], [146, 146, 95], [172, 146, 75], [194, 146, 60], [208, 128, 30], [8, 128, 140]], 9);

/**
 * A park tree's crown seen from beneath at night: dark leaf masses that warm towards the corner facing the lamp, a
 * lamplit edge under the nearer masses and the sky on top of the far ones. The trunk runs on below the drawing down to
 * the lawn. Mirror it in CSS (scale) for the other side of the path.
 */
export function CanopySprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("canopy-sprite", className)} {...rest} viewBox="0 0 220 170" aria-hidden="true">
      <defs>
        <radialGradient id={id("back")} cx="0.8" cy="1" r="1">
          <stop className="canopy-back-lit" />
          <stop className="canopy-back-mid" offset="0.5" />
          <stop className="canopy-back-dark" offset="1" />
        </radialGradient>
        <radialGradient id={id("front")} cx="0.72" cy="1" r="0.9">
          <stop className="canopy-front-lit" />
          <stop className="canopy-front-mid" offset="0.55" />
          <stop className="canopy-front-dark" offset="1" />
        </radialGradient>
        <linearGradient id={id("bark")}>
          <stop className="canopy-bark-dark" offset="0.4" />
          <stop className="canopy-bark-lit" offset="1" />
        </linearGradient>
      </defs>
      <path className="canopy-bark" fill={url(id("bark"))} d="M56 120 C59 190 58 300 54 440 H66 C65 300 67 196 72 124 Z" />
      <path className="canopy-branch" d="M62 150 C74 128 96 112 124 104 M60 138 C52 124 42 114 28 108" />
      <path className="canopy-sky-rim" d={CANOPY_BACK} transform="translate(0 -1.6)" />
      <path className="canopy-back" fill={url(id("back"))} d={CANOPY_BACK} />
      <path className="canopy-lamp-rim" d={`${CANOPY_FRONT} ${CANOPY_CLUMPS} ${CANOPY_SPRIGS}`} transform="translate(0.5 1.3)" />
      <path className="canopy-front" fill={url(id("front"))} d={CANOPY_FRONT} />
      <path className="canopy-clumps" fill={url(id("front"))} d={`${CANOPY_CLUMPS} ${CANOPY_SPRIGS}`} />
    </svg>
  );
}

/** A cast-iron park lamp: a lantern of four lit panes under a pointed cap, on a fluted post with a stepped base. */
export function ParkLampSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("park-lamp-sprite", className)} {...rest} viewBox="0 0 40 200" aria-hidden="true">
      <defs>
        <linearGradient id={id("iron")}>
          <stop className="park-lamp-iron-dark" offset="0.15" />
          <stop className="park-lamp-iron-lit" offset="0.6" />
          <stop className="park-lamp-iron-dark" offset="1" />
        </linearGradient>
        <radialGradient id={id("glass")} cx="0.5" cy="0.6" r="0.75">
          <stop className="park-lamp-glass-core" />
          <stop className="park-lamp-glass-edge" offset="1" />
        </radialGradient>
      </defs>
      <path className="park-lamp-iron" fill={url(id("iron"))} d="M17.4 44 H22.6 L23.6 184 H16.4 Z M15 39 H25 L24 44 H16 Z M12.6 184 H27.4 L29 191 H11 Z M9.2 191 H30.8 V200 H9.2 Z" />
      <path className="park-lamp-flute" d="M19.2 50 L19.6 180 M21 50 L21.4 180" />
      <path className="park-lamp-glass" fill={url(id("glass"))} d="M10.6 14 H29.4 L26.6 37 H13.4 Z" />
      <ellipse className="park-lamp-bulb" cx="20" cy="27" rx="3.2" ry="4.6" />
      <path className="park-lamp-frame" d="M10.6 14 H29.4 L26.6 37 H13.4 Z M20 14 V37 M12 25.5 H28" />
      <path className="park-lamp-cap" d="M6.4 14.6 L20 4.6 L33.6 14.6 Z M18.4 3.4 A1.6 1.6 0 1 0 21.6 3.4 A1.6 1.6 0 1 0 18.4 3.4 Z M12.4 37 H27.6 L25.6 40.4 H14.4 Z" />
    </svg>
  );
}

const LAWN_TOP = 16;
const LAWN_ARCH = 7;

/**
 * The lawn behind the steps: turf that darkens away from the lamps, their warm pools on the grass, and a fringe of
 * blades along its gentle crown, the tips catching the light.
 */
export function LawnSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("lawn-sprite", className)} {...rest} viewBox="0 0 440 200" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id("turf")} x2="0" y2="1">
          <stop className="lawn-turf-top" />
          <stop className="lawn-turf-mid" offset="0.3" />
          <stop className="lawn-turf-deep" offset="1" />
        </linearGradient>
        <linearGradient id={id("blades")} x2="0" y2="1">
          <stop className="lawn-blade-tip" />
          <stop className="lawn-blade-foot" offset="1" />
        </linearGradient>
        <Glow id={id("pool")} name="lawn-pool" />
      </defs>
      <path className="lawn-turf" fill={url(id("turf"))} d={`M0 ${LAWN_TOP} Q220 ${LAWN_TOP - LAWN_ARCH * 2} 440 ${LAWN_TOP} V200 H0 Z`} />
      <ellipse className="lawn-pool" fill={url(id("pool"))} cx="128" cy="22" rx="120" ry="58" />
      <ellipse className="lawn-pool is-far" fill={url(id("pool"))} cx="398" cy="18" rx="54" ry="26" />
      <path className="lawn-blades" fill={url(id("blades"))} d={grass(-4, 444, LAWN_TOP + 2, 10, 3.6, LAWN_ARCH)} />
    </svg>
  );
}

/**
 * A Mixue sundae for the night on the steps: a clear cup showing the drink and its bits, a printed band, the soft serve
 * under a clear dome and a striped straw. Glass highlights on both sides (CSS lights the one that faces the lamp),
 * beads of cold water, and a soft shadow where it stands on the stone.
 */
export function DrinkCupSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("drink-sprite", className)} {...rest} viewBox="0 0 60 112" aria-hidden="true">
      <defs>
        <linearGradient id={id("drink")} x2="0" y2="1">
          <stop className="drink-fill-top" />
          <stop className="drink-fill-deep" offset="1" />
        </linearGradient>
        <linearGradient id={id("cup")}>
          <stop className="drink-cup-edge" />
          <stop className="drink-cup-mid" offset="0.5" />
          <stop className="drink-cup-edge" offset="1" />
        </linearGradient>
        <radialGradient id={id("swirl")} cx="0.36" cy="0.2" r="0.9">
          <stop className="drink-swirl-hi" />
          <stop className="drink-swirl-lo" offset="1" />
        </radialGradient>
        <linearGradient id={id("dome")} x2="0" y2="1">
          <stop className="drink-dome-top" />
          <stop className="drink-dome-foot" offset="1" />
        </linearGradient>
        <Gloss id={id("gloss")} />
      </defs>
      <Contact id={id("contact")} cx={30} cy={106.6} rx={19} ry={3.2} />
      <path className="drink-straw" d="M36.6 6 L42.6 64" />
      <path className="drink-straw-stripe" d="M36.6 6 L42.6 64" />
      <path className="drink-cup" fill={url(id("cup"))} d="M11 40 L49 40 L43.5 103 C43.2 106.6 16.8 106.6 16.5 103 Z" />
      <path className="drink-fill" fill={url(id("drink"))} d="M13 57 C22 59.4 38 59.4 47 57 L43.5 103 C43.2 106.6 16.8 106.6 16.5 103 Z" />
      <g className="drink-bits">
        <circle cx="21" cy="99" r="2.4" /><circle cx="27" cy="101" r="2.4" /><circle cx="33.4" cy="100" r="2.4" /><circle cx="39" cy="98.6" r="2.2" />
        <circle cx="24" cy="95" r="2.2" /><circle cx="30.4" cy="96.2" r="2.3" /><circle cx="36.6" cy="94.6" r="2.1" />
      </g>
      <path className="drink-surface" d="M13 57 C22 59.4 38 59.4 47 57" />
      <path className="drink-band" d="M14 71 H46 L45.2 81 H14.8 Z" />
      <path className="drink-print" d="M30 79.2 C26.4 76.6 25.4 74.8 26.6 73.6 C27.6 72.8 29.2 73.2 30 74.4 C30.8 73.2 32.4 72.8 33.4 73.6 C34.6 74.8 33.6 76.6 30 79.2 Z" />
      <path className="drink-gloss" fill={url(id("gloss"))} d="M15.4 44 H19.6 L22 100 H19.2 Z" />
      <path className="drink-rim is-left" d="M12.4 42.6 L17.8 101" />
      <path className="drink-rim is-right" d="M47.6 42.6 L42.2 101" />
      <g className="drink-beads">
        <ellipse cx="38.6" cy="66" rx="0.9" ry="1.2" /><ellipse cx="22.6" cy="88" rx="0.8" ry="1.1" /><ellipse cx="41" cy="90" rx="0.7" ry="1" /><ellipse cx="26" cy="64" rx="0.7" ry="0.9" />
      </g>
      <path className="drink-drop" d="M40 74 C40 71 43 68 43 66 C43 68 46 71 46 74 C46 76 40 76 40 74 Z" />
      <path className="drink-lid" d="M7 36 C7 32.6 53 32.6 53 36 L51 41.4 H9 Z" />
      <path className="drink-lid-shine" d="M9.6 35 C20 33.6 40 33.6 50.4 35" />
      <path className="drink-swirl" fill={url(id("swirl"))} d="M15 35 C13.6 29.4 17.4 26.6 21.4 27.6 C19.8 21.8 25.4 18.4 29.6 20.4 C29.8 14.6 37.6 14.4 38.2 19.8 C42.4 19.2 45.4 23.4 42.6 27.4 C46.4 27.6 47.6 32.2 45.4 35 Z" />
      <path className="drink-swirl-line" d="M18 31.6 C24 29.4 36 29.4 43 31.4 M22.6 26 C27 24.2 33 24.2 37.6 25.2" />
      <path className="drink-dome" fill={url(id("dome"))} d="M9.4 35.4 C9.4 13.6 50.6 13.6 50.6 35.4 Z" />
      <path className="drink-dome-shine" d="M14.6 30 C14.6 23 19 18.6 25 17.4" />
      <path className="drink-straw-shine" d="M37.4 8 L37.8 12" />
    </svg>
  );
}

/** A coffee cup on its saucer, seen from the table, with room above for steam: glazed porcelain shaded round its
    body, a glare down one side, crema with a latte heart and a glint, and a soft shadow on the wood. */
export function CoffeeCupSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("coffee-sprite", className)} {...rest} viewBox="0 0 120 72" aria-hidden="true">
      <defs>
        <linearGradient id={id("glaze")}>
          <stop className="coffee-glaze-lo" />
          <stop className="coffee-glaze-hi" offset="0.3" />
          <stop className="coffee-glaze-mid" offset="0.62" />
          <stop className="coffee-glaze-shade" offset="1" />
        </linearGradient>
        <linearGradient id={id("saucer")} x2="0" y2="1">
          <stop className="coffee-saucer-hi" />
          <stop className="coffee-saucer-lo" offset="1" />
        </linearGradient>
        <radialGradient id={id("coffee")} cx="0.46" cy="0.55" r="0.62">
          <stop className="coffee-crema" />
          <stop className="coffee-brew" offset="1" />
        </radialGradient>
        <Gloss id={id("gloss")} />
      </defs>
      <Contact id={id("contact")} cx={56} cy={64.6} rx={56} ry={7} />
      <ellipse className="coffee-saucer-lip" cx="56" cy="61.4" rx="52" ry="8.6" />
      <ellipse className="coffee-saucer" fill={url(id("saucer"))} cx="56" cy="59.6" rx="52" ry="8.2" />
      <ellipse className="coffee-saucer-ring" cx="56" cy="59" rx="33" ry="4.6" />
      <ellipse className="coffee-cup-shadow" cx="58" cy="57.6" rx="31" ry="3.4" />
      <path className="coffee-handle" d="M86 24 C104 22 106 44 88 46" />
      <path className="coffee-handle-shade" d="M89 29 C97 29.6 98.6 39 90 41.4" />
      <path className="coffee-cup" fill={url(id("glaze"))} d="M18 18 L92 18 C92 40 84 56 55 56 C26 56 18 40 18 18 Z" />
      <path className="coffee-gloss" fill={url(id("gloss"))} d="M27.6 23 C27.6 36 31 45.6 37.6 51 L40.6 50.2 C35 44 32.6 35 32.6 23 Z" />
      <ellipse className="coffee-rim" cx="55" cy="18" rx="37" ry="7" />
      <ellipse className="coffee-liquid" fill={url(id("coffee"))} cx="55" cy="18.6" rx="31.6" ry="5.1" />
      <path className="coffee-heart" d="M55 21.5 C51 18 49.5 15.5 51.5 14.2 C53 13.4 54.5 14.4 55 15.3 C55.5 14.4 57 13.4 58.5 14.2 C60.5 15.5 59 18 55 21.5 Z" />
      <path className="coffee-glint" d="M33.6 16.6 C38 15.2 43 14.6 47.6 14.6" />
      <path className="coffee-rim-shine" d="M21.6 16 C27 12.4 40 10.8 52 11" />
    </svg>
  );
}

/** Steam off a hot cup: three wisps that thicken as they rise and thin away to nothing. */
export function SteamSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("steam-sprite", className)} {...rest} viewBox="0 0 44 64" aria-hidden="true">
      <defs>
        <linearGradient id={id("wisp")} x1="0" y1="1" x2="0" y2="0">
          <stop className="steam-foot" />
          <stop className="steam-body" offset="0.42" />
          <stop className="steam-top" offset="1" />
        </linearGradient>
      </defs>
      <g className="steam-wisps" stroke={url(id("wisp"))}>
        <path className="steam-wisp" d="M15 62 C9 52 21 46 15 36 C10 28 19 22 16 12" />
        <path className="steam-wisp" d="M23 62 C29 52 17 44 23 34 C28 26 20 18 24 6" />
        <path className="steam-wisp" d="M31 62 C26 54 36 48 31 40 C27 34 34 28 32 20" />
      </g>
    </svg>
  );
}

/** A rattan pendant over the garden table: woven shade glowing from inside, the bulb peeking out of its mouth. */
export function PendantLampSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  const shade = "M6 80 C6 60 16 49 30 49 C44 49 54 60 54 80 C46 83.4 14 83.4 6 80 Z";
  return (
    <svg className={svg("pendant-sprite", className)} {...rest} viewBox="0 0 60 100" aria-hidden="true">
      <defs>
        <radialGradient id={id("shade")} cx="0.5" cy="0.95" r="0.95">
          <stop className="pendant-shade-core" />
          <stop className="pendant-shade-mid" offset="0.55" />
          <stop className="pendant-shade-edge" offset="1" />
        </radialGradient>
        <pattern id={id("weave")} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path className="pendant-weave" d="M0 2 H4 M2 0 V4" />
        </pattern>
        <Glow id={id("bulb")} name="pendant-bulb" core={0.12} />
      </defs>
      <path className="pendant-cord" d="M30 0 V46" />
      <path className="pendant-cap" d="M26.5 44 H33.5 L34.5 50 H25.5 Z" />
      <path className="pendant-shade" fill={url(id("shade"))} d={shade} />
      <path className="pendant-weave-fill" fill={url(id("weave"))} d={shade} />
      <path className="pendant-sheen" d="M12.6 68 C14.6 59 21 52.6 29 51.4" />
      <ellipse className="pendant-mouth" cx="30" cy="80.6" rx="22.6" ry="2.6" />
      <circle className="pendant-bulb" fill={url(id("bulb"))} cx="30" cy="82" r="8" />
    </svg>
  );
}

const PLANT_LEAVES = [-80, 84, -62, 66, -40, 46, -18, 24, 3];

/** A potted plant by the table: a terracotta pot lit round its body, and a fan of glossy leaves, each with its rib. */
export function PottedPlantSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("plant-sprite", className)} {...rest} viewBox="0 0 80 110" aria-hidden="true">
      <defs>
        <linearGradient id={id("leaf")} x2="0" y2="1">
          <stop className="plant-leaf-tip" />
          <stop className="plant-leaf-base" offset="1" />
        </linearGradient>
        <linearGradient id={id("pot")}>
          <stop className="plant-pot-shade" />
          <stop className="plant-pot-lit" offset="0.34" />
          <stop className="plant-pot-mid" offset="0.62" />
          <stop className="plant-pot-shade" offset="1" />
        </linearGradient>
      </defs>
      <Contact id={id("contact")} cx={40} cy={105.6} rx={30} ry={4} />
      {PLANT_LEAVES.map((angle, i) => (
        <g key={angle} transform={`translate(40 66) rotate(${angle}) scale(${round(0.82 + 0.4 * Math.cos((angle * Math.PI) / 180) + (i % 2) * 0.05)})`}>
          <path className="plant-leaf" fill={url(id("leaf"))} d="M0 0 C-8 -12 -9 -30 0 -44 C9 -30 8 -12 0 0 Z" />
          <path className="plant-rib" d="M0 -2 Q1.2 -22 0 -40" />
        </g>
      ))}
      <path className="plant-soil" d="M18 66 C24 63 56 63 62 66 Z" />
      <path className="plant-pot" fill={url(id("pot"))} d="M17 70 H63 L57 104 C57 106.4 23 106.4 23 104 Z" />
      <path className="plant-pot" fill={url(id("pot"))} d="M14 63 H66 V70.4 C66 71.6 14 71.6 14 70.4 Z" />
      <path className="plant-pot-shine" d="M16 64.6 H64" />
    </svg>
  );
}

/* The far shore of Hồ Tây: trees and hotel blocks, and Trấn Quốc's slender tiered tower rising among them. */
const FAR_SHORE = "M0 30 V23 Q4 19 8 22 Q12 18 17 21 Q22 17 27 21 Q31 19 34 22 H38 V17 H45 V14 H50 V22 Q55 18 60 21 Q66 17 72 21 Q77 18 82 22 H86 V19 H94 V22 Q99 18 104 21 Q108 19 112 22 H114 V19.5 H115 V16.5 H116 V13.5 H116.8 V10.5 H117.6 V7.5 L118.5 4 L119.4 7.5 H120.2 V10.5 H121 V13.5 H122 V16.5 H123 V19.5 H124 V22 Q130 18 136 21 Q142 17 148 21 Q153 19 158 22 H162 V12 H170 V9 H174 V22 Q180 18 186 21 Q192 18 198 22 H204 V16 H214 V22 Q220 18 226 21 Q232 17 238 21 Q244 18 250 22 H256 V14 H262 V11 H268 V22 Q274 19 280 21 Q286 17 292 21 Q298 18 304 22 H310 V17 H320 V20 H326 V22 Q332 18 338 21 Q344 17 350 21 Q356 19 362 22 H366 V13 H372 V22 Q378 18 384 21 Q390 18 396 21 Q398 20 400 21 V30 Z";

/** The far shore across the lake, flat in the haze; the scene tints it, and at dusk its first windows come on. */
export function FarShoreSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("shore-sprite", className)} {...rest} viewBox="0 0 400 30" preserveAspectRatio="none" aria-hidden="true">
      <path className="shore-line" d={FAR_SHORE} />
      <g className="shore-lights">
        <rect x="40" y="18" width="1.4" height="1.2" /><rect x="166" y="13" width="1.4" height="1.2" /><rect x="168" y="17" width="1.4" height="1.2" />
        <rect x="208" y="18" width="1.4" height="1.2" /><rect x="259" y="15" width="1.4" height="1.2" /><rect x="264" y="18" width="1.4" height="1.2" />
        <rect x="313" y="19" width="1.4" height="1.2" /><rect x="368" y="16" width="1.4" height="1.2" />
      </g>
    </svg>
  );
}

const HEDGE = [
  crown(16, 36, 22, 13, 0.2), crown(52, 30, 26, 15, 1.3), crown(94, 36, 22, 13, 2.1), crown(134, 28, 28, 16, 0.8), crown(178, 34, 24, 14, 1.7),
  crown(220, 29, 27, 15, 2.6), crown(262, 35, 23, 13, 0.5), crown(302, 28, 28, 16, 1.4), crown(346, 34, 24, 14, 2.2), crown(388, 30, 26, 15, 0.9),
  crown(428, 35, 22, 13, 1.8),
].join(" ");
/* Bougainvillea over the hedge, the magenta every garden café in Hà Nội grows: a few loose sprays of bracts. */
const BOUGAINVILLEA = [[56, 9], [64, 14], [222, 8], [214, 13], [306, 8], [392, 11]].map(([x, y], spray) =>
  Array.from({ length: 6 }, (_, k) => {
    const angle = k * 1.05 + spray;
    return `M${round(x + Math.cos(angle) * 4.2 + 2.2)} ${round(y + Math.sin(angle) * 2.8)}a2.2 2.2 0 1 0 0.1 0`;
  }).join("")).join("");

/**
 * The garden's hedge between the tables and the lake: a row of shrubs lit gold along their tops by the sun on the water,
 * deep green beneath, with bougainvillea spilling over it.
 */
export function GardenHedgeSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("hedge-sprite", className)} {...rest} viewBox="0 0 440 72" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id("leaves")} x2="0" y2="1">
          <stop className="hedge-sunlit" />
          <stop className="hedge-mid" offset="0.38" />
          <stop className="hedge-deep" offset="1" />
        </linearGradient>
      </defs>
      <path className="hedge-rim" d={HEDGE} transform="translate(0.6 -1.4)" />
      <path className="hedge-leaves" fill={url(id("leaves"))} d={`${HEDGE} M-4 40 H444 V72 H-4 Z`} />
      <path className="hedge-bracts" d={BOUGAINVILLEA} />
      <path className="hedge-bracts is-light" d={BOUGAINVILLEA} transform="translate(-0.6 -0.6)" />
    </svg>
  );
}

const TABLE_TOP = "M-2 44 C40 18 120 2 200 2 C280 2 360 18 402 44 V212 H-2 Z";
const TABLE_SEAMS = [22, 44, 70, 102, 140, 186];
/* Two long grain lines through each plank, wandering a little, wider apart on the nearer planks. */
const TABLE_GRAIN = TABLE_SEAMS.map((seam, i) => {
  const previous = i ? TABLE_SEAMS[i - 1] : 0;
  return [0.32, 0.68].map((share, k) => {
    const y = round(previous + (seam - previous) * share);
    const wobble = round((seam - previous) * 0.1);
    return `M-2 ${y}C${80 + k * 30} ${round(y - wobble)} ${150 - k * 20} ${round(y + wobble)} 220 ${y}S${360 - k * 30} ${round(y - wobble)} 402 ${round(y + wobble / 2)}`;
  }).join("");
}).join("");

/**
 * The garden table: a round wooden top running off the bottom of the frame, its planks and grain, the varnish holding
 * a band of bright sky by the far edge, the pendant's warm pool to the left and the lake's glare to the right.
 */
export function CafeTableSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("table-sprite", className)} {...rest} viewBox="0 0 400 210" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id("wood")} x2="0" y2="1">
          <stop className="table-wood-far" />
          <stop className="table-wood-mid" offset="0.38" />
          <stop className="table-wood-near" offset="1" />
        </linearGradient>
        <linearGradient id={id("varnish")} x2="0" y2="1">
          <stop className="table-varnish-hi" />
          <stop className="table-varnish-lo" offset="1" />
        </linearGradient>
        <clipPath id={id("top")}><path d={TABLE_TOP} /></clipPath>
        <Glow id={id("pool")} name="table-pool" />
        <Glow id={id("glare")} name="table-glare" />
      </defs>
      <path className="table-top" fill={url(id("wood"))} d={TABLE_TOP} />
      <g clipPath={url(id("top"))}>
        <path className="table-seams" d={TABLE_SEAMS.map((y) => `M-2 ${y}H402`).join("")} />
        <path className="table-grain" d={TABLE_GRAIN} />
        <path className="table-knot" d="M246 57 a7 2.6 0 1 0 0.1 0 M242 57 a3 1.2 0 1 0 0.1 0 M86 120 a8 3 0 1 0 0.1 0" />
        <path className="table-varnish" fill={url(id("varnish"))} d="M-2 44 C40 18 120 2 200 2 C280 2 360 18 402 44 V66 C360 42 280 28 200 28 C120 28 40 42 -2 66 Z" />
        <ellipse className="table-pool" fill={url(id("pool"))} cx="66" cy="48" rx="118" ry="62" />
        <ellipse className="table-glare" fill={url(id("glare"))} cx="322" cy="30" rx="112" ry="36" />
      </g>
      <path className="table-edge" d="M-2 44 C40 18 120 2 200 2 C280 2 360 18 402 44" />
    </svg>
  );
}

/** Two riders on a scooter, drawn as a silhouette for the night streets of the first ride. */
export function ScooterSprite({ className = "", ...rest }: SpriteProps) {
  const beamId = useId();
  return (
    <svg className={`scooter-sprite ${className}`.trim()} {...rest} viewBox="0 0 220 84" aria-hidden="true">
      <defs>
        <linearGradient id={beamId} x1="0" x2="1">
          <stop offset="0" stopColor="#ffe9b8" stopOpacity="0.42" />
          <stop offset="1" stopColor="#ffe9b8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse className="scooter-shadow" cx="70" cy="80" rx="64" ry="4" />
      <g className="scooter-body">
        <circle className="scooter-wheel" cx="28" cy="70" r="12" />
        <circle className="scooter-wheel" cx="112" cy="70" r="12" />
        <circle className="scooter-hub" cx="28" cy="70" r="4" />
        <circle className="scooter-hub" cx="112" cy="70" r="4" />
        <path className="scooter-frame" d="M36 66 C44 54 58 52 74 54 L96 58 C108 60 112 66 108 70 L40 70 Z" />
        <path className="scooter-frame" d="M98 56 C100 46 104 36 108 30 L116 32 C112 40 110 50 108 60 Z" />
        <path className="scooter-seat" d="M44 52 C50 44 74 42 84 48 L82 54 L46 56 Z" />
        <path className="scooter-rider" d="M54 50 C52 40 56 30 62 28 C60 22 62 16 66 16 C71 16 73 22 70 28 C78 30 80 40 78 50 Z" />
        <path className="scooter-rider scooter-rider-back" d="M74 52 C72 42 76 34 82 32 C80 26 82 20 86 20 C91 20 93 26 90 32 C98 34 100 44 98 54 Z" />
        <path className="scooter-headlight" d="M118 34 C122 32 124 32 126 34 C126 37 124 39 120 40 Z" />
      </g>
      <path className="scooter-beam" fill={`url(#${beamId})`} d="M126 34 L220 6 L220 66 L126 40 Z" />
    </svg>
  );
}

/** The crescent over the first ride: its lit limb, the ghost of the full disc, a halo and two moonlit wisps of cloud. */
export function MoonSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("moon-sprite", className)} {...rest} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <radialGradient id={id("halo")}>
          <stop className="moon-halo-core" offset="0.14" />
          <stop className="moon-halo-mid" offset="0.36" />
          <stop className="moon-halo-edge" offset="1" />
        </radialGradient>
        <radialGradient id={id("lit")} cx="0.2" cy="0.8" r="1">
          <stop className="moon-lit-hi" />
          <stop className="moon-lit-lo" offset="1" />
        </radialGradient>
        <linearGradient id={id("wisp")} x2="0" y2="1">
          <stop className="moon-wisp-hi" />
          <stop className="moon-wisp-lo" offset="1" />
        </linearGradient>
      </defs>
      <circle className="moon-halo" fill={url(id("halo"))} cx="20" cy="20" r="66" />
      <circle className="moon-ghost" cx="20" cy="20" r="18" />
      <path className="moon-lit" fill={url(id("lit"))} d="M15.9 2.5 A18 18 0 1 0 36.7 26.7 A16 16 0 0 1 15.9 2.5 Z" />
      <g className="moon-maria">
        <ellipse cx="9" cy="24" rx="2.6" ry="2" />
        <circle cx="13.6" cy="31" r="1.5" />
        <circle cx="6.6" cy="16.8" r="1.1" />
      </g>
      <path className="moon-wisp" fill={url(id("wisp"))} d="M-40 48 C-26 42 0 42 14 45 C26 47 44 44 62 47 C50 52 24 52 8 51 C-8 50 -26 52 -40 48 Z" />
      <path className="moon-wisp is-thin" fill={url(id("wisp"))} d="M17 33 C28 29.4 46 29.4 68 32.4 C57 35.4 40 36.4 30 36 C24 35.8 19.6 35 17 33 Z" />
    </svg>
  );
}

const NEAR_SKYLINE = "M0 90 V58 H8 V50 H12 V47 H15 V50 H18 V46 H30 V56 H34 V40 L40 35 L46 40 V60 H54 V50 H66 V44 H69 V41 H72 V44 H74 V60 H84 V48 H98 V64 H110 V52 H126 V38 H140 V56 H154 V30 H162 V24 H168 V30 H176 V58 H190 V48 H206 V62 H220 V42 H234 V54 H248 V36 H262 V50 H278 V60 H290 V46 H302 V54 H312 V48 H320 V10 L324 7 H346 L350 10 V52 H356 V40 H368 V56 H376 V50 H379 V47 H382 V50 H392 V58 H400 V90 Z";
const FAR_SKYLINE = "M0 90 V66 H12 V58 H26 V63 H40 V52 H48 V46 H54 V52 H66 V61 H84 V54 H100 V60 H116 V48 H128 V56 H146 V42 L152 36 L158 42 V57 H176 V63 H192 V50 H210 V59 H226 V53 H240 V61 H258 V46 H272 V55 H288 V61 H304 V51 H322 V57 H336 V47 H352 V59 H368 V53 H384 V62 H400 V90 Z";
/* The tower's windows on a grid, a little under half of them lit, every fourth lit one in the cool light of a screen. */
const TOWER_WINDOWS = Array.from({ length: 48 }, (_, i) => [i % 6, Math.floor(i / 6)])
  .filter(([column, row]) => (column * 5 + row * 3 + ((column * row) % 4)) % 7 < 3)
  .map(([column, row], i) => ({ x: round(322.6 + column * 4.2), y: 13 + row * 5, tone: i % 4 === 3 ? "is-cool" : "is-warm" }));
const STREET_WINDOWS = [
  [21, 50], [25.5, 54], [37, 45], [41.5, 45], [37, 51], [57, 54], [61.5, 58], [87, 52], [92, 56], [129, 43], [134, 49],
  [158, 34], [165, 30], [170, 40], [224, 47], [229, 52], [252, 41], [256.5, 47], [305, 58], [359, 45], [363.5, 50], [385, 54],
].map(([x, y], i) => ({ x, y, tone: i % 5 === 2 ? "is-cool" : "is-warm" }));
/* A handful of windows breathe; each is redrawn with the whole skyline, so they stay few. */
const SKYLINE_WINDOWS = [...STREET_WINDOWS, ...TOWER_WINDOWS].map((window, i) => ({ ...window, flicker: i % 7 === 3 }));

/**
 * The city behind the first ride. Near: rooftops with their water tanks, the tower where he waited with the roses,
 * windows still lit, and a moonlit edge on every roof (a lighter copy of the outline, nudged towards the moon).
 * Far: a lower line of blocks that sits back in the haze of the night air.
 */
export function SkylineSprite({ className = "", far = false, ...rest }: SpriteProps & { far?: boolean }) {
  const id = useIds();
  const outline = far ? FAR_SKYLINE : NEAR_SKYLINE;
  return (
    <svg className={svg("skyline-sprite", className)} {...rest} viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id("mass")} x2="0" y2="1">
          <stop className="skyline-mass-top" />
          <stop className="skyline-mass-base" offset="1" />
        </linearGradient>
      </defs>
      {far ? null : <path className="skyline-rim" d={outline} transform="translate(1.1 -1)" />}
      <path className="skyline-mass" fill={url(id("mass"))} d={outline} />
      {far ? null : (
        <>
          <path className="skyline-antenna" d="M335 7 V1 M330 7 V3.6" />
          <g className="skyline-windows">
            {SKYLINE_WINDOWS.map(({ x, y, tone, flicker }) => (
              <rect key={`${x}-${y}`} className={`${tone}${flicker ? " is-flicker" : ""}`} x={x} y={y} width="2.2" height="2.6" />
            ))}
          </g>
        </>
      )}
    </svg>
  );
}

/** A street light on the pavement of the first ride: a tapered pole, a swan-neck arm and its head, lit beneath. */
export function StreetLampSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={svg("street-lamp-sprite", className)} {...rest} viewBox="0 0 40 120" aria-hidden="true">
      <path className="street-lamp-iron" d="M6.4 120 L7.6 22 C7.6 11 13 6.4 21 6 L25 5.8 V7.4 L21 7.6 C14 8 9.8 12 9.8 22 L10.8 120 Z M4.2 120 L5.2 113 H12 L13 120 Z" />
      <path className="street-lamp-iron" d="M23.6 4.6 C28 2.8 35.6 3 39.4 5.6 C39.6 7.4 38.6 8.6 36.6 8.8 L25.6 9.2 C24 9.2 23.2 7.8 23.6 4.6 Z" />
      <path className="street-lamp-rim" d="M10.4 118 L9.5 24 C9.5 15.4 13.4 9.8 20 8.2 M27 4.2 C31 3 36 3.4 39 5.4" />
      <path className="street-lamp-lens" d="M26.2 8.9 C29 10.6 34.6 10.6 37 8.8 Z" />
    </svg>
  );
}

const RIDE_BODY = "M30 96 C30 86 36 80 48 79 L112 78 C116 78 118 82 116 88 L110 107 L142 106 C146 92 149 76 152 62 L162 60 C160 76 158 90 160 100 C168 95 182 96 190 103 L187 105 C180 100 168 99 160 105 L156 113 L104 114 C98 114 94 112 90 108 L84 106 C80 98 70 94 60 94 C50 94 42 98 38 104 L34 104 C31 102 30 99 30 96 Z";
const RIDE_STEERING = "M150 62 L155 46 L161 46 L159 62 Z M145 46.4 L168 43.4 L168.6 46.6 L145.6 49.6 Z M160 48 C165 45 172 46 174 50 C174 55 169 58 163 57 C160 55 159 52 160 48 Z";
const RIDE_DRIVER = "M94 76 C88 64 88 48 94 38 C97 32 101 29 106 28 C104 25 103 21 103.5 17 C104.5 9 110 4 116 4.5 C122 5 126 10 125.5 16 C125.4 18 124.6 19.4 123.4 20 L121.4 24 C124.6 26.6 128 31 131 35.6 L147.6 43.4 L148 47.4 L131.4 46 C127.6 45.6 124.4 44 122.6 42.4 C122 50 121.4 58 121 64 L136 64.6 C140.4 65 142 68.6 141 72.4 L139.6 103.6 L148.6 105.6 V108.6 H131 L132 76 C122 76.6 106 77 94 76 Z";
const RIDE_PASSENGER = "M68 76 C63.6 65 64.4 53 69.6 45.4 C72.8 40.6 77 37.6 82 36.8 C80.6 33.4 80.8 29.4 82.6 26.4 C85 21.6 90 19.4 95 20.4 C99.8 21.6 102.6 25.8 101.8 30.6 L100.2 33.6 C102.2 35.8 103.8 38.6 105 42 L113.6 47.6 L111.4 50.6 L101.4 45.8 C99 45 96.6 45 95 45.8 C94.4 52 94 58.4 94.4 64.6 L106 65 C110 65.4 111.4 69 110.4 72.4 L106.6 96 L114.4 98 V101 H99.6 L101 76 C90 76.6 78 77 68 76 Z";
const RIDE_OUTLINE = [RIDE_BODY, RIDE_STEERING, RIDE_DRIVER, RIDE_PASSENGER].join(" ");

/** A wheel of the night ride: tyre, rim, five spokes and a hub, with the moon caught on the top of the tyre. */
function RideWheel({ cx }: { cx: number }) {
  const spokes = Array.from({ length: 5 }, (_, i) => {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    return `M${round(cx + Math.cos(angle) * 3)} ${round(118 + Math.sin(angle) * 3)}L${round(cx + Math.cos(angle) * 9.6)} ${round(118 + Math.sin(angle) * 9.6)}`;
  }).join("");
  return (
    <g className="ride-wheel">
      <circle className="ride-tyre" cx={cx} cy="118" r="16" />
      <circle className="ride-wheel-rim" cx={cx} cy="118" r="10" />
      <path className="ride-spokes" d={spokes} />
      <circle className="ride-hub" cx={cx} cy="118" r="3" />
      <path className="ride-tyre-shine" d={`M${cx + 4} 103.4 A15 15 0 0 1 ${cx + 14.4} 113`} />
    </g>
  );
}

/**
 * The first ride, for Part II's night street: a step-through scooter with the two of them on it, she leaning on his
 * back. Silhouettes with a moonlit edge (the outline again in a lighter tone, nudged towards the moon), a little gloss on
 * the paint, the red tail light, and the headlight throwing its beam and a pool of light on the road ahead.
 * Part III's streets keep the plainer ScooterSprite.
 */
export function NightRideSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("ride-sprite", className)} {...rest} viewBox="0 0 240 140" aria-hidden="true">
      <defs>
        <linearGradient id={id("paint")} x2="0" y2="1">
          <stop className="ride-paint-hi" />
          <stop className="ride-paint-lo" offset="1" />
        </linearGradient>
        <linearGradient id={id("beam")} x2="1">
          <stop className="ride-beam-near" />
          <stop className="ride-beam-far" offset="1" />
        </linearGradient>
        <Glow id={id("pool")} name="ride-pool" />
        <Glow id={id("lamp")} name="ride-lamp" core={0.06} />
        <Glow id={id("tail")} name="ride-tail" core={0.08} />
      </defs>
      <Contact id={id("contact")} cx={112} cy={134.4} rx={86} ry={5} />
      <ellipse className="ride-pool" fill={url(id("pool"))} cx="212" cy="134" rx="40" ry="5.4" />
      <RideWheel cx={60} />
      <RideWheel cx={166} />
      {/* Everything above the wheels idles on its springs, the beam with it. */}
      <g className="ride-body">
        <path className="ride-rim" d={RIDE_OUTLINE} transform="translate(1 -1.1)" />
        <path className="ride-silhouette" d={RIDE_OUTLINE} />
        <path className="ride-paint" fill={url(id("paint"))} d={RIDE_BODY} />
        <path className="ride-seat" d="M44 79 C46 72 56 70 76 70 H108 C114 70 116 74 114 79 Z" />
        <path className="ride-gloss" d="M36 88 C38 84 42 81.6 48 81 M144 101 C147 90 149.6 78 152.4 66 M168 99.6 C174 98.8 181 99.6 186 102.4" />
        <ellipse className="ride-lens" cx="169.6" cy="51.8" rx="3.4" ry="3" />
        <path className="ride-taillight" d="M30.4 92 C31.2 89.6 33.4 88.6 35.4 89.2 L35 93.6 C33 94.2 31.2 93.6 30.4 92 Z" />
        <circle className="ride-tail-glow" fill={url(id("tail"))} cx="32.6" cy="91.4" r="9" />
        <circle className="ride-lamp-glow" fill={url(id("lamp"))} cx="170" cy="52" r="20" />
        <path className="ride-beam" fill={url(id("beam"))} d="M172 47.6 L240 22 V100 L172 56 Z" />
      </g>
    </svg>
  );
}

export function HeartSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={`heart-sprite ${className}`.trim()} {...rest} viewBox="0 0 24 22" aria-hidden="true">
      <path d="M12 21 C4 15 1 11 1 6.5 C1 3 3.5 1 6.5 1 C8.8 1 10.8 2.4 12 4.2 C13.2 2.4 15.2 1 17.5 1 C20.5 1 23 3 23 6.5 C23 11 20 15 12 21 Z" />
    </svg>
  );
}

const DUSK_CLOUD = "M8 52 C2 46 10 39 20 41 C21 32 33 27 43 32 C47 21 64 17 74 26 C81 15 100 13 109 24 C117 17 134 18 139 29 C149 24 164 27 167 36 C178 33 192 38 193 45 C204 44 214 49 210 54 C176 59 48 59 8 52 Z";

/** A bank of cloud at sunset: its lumpy top in the dusk, its flat underside lit from below by the sun, lined in gold. */
export function DuskCloudSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("dusk-cloud-sprite", className)} {...rest} viewBox="0 0 220 64" aria-hidden="true">
      <defs>
        <linearGradient id={id("body")} x2="0" y2="1">
          <stop className="dusk-cloud-top" />
          <stop className="dusk-cloud-mid" offset="0.56" />
          <stop className="dusk-cloud-base" offset="1" />
        </linearGradient>
      </defs>
      <path className="dusk-cloud" fill={url(id("body"))} d={DUSK_CLOUD} />
      <path className="dusk-cloud-lining" d="M18 51.6 C60 57 150 57.2 200 51.6" />
    </svg>
  );
}

const LAKE_TREE_CROWN = [crown(62, 66, 34, 17, 0.4), crown(108, 46, 36, 18, 1.2), crown(134, 92, 30, 15, 2.1), crown(92, 106, 28, 14, 2.9), crown(46, 106, 22, 11, 0.9), crown(146, 132, 16, 9, 1.6)].join(" ");
/* Gaps in the leaves where the sky shows through, drawn against the crown's winding so they cut holes in it. */
const LAKE_TREE_GAPS = [[80, 86, 5, 3.4], [116, 68, 4.4, 3], [56, 56, 3.6, 2.6], [128, 108, 4, 2.8], [96, 34, 3.4, 2.4]]
  .map(([cx, cy, rx, ry]) => `M${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}Z`).join("");
const LAKE_TREE_SPRIGS = sprigs([[30, 118, 130], [56, 132, 100], [88, 136, 90], [118, 124, 70], [152, 116, 30], [26, 90, 175], [36, 52, 215], [148, 40, 320], [158, 144, 60]], 10);
const LAKE_TREE_TRUNK = "M92 232 C94 200 92 170 96 140 C98 128 104 118 112 110 L116 114 C110 124 106 134 104 148 C102 172 104 202 108 232 Z M96 150 C86 138 74 132 62 124 L60 128 C72 134 84 144 92 156 Z M108 122 C116 108 120 96 120 84 L124 84 C124 98 120 110 112 126 Z M90 136 C84 120 74 108 64 98 L67 95 C78 106 88 118 94 132 Z";
const LAKE_TREE_LEAVES = `${LAKE_TREE_CROWN} ${LAKE_TREE_SPRIGS} ${LAKE_TREE_GAPS}`;

/** A big lakeside tree against the setting sun, as in the photo: a dark crown and trunk, gold along the sunward edge. */
export function LakeTreeSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("lake-tree-sprite", className)} {...rest} viewBox="0 0 160 232" aria-hidden="true">
      <defs>
        <linearGradient id={id("crown")} x2="1" y2="0.3">
          <stop className="lake-tree-lit" />
          <stop className="lake-tree-dark" offset="0.6" />
        </linearGradient>
      </defs>
      <path className="lake-tree-rim" d={`${LAKE_TREE_LEAVES} ${LAKE_TREE_TRUNK}`} transform="translate(-1.6 -0.8)" />
      <path className="lake-tree-trunk" d={LAKE_TREE_TRUNK} />
      <path className="lake-tree-crown" fill={url(id("crown"))} d={LAKE_TREE_LEAVES} />
    </svg>
  );
}

/**
 * The Thanh Niên embankment they sat on: the parapet along the water, its coping lit gold where the sun lies across it,
 * its face in shadow, and the paving of the promenade running towards us with a warm sheen on it.
 */
export function PromenadeSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("promenade-sprite", className)} {...rest} viewBox="0 0 440 116" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id("ground")} x2="0" y2="1">
          <stop className="promenade-near-wall" />
          <stop className="promenade-mid" offset="0.32" />
          <stop className="promenade-deep" offset="1" />
        </linearGradient>
        <linearGradient id={id("face")} x2="0" y2="1">
          <stop className="promenade-face-top" />
          <stop className="promenade-face-foot" offset="1" />
        </linearGradient>
        <linearGradient id={id("coping")}>
          <stop className="promenade-coping-dim" />
          <stop className="promenade-coping-lit" offset="0.78" />
          <stop className="promenade-coping-dim" offset="1" />
        </linearGradient>
        <Glow id={id("sheen")} name="promenade-sheen" />
      </defs>
      <path className="promenade-ground" fill={url(id("ground"))} d="M-4 21 H444 V116 H-4 Z" />
      <ellipse className="promenade-sheen" fill={url(id("sheen"))} cx="350" cy="26" rx="130" ry="20" />
      <path className="promenade-paving" d="M-4 42 H444 M-4 68 H444 M-4 100 H444 M70 21 L52 116 M170 21 L162 116 M270 21 L276 116 M370 21 L388 116" />
      <path className="promenade-face" fill={url(id("face"))} d="M-4 9 C140 8 300 8 444 9 V22 H-4 Z" />
      <path className="promenade-joints" d="M44 10 V22 M108 9.6 V22 M172 9.4 V22 M236 9.4 V22 M300 9.4 V22 M364 9.6 V22 M428 10 V22" />
      <path className="promenade-coping" fill={url(id("coping"))} d="M-4 6.6 C140 5.4 300 5.4 444 6.6 V10.4 C300 9.2 140 9.2 -4 10.4 Z" />
      <path className="promenade-grass" d={`${grass(-4, 64, 22.4, 7, 3.2)} ${grass(392, 444, 22.4, 7, 3.2)}`} />
    </svg>
  );
}

const COUPLE_HIM = "M8 80 C8 64 13 53 24 48.6 C29 46.6 34 45.6 38.6 44.8 C40.6 44.4 41.6 43 41.6 40.6 C37.6 38 35.6 33.4 35.8 28.6 C36.2 21 41.4 15.6 47.4 15.6 C53.6 15.6 58.6 21 58.8 28 C59 33 57 37.4 53.6 40.2 C53.6 42.8 55 44.4 58 45 C64 46 70 47.6 74 51 C78 54.4 80 61 80.4 68 L81 80 Z";
const COUPLE_HER = "M60 80 C60 70 62 62.4 67 58.6 C70 56.2 73.6 55.2 76.6 54.6 C78 54.2 78.8 53 78.8 51.6 C74.4 50 71.2 46.6 70.4 42.4 C69.4 36.4 72.8 30.8 78.6 29.6 C84.6 28.4 89.8 32 90.6 37.6 C91.4 42.4 89 46.6 85.4 48.6 C85.4 51 87.4 52.6 90.4 53.6 C96 55.6 101 58.4 103 63 C104.6 67.4 105 73 105 80 Z";
const COUPLE_HAIR = "M70.8 42 C70 34.4 75 29.2 81 28.8 C87.4 28.4 91.4 33.4 91.2 39.4 C91 45 89 49.4 89.4 54.6 C89.8 59 92.4 62.6 95.6 65.4 C90.4 66.8 85.6 65 83 61.4 C80.6 58 80.4 53.6 81 49.8 C77 48.8 72.4 46.4 70.8 42 Z";
const COUPLE_OUTLINE = [COUPLE_HIM, COUPLE_HER, COUPLE_HAIR].join(" ");

/**
 * The two of them sitting close, seen from behind, her head on his shoulder and her long hair down her back. Plain
 * silhouettes; the light they sit against draws a bright line round them (the outline stroked behind the fill). A
 * scene can also show the bench they sit on and the long shadow the low sun lays out behind them.
 */
export function CoupleSittingSprite({ className = "", ...rest }: SpriteProps) {
  const id = useIds();
  return (
    <svg className={svg("couple-sprite", className)} {...rest} viewBox="0 0 120 80" aria-hidden="true">
      <defs>
        <linearGradient id={id("rim")} x2="0" y2="1">
          <stop className="couple-rim-top" />
          <stop className="couple-rim-low" offset="1" />
        </linearGradient>
        <linearGradient id={id("cast")} x2="0" y2="1">
          <stop className="couple-cast-near" />
          <stop className="couple-cast-far" offset="1" />
        </linearGradient>
      </defs>
      <path className="couple-cast" fill={url(id("cast"))} d="M22 79 H100 L116 110 H4 Z" />
      <path className="couple-rim" stroke={url(id("rim"))} d={COUPLE_OUTLINE} />
      <path className="couple-body" d={COUPLE_OUTLINE} />
      <path className="couple-strands" d="M84.6 34 C88.6 40 86 49 88.4 57 M80 31.4 C83 36 82.4 42 83.4 48" />
      <g className="couple-bench">
        <path className="couple-bench-post" d="M6 64 H11 V80 H6 Z M109 64 H114 V80 H109 Z" />
        <path className="couple-bench-slat" d="M0 63 H120 V68.4 H0 Z M0 71.6 H120 V77 H0 Z" />
      </g>
    </svg>
  );
}
