/**
 * The wind of the scroll: petals by day (Part I), glints and hydrangea florets by night (Part II), blowing past the
 * reader while the page moves, more and faster the faster it goes, then drifting and settling once it stops. A page
 * moving down pushes the air up past the reader, so they come in at the edge the page is heading for and stream the
 * other way; the nearer ones (bigger and softer) travel faster than the page and the farther ones slower, so the wind
 * has depth of its own. The endings throw a handful into the air (`burst`).
 *
 * Everything is drawn on one fixed canvas from a few sprites drawn once; there are never more than a few dozen in the
 * air, and the caller stops asking for frames when it is clear.
 */

import { wakeScrollVelocity } from "../../../shared/motion/scrollVelocity";

export type WindVariant = "day" | "night";

export interface WindParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  /** Phase of the tumble: the sprite is drawn foreshortened by its cosine. */
  flip: number;
  flipRate: number;
  /** Size in css px. */
  size: number;
  /** How near the reader it is (about 0.55 to 1.35): nearer is bigger, faster and softer. */
  depth: number;
  age: number;
  life: number;
  alpha: number;
  sway: number;
  swayRate: number;
  phase: number;
  sprite: number;
  /** Set once it has been on screen; leaving the screen after that ends it. */
  entered: boolean;
  /** Thrown by a burst: it keeps its own flight a little longer before the wind takes it. */
  burst: boolean;
}

interface Profile {
  /** New particles per px scrolled. */
  density: number;
  cap: number;
  /** Drift once the page is still, in px/s for a particle of depth 1 (positive falls, negative rises). */
  fall: number;
  /** Size range in css px, from the farthest to the nearest. */
  size: [number, number];
  /** Share of the page's speed a particle of depth 1 moves at. */
  coupling: number;
}

const profiles: Record<WindVariant, { desktop: Profile; mobile: Profile }> = {
  day: {
    desktop: { density: 0.022, cap: 96, fall: 44, size: [12, 30], coupling: 0.95 },
    mobile: { density: 0.011, cap: 32, fall: 38, size: [10, 22], coupling: 0.9 },
  },
  night: {
    desktop: { density: 0.018, cap: 84, fall: -16, size: [10, 26], coupling: 0.9 },
    mobile: { density: 0.009, cap: 30, fall: -14, size: [8, 19], coupling: 0.85 },
  },
};

export const windProfile = (variant: WindVariant, mobile: boolean): Profile => profiles[variant][mobile ? "mobile" : "desktop"];

const TAU = Math.PI * 2;
/** How far past the screen's edge a particle may go before it ends, in css px. */
const MARGIN = 120;

/** How many particles a frame's scrolling earns, and the fraction carried over to the next frame. */
export function windSpawns(carry: number, velocity: number, deltaMs: number, density: number): [count: number, carry: number] {
  const budget = carry + Math.abs(velocity) * deltaMs * density;
  const count = Math.floor(budget);
  return [count, budget - count];
}

/**
 * One step of a particle's flight. The air it sits in moves against the page, as fast as the page times its depth, and
 * the particle eases toward that (a burst keeps its own throw a little longer), sways on its own rhythm and drifts with
 * the breeze; it tumbles faster while the page moves.
 */
export function stepParticle(particle: WindParticle, velocity: number, dt: number, breeze: number, profile: Profile): void {
  particle.age += dt;
  const target = -velocity * 1000 * profile.coupling * particle.depth + profile.fall * particle.depth;
  const thrown = particle.burst && particle.age < 0.9;
  const relax = 1 - Math.exp(-(thrown ? 1.1 : 2.8) * dt);
  particle.vy += (target - particle.vy) * relax;
  particle.vx += (breeze * particle.depth - particle.vx) * relax * (thrown ? 0.4 : 0.6);
  particle.x += (particle.vx + Math.cos(particle.age * particle.swayRate + particle.phase) * particle.sway) * dt;
  particle.y += particle.vy * dt;
  const agitation = 1 + Math.min(3, Math.abs(velocity) * 0.9);
  particle.angle += particle.spin * agitation * dt;
  particle.flip += particle.flipRate * agitation * dt;
}

/** Whether a particle is still worth drawing on a `width` × `height` screen; it marks its first time on screen. */
export function particleAlive(particle: WindParticle, width: number, height: number): boolean {
  if (particle.age >= particle.life) return false;
  const inside = particle.x > -MARGIN && particle.x < width + MARGIN && particle.y > -MARGIN && particle.y < height + MARGIN;
  if (inside) particle.entered = true;
  return inside || !particle.entered;
}

/* ---------- Sprites, drawn once ---------- */

const SPRITE = 64;

interface Sprite {
  sharp: HTMLCanvasElement;
  /** The same, out of focus, for the nearest particles. */
  soft: HTMLCanvasElement;
  /** Tumbles edge-on as it flies (petals, florets) rather than staying flat to the reader (glints). */
  tumbles: boolean;
  /** How strongly it twinkles while it flies (0 for none). */
  twinkle: number;
  /** How often it is picked, relative to the others. */
  weight: number;
}

function drawSprite(draw: (context: CanvasRenderingContext2D) => void, blur: number): HTMLCanvasElement {
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

function sprite(draw: (context: CanvasRenderingContext2D) => void, tumbles: boolean, weight: number, twinkle = 0): Sprite {
  return { sharp: drawSprite(draw, 0), soft: drawSprite(draw, 2.6), tumbles, twinkle, weight };
}

/** A cherry petal, base down: notched at the tip, a faint crease down the middle, light caught on one cheek. */
function petalShape(): Path2D {
  const shape = new Path2D();
  shape.moveTo(0, 22);
  shape.bezierCurveTo(-15.5, 13.5, -18.5, -9, -7.5, -20);
  shape.quadraticCurveTo(-3.2, -23.2, 0, -16.8);
  shape.quadraticCurveTo(3.2, -23.2, 7.5, -20);
  shape.bezierCurveTo(18.5, -9, 15.5, 13.5, 0, 22);
  shape.closePath();
  return shape;
}

function petal([base, body, tip]: [string, string, string]) {
  return (context: CanvasRenderingContext2D) => {
    const shape = petalShape();
    const fill = context.createLinearGradient(0, 22, 0, -22);
    fill.addColorStop(0, base);
    fill.addColorStop(0.42, body);
    fill.addColorStop(1, tip);
    context.fillStyle = fill;
    // A faint rose shadow keeps a pale petal readable against the pink page.
    context.shadowColor = "rgba(150, 30, 70, 0.28)";
    context.shadowBlur = 3;
    context.shadowOffsetY = 1;
    context.fill(shape);
    context.shadowColor = "transparent";
    context.save();
    context.clip(shape);
    const light = context.createRadialGradient(-6, -7, 1, -6, -7, 17);
    light.addColorStop(0, "rgba(255, 255, 255, 0.55)");
    light.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = light;
    context.fillRect(-SPRITE / 2, -SPRITE / 2, SPRITE, SPRITE);
    context.restore();
    context.strokeStyle = "rgba(255, 255, 255, 0.5)";
    context.lineWidth = 1.1;
    context.beginPath();
    context.moveTo(0, 18);
    context.quadraticCurveTo(-1.4, 2, 0, -12);
    context.stroke();
  };
}

/** A whole little blossom, five petals round a gold heart. */
function blossom(context: CanvasRenderingContext2D) {
  const shape = petalShape();
  for (let index = 0; index < 5; index += 1) {
    context.save();
    context.rotate((index * TAU) / 5);
    context.translate(0, -11.5);
    context.scale(0.5, 0.5);
    const fill = context.createLinearGradient(0, 22, 0, -22);
    fill.addColorStop(0, "#f58fae");
    fill.addColorStop(0.5, "#ffc2d2");
    fill.addColorStop(1, "#fff0f4");
    context.fillStyle = fill;
    context.fill(shape);
    context.restore();
  }
  context.fillStyle = "#f4c25e";
  context.beginPath();
  context.arc(0, 0, 3.6, 0, TAU);
  context.fill();
}

/** A point of light with a coloured halo. */
function glint(color: string) {
  return (context: CanvasRenderingContext2D) => {
    const glow = context.createRadialGradient(0, 0, 0, 0, 0, 26);
    glow.addColorStop(0, "rgba(255, 255, 255, 1)");
    glow.addColorStop(0.16, "rgba(255, 255, 255, 0.95)");
    glow.addColorStop(0.32, color);
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = glow;
    context.beginPath();
    context.arc(0, 0, 26, 0, TAU);
    context.fill();
  };
}

/** A four-pointed star, the kind that catches on water. */
function sparkle(context: CanvasRenderingContext2D) {
  const halo = context.createRadialGradient(0, 0, 0, 0, 0, 18);
  halo.addColorStop(0, "rgba(220, 244, 255, 0.7)");
  halo.addColorStop(1, "rgba(168, 221, 235, 0)");
  context.fillStyle = halo;
  context.beginPath();
  context.arc(0, 0, 18, 0, TAU);
  context.fill();
  context.fillStyle = "#f6fcff";
  context.beginPath();
  context.moveTo(0, -27);
  context.quadraticCurveTo(2.2, -2.2, 27, 0);
  context.quadraticCurveTo(2.2, 2.2, 0, 27);
  context.quadraticCurveTo(-2.2, 2.2, -27, 0);
  context.quadraticCurveTo(-2.2, -2.2, 0, -27);
  context.fill();
}

/** One hydrangea floret: four rounded sepals round a pale eye. */
function floret([outer, inner]: [string, string]) {
  return (context: CanvasRenderingContext2D) => {
    for (let index = 0; index < 4; index += 1) {
      context.save();
      context.rotate((index * TAU) / 4 + Math.PI / 4);
      const fill = context.createLinearGradient(0, -22, 0, 0);
      fill.addColorStop(0, outer);
      fill.addColorStop(1, inner);
      context.fillStyle = fill;
      context.beginPath();
      context.ellipse(0, -11, 8.5, 11.5, 0, 0, TAU);
      context.fill();
      context.restore();
    }
    context.fillStyle = "#fff6e6";
    context.beginPath();
    context.arc(0, 0, 3.2, 0, TAU);
    context.fill();
  };
}

function spritesFor(variant: WindVariant): Sprite[] {
  if (variant === "day") {
    return [
      sprite(petal(["#ec5f8c", "#ff9fba", "#ffdbe6"]), true, 3),
      sprite(petal(["#f6809f", "#ffbfd0", "#fff0f4"]), true, 3),
      sprite(petal(["#ff8a73", "#ffbfa9", "#ffeadf"]), true, 2),
      sprite(petal(["#ffb3c6", "#ffe3eb", "#ffffff"]), true, 2),
      sprite(blossom, true, 0.8),
    ];
  }
  return [
    sprite(glint("rgba(168, 221, 235, 0.55)"), false, 3, 0.45),
    sprite(glint("rgba(242, 201, 181, 0.55)"), false, 2, 0.45),
    sprite(glint("rgba(196, 182, 240, 0.55)"), false, 2, 0.45),
    sprite(sparkle, false, 1.4, 0.6),
    sprite(floret(["#8fb8ea", "#cfe0ff"]), true, 1.2),
    sprite(floret(["#b6a6ee", "#e6dcff"]), true, 1),
  ];
}

/* ---------- The wind ---------- */

export interface ScrollWind {
  /** One frame: spawns what the scrolling earned, moves and draws everything; returns whether anything is in the air. */
  step(velocity: number, deltaMs: number): boolean;
  /** Throws `count` particles into the air from a point on screen (css px). */
  burst(x: number, y: number, count?: number): void;
  /** Matches the canvas to its box; call when the window changes size. */
  resize(): void;
}

const random = (min: number, max: number) => min + Math.random() * (max - min);

export function createScrollWind(canvas: HTMLCanvasElement, variant: WindVariant, mobile: boolean): ScrollWind | null {
  const context = canvas.getContext("2d");
  if (!context) return null;
  const profile = windProfile(variant, mobile);
  const sprites = spritesFor(variant);
  const totalWeight = sprites.reduce((sum, item) => sum + item.weight, 0);
  const particles: WindParticle[] = [];
  let carry = 0;
  let time = 0;
  let width = 1;
  let height = 1;
  let ratio = 1;
  let painted = false;

  const pick = () => {
    let roll = Math.random() * totalWeight;
    for (let index = 0; index < sprites.length; index += 1) {
      roll -= sprites[index].weight;
      if (roll <= 0) return index;
    }
    return sprites.length - 1;
  };

  const create = (x: number, y: number, vx: number, vy: number, burst: boolean): WindParticle => {
    const depth = random(0.55, 1.35);
    const [small, large] = profile.size;
    const index = pick();
    return {
      x, y, vx, vy,
      angle: random(0, TAU),
      spin: random(0.6, 2.2) * (Math.random() < 0.5 ? -1 : 1),
      flip: random(0, TAU),
      flipRate: sprites[index].tumbles ? random(1.6, 4.2) : 0,
      size: (small + ((large - small) * (depth - 0.55)) / 0.8) * random(0.85, 1.15),
      depth,
      age: 0,
      life: burst ? random(3.2, 5.4) : random(3.4, 6.2),
      alpha: depth > 1.15 ? random(0.5, 0.7) : random(0.72, 0.95),
      sway: random(18, 56),
      swayRate: random(1.2, 2.6),
      phase: random(0, TAU),
      sprite: index,
      entered: burst,
      burst,
    };
  };

  /** A particle coming in at the edge the page is heading for; on wide screens most keep to the margins. */
  const spawn = (direction: number) => {
    const marginal = !mobile && Math.random() < 0.55;
    const x = marginal
      ? (Math.random() < 0.5 ? random(-0.02, 0.22) : random(0.78, 1.02)) * width
      : random(0, width);
    const y = direction > 0 ? height + random(10, height * 0.35) : -random(10, height * 0.35);
    particles.push(create(x, y, 0, -direction * 320, false));
  };

  const draw = () => {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (const particle of particles) {
      const art = sprites[particle.sprite];
      const fadeIn = Math.min(1, particle.age / 0.35);
      const fadeOut = Math.max(0, Math.min(1, (particle.life - particle.age) / 0.9));
      const twinkle = art.twinkle ? 1 - art.twinkle * (0.5 + 0.5 * Math.sin(particle.age * 7 + particle.phase)) : 1;
      const alpha = particle.alpha * fadeIn * fadeOut * twinkle;
      // Faded out, or still waiting off screen to come in.
      if (alpha <= 0.01 || particle.y < -particle.size || particle.y > height + particle.size) continue;
      const scale = (particle.size * ratio) / (SPRITE * 0.62);
      // Edge-on, a petal is only a sliver; it never quite vanishes.
      const foreshorten = art.tumbles ? Math.max(0.12, Math.abs(Math.cos(particle.flip))) : 1;
      const angle = art.tumbles || art.twinkle > 0.5 ? particle.angle : 0;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      context.globalAlpha = alpha;
      context.setTransform(cos * scale * foreshorten, sin * scale * foreshorten, -sin * scale, cos * scale, particle.x * ratio, particle.y * ratio);
      context.drawImage(particle.depth > 1.15 ? art.soft : art.sharp, -SPRITE / 2, -SPRITE / 2);
    }
    context.globalAlpha = 1;
    painted = particles.length > 0;
  };

  return {
    step(velocity, deltaMs) {
      const dt = Math.min(0.064, deltaMs / 1000);
      time += dt;
      const [count, rest] = windSpawns(carry, velocity, deltaMs, profile.density);
      carry = rest;
      const direction = Math.sign(velocity);
      for (let index = 0; index < count && particles.length < profile.cap; index += 1) spawn(direction);
      // A light breeze toward the right that gusts now and then.
      const breeze = 16 + 20 * Math.sin(time * 0.37) + 9 * Math.sin(time * 1.13 + 1.7);
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        stepParticle(particle, velocity, dt, breeze, profile);
        if (!particleAlive(particle, width, height)) particles.splice(index, 1);
      }
      if (particles.length || painted) draw();
      return particles.length > 0;
    },
    burst(x, y, count = 34) {
      const room = profile.cap + 40 - particles.length;
      for (let index = 0; index < Math.min(count, room); index += 1) {
        // Up and out, mostly upward: a handful thrown into the air.
        const angle = random(-Math.PI * 0.94, -Math.PI * 0.06);
        const speed = random(240, 640);
        particles.push(create(x + random(-24, 24), y + random(-12, 12), Math.cos(angle) * speed, Math.sin(angle) * speed, true));
      }
    },
    resize() {
      // Soft little shapes need no more than this; a phone's full density would only cost fill rate.
      ratio = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 2);
      width = Math.max(1, canvas.clientWidth);
      height = Math.max(1, canvas.clientHeight);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      painted = true;
    },
  };
}

/* ---------- Bursts, thrown from anywhere on the page into its one wind ---------- */

type Thrower = (x: number, y: number, count?: number) => void;
let throwInto: Thrower | null = null;

/** Makes `thrower` the wind that bursts are thrown into (the page's ScrollWind); returns the way to let it go. */
export function catchWindBursts(thrower: Thrower): () => void {
  throwInto = thrower;
  return () => {
    if (throwInto === thrower) throwInto = null;
  };
}

/** Throws a handful of the page's wind into the air from a point on screen (css px), if the wind is blowing. */
export function windBurst(x: number, y: number, count?: number): void {
  if (!throwInto) return;
  throwInto(x, y, count);
  wakeScrollVelocity();
}
