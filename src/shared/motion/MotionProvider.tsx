import type { ReactNode } from "react";
import { LazyMotion, MotionConfig } from "motion/react";
import { whenIdle } from "./whenIdle";

// Motion's features (animation, gestures, layout) arrive in their own chunk once the browser is idle, so they never
// compete with the first screen's photos. Until then every `m` component simply shows its resting state.
const loadFeatures = () => whenIdle().then(() => import("./features")).then((module) => module.default);

/**
 * Motion for the whole story. `reducedMotion="user"` drops transform and layout animation for readers who asked for
 * less motion; `strict` keeps the full `motion` component (and its weight) out of the bundle.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
