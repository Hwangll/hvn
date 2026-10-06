/** A value that chases a target on a soft spring: it lags while the target moves, overshoots a touch, then settles. */
export interface Spring {
  value: number;
  speed: number;
}

/**
 * One step of the spring toward `target`, `dt` seconds long. The defaults (stiffness 90, damping 11) settle in about
 * half a second with a tenth of overshoot: weight, not wobble. Returns whether it is still moving; at rest on a zero
 * target it snaps to exactly zero, so a layer at rest can drop its offset altogether.
 */
export function stepSpring(spring: Spring, target: number, dt: number, stiffness = 90, damping = 11): boolean {
  const step = Math.min(0.05, Math.max(0, dt));
  spring.speed += (stiffness * (target - spring.value) - damping * spring.speed) * step;
  spring.value += spring.speed * step;
  const moving = Math.abs(spring.value - target) > 0.05 || Math.abs(spring.speed) > 0.05;
  if (!moving && target === 0) {
    spring.value = 0;
    spring.speed = 0;
  }
  return moving;
}

/**
 * How far a ribbon's text has run after a frame: an unhurried pace of its own plus a share of the page's speed, always
 * in the direction the reader last scrolled, wrapped to one run of its words so the loop never shows a seam.
 */
export function nextRibbonOffset(offset: number, direction: number, velocity: number, dt: number, run: number, pace = 34, pull = 0.24): number {
  if (run <= 0) return 0;
  const speed = pace + Math.abs(velocity) * 1000 * pull;
  const next = (offset + direction * speed * dt) % run;
  return next < 0 ? next + run : next;
}
