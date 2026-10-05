/**
 * The story's springs. This is a love letter, not a trading desk, so things settle softly and may overshoot a touch.
 * Each spring is a visual duration (how long the move looks) plus a bounce; Motion turns that into real physics, so a
 * move that is interrupted mid-flight carries its velocity into the next one.
 */
export const springs = {
  /** Highlights, cards and digits gliding into place. */
  settle: { type: "spring", visualDuration: 0.45, bounce: 0.22 },
  /** Words and photos arriving. */
  arrive: { type: "spring", visualDuration: 0.7, bounce: 0.12 },
} as const;

/** Springs for values that chase the pointer; these feed `springValue` directly, so they carry no `type`. */
export const followSprings = {
  magnet: { visualDuration: 0.35, bounce: 0.35 },
  tilt: { visualDuration: 0.45, bounce: 0.2 },
} as const;
