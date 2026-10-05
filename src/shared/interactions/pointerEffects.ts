import { frame, motionValue, springValue, type MotionValue } from "motion";
import { followSprings } from "../motion/springs";

/** A magnetic control leans this share of the pointer's offset toward it, at most MAGNET_REACH px, and lifts a little. */
const MAGNET_PULL = 0.22;
const MAGNET_REACH = 6;
const MAGNET_LIFT = -2;
/** The steepest a photo tips under the cursor, in degrees. */
const TILT_MAX = 7;

interface Follower {
  target: { x: MotionValue<number>; y: MotionValue<number> };
  x: MotionValue<number>;
  y: MotionValue<number>;
  dispose: () => void;
}

type FollowSpring = (typeof followSprings)[keyof typeof followSprings];

const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));
const unit = (value: number) => Math.max(0, Math.min(1, value));

const clearTilt = (element: HTMLElement) => {
  element.style.removeProperty("rotate");
  element.style.removeProperty("--tilt-x");
  element.style.removeProperty("--tilt-y");
};

/** Two values that spring after their targets and repaint at most once per frame. */
function createFollower(spring: FollowSpring, paint: (x: number, y: number) => void): Follower {
  const target = { x: motionValue(0), y: motionValue(0) };
  const x = springValue(target.x, spring);
  const y = springValue(target.y, spring);
  const render = () => paint(x.get(), y.get());
  const stopX = x.on("change", () => frame.render(render));
  const stopY = y.on("change", () => frame.render(render));
  return {
    target,
    x,
    y,
    dispose: () => {
      stopX();
      stopY();
      x.destroy();
      y.destroy();
      target.x.destroy();
      target.y.destroy();
    },
  };
}

/**
 * The story's pointer-led touches, all fed by one passive pointermove listener on `root`:
 * - `[data-magnetic]` controls lean a few pixels toward the cursor and lift, on a spring (Magnet, React Bits).
 * - `[data-tilt]` photos tip under the cursor in 3D while a sheet of light follows it (Tilted Card and Glare Hover,
 *   React Bits; 3D Card, Aceternity). The tilt is written to `rotate`, so each photo keeps its own `transform`;
 *   `[data-tilt="transform"]` gets `--tilt-x` / `--tilt-y` instead, for a photo whose `transform` is animated.
 * - `[data-spotlight]` cards carry a soft light where the cursor is (Card Spotlight, Aceternity; Magic Card, Magic UI).
 * Only pointers that can hover get any of it; the caller leaves it out for readers who prefer reduced motion.
 */
export function installPointerEffects(root: HTMLElement): () => void {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};

  const magnets = new Map<HTMLElement, Follower>();
  const tilts = new Map<HTMLElement, Follower>();
  let magnet: HTMLElement | null = null;
  let tilt: HTMLElement | null = null;
  let spot: HTMLElement | null = null;
  let latest: PointerEvent | null = null;
  let queued = 0;

  const magnetFor = (element: HTMLElement) => {
    let follower = magnets.get(element);
    if (!follower) {
      follower = createFollower(followSprings.magnet, (x, y) => {
        // Back at rest, `translate` goes back to the stylesheet.
        if (Math.abs(x) < 0.05 && Math.abs(y) < 0.05) element.style.removeProperty("translate");
        else element.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
      });
      magnets.set(element, follower);
    }
    return follower;
  };

  const tiltFor = (element: HTMLElement) => {
    let follower = tilts.get(element);
    if (!follower) {
      const viaTransform = element.dataset.tilt === "transform";
      follower = createFollower(followSprings.tilt, (x, y) => {
        const angle = Math.hypot(x, y);
        if (angle < 0.02) {
          clearTilt(element);
        } else if (viaTransform) {
          element.style.setProperty("--tilt-x", x.toFixed(3));
          element.style.setProperty("--tilt-y", y.toFixed(3));
        } else {
          // For tilts this small, one turn about the axis (x, y, 0) by their combined angle is both tilts at once.
          element.style.rotate = `${x.toFixed(3)} ${y.toFixed(3)} 0 ${angle.toFixed(2)}deg`;
        }
      });
      tilts.set(element, follower);
    }
    return follower;
  };

  const settle = (followers: Map<HTMLElement, Follower>, element: HTMLElement | null) => {
    const follower = element ? followers.get(element) : undefined;
    follower?.target.x.set(0);
    follower?.target.y.set(0);
  };

  const update = () => {
    queued = 0;
    const event = latest;
    if (!event) return;
    const over = event.target instanceof Element ? event.target : null;
    const nextMagnet = over?.closest<HTMLElement>("[data-magnetic]") ?? null;
    const nextTilt = over?.closest<HTMLElement>("[data-tilt]") ?? null;
    const nextSpot = over?.closest<HTMLElement>("[data-spotlight]") ?? null;

    if (nextMagnet !== magnet) {
      settle(magnets, magnet);
      magnet = nextMagnet;
    }
    if (nextTilt !== tilt) {
      settle(tilts, tilt);
      tilt?.classList.remove("is-tilting");
      tilt = nextTilt;
      tilt?.classList.add("is-tilting");
    }
    if (nextSpot !== spot) {
      spot?.classList.remove("is-lit");
      spot = nextSpot;
      spot?.classList.add("is-lit");
    }

    // Every box is read before anything is written, so a move never forces a second style pass.
    const magnetBox = magnet?.getBoundingClientRect();
    const tiltBox = tilt?.getBoundingClientRect();
    const spotBox = spot?.getBoundingClientRect();

    if (magnet && magnetBox) {
      const follower = magnetFor(magnet);
      // The box already includes the lean; take it out so the pull is measured from where the control rests.
      const dx = event.clientX - (magnetBox.left + magnetBox.width / 2 - follower.x.get());
      const dy = event.clientY - (magnetBox.top + magnetBox.height / 2 - follower.y.get());
      follower.target.x.set(clamp(dx * MAGNET_PULL, MAGNET_REACH));
      follower.target.y.set(clamp(dy * MAGNET_PULL, MAGNET_REACH) + MAGNET_LIFT);
    }
    if (tilt && tiltBox?.width && tiltBox.height) {
      const nx = unit((event.clientX - tiltBox.left) / tiltBox.width);
      const ny = unit((event.clientY - tiltBox.top) / tiltBox.height);
      const follower = tiltFor(tilt);
      // The corner under the cursor dips away, as if pressed.
      follower.target.x.set((0.5 - ny) * 2 * TILT_MAX);
      follower.target.y.set((nx - 0.5) * 2 * TILT_MAX);
      tilt.style.setProperty("--glare-x", `${(nx * 100).toFixed(1)}%`);
      tilt.style.setProperty("--glare-y", `${(ny * 100).toFixed(1)}%`);
    }
    if (spot && spotBox) {
      spot.style.setProperty("--spot-x", `${Math.round(event.clientX - spotBox.left)}px`);
      spot.style.setProperty("--spot-y", `${Math.round(event.clientY - spotBox.top)}px`);
    }
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    latest = event;
    if (!queued) queued = window.requestAnimationFrame(update);
  };

  const releaseAll = () => {
    latest = null;
    settle(magnets, magnet);
    settle(tilts, tilt);
    tilt?.classList.remove("is-tilting");
    spot?.classList.remove("is-lit");
    magnet = null;
    tilt = null;
    spot = null;
  };

  // A page that scrolls under a still cursor ends the hover, as the stylesheet's own :hover would.
  const onScroll = () => {
    if (magnet || tilt || spot) releaseAll();
  };

  root.addEventListener("pointermove", onMove, { passive: true });
  root.addEventListener("pointerleave", releaseAll, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });

  return () => {
    root.removeEventListener("pointermove", onMove);
    root.removeEventListener("pointerleave", releaseAll);
    window.removeEventListener("scroll", onScroll);
    window.cancelAnimationFrame(queued);
    releaseAll();
    for (const [element, follower] of magnets) {
      follower.dispose();
      element.style.removeProperty("translate");
    }
    for (const [element, follower] of tilts) {
      follower.dispose();
      clearTilt(element);
    }
    magnets.clear();
    tilts.clear();
  };
}
