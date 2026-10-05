import type { CSSProperties } from "react";

/** Each meteor runs its own long cycle, so they cross one at a time and the sky stays mostly still. */
const meteors = [
  { top: "4%", left: "70%", delay: "1.6s", duration: "11s" },
  { top: "12%", left: "96%", delay: "6.2s", duration: "13s" },
  { top: "0%", left: "42%", delay: "9.4s", duration: "15s" },
  { top: "20%", left: "84%", delay: "12.8s", duration: "17s" },
];

/** A few shooting stars across a night sky (Meteors, Magic UI and Aceternity). The stylesheet animates them. */
export function Meteors({ className = "" }: { className?: string }) {
  return (
    <span className={`meteors ${className}`.trim()} aria-hidden="true">
      {meteors.map((meteor) => (
        <i
          key={`${meteor.top}-${meteor.left}`}
          style={{ "--top": meteor.top, "--left": meteor.left, "--delay": meteor.delay, "--duration": meteor.duration } as CSSProperties}
        />
      ))}
    </span>
  );
}
