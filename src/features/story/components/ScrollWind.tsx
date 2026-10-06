import { useEffect, useRef } from "react";
import { onScrollVelocity } from "../../../shared/motion/scrollVelocity";
import { catchWindBursts, createScrollWind, type ScrollWind as Wind, type WindVariant } from "../utils/scrollWind";

interface ScrollWindProps {
  variant: WindVariant;
  mobile: boolean;
}

/**
 * The petals (by day) or glints (by night) that blow past the reader while the page scrolls (utils/scrollWind.ts), on a
 * fixed canvas over the story; `windBurst` throws a handful into it. Nothing is set up until the reader first scrolls or
 * something is thrown, and frames stop once the air is clear. Left out for readers who prefer reduced motion.
 */
export function ScrollWind({ variant, mobile }: ScrollWindProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    // undefined: not made yet; null: this browser has no 2D canvas to draw it on.
    let wind: Wind | null | undefined;
    const ready = () => {
      if (wind === undefined) {
        wind = createScrollWind(canvas, variant, mobile);
        wind?.resize();
      }
      return wind;
    };
    const stop = onScrollVelocity((velocity, deltaMs) => {
      if (wind === undefined && velocity === 0) return false;
      return ready()?.step(velocity, deltaMs) ?? false;
    });
    const release = catchWindBursts((x, y, count) => ready()?.burst(x, y, count));
    const resize = () => wind?.resize();
    window.addEventListener("resize", resize);
    return () => {
      stop();
      window.removeEventListener("resize", resize);
      release();
      // Emptying the canvas clears it and lets its memory go.
      if (wind) {
        canvas.width = 0;
        canvas.height = 0;
      }
    };
  }, [variant, mobile]);

  return <canvas className={`scroll-wind is-${variant}`} ref={canvasRef} aria-hidden="true" />;
}
