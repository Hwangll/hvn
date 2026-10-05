import { Heart } from "lucide-react";
import { useRef } from "react";
import { partThreeCopy } from "../data/story";
import { useCountdown } from "../../../shared/hooks/useCountdown";
import { useOnScreen } from "../../../shared/hooks/useOnScreen";
import { useRevealOnce } from "../../../shared/motion/useRevealOnce";
import { CircularText } from "../../../shared/components/motion/CircularText";
import { RollingNumber } from "../../../shared/components/motion/RollingNumber";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

/**
 * Part III arrives as a sealed envelope rather than a promise: until `partThreeCopy.opensAt` it stays
 * shut behind a wax seal and a live countdown, and once that moment passes the flap lifts on its own
 * and the letter inside slides out. The date lives in one constant in the story data.
 */
export function SealedEnvelope() {
  const opensAt = new Date(partThreeCopy.opensAt);
  // The clock only runs while the envelope can be seen; scrolled back to, it rolls straight to the time left.
  const envelopeRef = useRef<HTMLDivElement | null>(null);
  const remaining = useCountdown(partThreeCopy.opensAt, useOnScreen(envelopeRef));
  const opened = remaining.isPast;
  const openOn = Number.isNaN(opensAt.getTime()) ? "" : dateFormatter.format(opensAt);
  // The cards wait at zero until the envelope is in view, then every digit rolls to the time that is left.
  const countdownRef = useRef<HTMLOListElement | null>(null);
  const counting = useRevealOnce(countdownRef, 0.6);
  const units = [
    { value: remaining.days, label: partThreeCopy.countdownLabels.days },
    { value: remaining.hours, label: partThreeCopy.countdownLabels.hours },
    { value: remaining.minutes, label: partThreeCopy.countdownLabels.minutes },
    { value: remaining.seconds, label: partThreeCopy.countdownLabels.seconds },
  ];

  return (
    <div className={`sealed-envelope ${opened ? "is-open" : "is-sealed"}`} ref={envelopeRef}>
      <div className="envelope-paper">
        <div className="envelope-letter">
          <span>{partThreeCopy.stamp}</span>
          <p>{opened ? partThreeCopy.openNote : partThreeCopy.sealedNote}</p>
        </div>
        <i className="envelope-front" aria-hidden="true" />
        <i className="envelope-flap" aria-hidden="true" />
        {/* The opening date runs round the wax like a ribbon; it is also written out under the envelope. */}
        {opened ? null : <CircularText className="envelope-seal-ring" text={`${partThreeCopy.stamp} · ${partThreeCopy.openLabel} ${openOn} · `} />}
        <span className="envelope-seal" aria-hidden="true"><Heart size={16} strokeWidth={2.4} /></span>
      </div>

      {opened ? null : (
        <div className="envelope-countdown">
          <p className="envelope-open-on">{partThreeCopy.openLabel} {openOn}</p>
          <ol aria-hidden="true" ref={countdownRef}>
            {units.map((unit) => (
              <li key={unit.label}>
                <strong><RollingNumber value={counting ? unit.value : 0} /></strong>
                <span>{unit.label}</span>
              </li>
            ))}
          </ol>
          <p className="sr-only">
            Còn {remaining.days} ngày {remaining.hours} giờ nữa là mở, vào ngày {openOn}.
          </p>
        </div>
      )}
    </div>
  );
}
