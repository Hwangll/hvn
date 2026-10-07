import { ArrowDown, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type AnimationEvent } from "react";
import { nextPartCopy, partThreeFilmCopy } from "../../data/story";
import { RedCarSprite } from "../atoms/PartThreeSprites";
import { Clapperboard } from "./Clapperboard";

const copy = partThreeFilmCopy.postCredits;

/** The day the next chapter's envelope opens, as a slate would chalk it: 01.01.2027. */
const nextDate = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" })
  .format(new Date(nextPartCopy.opensAt))
  .replaceAll("/", ".");

/**
 * The scene after the credits, for whoever stays in the dark long enough, in letterbox and film grain: a slate for the
 * next chapter claps; under the full moon the red car comes down the street past the lamps, brakes under one of them,
 * a heart goes up and its lights flash twice with the heart's beats, then it revs and is gone, too fast, the leaves
 * swirling after it; then the line every sequel ends on. It plays once it is well in view, and can be played again;
 * under reduced motion it is only its last card.
 */
export function PostCreditsScene({ reducedMotion }: { reducedMotion: boolean }) {
  const filmRef = useRef<HTMLElement | null>(null);
  // Without IntersectionObserver there is no way to wait for it to come into view, so it simply plays.
  const [run, setRun] = useState(() => (typeof IntersectionObserver === "undefined" ? 1 : 0));
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const film = filmRef.current;
    if (reducedMotion || !film || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.intersectionRatio >= 0.6)) {
        setRun(1);
        observer.disconnect();
      }
    }, { threshold: [0, 0.6] });
    observer.observe(film);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const finish = (event: AnimationEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).classList.contains("post-credits-return")) setEnded(true);
  };
  const replay = () => {
    setEnded(false);
    setRun((current) => current + 1);
  };
  const state = reducedMotion ? "is-still" : run ? "is-playing" : "is-waiting";

  return (
    <section className="post-credits" aria-label={copy.label}>
      <p className="post-credits-hint">
        {copy.hint}
        <ArrowDown aria-hidden="true" size={16} />
      </p>
      <figure className={`post-credits-film ${state}${ended ? " is-ended" : ""}`} ref={filmRef} onAnimationEnd={finish}>
        <figcaption className="post-credits-label">{copy.label}</figcaption>
        <div className="post-credits-screen" key={run} aria-hidden="true">
          <div className="pc-night">
            <i className="pc-stars" />
            <i className="pc-stars is-far" />
            <i className="pc-moon" />
            <i className="pc-skyline" />
            <i className="pc-road" />
            <i className="pc-lamps" />
            <i className="pc-dashes" />
            <span className="pc-leaves"><i /><i /><i /><i /><i /></span>
          </div>
          <div className="pc-car">
            <i className="pc-beam" />
            <i className="pc-brake" />
            <RedCarSprite />
            <i className="pc-streaks" />
          </div>
          {/* Left behind in the air when the car goes. */}
          <i className="pc-puff" />
          <i className="pc-heart" />
          <div className="pc-slate">
            <Clapperboard shot={{ production: copy.production, chapter: "??", scene: "01", take: 1, date: nextDate, title: copy.note }} />
          </div>
          <div className="post-credits-return">
            <b>{copy.names}</b>
            <span>{copy.returns}</span>
            <i className="pc-divider" />
            <small>{copy.on} <time dateTime={nextPartCopy.opensAt.slice(0, 10)}>{nextDate}</time></small>
          </div>
          <i className="pc-grain" />
        </div>
        <p className="sr-only">{copy.names} {copy.returns} {copy.on} {nextDate}.</p>
        {ended ? (
          <button className="post-credits-replay" type="button" onClick={replay}>
            <RotateCcw aria-hidden="true" size={15} />
            {copy.replay}
          </button>
        ) : null}
      </figure>
    </section>
  );
}
