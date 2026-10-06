import gsap from "gsap";

/**
 * How fast the page is scrolling, for everything that answers to it: the wind that blows past the reader, the layers
 * that lag behind and settle, the ribbons that run faster while the page moves. One passive scroll listener notes where
 * the page is and wakes one callback on GSAP's ticker (the clock Lenis and ScrollTrigger already share), which measures
 * the speed once a frame, eases it and hands it to every listener. The position comes from the scroll event, never read
 * on the ticker: by then the scroll engine has written its styles, and reading the scroll offset there would make the
 * browser recalculate them an extra time every frame. Listeners still settling ask for more frames by returning true;
 * once the page is still and none of them is busy the callback leaves the ticker, so a page at rest costs nothing.
 */

/** Speed in px per ms (positive while the page moves down) and the frame's length in ms. Return true for another frame. */
export type ScrollListener = (velocity: number, deltaMs: number) => boolean | void;

/** Fastest speed passed on, in px per ms: a hard fling, well past any reading pace. */
export const MAX_SCROLL_VELOCITY = 8;

/**
 * The next eased speed, from the last one and a frame's travel. A frame that travels more than a screen and a half is a
 * jump (a chapter link, a reload restoring its place), not a scroll, and reads as stillness.
 */
export function nextScrollVelocity(previous: number, travel: number, deltaMs: number, viewport: number): number {
  const raw = Math.abs(travel) > viewport * 1.5 ? 0 : travel / Math.max(4, deltaMs);
  const clamped = Math.max(-MAX_SCROLL_VELOCITY, Math.min(MAX_SCROLL_VELOCITY, raw));
  // A little easing evens out the spacing of wheel and touch events without reading as lag.
  const eased = previous + (clamped - previous) * 0.4;
  return travel === 0 && Math.abs(eased) < 0.003 ? 0 : eased;
}

const listeners = new Set<ScrollListener>();
let running = false;
/** Where the page was at its last scroll event, and where the last frame measured from. */
let latestY = 0;
let lastY = 0;
let viewport = 900;
let velocity = 0;
let stillFrames = 0;

function tick(_time: number, deltaTime: number) {
  const y = latestY;
  const deltaMs = Math.min(64, Math.max(4, deltaTime));
  const travel = y - lastY;
  lastY = y;
  velocity = nextScrollVelocity(velocity, travel, deltaMs, viewport);
  stillFrames = travel === 0 ? stillFrames + 1 : 0;
  let busy = false;
  for (const listener of listeners) if (listener(velocity, deltaMs)) busy = true;
  if (!busy && velocity === 0 && stillFrames > 2) sleep();
}

function sleep() {
  if (!running) return;
  running = false;
  gsap.ticker.remove(tick);
}

/** Starts the frames again, e.g. when a listener has something to show while the page is still. */
export function wakeScrollVelocity(): void {
  if (running || !listeners.size) return;
  running = true;
  stillFrames = 0;
  gsap.ticker.add(tick);
}

function onScroll() {
  latestY = window.scrollY;
  viewport = window.innerHeight;
  wakeScrollVelocity();
}

/** Calls `listener` every frame while the page scrolls or any listener is busy; returns the unsubscribe. */
export function onScrollVelocity(listener: ScrollListener): () => void {
  if (!listeners.size) {
    latestY = window.scrollY;
    lastY = latestY;
    viewport = window.innerHeight;
    velocity = 0;
    window.addEventListener("scroll", onScroll, { passive: true });
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size) return;
    window.removeEventListener("scroll", onScroll);
    sleep();
  };
}
