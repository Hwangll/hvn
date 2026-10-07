import { Heart } from "lucide-react";
import { useRef } from "react";
import type { EnvelopeCopy } from "../data/story";
import { useCountdown } from "../../../shared/hooks/useCountdown";
import { useOnScreen } from "../../../shared/hooks/useOnScreen";
import { useRevealOnce } from "../../../shared/motion/useRevealOnce";
import { CircularText } from "../../../shared/components/motion/CircularText";
import { RollingNumber } from "../../../shared/components/motion/RollingNumber";

// The dates are Hà Nội's: an envelope that opens at midnight there shows that day wherever it is read.
const dateFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" });

/**
 * The next part arrives as a sealed envelope rather than a promise: until `copy.opensAt` it stays
 * shut behind a wax seal and a live countdown, and once that moment passes the flap lifts on its own
 * and the letter inside slides out. The dates live in the story data (partThreeCopy, nextPartCopy).
 */
export function SealedEnvelope({ copy }: { copy: EnvelopeCopy }) {
  const opensAt = new Date(copy.opensAt);
  // The clock only runs while the envelope can be seen; scrolled back to, it rolls straight to the time left.
  const envelopeRef = useRef<HTMLDivElement | null>(null);
  const remaining = useCountdown(copy.opensAt, useOnScreen(envelopeRef));
  const opened = remaining.isPast;
  const openOn = Number.isNaN(opensAt.getTime()) ? "" : dateFormatter.format(opensAt);
  // The cards wait at zero until the envelope is in view, then every digit rolls to the time that is left.
  const countdownRef = useRef<HTMLOListElement | null>(null);
  const counting = useRevealOnce(countdownRef, 0.6);
  const units = [
    { value: remaining.days, label: copy.countdownLabels.days },
    { value: remaining.hours, label: copy.countdownLabels.hours },
    { value: remaining.minutes, label: copy.countdownLabels.minutes },
    { value: remaining.seconds, label: copy.countdownLabels.seconds },
  ];

  return (
    <div className={`sealed-envelope ${opened ? "is-open" : "is-sealed"}`} ref={envelopeRef}>
      <div className="envelope-paper">
        <div className="envelope-letter">
          <span>{copy.stamp}</span>
          <p>{opened ? copy.openNote : copy.sealedNote}</p>
        </div>
        <i className="envelope-front" aria-hidden="true" />
        <i className="envelope-flap" aria-hidden="true" />
        {/* The opening date runs round the wax like a ribbon; it is also written out under the envelope. */}
        {opened ? null : <CircularText className="envelope-seal-ring" text={`${copy.stamp} · ${copy.openLabel} ${openOn} · `} />}
        <span className="envelope-seal" aria-hidden="true"><Heart size={16} strokeWidth={2.4} /></span>
      </div>

      {opened ? null : (
        <div className="envelope-countdown">
          <p className="envelope-open-on">{copy.openLabel} {openOn}</p>
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
