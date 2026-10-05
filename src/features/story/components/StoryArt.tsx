import type { CSSProperties, ReactElement } from "react";

/**
 * The little painted things that fill the story's skies and margins: clouds, blossoms, cherry twigs, butterflies and birds
 * for Part I's afternoon; hydrangea florets and paper lanterns for Part II's night (clouds are shared, recoloured by each
 * page). They are inline SVG so the stylesheets can colour and animate their parts; all of them are decorative.
 */

interface ArtProps {
  className?: string;
  style?: CSSProperties;
}

/** Each cloud is a few overlapping puffs in one colour over a pink underside, so it stays soft at any size. */
const cloudShapes: Array<{ viewBox: string; puffs: ReactElement }> = [
  {
    viewBox: "0 0 240 120",
    puffs: (
      <>
        <circle cx="62" cy="72" r="28" />
        <circle cx="98" cy="52" r="36" />
        <circle cx="142" cy="48" r="40" />
        <circle cx="184" cy="68" r="30" />
        <rect x="40" y="66" width="164" height="34" rx="17" />
      </>
    ),
  },
  {
    viewBox: "0 0 240 110",
    puffs: (
      <>
        <circle cx="52" cy="70" r="24" />
        <circle cx="88" cy="56" r="32" />
        <circle cx="128" cy="48" r="30" />
        <circle cx="164" cy="60" r="28" />
        <circle cx="196" cy="72" r="20" />
        <rect x="34" y="68" width="176" height="28" rx="14" />
      </>
    ),
  },
  {
    viewBox: "0 0 150 90",
    puffs: (
      <>
        <circle cx="40" cy="62" r="20" />
        <circle cx="70" cy="46" r="26" />
        <circle cx="102" cy="54" r="22" />
        <circle cx="126" cy="66" r="15" />
        <rect x="24" y="60" width="114" height="22" rx="11" />
      </>
    ),
  },
];

export function Cloud({ variant = 0, className = "", style }: ArtProps & { variant?: number }) {
  const shape = cloudShapes[variant % cloudShapes.length];
  return (
    <svg className={`art-cloud ${className}`.trim()} viewBox={shape.viewBox} style={style} aria-hidden="true" focusable="false">
      <g className="art-cloud-shade" transform="translate(0 6)">{shape.puffs}</g>
      <g className="art-cloud-body">{shape.puffs}</g>
    </svg>
  );
}

/** Five notched petals, the way cherry blossoms are drawn. */
function petals(cx: number, cy: number, scale = 1) {
  return [0, 72, 144, 216, 288].map((turn, index) => (
    <path
      key={turn}
      className={index % 2 ? "art-petal is-light" : "art-petal"}
      d="M16 16C12 11 12.2 5 14.6 3.4L16 4.8l1.4-1.4C19.8 5 20 11 16 16z"
      transform={`translate(${cx - 16 * scale} ${cy - 16 * scale}) scale(${scale}) rotate(${turn} 16 16)`}
    />
  ));
}

export function Blossom({ className = "", style }: ArtProps) {
  return (
    <svg className={`art-blossom ${className}`.trim()} viewBox="0 0 32 32" style={style} aria-hidden="true" focusable="false">
      {petals(16, 16)}
      <circle className="art-blossom-heart" cx="16" cy="16" r="2.6" />
    </svg>
  );
}

/** A cherry twig in flower, growing in from the left edge, or from the right with `flip`. */
export function Sprig({ flip = false, className = "", style }: ArtProps & { flip?: boolean }) {
  const flowers: Array<[number, number, number]> = [[80, 37, 0.85], [100, 61, 0.7], [136, 20, 0.75], [122, 10, 0.55], [50, 55, 0.65]];
  return (
    <svg className={`art-sprig ${className}`.trim()} viewBox="0 0 160 90" style={style} aria-hidden="true" focusable="false">
      <g transform={flip ? "matrix(-1 0 0 1 160 0)" : undefined}>
        <path className="art-sprig-branch" d="M0 70C30 64 52 52 74 40c18-10 38-14 66-18" />
        <path className="art-sprig-branch is-twig" d="M62 46c8 10 20 16 34 18" />
        <path className="art-sprig-branch is-twig" d="M104 30c8-10 16-16 28-20" />
        {flowers.map(([x, y, scale]) => (
          <g key={`${x}-${y}`}>
            {petals(x, y, scale)}
            <circle className="art-blossom-heart" cx={x} cy={y} r={2.4 * scale} />
          </g>
        ))}
        <circle className="art-bud" cx="146" cy="24" r="2.6" />
        <circle className="art-bud" cx="110" cy="66" r="2.2" />
      </g>
    </svg>
  );
}

export type ButterflyTheme = "rose" | "peach" | "lilac" | "gold";

/** Two wings that close toward the body (the stylesheet flaps them), a body and two feelers. */
export function Butterfly({ theme, className = "", style }: ArtProps & { theme: ButterflyTheme }) {
  return (
    <svg className={`art-butterfly is-${theme} ${className}`.trim()} viewBox="0 0 48 40" style={style} aria-hidden="true" focusable="false">
      <g className="art-wing">
        <path className="art-wing-upper" d="M24 19C18 6 6 1 3 7s5 12 21 14z" />
        <path className="art-wing-lower" d="M24 21c-11 0-16 7-13 12s10-2 13-10z" />
        <circle className="art-wing-spot" cx="9" cy="9" r="1.7" />
      </g>
      <g className="art-wing">
        <path className="art-wing-upper" d="M24 19c6-13 18-18 21-12s-5 12-21 14z" />
        <path className="art-wing-lower" d="M24 21c11 0 16 7 13 12s-10-2-13-10z" />
        <circle className="art-wing-spot" cx="39" cy="9" r="1.7" />
      </g>
      <path className="art-butterfly-body" d="M24 13v18" />
      <path className="art-butterfly-feelers" d="M24 14c-1-5-3-7.5-5.5-8.5M24 14c1-5 3-7.5 5.5-8.5" />
    </svg>
  );
}

/** A bird far off: two arcs of wing that the stylesheet beats; nothing more is visible at that distance. */
export function Bird({ className = "", style }: ArtProps) {
  return (
    <svg className={`art-bird ${className}`.trim()} viewBox="0 0 40 16" style={style} aria-hidden="true" focusable="false">
      <path d="M2 10c6-6 12-6 18 1 6-7 12-7 18-1" />
    </svg>
  );
}

/** One floret of a hydrangea head: four rounded petals and a pale eye, Part II's flower. */
export function Floret({ className = "", style }: ArtProps) {
  return (
    <svg className={`art-floret ${className}`.trim()} viewBox="0 0 32 32" style={style} aria-hidden="true" focusable="false">
      {[0, 90, 180, 270].map((turn, index) => (
        <path
          key={turn}
          className={index % 2 ? "art-floret-petal is-light" : "art-floret-petal"}
          d="M16 15c-4.5-1-7.5-5-6-9.5 1.2-3.4 5-4 6-1.5 1-2.5 4.8-1.9 6 1.5 1.5 4.5-1.5 8.5-6 9.5z"
          transform={`rotate(${turn} 16 16)`}
        />
      ))}
      <circle className="art-floret-eye" cx="16" cy="16" r="2.2" />
    </svg>
  );
}

/** A paper sky lantern with a small flame; its warm glow is drawn by the stylesheet around it. */
export function Lantern({ className = "", style }: ArtProps) {
  return (
    <svg className={`art-lantern ${className}`.trim()} viewBox="0 0 40 56" style={style} aria-hidden="true" focusable="false">
      <path className="art-lantern-paper" d="M8 6h24c3 0 5 2 5 5v30c0 6-7 9-17 9S3 47 3 41V11c0-3 2-5 5-5z" />
      <path className="art-lantern-rib" d="M14 7c-2 12-2 30 0 42M26 7c2 12 2 30 0 42" />
      <path className="art-lantern-rim" d="M10 50h20" />
      <ellipse className="art-lantern-flame" cx="20" cy="45" rx="3" ry="4.5" />
    </svg>
  );
}
