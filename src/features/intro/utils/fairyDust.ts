/**
 * Fairy dust over the memory room (FairyDust.tsx): lights that wander and pulse like fireflies, a few that circle the
 * bouquet, petals falling through the realm (sunflower and cherry at dusk, hydrangea florets at night), sparks rising off
 * the plinth, a butterfly or two of light and a trail of glitter behind the pointer. Opening the story draws everything
 * into the bouquet.
 *
 * It is all one canvas over the room, painted from a few sprites drawn once; glows add up where they cross, the way light
 * does. There are a few dozen things in the air on a computer and half that on a phone.
 */

export type FairyVariant = "dusk" | "night";

export interface FairyProfile {
  wisps: number;
  orbiters: number;
  petals: number;
  butterflies: number;
  /** Sparks rising off the plinth per second. */
  sparks: number;
  /** One glitter for every this many px the pointer travels; 0 for none. */
  trailSpacing: number;
  cap: number;
  /** The most device pixels per css px the canvas uses: soft lights need no more. */
  ratio: number;
}

const profiles: Record<"desktop" | "mobile", FairyProfile> = {
  desktop: { wisps: 26, orbiters: 7, petals: 14, butterflies: 2, sparks: 5, trailSpacing: 11, cap: 240, ratio: 1.5 },
  mobile: { wisps: 12, orbiters: 4, petals: 7, butterflies: 1, sparks: 2.5, trailSpacing: 0, cap: 120, ratio: 1.25 },
};

export const fairyProfile = (mobile: boolean): FairyProfile => profiles[mobile ? "mobile" : "desktop"];

const TAU = Math.PI * 2;

/** Where a wandering light sits around its anchor at time `t`: two slow sines a side, so its path never quite repeats. */
export function wander(t: number, phase: number, rx: number, ry: number): [number, number] {
  return [
    rx * (0.7 * Math.sin(t * 0.31 + phase) + 0.3 * Math.sin(t * 0.83 + phase * 1.7)),
    ry * (0.65 * Math.cos(t * 0.27 + phase * 1.3) + 0.35 * Math.sin(t * 0.71 + phase * 0.6)),
  ];
}

/** A point on a ring round the bouquet seen from a little above; `front` runs from 0 behind the bouquet to 1 before it. */
export function orbitPoint(angle: number, radius: number, tilt: number): { x: number; y: number; front: number } {
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius * tilt, front: (Math.sin(angle) + 1) / 2 };
}

/** How many glitters a pointer stroke of `distance` px leaves, one every `spacing` px, and the distance carried over. */
export function trailSpawns(carry: number, distance: number, spacing: number): [count: number, carry: number] {
  if (spacing <= 0) return [0, 0];
  const budget = carry + distance;
  const count = Math.floor(budget / spacing);
  return [count, budget - count * spacing];
}

/** A firefly's glow at time `t`, from 0.4 to 1: dim most of the time, swelling now and then. */
export function pulse(t: number, rate: number, phase: number): number {
  const wave = 0.5 + 0.5 * Math.sin(t * rate + phase);
  return 0.4 + 0.6 * wave * wave * wave;
}

/** A butterfly's figure of eight round a point, `width` × `height` px across; with which way it is flying (radians). */
export function butterflyFlight(t: number, phase: number, width: number, height: number): { x: number; y: number; heading: number } {
  const turn = t * 0.42 + phase;
  const bob = t * 1.3 + phase;
  const x = Math.sin(turn) * width * 0.5;
  const y = Math.sin(turn * 2) * height * 0.25 + Math.sin(bob) * height * 0.06;
  const dx = Math.cos(turn) * width * 0.21;
  const dy = Math.cos(turn * 2) * height * 0.21 + Math.cos(bob) * height * 0.078;
  return { x, y, heading: Math.atan2(dy, dx) };
}

/* ---------- Sprites, drawn once ---------- */

const SPRITE = 64;

function paint(draw: (context: CanvasRenderingContext2D) => void, blur = 0): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = SPRITE;
  canvas.height = SPRITE;
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  if (blur && "filter" in context) context.filter = `blur(${blur}px)`;
  context.translate(SPRITE / 2, SPRITE / 2);
  draw(context);
  return canvas;
}

/** A point of light in a coloured halo. */
function glow(rgb: string) {
  return (context: CanvasRenderingContext2D) => {
    const fill = context.createRadialGradient(0, 0, 0, 0, 0, 31);
    fill.addColorStop(0, "rgba(255, 255, 255, 1)");
    fill.addColorStop(0.09, "rgba(255, 255, 255, 0.92)");
    fill.addColorStop(0.22, `rgba(${rgb}, 0.72)`);
    fill.addColorStop(0.5, `rgba(${rgb}, 0.2)`);
    fill.addColorStop(1, `rgba(${rgb}, 0)`);
    context.fillStyle = fill;
    context.beginPath();
    context.arc(0, 0, 31, 0, TAU);
    context.fill();
  };
}

/** A four-pointed star in a faint halo. */
function sparkle(rgb: string) {
  return (context: CanvasRenderingContext2D) => {
    const halo = context.createRadialGradient(0, 0, 0, 0, 0, 20);
    halo.addColorStop(0, `rgba(${rgb}, 0.75)`);
    halo.addColorStop(1, `rgba(${rgb}, 0)`);
    context.fillStyle = halo;
    context.beginPath();
    context.arc(0, 0, 20, 0, TAU);
    context.fill();
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.moveTo(0, -29);
    context.quadraticCurveTo(2, -2, 29, 0);
    context.quadraticCurveTo(2, 2, 0, 29);
    context.quadraticCurveTo(-2, 2, -29, 0);
    context.quadraticCurveTo(-2, -2, 0, -29);
    context.fill();
  };
}

/** A sunflower's ray petal: long, pointed, a crease down the middle. */
function sunflowerPetal([base, body, tip]: [string, string, string]) {
  return (context: CanvasRenderingContext2D) => {
    const shape = new Path2D("M0 27C-8.5 16-9.5-6-3.5-22.5Q0-30 3.5-22.5C9.5-6 8.5 16 0 27Z");
    const fill = context.createLinearGradient(0, 27, 0, -28);
    fill.addColorStop(0, base);
    fill.addColorStop(0.45, body);
    fill.addColorStop(1, tip);
    context.fillStyle = fill;
    context.fill(shape);
    context.strokeStyle = "rgba(160, 80, 10, 0.35)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, 22);
    context.quadraticCurveTo(-1, 0, 0, -20);
    context.stroke();
  };
}

/** A cherry petal, notched at the tip. */
function cherryPetal([base, body, tip]: [string, string, string]) {
  return (context: CanvasRenderingContext2D) => {
    const shape = new Path2D("M0 22C-15.5 13.5-18.5-9-7.5-20Q-3.2-23.2 0-16.8Q3.2-23.2 7.5-20C18.5-9 15.5 13.5 0 22Z");
    const fill = context.createLinearGradient(0, 22, 0, -22);
    fill.addColorStop(0, base);
    fill.addColorStop(0.42, body);
    fill.addColorStop(1, tip);
    context.fillStyle = fill;
    context.fill(shape);
  };
}

/** A hydrangea floret: four rounded sepals round a pale eye. */
function floret([outer, inner]: [string, string]) {
  return (context: CanvasRenderingContext2D) => {
    for (let index = 0; index < 4; index += 1) {
      context.save();
      context.rotate((index * TAU) / 4 + Math.PI / 4);
      const fill = context.createLinearGradient(0, -23, 0, 0);
      fill.addColorStop(0, outer);
      fill.addColorStop(1, inner);
      context.fillStyle = fill;
      context.beginPath();
      context.ellipse(0, -11.5, 9, 12, 0, 0, TAU);
      context.fill();
      context.restore();
    }
    context.fillStyle = "#fff8ea";
    context.beginPath();
    context.arc(0, 0, 3.2, 0, TAU);
    context.fill();
  };
}

/** One wing of a butterfly of light, its root at the sprite's centre: an upper and a lower lobe. */
function wing([edge, body, root]: [string, string, string], rgb: string) {
  return (context: CanvasRenderingContext2D) => {
    const fill = context.createLinearGradient(0, 0, 30, -10);
    fill.addColorStop(0, root);
    fill.addColorStop(0.5, body);
    fill.addColorStop(1, edge);
    context.shadowColor = `rgba(${rgb}, 0.9)`;
    context.shadowBlur = 6;
    context.fillStyle = fill;
    context.beginPath();
    context.moveTo(0, 0);
    context.bezierCurveTo(5, -17, 25, -27, 29.5, -17);
    context.bezierCurveTo(32, -8, 20, 1, 0, 2);
    context.moveTo(0, 2);
    context.bezierCurveTo(14, 4, 23, 12, 18.5, 21);
    context.bezierCurveTo(14, 27, 4, 17, 0, 4);
    context.fill();
    context.shadowColor = "transparent";
    context.fillStyle = "rgba(255, 255, 255, 0.85)";
    context.beginPath();
    context.arc(19, -15, 2.4, 0, TAU);
    context.fill();
  };
}

interface Sprites {
  glows: HTMLCanvasElement[];
  sparkle: HTMLCanvasElement;
  petals: Array<{ sharp: HTMLCanvasElement; soft: HTMLCanvasElement }>;
  wing: HTMLCanvasElement;
  /** The colour of the butterflies' own halo. */
  wingGlow: HTMLCanvasElement;
}

function spritesFor(variant: FairyVariant): Sprites {
  const petal = (draw: (context: CanvasRenderingContext2D) => void) => ({ sharp: paint(draw), soft: paint(draw, 2.4) });
  if (variant === "dusk") {
    return {
      glows: ["255, 205, 120", "255, 166, 118", "255, 140, 178", "255, 236, 190"].map((rgb) => paint(glow(rgb))),
      sparkle: paint(sparkle("255, 222, 160")),
      petals: [
        petal(sunflowerPetal(["#e07d14", "#f7b42c", "#ffe18c"])),
        petal(sunflowerPetal(["#d06a12", "#f2a325", "#ffd46b"])),
        petal(cherryPetal(["#ef7aa0", "#ffc0d2", "#fff0f4"])),
      ],
      wing: paint(wing(["#fff5dc", "#ffc96e", "#ff9a48"], "255, 186, 104")),
      wingGlow: paint(glow("255, 190, 110")),
    };
  }
  return {
    glows: ["140, 214, 255", "190, 170, 255", "150, 255, 226", "226, 240, 255"].map((rgb) => paint(glow(rgb))),
    sparkle: paint(sparkle("196, 228, 255")),
    petals: [
      petal(floret(["#7ea8e6", "#cfe0ff"])),
      petal(floret(["#a894e8", "#e5dcff"])),
      petal(floret(["#bfd6f4", "#ffffff"])),
    ],
    wing: paint(wing(["#eaf7ff", "#8fd2ff", "#5a87ff"], "130, 196, 255")),
    wingGlow: paint(glow("140, 200, 255")),
  };
}

/* ---------- The dust ---------- */

type Kind = "wisp" | "orbit" | "petal" | "spark" | "glitter" | "butterfly";

interface Mote {
  kind: Kind;
  variant: FairyVariant;
  sprite: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** A wisp's anchor; an orbiter's ring radius (ax) and tilt (ay). */
  ax: number;
  ay: number;
  /** How far a wisp wanders, and how far the pointer has pushed it aside. */
  rx: number;
  ry: number;
  ox: number;
  oy: number;
  /** Seconds since it was made; negative until it comes in. */
  age: number;
  life: number;
  /** Seconds left before it is gone, once it is on its way out. */
  fade: number;
  size: number;
  alpha: number;
  depth: number;
  phase: number;
  rate: number;
  angle: number;
  spin: number;
  flip: number;
  flipRate: number;
  /** An orbiter's height above the plinth, as a share of the bouquet's. */
  lift: number;
  /** Recent positions, x and y in turn, newest first: the tail an orbiter or a butterfly draws. */
  tail: number[] | null;
}

/** The bouquet on screen, in css px: its centre, size and the top of its plinth. */
export interface StageBox {
  x: number;
  y: number;
  width: number;
  height: number;
  plinthY: number;
}

/** The stage box of the bouquet's frame: the flowers sit a little above its middle, the plinth's top near its foot. */
export function stageBoxOf(rect: { left: number; top: number; width: number; height: number }): StageBox {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.42, width: rect.width, height: rect.height, plinthY: rect.top + rect.height * 0.86 };
}

export interface FairyDust {
  /** One frame: moves and draws everything. */
  step(deltaMs: number): void;
  /** Matches the canvas to its box; call when the window changes size. */
  resize(): void;
  setStage(stage: StageBox): void;
  /** The realm changed: what is in the air drifts off and the other realm's dust comes in. */
  setVariant(variant: FairyVariant): void;
  /** The pointer moved to (x, y): it leaves glitter, and the lights near it shy away. */
  pointer(x: number, y: number): void;
  /** The pointer left the window. */
  leave(): void;
  /** Throws `count` glitters out of a point on screen. */
  burst(x: number, y: number, count?: number): void;
  /** Draws everything into the bouquet: the story is opening. */
  gather(): void;
}

const random = (min: number, max: number) => min + Math.random() * (max - min);
const STANDING: ReadonlySet<Kind> = new Set<Kind>(["wisp", "orbit", "petal", "butterfly"]);
const TAIL = 7;

export function createFairyDust(canvas: HTMLCanvasElement, initial: FairyVariant, mobile: boolean): FairyDust | null {
  const context = canvas.getContext("2d");
  if (!context) return null;
  const profile = fairyProfile(mobile);
  const sprites: Record<FairyVariant, Sprites | null> = { dusk: null, night: null };
  const spritesOf = (variant: FairyVariant) => (sprites[variant] ??= spritesFor(variant));
  const motes: Mote[] = [];
  let variant = initial;
  let width = 1;
  let height = 1;
  let ratio = 1;
  let time = 0;
  let sparkCarry = 0;
  let trailCarry = 0;
  let pointerX = 0;
  let pointerY = 0;
  let pointerIn = false;
  let gatheredAt = -1;
  let measured: StageBox | null = null;

  const mote = (kind: Kind, overrides: Partial<Mote>): Mote => ({
    kind, variant, sprite: 0, x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0, rx: 0, ry: 0, ox: 0, oy: 0,
    age: 0, life: Infinity, fade: Infinity, size: 10, alpha: 1, depth: 1, phase: random(0, TAU), rate: 1,
    angle: random(0, TAU), spin: 0, flip: random(0, TAU), flipRate: 0, lift: 0, tail: null, ...overrides,
  });

  const room = () => motes.length < profile.cap;
  /** Where the bouquet is; until it has been measured, a guess at the middle of the room. */
  const box = (): StageBox => measured ?? { x: width / 2, y: height * 0.45, width: Math.min(420, width * 0.8), height: Math.min(440, height * 0.5), plinthY: height * 0.68 };

  /** The standing population of a realm, coming in over `spread` seconds. */
  const populate = (spread: number) => {
    const set = spritesOf(variant);
    const stage = box();
    for (let index = 0; index < profile.wisps; index += 1) {
      // A third keep near the bouquet; the rest are spread over the room.
      const near = index % 3 === 0;
      const depth = random(0.6, 1.3);
      motes.push(mote("wisp", {
        sprite: Math.floor(random(0, set.glows.length)),
        ax: near ? stage.x + random(-1, 1) * stage.width * 0.9 : random(0, width),
        ay: near ? stage.y + random(-0.8, 0.6) * stage.height : random(0, height),
        rx: random(18, 70),
        ry: random(14, 46),
        vy: -random(4, 13) * depth,
        size: random(11, 24) * depth,
        alpha: random(0.7, 1),
        depth,
        rate: random(0.9, 2.4),
        age: -random(0, spread),
      }));
    }
    for (let index = 0; index < profile.orbiters; index += 1) {
      motes.push(mote("orbit", {
        sprite: index % set.glows.length,
        ax: random(0.36, 0.56),
        ay: random(0.2, 0.36),
        lift: random(0.08, 0.86),
        rate: random(0.32, 0.62) * (index % 2 ? -1 : 1),
        angle: random(0, TAU),
        size: random(10, 17),
        alpha: random(0.7, 1),
        // Streaks cost a draw per point; a phone keeps its lights without them.
        tail: mobile ? null : [],
        age: -random(0, spread),
      }));
    }
    for (let index = 0; index < profile.petals; index += 1) {
      const depth = random(0.6, 1.35);
      motes.push(mote("petal", {
        sprite: Math.floor(random(0, set.petals.length)),
        x: random(-40, width + 40),
        y: random(-height * 0.3, height),
        vy: random(18, 34) * depth,
        size: (variant === "dusk" ? random(14, 22) : random(12, 19)) * depth,
        alpha: depth > 1.15 ? random(0.55, 0.75) : random(0.75, 0.95),
        depth,
        rx: random(14, 42),
        rate: random(0.8, 1.8),
        spin: random(0.4, 1.4) * (Math.random() < 0.5 ? -1 : 1),
        flipRate: random(1.2, 3.2),
        age: -random(0, spread),
      }));
    }
    for (let index = 0; index < profile.butterflies; index += 1) {
      motes.push(mote("butterfly", { phase: index * Math.PI + random(-0.6, 0.6), size: mobile ? 26 : 32, alpha: 1, tail: mobile ? null : [], age: -random(0.4, spread + 0.4) }));
    }
  };

  const throwGlitter = (x: number, y: number, speed: [number, number], life: [number, number], size: [number, number], spread = TAU, heading = 0) => {
    if (!room()) return;
    const angle = heading + random(-spread / 2, spread / 2);
    const velocity = random(speed[0], speed[1]);
    motes.push(mote("glitter", {
      sprite: Math.random() < 0.45 ? -1 : Math.floor(random(0, 4)),
      x, y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: random(life[0], life[1]),
      size: random(size[0], size[1]),
      alpha: random(0.75, 1),
      rate: random(8, 14),
    }));
  };

  const stepWisp = (item: Mote, dt: number) => {
    item.ay += item.vy * dt;
    item.ax += Math.sin(time * 0.21 + item.phase) * 4 * dt;
    if (item.ay < -60) {
      // Back in at the foot of the room, or now and then out of the clouds round the plinth, fading in again.
      const stage = box();
      const nearPlinth = Math.random() < 0.33;
      item.ax = nearPlinth ? stage.x + random(-1, 1) * stage.width * 0.8 : random(0, width);
      item.ay = nearPlinth ? stage.plinthY + random(0, 40) : height + random(20, 80);
      item.age = 0;
    }
    const [wx, wy] = wander(item.age, item.phase, item.rx, item.ry);
    let pushX = 0;
    let pushY = 0;
    if (pointerIn) {
      const dx = item.ax + wx - pointerX;
      const dy = item.ay + wy - pointerY;
      const distance = Math.hypot(dx, dy);
      if (distance < 120 && distance > 0.01) {
        const strength = (1 - distance / 120) * 70;
        pushX = (dx / distance) * strength;
        pushY = (dy / distance) * strength;
      }
    }
    const ease = 1 - Math.exp(-(pushX || pushY ? 6 : 1.4) * dt);
    item.ox += (pushX - item.ox) * ease;
    item.oy += (pushY - item.oy) * ease;
    item.x = item.ax + wx + item.ox;
    item.y = item.ay + wy + item.oy;
  };

  const stepOrbit = (item: Mote, dt: number) => {
    const stage = box();
    item.angle += item.rate * dt;
    const ring = orbitPoint(item.angle, item.ax * stage.width, item.ay);
    item.x = stage.x + ring.x;
    item.y = stage.plinthY - item.lift * stage.height * 0.8 + ring.y + Math.sin(item.age * 0.6 + item.phase) * 12;
    item.depth = ring.front;
  };

  const stepPetal = (item: Mote, dt: number) => {
    const breeze = 10 + 14 * Math.sin(time * 0.3) + 6 * Math.sin(time * 1.1 + 1.3);
    item.vx += (breeze * item.depth - item.vx) * (1 - Math.exp(-1.5 * dt));
    item.x += (item.vx + Math.cos(item.age * item.rate + item.phase) * item.rx) * dt;
    item.y += item.vy * dt;
    item.angle += item.spin * dt;
    item.flip += item.flipRate * dt;
    if (item.y > height + 40) {
      // Back in at the top, often off the flowering boughs in the corners.
      const corner = Math.random();
      item.y = -random(30, 140);
      item.x = corner < 0.25 ? random(0, width * 0.22) : corner < 0.5 ? random(width * 0.78, width) : random(-40, width + 40);
    }
  };

  const stepButterfly = (item: Mote, dt: number) => {
    const stage = box();
    // Wide enough to leave the bouquet, never so wide it flutters over the words beside it.
    const flight = butterflyFlight(item.age, item.phase, stage.width * 1.12, stage.height * 0.85);
    item.x = stage.x + flight.x;
    item.y = stage.y - stage.height * 0.05 + flight.y;
    item.angle = Math.cos(flight.heading) * 0.32;
    item.flip = 0.22 + 0.78 * Math.abs(Math.sin(item.age * TAU * 2.4 + item.phase));
    // A little dust off its wings.
    item.rate += dt;
    if (item.rate > (mobile ? 0.16 : 0.08) && item.age > 0) {
      item.rate = 0;
      throwGlitter(item.x + random(-5, 5), item.y + random(-2, 6), [6, 26], [0.6, 1.1], [3, 6], Math.PI * 0.8, Math.PI / 2);
    }
  };

  const update = (dt: number) => {
    const stage = box();
    time += dt;
    const gathering = gatheredAt >= 0 ? time - gatheredAt : -1;
    // Sparks off the plinth.
    if (gathering < 0) {
      sparkCarry += profile.sparks * dt;
      while (sparkCarry >= 1) {
        sparkCarry -= 1;
        if (!room()) break;
        motes.push(mote("spark", {
          sprite: Math.random() < 0.35 ? -1 : Math.floor(random(0, 4)),
          x: stage.x + random(-0.5, 0.5) * stage.width * 0.62,
          y: stage.plinthY + random(-6, 6),
          vx: random(-8, 8),
          vy: -random(26, 64),
          life: random(1.6, 3.2),
          size: random(4, 8),
          alpha: random(0.7, 1),
          rate: random(5, 9),
        }));
      }
    }
    for (let index = motes.length - 1; index >= 0; index -= 1) {
      const item = motes[index];
      item.age += dt;
      if (item.age < 0) continue;
      if (item.fade !== Infinity) {
        item.fade -= dt;
        if (item.fade <= 0) {
          motes.splice(index, 1);
          continue;
        }
      }
      if (item.age >= item.life) {
        motes.splice(index, 1);
        continue;
      }
      if (item.kind === "wisp") stepWisp(item, dt);
      else if (item.kind === "orbit") stepOrbit(item, dt);
      else if (item.kind === "petal") stepPetal(item, dt);
      else if (item.kind === "butterfly") stepButterfly(item, dt);
      else {
        // Sparks rise and slow; glitter is thrown, slows in the air and sinks.
        const drag = Math.exp(-(item.kind === "spark" ? 0.3 : 2.4) * dt);
        item.vx *= drag;
        item.vy = item.vy * drag + (item.kind === "spark" ? 0 : 46 * dt);
        item.x += (item.vx + Math.sin(item.age * 3 + item.phase) * (item.kind === "spark" ? 7 : 0)) * dt;
        item.y += item.vy * dt;
      }
      if (gathering >= 0 && STANDING.has(item.kind)) {
        // Drawn into the flowers, faster and faster.
        const pull = 1 - Math.exp(-dt * (1.2 + gathering * 3));
        item.ax += (stage.x - item.x) * pull;
        item.ay += (stage.y - item.y) * pull;
        if (item.kind !== "wisp") {
          item.x += (stage.x - item.x) * pull;
          item.y += (stage.y - item.y) * pull;
        }
      }
      if (item.tail) {
        item.tail.unshift(item.x, item.y);
        if (item.tail.length > TAIL * 2) item.tail.length = TAIL * 2;
      }
    }
  };

  const draw = () => {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalCompositeOperation = "source-over";
    context.clearRect(0, 0, canvas.width, canvas.height);
    const gathering = gatheredAt >= 0 ? time - gatheredAt : -1;
    const gatherFade = gathering < 0 ? 1 : Math.max(0, 1 - gathering / 1.3);
    // Petals first, as themselves; then every light, added on.
    for (let pass = 0; pass < 2; pass += 1) {
      context.globalCompositeOperation = pass === 0 ? "source-over" : "lighter";
      for (const item of motes) {
        if (item.age < 0 || (item.kind === "petal") !== (pass === 0)) continue;
        const set = spritesOf(item.variant);
        const fadeIn = Math.min(1, item.age / (item.kind === "glitter" ? 0.05 : 0.6));
        const fadeOut = item.fade !== Infinity ? Math.min(1, item.fade / 0.6) : item.life !== Infinity ? Math.min(1, (item.life - item.age) / (item.life * 0.45)) : 1;
        let alpha = item.alpha * fadeIn * fadeOut * (STANDING.has(item.kind) ? gatherFade : 1);
        let size = item.size;
        if (item.kind === "wisp") alpha *= pulse(item.age, item.rate, item.phase);
        else if (item.kind === "orbit") {
          alpha *= 0.3 + 0.7 * item.depth;
          size *= 0.65 + 0.55 * item.depth;
        } else if (item.kind === "spark" || item.kind === "glitter") alpha *= 0.65 + 0.35 * Math.sin(item.age * item.rate + item.phase);
        if (alpha <= 0.01 || item.x < -60 || item.x > width + 60 || item.y < -60 || item.y > height + 60) continue;
        context.globalAlpha = Math.min(1, alpha);
        if (item.kind === "petal") {
          const art = set.petals[item.sprite];
          const scale = (size * ratio) / (SPRITE * 0.62);
          const foreshorten = Math.max(0.14, Math.abs(Math.cos(item.flip)));
          const cos = Math.cos(item.angle);
          const sin = Math.sin(item.angle);
          context.setTransform(cos * scale * foreshorten, sin * scale * foreshorten, -sin * scale, cos * scale, item.x * ratio, item.y * ratio);
          context.drawImage(item.depth > 1.15 ? art.soft : art.sharp, -SPRITE / 2, -SPRITE / 2);
          continue;
        }
        if (item.kind === "butterfly") {
          drawTail(item, set.glows[0], alpha * 0.5, size * 0.28);
          const scale = (size * ratio) / SPRITE;
          context.setTransform(scale * 2.6, 0, 0, scale * 2.6, item.x * ratio, item.y * ratio);
          context.globalAlpha = Math.min(1, alpha * 0.55);
          context.drawImage(set.wingGlow, -SPRITE / 2, -SPRITE / 2);
          context.globalAlpha = Math.min(1, alpha);
          const cos = Math.cos(item.angle);
          const sin = Math.sin(item.angle);
          for (const side of [1, -1]) {
            const spread = item.flip * side;
            context.setTransform(cos * scale * spread, sin * scale * spread, -sin * scale, cos * scale, item.x * ratio, item.y * ratio);
            context.drawImage(set.wing, -SPRITE / 2, -SPRITE / 2);
          }
          continue;
        }
        if (item.kind === "orbit") drawTail(item, set.glows[item.sprite], alpha * 0.45, size * 0.55);
        const art = item.sprite < 0 ? set.sparkle : set.glows[item.sprite];
        const scale = (size * ratio) / (SPRITE * (item.sprite < 0 ? 0.62 : 0.42));
        const turn = item.sprite < 0 ? item.age * 1.6 + item.phase : 0;
        const cos = Math.cos(turn) * scale;
        const sin = Math.sin(turn) * scale;
        context.setTransform(cos, sin, -sin, cos, item.x * ratio, item.y * ratio);
        context.drawImage(art, -SPRITE / 2, -SPRITE / 2);
      }
    }
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 1;
  };

  /** The fading streak behind an orbiter or a butterfly. */
  const drawTail = (item: Mote, art: HTMLCanvasElement, alpha: number, size: number) => {
    const tail = item.tail;
    if (!tail) return;
    for (let index = 2; index < tail.length; index += 2) {
      const share = 1 - index / (TAIL * 2);
      const scale = (size * share * ratio) / (SPRITE * 0.42);
      context.globalAlpha = Math.min(1, alpha * share);
      context.setTransform(scale, 0, 0, scale, tail[index] * ratio, tail[index + 1] * ratio);
      context.drawImage(art, -SPRITE / 2, -SPRITE / 2);
    }
  };

  return {
    step(deltaMs) {
      const dt = Math.min(0.05, deltaMs / 1000);
      update(dt);
      draw();
    },
    resize() {
      const nextRatio = Math.min(window.devicePixelRatio || 1, profile.ratio);
      const nextWidth = Math.max(1, canvas.clientWidth);
      const nextHeight = Math.max(1, canvas.clientHeight);
      // What was spread over the old room keeps its place in the new one.
      const sx = nextWidth / width;
      const sy = nextHeight / height;
      if (motes.length && (sx !== 1 || sy !== 1)) {
        for (const item of motes) {
          if (item.kind === "wisp") {
            item.ax *= sx;
            item.ay *= sy;
          } else if (item.kind === "petal") {
            item.x *= sx;
            item.y *= sy;
          }
        }
      }
      ratio = nextRatio;
      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      if (!motes.length) populate(1.6);
    },
    setStage(next) {
      measured = next;
    },
    setVariant(next) {
      if (next === variant) return;
      const stage = box();
      variant = next;
      for (const item of motes) if (STANDING.has(item.kind) && item.fade === Infinity) item.fade = random(0.4, 1.1);
      populate(1.4);
      for (let index = 0; index < 26; index += 1) throwGlitter(stage.x + random(-20, 20), stage.y + random(-30, 30), [60, 260], [0.9, 1.7], [5, 11]);
    },
    pointer(x, y) {
      if (pointerIn) {
        const [count, carry] = trailSpawns(trailCarry, Math.hypot(x - pointerX, y - pointerY), profile.trailSpacing);
        trailCarry = carry;
        for (let index = 0; index < Math.min(count, 4); index += 1) {
          const share = (index + 1) / count;
          throwGlitter(pointerX + (x - pointerX) * share + random(-4, 4), pointerY + (y - pointerY) * share + random(-4, 4), [8, 46], [0.55, 1.15], [4, 10]);
        }
      }
      pointerX = x;
      pointerY = y;
      pointerIn = true;
    },
    leave() {
      pointerIn = false;
      trailCarry = 0;
    },
    burst(x, y, count = 16) {
      for (let index = 0; index < count; index += 1) throwGlitter(x, y, [70, 300], [0.8, 1.6], [5, 12]);
    },
    gather() {
      if (gatheredAt >= 0) return;
      const stage = box();
      gatheredAt = time;
      for (let index = 0; index < 44; index += 1) throwGlitter(stage.x + random(-24, 24), stage.y + random(-40, 40), [90, 380], [0.9, 1.8], [5, 13]);
    },
  };
}
