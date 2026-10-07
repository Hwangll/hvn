import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { partThreeFilmCopy } from "../../data/story";

/** Seen once a visit: coming back to the page within the same session goes straight to the film. */
export const LEADER_SEEN_KEY = "hvn-part-three-leader";

/**
 * The house lights going down and the curtains parting, the leader counting, a beat of black, the rating card, and the
 * iris opening onto the title page.
 */
type Phase = "house" | "count" | "black" | "rating" | "lift" | "done";

/** The leader's clock, in ms. */
const HOUSE = 1500;
const COUNT = 720;
const COUNTS = [5, 4, 3, 2, 1];
const BLACK = 240;
const RATING = 2700;
const LIFT = 900;
const SKIP_LIFT = 480;
const TOTAL = HOUSE + COUNTS.length * COUNT + BLACK + RATING;

/** The film as it runs through the gate: its start frame, the count, black leader, then the rating card. */
type Frame = "start" | number | "black" | "rating";
const reel: Frame[] = ["start", ...COUNTS, "black", "rating"];
/** Frames shown on either side of the one in the gate. */
const AROUND = 2;

const copy = partThreeFilmCopy;

function shouldPlay(reducedMotion: boolean) {
  if (reducedMotion || typeof window === "undefined") return false;
  // A reload partway down the page, or a link to one of its stops, goes straight back to the reading.
  if (window.scrollY > 40 || window.location.hash) return false;
  try {
    return window.sessionStorage.getItem(LEADER_SEEN_KEY) !== "seen";
  } catch {
    return true;
  }
}

/** One frame of the strip: the leader's dial and number, its start frame, black, or the rating card. */
function LeaderFrame({ frame, current }: { frame: Frame | undefined; current: boolean }) {
  const kind = frame === undefined || frame === "black" ? "black" : typeof frame === "number" ? "count" : frame;
  return (
    <div className={`leader-frame is-${kind} ${current ? "is-current" : ""}`.trim()}>
      <div className="leader-face">
        {typeof frame === "number" ? (
          <>
            {current ? <i className="leader-sweep" /> : null}
            <i className="leader-ring is-outer" />
            <i className="leader-ring is-inner" />
            <i className="leader-cross" />
            <b className="leader-count">{frame}</b>
          </>
        ) : null}
        {frame === "start" ? (
          <div className="leader-start">
            <small>{copy.presents}</small>
            <b>{copy.start}</b>
            <small>{copy.production}</small>
          </div>
        ) : null}
        {frame === "rating" ? (
          <div className="rating-card">
            <p className="rating-kicker">{copy.rating.kicker}</p>
            <div className="rating-row">
              <span className="rating-badge"><b>{copy.rating.badge}</b><small>{copy.rating.badgeUnit}</small></span>
              <div className="rating-text">
                <p className="rating-audience">{copy.rating.audience}</p>
                <p className="rating-reasons">{copy.rating.reasons}</p>
              </div>
            </div>
            <p className="rating-presents">{copy.presents} · {copy.production}</p>
          </div>
        ) : null}
      </div>
      {/* The edge print between the perforations, as a film stock carries it. */}
      {kind !== "black" ? <span className="leader-edge-print">HÁT &amp; NỜ ▸ 2026 ▸ {typeof frame === "number" ? `0${frame}` : "00"}</span> : null}
    </div>
  );
}

/**
 * Part III opens like a film in a cinema: the house lights go down and the velvet curtains part, an old leader runs
 * through the gate counting down from five (each frame pulled down into place, the strip and its perforations either
 * side of it), a rating card passes the film for its audience of two, and an iris opens onto the title page. Any
 * scroll, key or the skip button ends it at once; it plays once a visit, and never under reduced motion.
 */
export function FilmLeader({ reducedMotion }: { reducedMotion: boolean }) {
  const [phase, setPhase] = useState<Phase>(() => (shouldPlay(reducedMotion) ? "house" : "done"));
  // Which frame of the reel is in the gate.
  const [position, setPosition] = useState(0);
  const [quick, setQuick] = useState(false);
  const timers = useRef<number[]>([]);
  const playing = phase !== "done";

  const skip = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [window.setTimeout(() => setPhase("done"), SKIP_LIFT)];
    setQuick(true);
    setPhase((current) => (current === "done" ? current : "lift"));
  }, []);

  // Scheduled once, as the film starts (a skip reschedules only its own end); once it is over, nothing is left to run.
  useEffect(() => {
    if (!playing) return undefined;
    try {
      window.sessionStorage.setItem(LEADER_SEEN_KEY, "seen");
    } catch {
      // Without storage it simply plays again next visit.
    }
    const at = (delay: number, run: () => void) => timers.current.push(window.setTimeout(run, delay));
    COUNTS.forEach((_, index) => at(HOUSE + index * COUNT, () => {
      setPhase("count");
      setPosition(index + 1);
    }));
    const black = HOUSE + COUNTS.length * COUNT;
    at(black, () => {
      setPhase("black");
      setPosition(COUNTS.length + 1);
    });
    at(black + BLACK, () => {
      setPhase("rating");
      setPosition(COUNTS.length + 2);
    });
    at(TOTAL, () => setPhase("lift"));
    at(TOTAL + LIFT, () => setPhase("done"));
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };
  }, [playing]);

  useEffect(() => {
    if (!playing) return undefined;
    const startY = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - startY) > 4) skip();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab" && event.key !== "Shift") skip();
    };
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [playing, skip]);

  if (!playing) return null;

  const strip = Array.from({ length: AROUND * 2 + 1 }, (_, index) => reel[position - AROUND + index]);
  const style = { "--leader-total": `${TOTAL}ms` } as CSSProperties;

  return createPortal(
    <div className={`film-leader is-${phase} ${quick ? "is-quick" : ""}`.trim()} style={style} data-frame={String(reel[position])}>
      <div className="leader-house" aria-hidden="true">
        <i className="leader-curtain is-left" />
        <i className="leader-curtain is-right" />
      </div>
      <div className="leader-film" aria-hidden="true">
        {/* Re-keyed each frame, so the strip is pulled down one frame into the gate. */}
        <div className="leader-reel" key={position}>
          {strip.map((frame, index) => <LeaderFrame frame={frame} current={index === AROUND} key={`${position}-${index}`} />)}
        </div>
        <div className="leader-gate">
          <i className="leader-pop" key={position} />
          <i className="leader-grain" />
          <i className="leader-dust" />
          <i className="leader-hair" />
          <i className="leader-scratch" />
        </div>
      </div>
      <button className="film-leader-skip" type="button" aria-label={copy.skip} onClick={skip}>
        <span>Bỏ qua</span>
        <span aria-hidden="true">›</span>
        <i className="film-leader-meter" aria-hidden="true" />
      </button>
    </div>,
    document.body,
  );
}
