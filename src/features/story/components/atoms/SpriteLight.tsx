import { url } from "./spriteIds";

/* The light the lit sprites of Parts II and III share. Their stops are coloured in CSS (`.sprite-contact-*`,
   `.sprite-gloss-*`), so each part darkens its shadows in its own night. */

/** The soft shadow under a thing that rests on a surface: darkest where it touches, gone by the edge. */
export function Contact({ id, cx, cy, rx, ry }: { id: string; cx: number; cy: number; rx: number; ry: number }) {
  return (
    <>
      <radialGradient id={id}>
        <stop className="sprite-contact-core" offset="0.2" />
        <stop className="sprite-contact-edge" offset="1" />
      </radialGradient>
      <ellipse className="sprite-contact" cx={cx} cy={cy} rx={rx} ry={ry} fill={url(id)} />
    </>
  );
}

/** A highlight that fades out along its length, for glass, glaze and gloss. */
export function Gloss({ id, x2 = 0, y2 = 1 }: { id: string; x2?: number; y2?: number }) {
  return (
    <linearGradient id={id} x2={x2} y2={y2}>
      <stop className="sprite-gloss-hi" />
      <stop className="sprite-gloss-lo" offset="1" />
    </linearGradient>
  );
}

/** A glow: brightest at its heart, gone by its edge. Its stops take the class `${name}-core` / `${name}-edge`. */
export function Glow({ id, name, core = 0 }: { id: string; name: string; core?: number }) {
  return (
    <radialGradient id={id}>
      <stop className={`${name}-core`} offset={core} />
      <stop className={`${name}-edge`} offset="1" />
    </radialGradient>
  );
}
