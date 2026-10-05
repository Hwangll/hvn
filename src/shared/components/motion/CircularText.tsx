import { useId } from "react";

/** Circumference of the r=40 ring in the 100-unit box, so the text closes the circle exactly. */
const RING_LENGTH = 251.3;

/**
 * A line of text set around a circle, for the stylesheet to turn slowly (Circular Text, React Bits). Decorative, so it
 * is hidden from assistive technology; whatever it says must also be said elsewhere. The turn belongs on the wrapper:
 * Chrome repaints an <svg> it rotates every frame, but hands a rotating HTML box to the compositor.
 */
export function CircularText({ text, className = "" }: { text: string; className?: string }) {
  const ringId = `ring-${useId().replace(/[^\w-]/g, "")}`;

  return (
    <span className={`circular-text ${className}`.trim()} aria-hidden="true">
      <svg viewBox="0 0 100 100" focusable="false">
        <path id={ringId} d="M 10 50 a 40 40 0 1 1 80 0 a 40 40 0 1 1 -80 0" fill="none" />
        <text>
          <textPath href={`#${ringId}`} textLength={RING_LENGTH} lengthAdjust="spacing">{text}</textPath>
        </text>
      </svg>
    </span>
  );
}
