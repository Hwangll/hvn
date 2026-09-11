import type { CSSProperties } from "react";

interface DayClockProps {
  /** Start and end of this scene's slice of the day, as "HH:MM". */
  from: string;
  to: string;
  /** What happened in this slice, shown under the dial. */
  note: string;
  /** Bounds of the whole day, so the ring can show where this slice sits. */
  dayStart: string;
  dayEnd: string;
}

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * The one-day timeline: the same dial as the Mixue chapter, but its hands sweep this scene's own hours
 * and a ring around it marks where those hours sit inside the whole day. Scrolling the three stops in a
 * row therefore reads as one continuous afternoon rather than three unrelated scenes.
 */
export function DayClock({ from, to, note, dayStart, dayEnd }: DayClockProps) {
  const start = toMinutes(from);
  const end = toMinutes(to);
  const span = Math.max(1, toMinutes(dayEnd) - toMinutes(dayStart));
  const elapsed = end - start;

  return (
    <div
      className="day-clock"
      data-parallax="-0.1"
      data-delay="0.14"
      style={{
        "--day-from": (start - toMinutes(dayStart)) / span,
        "--day-to": (end - toMinutes(dayStart)) / span,
      } as CSSProperties}
    >
      <i className="day-clock-ring" />
      <i className="date-clock-face" />
      {/* Inline rotation is the hands' starting time; the scroll engine adds `data-spin` on top of it. */}
      <i
        className="date-clock-hand date-clock-hand-hour"
        style={{ transform: `rotate(${((start / 60) % 12) * 30}deg)` }}
        data-spin={elapsed * 0.5}
      />
      <i
        className="date-clock-hand date-clock-hand-minute"
        style={{ transform: `rotate(${(start % 60) * 6}deg)` }}
        data-spin={elapsed * 6}
      />
      <i className="date-clock-pin" />
      <small className="date-clock-label">{from} → {to}</small>
      <small className="day-clock-note">{note}</small>
    </div>
  );
}
