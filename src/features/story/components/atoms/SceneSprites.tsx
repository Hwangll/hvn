import type { SVGProps } from "react";

/* Small vector props for the Part II dioramas. Colours live in CSS so each scene can tint them;
   extra props (data-* scroll hints) pass straight through to the <svg>. */
type SpriteProps = SVGProps<SVGSVGElement>;

export function FishSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={`fish-sprite ${className}`.trim()} {...rest} viewBox="0 0 64 32" aria-hidden="true">
      {/* Mirrored fish flip this group in CSS, so the scroll engine can own the outer transform. */}
      <g className="fish-shape">
        <g className="fish-tail">
          <path d="M45 16 L62 5 L57 16 L62 27 Z" />
        </g>
        <path className="fish-body" d="M4 16 C10 4 34 2 48 16 C34 30 10 28 4 16 Z" />
        <path className="fish-belly" d="M10 18.5 C18 24.5 34 26 46 17.5 C34 23.5 18 22.5 10 18.5 Z" />
        <path className="fish-fin" d="M22 9.5 C26 3 34 3 37 8 C31 9 26 10 22 9.5 Z" />
        <path className="fish-fin fish-fin-low" d="M24 22 C27 27 33 27.5 36 24 C31 24 27 23.5 24 22 Z" />
        <circle className="fish-eye" cx="12.5" cy="14" r="2.1" />
        <circle className="fish-glint" cx="13.2" cy="13.3" r="0.75" />
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

export function CloudSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={`cloud-sprite ${className}`.trim()} {...rest} viewBox="0 0 120 44" aria-hidden="true">
      <path d="M14 38 C2 38 2 22 14 22 C14 8 36 4 44 16 C50 4 76 4 80 18 C96 12 114 22 108 38 Z" />
    </svg>
  );
}
