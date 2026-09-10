import type { CSSProperties, SVGProps } from "react";

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

export function JellyfishSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={`jelly-sprite ${className}`.trim()} {...rest} viewBox="0 0 60 90" aria-hidden="true">
      <g className="jelly-tentacles">
        <path d="M18 44 C14 56 22 62 16 74 C12 82 18 86 15 90" />
        <path d="M26 46 C24 58 30 64 26 76 C24 82 28 86 26 90" />
        <path d="M34 46 C36 58 30 64 34 76 C36 82 32 86 34 90" />
        <path d="M42 44 C46 56 38 62 44 74 C48 82 42 86 45 90" />
      </g>
      <path className="jelly-bell" d="M4 40 C4 14 18 2 30 2 C42 2 56 14 56 40 C50 46 44 42 40 46 C36 42 34 44 30 48 C26 44 24 42 20 46 C16 42 10 46 4 40 Z" />
      <path className="jelly-shine" d="M14 30 C14 18 20 10 28 8 C22 14 19 22 19 32 Z" />
      <circle className="jelly-spot" cx="24" cy="26" r="2.2" />
      <circle className="jelly-spot" cx="36" cy="22" r="1.6" />
      <circle className="jelly-spot" cx="40" cy="32" r="1.3" />
    </svg>
  );
}

export function KelpSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={`kelp-sprite ${className}`.trim()} {...rest} viewBox="0 0 40 120" aria-hidden="true">
      <path className="kelp-blade" d="M20 120 C6 104 30 92 18 76 C8 62 30 52 20 36 C12 22 26 12 20 0 C28 14 12 26 24 40 C34 54 10 64 22 78 C32 92 8 104 20 120 Z" />
      <path className="kelp-blade kelp-blade-back" d="M30 120 C22 106 38 96 30 84 C22 72 36 62 30 48 C24 40 34 30 32 18 C36 30 26 40 32 50 C38 62 24 72 32 86 C40 98 24 108 30 120 Z" />
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

export function BirdSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={`bird-sprite ${className}`.trim()} {...rest} viewBox="0 0 40 18" aria-hidden="true">
      <path className="bird-wing bird-wing-left" d="M20 12 C14 4 8 2 1 6 C8 6 14 9 20 12 Z" />
      <path className="bird-wing bird-wing-right" d="M20 12 C26 4 32 2 39 6 C32 6 26 9 20 12 Z" />
    </svg>
  );
}

/** A tall ice-cream cup with a swirl and a straw, for the two drinks of the Mixue night. */
export function DrinkCupSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={`drink-sprite ${className}`.trim()} {...rest} viewBox="0 0 60 110" aria-hidden="true">
      <path className="drink-straw" d="M38 8 L44 62" />
      <path className="drink-lid" d="M8 34 C8 30 52 30 52 34 L50 40 L10 40 Z" />
      <path className="drink-cup" d="M11 40 L49 40 L43 104 C43 107 17 107 17 104 Z" />
      <path className="drink-fill" d="M13.5 62 L46.5 62 L43 104 C43 107 17 107 17 104 Z" />
      <path className="drink-swirl" d="M18 32 C18 20 26 20 26 26 C26 14 40 12 40 22 C40 12 50 20 44 30 Z" />
      <path className="drink-shine" d="M17 46 L20 96" />
      <path className="drink-drop" d="M46 70 C46 66 50 62 50 60 C50 62 54 66 54 70 C54 73 46 73 46 70 Z" />
    </svg>
  );
}

/** A coffee cup on its saucer, seen from the table, with room above for steam. */
export function CoffeeCupSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={`coffee-sprite ${className}`.trim()} {...rest} viewBox="0 0 120 70" aria-hidden="true">
      <ellipse className="coffee-saucer" cx="56" cy="60" rx="52" ry="8" />
      <ellipse className="coffee-saucer-ring" cx="56" cy="59" rx="34" ry="4.5" />
      <path className="coffee-handle" d="M86 24 C104 22 106 44 88 46" />
      <path className="coffee-cup" d="M18 18 L92 18 C92 40 84 56 55 56 C26 56 18 40 18 18 Z" />
      <ellipse className="coffee-rim" cx="55" cy="18" rx="37" ry="7" />
      <ellipse className="coffee-liquid" cx="55" cy="18.5" rx="31" ry="5" />
      <path className="coffee-heart" d="M55 21.5 C51 18 49.5 15.5 51.5 14.2 C53 13.4 54.5 14.4 55 15.3 C55.5 14.4 57 13.4 58.5 14.2 C60.5 15.5 59 18 55 21.5 Z" />
    </svg>
  );
}

/** Two riders on a scooter, drawn as a silhouette for the night streets of the first ride. */
export function ScooterSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={`scooter-sprite ${className}`.trim()} {...rest} viewBox="0 0 140 84" aria-hidden="true">
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
      <path className="scooter-beam" d="M126 34 L140 22 L140 52 L126 40 Z" />
    </svg>
  );
}

/** A low city skyline for the far distance of the night scene. */
export function SkylineSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={`skyline-sprite ${className}`.trim()} {...rest} viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 90 L0 62 L18 62 L18 48 L34 48 L34 70 L52 70 L52 30 L58 22 L64 30 L64 66 L88 66 L88 52 L108 52 L108 74 L124 74 L124 40 L146 40 L146 62 L160 62 L160 20 L166 14 L172 20 L172 58 L196 58 L196 68 L214 68 L214 44 L236 44 L236 76 L252 76 L252 34 L270 34 L270 60 L290 60 L290 50 L312 50 L312 72 L328 72 L328 26 L336 18 L344 26 L344 64 L362 64 L362 56 L382 56 L382 78 L400 78 L400 90 Z" />
      <g className="skyline-windows">
        <rect x="55" y="36" width="3" height="4" /><rect x="57" y="46" width="3" height="4" /><rect x="128" y="46" width="3" height="4" /><rect x="138" y="52" width="3" height="4" />
        <rect x="163" y="30" width="3" height="4" /><rect x="166" y="40" width="3" height="4" /><rect x="256" y="42" width="3" height="4" /><rect x="262" y="50" width="3" height="4" />
        <rect x="332" y="34" width="3" height="4" /><rect x="338" y="44" width="3" height="4" /><rect x="220" y="50" width="3" height="4" /><rect x="94" y="58" width="3" height="4" />
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

/** Two people sitting close together, seen from behind, for the hoàng hôn hill. */
export function CoupleSittingSprite({ className = "", ...rest }: SpriteProps) {
  return (
    <svg className={`couple-sprite ${className}`.trim()} {...rest} viewBox="0 0 120 80" aria-hidden="true">
      <path className="couple-body" d="M20 80 C18 60 26 44 40 42 C44 30 60 30 62 42 C70 44 76 54 76 66 L76 80 Z" />
      <path className="couple-head" d="M38 30 C38 20 44 14 51 14 C58 14 64 20 64 30 C64 38 58 42 51 42 C44 42 38 38 38 30 Z" />
      <path className="couple-hair" d="M36 30 C34 16 44 8 54 10 C66 12 68 22 66 32 C62 22 56 20 50 22 C44 24 38 26 36 30 Z" />
      <path className="couple-body couple-body-two" d="M60 80 C58 62 66 48 78 46 C82 36 96 36 98 46 C108 48 112 58 112 70 L112 80 Z" />
      <path className="couple-head" d="M76 38 C76 30 81 25 87 25 C93 25 98 30 98 38 C98 44 93 48 87 48 C81 48 76 44 76 38 Z" />
      <path className="couple-hair" d="M74 40 C72 26 82 22 90 26 C86 28 82 32 80 40 C78 36 76 36 74 40 Z" />
    </svg>
  );
}
