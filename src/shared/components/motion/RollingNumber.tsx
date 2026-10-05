import { AnimatePresence, m } from "motion/react";
import { springs } from "../../motion/springs";

/**
 * A number whose digits roll into place like an odometer (Number Ticker, Magic UI). It counts down, so each new digit
 * drops in from above while the old one falls away. Each digit rolls inside a window sized by an invisible 0, with
 * both faces laid over it, so a tick never measures or moves anything; slots are keyed from the right so they stay put
 * when the number loses a digit. The roll is a `transform`, which Motion hands to the compositor.
 */
export function RollingNumber({ value, pad = 2 }: { value: number; pad?: number }) {
  const digits = String(Math.max(0, Math.floor(value))).padStart(pad, "0").split("");

  return (
    <span className="rolling-number">
      {digits.map((digit, index) => (
        <span className="rolling-digit" key={digits.length - index}>
          <span className="rolling-digit-sizer">0</span>
          <AnimatePresence initial={false}>
            <m.span
              key={digit}
              className="rolling-digit-face"
              initial={{ transform: "translateY(-110%)", opacity: 0 }}
              animate={{ transform: "translateY(0%)", opacity: 1 }}
              exit={{ transform: "translateY(110%)", opacity: 0 }}
              transition={springs.settle}
            >
              {digit}
            </m.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}
