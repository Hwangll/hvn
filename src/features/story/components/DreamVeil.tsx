import type { CSSProperties } from "react";
import { Bird } from "./StoryArt";

/**
 * The topmost layer of both parts, over the story itself: a little light in the air between the reader and the page, so
 * the whole thing reads as if seen through a dream. Motes rise and fade, two or three soft orbs drift, a light leak
 * sweeps across now and then, the corners mist over; by day a small flock sometimes crosses right in front of the story.
 * It never takes the pointer and is faint enough to read through (colours in part-one-depth.css / part-two-depth.css).
 */

interface Mote {
  x: string;
  y: string;
  size: number;
  life: number;
  delay: number;
  dx: string;
  /** Kept to wide screens. */
  wide?: boolean;
}

const motes: Mote[] = [
  { x: "8%", y: "86%", size: 4, life: 18, delay: -2, dx: "3vw" },
  { x: "22%", y: "70%", size: 3, life: 22, delay: -9, dx: "-2vw", wide: true },
  { x: "34%", y: "94%", size: 5, life: 16, delay: -5, dx: "2vw" },
  { x: "47%", y: "78%", size: 3, life: 24, delay: -14, dx: "-3vw", wide: true },
  { x: "58%", y: "90%", size: 4, life: 19, delay: -11, dx: "4vw", wide: true },
  { x: "69%", y: "74%", size: 6, life: 21, delay: -3, dx: "-2vw", wide: true },
  { x: "80%", y: "88%", size: 3, life: 17, delay: -7, dx: "2vw" },
  { x: "91%", y: "80%", size: 5, life: 23, delay: -16, dx: "-4vw", wide: true },
];

const orbs = [
  { x: "-6%", y: "8%", size: "26vw", life: 30, delay: -6, dx: "8vw", dy: "6vh" },
  { x: "70%", y: "54%", size: "22vw", life: 26, delay: -14, dx: "-6vw", dy: "-8vh", wide: true },
  { x: "30%", y: "78%", size: "18vw", life: 34, delay: -20, dx: "5vw", dy: "-6vh", wide: true },
];

/** The flock that passes in front of the story: a few big, slightly soft birds, about once every forty seconds. */
const frontFlock = { y: "30%", life: 40, delay: -6, span: "15rem", bird: "2.6rem", birds: [[0, 40], [34, 10], [64, 52]] } as const;

export function DreamVeil({ variant }: { variant: "day" | "night" }) {
  return (
    <div className={`dream-veil is-${variant}`} aria-hidden="true">
      <div className="dream-haze" />
      {orbs.map((orb) => (
        <span
          className="dream-orb"
          data-wide={orb.wide || undefined}
          style={{ "--x": orb.x, "--y": orb.y, "--size": orb.size, "--life": `${orb.life}s`, "--delay": `${orb.delay}s`, "--dx": orb.dx, "--dy": orb.dy } as CSSProperties}
          key={orb.x}
        />
      ))}
      <span className="dream-leak" />
      {motes.map((mote) => (
        <span
          className="dream-dust"
          data-wide={mote.wide || undefined}
          style={{ "--x": mote.x, "--y": mote.y, "--size": `${mote.size}px`, "--life": `${mote.life}s`, "--delay": `${mote.delay}s`, "--dx": mote.dx } as CSSProperties}
          key={mote.x}
        />
      ))}
      {variant === "day" ? (
        <div
          className="flock"
          data-wide
          style={{ "--y": frontFlock.y, "--life": `${frontFlock.life}s`, "--delay": `${frontFlock.delay}s`, "--span": frontFlock.span, "--bird": frontFlock.bird } as CSSProperties}
        >
          {frontFlock.birds.map(([x, y], index) => (
            <Bird key={`${x}-${y}`} style={{ left: `${x}%`, top: `${y}%`, "--beat": `${0.36 + index * 0.07}s` } as CSSProperties} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
