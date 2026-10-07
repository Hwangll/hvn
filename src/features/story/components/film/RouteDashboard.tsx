import { TriangleAlert } from "lucide-react";
import { memo } from "react";
import { url, useIds } from "../atoms/spriteIds";

/*
 * The dashboard of Part III's route, for a film called "Quá nhanh, quá nguy hiểm": the red car of chapter 3 drives the
 * road under the stops, and a speedometer climbs from the first day of the part (8/9) to the last (1/10), into the red
 * at the birthday. Both read the route's own progress (--route-scroll, written by the scroll engine as the scenes hand
 * over, else --route-progress), so they move with the stage itself, never ahead of it.
 */

/** Where the dial's red zone starts, as a share of the part: only the last stop, the birthday, reaches it. */
const REDLINE = 0.95;
/** The dial's centre and the radii its parts are drawn on (viewBox 100 × 56). */
const C = { x: 50, y: 50 };
/** A tick every twentieth of the part; every quarter a long one. */
const ticks = Array.from({ length: 21 }, (_, index) => index / 20);

/** A point on the dial at a share t of the sweep, from 8/9 on the left (t = 0) over the top to 1/10 on the right. */
function at(t: number, r: number) {
  const angle = Math.PI * (1 - t);
  return `${(C.x + r * Math.cos(angle)).toFixed(2)} ${(C.y - r * Math.sin(angle)).toFixed(2)}`;
}

const arc = (from: number, to: number, r: number) => `M${at(from, r)} A${r} ${r} 0 0 1 ${at(to, r)}`;

interface RouteSpeedometerProps {
  redline: boolean;
  /** The day of the stop in hand, dd.mm, for the readout beside the dial. */
  date?: string;
}

/**
 * A half dial in a chrome bezel: the month's days round its edge, a gold arc for how far the story has come, the red
 * zone at the end, a warning lamp, and the needle on its hub. Beside it a small readout gives the day of the stop in
 * hand; at the birthday it gives way to the warning, and the needle slams into the red and trembles there.
 */
export const RouteSpeedometer = memo(function RouteSpeedometer({ redline, date }: RouteSpeedometerProps) {
  const id = useIds();
  return (
    <div className={`route-speedometer ${redline ? "is-redline" : ""}`.trim()} aria-hidden="true">
      {redline ? (
        <span className="speedo-warning"><TriangleAlert size={12} strokeWidth={2.6} />Quá nguy hiểm</span>
      ) : date ? (
        <span className="speedo-readout"><small>Ngày</small><b>{date}</b></span>
      ) : null}
      <svg viewBox="0 0 100 56">
        <defs>
          <linearGradient id={id("chrome")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff6f0" />
            <stop offset="0.45" stopColor="#a8969c" />
            <stop offset="0.7" stopColor="#e8dcdf" />
            <stop offset="1" stopColor="#5a4a50" />
          </linearGradient>
          <radialGradient id={id("face")} cx="0.5" cy="0.95" r="0.95">
            <stop offset="0" stopColor="#3a0d1c" />
            <stop offset="0.7" stopColor="#1c050d" />
            <stop offset="1" stopColor="#0e0206" />
          </radialGradient>
          <radialGradient id={id("hub")} cx="0.36" cy="0.32" r="0.8">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.5" stopColor="#b9adb2" />
            <stop offset="1" stopColor="#4a3c42" />
          </radialGradient>
          <linearGradient id={id("needle")} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#ffd2c8" />
            <stop offset="0.35" stopColor="#ff5a4e" />
            <stop offset="1" stopColor="#ff2a3e" />
          </linearGradient>
        </defs>
        <path className="speedo-bezel" fill={url(id("chrome"))} d="M3 50 A47 47 0 0 1 97 50 V52.5 Q97 55 94.5 55 H5.5 Q3 55 3 52.5 Z" />
        <path className="speedo-face" fill={url(id("face"))} d="M6.5 50.5 A43.5 43.5 0 0 1 93.5 50.5 Z" />
        <path className="speedo-glass" d="M14 40 A37 37 0 0 1 58 12.4 A42 42 0 0 0 14 40 Z" />
        <path className="speedo-red" d={arc(0.92, 1, 39.6)} />
        <path className="speedo-fill" d={arc(0, 1, 42.4)} pathLength={1} />
        {ticks.map((t) => {
          const major = Math.round(t * 20) % 5 === 0;
          return <path key={t} className={`speedo-tick ${major ? "is-major" : ""} ${t >= REDLINE ? "is-red" : ""}`.replace(/\s+/g, " ").trim()} d={`M${at(t, major ? 33.5 : 37)} L${at(t, 40.5)}`} />;
        })}
        <text className="speedo-label" x="25" y="45.5" textAnchor="middle">8/9</text>
        <text className="speedo-label" x="75" y="45.5" textAnchor="middle">1/10</text>
        {/* Unlit until the birthday. */}
        <g className="speedo-lamp">
          <path d="M50 22.5 L55.2 31.5 H44.8 Z" />
          <path className="speedo-lamp-mark" d="M50 25.6 V28.4 M50 30 V30.2" />
        </g>
        <g className="speedo-needle">
          <path fill={url(id("needle"))} d="M48.5 50 L50 11 L51.5 50 Z" />
          <path className="speedo-needle-tail" d="M48.9 50 L50 55.2 L51.1 50 Z" />
        </g>
        <circle className="speedo-hub" fill={url(id("hub"))} cx={C.x} cy={C.y} r="4.6" />
        <circle className="speedo-hub-cap" cx={C.x} cy={C.y} r="1.5" />
      </svg>
    </div>
  );
});

/** The red car of chapter 3, side on and facing the way the route runs; its wheels turn as far as it has driven. */
export const RouteCar = memo(function RouteCar() {
  const id = useIds();
  return (
    <span className="route-car" aria-hidden="true">
      <i className="route-car-streaks" />
      <svg viewBox="0 0 44 20">
        <defs>
          <linearGradient id={id("paint")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff8a96" />
            <stop offset="0.38" stopColor="#ea2c44" />
            <stop offset="0.72" stopColor="#c0142e" />
            <stop offset="1" stopColor="#7a0618" />
          </linearGradient>
        </defs>
        <ellipse className="route-car-shadow" cx="22.5" cy="18.8" rx="19.5" ry="1.3" />
        <path className="route-car-body" fill={url(id("paint"))} d="M3 13.4 C3 10.6 4.6 9.4 7.6 9 L12.6 8.4 L17.4 4.2 C18.6 3.2 19.8 2.8 21.4 2.8 H29 C31 2.8 32.4 3.6 33.6 5 L36.6 8.6 L39.4 9.4 C41 9.8 41.8 11 41.8 12.6 V14.4 C41.8 15.4 41 16 40 16 H4.6 C3.6 16 3 15.2 3 14.4 Z" />
        <path className="route-car-glass" d="M14.6 8.4 L18.6 5 C19.4 4.4 20.2 4.2 21.2 4.2 H24.6 V8.4 Z M26.2 4.2 H29 C30.2 4.2 31 4.6 31.8 5.6 L34.2 8.4 H26.2 Z" />
        <path className="route-car-glint" d="M19.4 5.4 L17.2 7.6 M28.4 5 L27.2 7" />
        <path className="route-car-shine" d="M6 10.6 C14 9.8 30 9.8 39 10.6" />
        <path className="route-car-door" d="M25.4 8.6 V15 M15.4 9.4 C14.8 11.6 14.8 13.6 15.4 15" />
        <path className="route-car-head" d="M39.4 10.4 C40.6 10.6 41.3 11.3 41.3 12.2 H39 Z" />
        <path className="route-car-tail" d="M3.4 11.2 H5.6 V12.8 H3.2 Z" />
        {[11.4, 33.4].map((cx) => (
          <g key={cx}>
            <circle className="route-car-arch" cx={cx} cy="15.4" r="4.3" />
            <g className="route-car-wheel">
              <circle className="route-car-tyre" cx={cx} cy="15.6" r="3.6" />
              <circle className="route-car-rim" cx={cx} cy="15.6" r="1.9" />
              <path className="route-car-spoke" d={`M${cx - 1.9} 15.6 H${cx + 1.9} M${cx} 13.7 V17.5`} />
            </g>
          </g>
        ))}
      </svg>
      <i className="route-car-beam" />
    </span>
  );
});
