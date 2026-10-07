import { useEffect, useRef, useState, type AnimationEvent } from "react";
import type { StoryScrollItem } from "../../data/story";
import { Clapperboard, type SlateShot } from "./Clapperboard";
import { opensChapter, shotFor } from "./slateShots";

interface Take {
  key: number;
  /** The chapter the slate is for: leaving it takes the slate away. */
  chapterId: string;
  shot: SlateShot;
}

/** One playing of the slate: it comes up in front of the scene, claps, is pulled away, and then is gone. */
function SlateTake({ take, onDone }: { take: Take; onDone: () => void }) {
  const finish = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onDone();
  };
  return (
    <div className="chapter-slate" aria-hidden="true" onAnimationEnd={finish}>
      <Clapperboard shot={take.shot} />
    </div>
  );
}

/**
 * The slate in front of the desktop stage. Going on into a new chapter brings a clapperboard up in front of its scene,
 * to clap and be pulled away; coming back to a chapter from below claps its next take. It waits for the stage to be on
 * screen, so the first chapter's slate comes down as the reader arrives from the title page, not on page load.
 */
export function StageSlate({ items, activeIndex }: { items: readonly StoryScrollItem[]; activeIndex: number }) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [onStage, setOnStage] = useState(false);
  const [seenIndex, setSeenIndex] = useState(-1);
  const [takes, setTakes] = useState<Readonly<Record<string, number>>>({});
  const [take, setTake] = useState<Take | null>(null);

  // A step forward onto a chapter's first stop calls for its slate (its next take). A move within the chapter lets the
  // slate finish clapping; leaving the chapter (a jump, or going back) takes it away, played or still waiting for the
  // stage to come on screen. Worked out as the stop changes, from the stop before it.
  if (activeIndex !== seenIndex) {
    setSeenIndex(activeIndex);
    const item = items[activeIndex];
    if (item && activeIndex > seenIndex && opensChapter(items, activeIndex)) {
      const count = (takes[item.chapterId] ?? 0) + 1;
      setTakes({ ...takes, [item.chapterId]: count });
      setTake({ key: activeIndex * 100 + count, chapterId: item.chapterId, shot: shotFor(item, count) });
    } else if (take && item?.chapterId !== take.chapterId) {
      setTake(null);
    }
  }

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry) setOnStage(entry.intersectionRatio >= 0.5);
    }, { threshold: [0, 0.5] });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="chapter-slate-frame" ref={frameRef}>
      {take && onStage ? <SlateTake key={take.key} take={take} onDone={() => setTake(null)} /> : null}
    </div>
  );
}

/**
 * The same slate on a phone, over the first scene card of each chapter: it claps when the card comes up the screen,
 * that is when the reader scrolls on down into the chapter, and again (its next take) whenever they come back down.
 */
export function CanvasSlate({ item }: { item: StoryScrollItem }) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const takes = useRef(0);
  const [take, setTake] = useState<Take | null>(null);

  useEffect(() => {
    const canvas = frameRef.current?.parentElement;
    if (!canvas || typeof IntersectionObserver === "undefined") return undefined;
    let shown = false;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio === 0) shown = false;
        // Most of the card is in view, its top edge still on screen: it has come up from below.
        if (!shown && entry.intersectionRatio >= 0.55 && entry.boundingClientRect.top > 0) {
          shown = true;
          takes.current += 1;
          setTake({ key: takes.current, chapterId: item.chapterId, shot: shotFor(item, takes.current) });
        }
      }
    }, { threshold: [0, 0.55] });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [item]);

  return (
    <div className="chapter-slate-frame" ref={frameRef}>
      {take ? <SlateTake key={take.key} take={take} onDone={() => setTake(null)} /> : null}
    </div>
  );
}
