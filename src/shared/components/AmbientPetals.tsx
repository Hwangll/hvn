import type { CSSProperties } from "react";

const petals = [
  { left: 4, delay: -1.2, duration: 13.5, size: 0.72, drift: -24 },
  { left: 11, delay: -5.8, duration: 16.2, size: 0.55, drift: 34 },
  { left: 18, delay: -3.1, duration: 12.8, size: 0.82, drift: -18 },
  { left: 27, delay: -8.4, duration: 18.4, size: 0.5, drift: 28 },
  { left: 36, delay: -2.6, duration: 15.1, size: 0.68, drift: -38 },
  { left: 44, delay: -9.2, duration: 17.3, size: 0.58, drift: 20 },
  { left: 52, delay: -4.7, duration: 14.6, size: 0.76, drift: -26 },
  { left: 61, delay: -7.9, duration: 19.1, size: 0.48, drift: 32 },
  { left: 70, delay: -2.1, duration: 13.9, size: 0.7, drift: -22 },
  { left: 78, delay: -6.6, duration: 16.8, size: 0.56, drift: 26 },
  { left: 86, delay: -10.4, duration: 18.8, size: 0.8, drift: -34 },
  { left: 94, delay: -3.8, duration: 15.7, size: 0.52, drift: 18 },
];

export function AmbientPetals() {
  return (
    <div className="ambient-petals" aria-hidden="true">
      {petals.map((petal) => (
        <span
          key={`${petal.left}-${petal.delay}`}
          style={
            {
              "--petal-left": `${petal.left}%`,
              "--petal-delay": `${petal.delay}s`,
              "--petal-duration": `${petal.duration}s`,
              "--petal-size": petal.size,
              "--petal-drift": `${petal.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
