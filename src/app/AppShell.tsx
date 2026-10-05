import { useCallback, useEffect, useRef, useState } from "react";
import { useLenisScroll } from "../shared/hooks/useLenisScroll";
import { usePointerDelight } from "../shared/hooks/usePointerDelight";
import { useReducedMotion } from "../shared/hooks/useReducedMotion";
import { useSoundToggle } from "../shared/hooks/useSoundToggle";
import { SoundToggle } from "../shared/components/SoundToggle";
import { AmbientPetals } from "../shared/components/AmbientPetals";
import { MemoryIntro } from "../features/intro/components/MemoryIntro";
import { MemoryTransitionOverlay } from "../features/intro/components/MemoryTransitionOverlay";
import { StoryExperience } from "../features/story/components/StoryExperience";
import type { StoryPage } from "./storyPage";

export type ExperienceState = "intro" | "focusing" | "transitioning" | "story-reveal" | "story-ready";

const INTRO_SEEN_KEY = "hvn-memory-intro-seen";

interface AppShellProps {
  page?: StoryPage;
}

export function AppShell({ page = "part-one" }: AppShellProps) {
  const isPartTwoPage = page === "part-two";
  const prefersReducedMotion = useReducedMotion();
  const { playCue, soundEnabled, toggleSound } = useSoundToggle();
  const [isIntroSeen, setIsIntroSeen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return isPartTwoPage || window.sessionStorage.getItem(INTRO_SEEN_KEY) === "true";
  });
  const [experienceState, setExperienceState] = useState<ExperienceState>(() => {
    if (typeof window === "undefined") {
      return "intro";
    }

    return isPartTwoPage || window.sessionStorage.getItem(INTRO_SEEN_KEY) === "true" ? "story-ready" : "intro";
  });
  const transitionTimerIds = useRef<number[]>([]);
  const introVisible = experienceState === "intro" || experienceState === "focusing" || (experienceState === "transitioning" && !isIntroSeen);
  const storyVisible = experienceState === "story-reveal" || experienceState === "story-ready" || (experienceState === "transitioning" && isIntroSeen);

  useLenisScroll(prefersReducedMotion);
  const shellRef = useRef<HTMLDivElement | null>(null);
  usePointerDelight(shellRef, isPartTwoPage, prefersReducedMotion);

  // The browser's own chrome follows the room: dark while the memory room is open, rose paper once the story shows.
  useEffect(() => {
    if (isPartTwoPage) return;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", introVisible ? "#16141f" : "#fff4f6");
  }, [introVisible, isPartTwoPage]);

  useEffect(() => {
    const shouldLock = experienceState === "intro" || experienceState === "focusing" || experienceState === "transitioning";
    document.body.classList.toggle("is-scroll-locked", shouldLock);

    return () => document.body.classList.remove("is-scroll-locked");
  }, [experienceState]);

  const clearTransitionTimers = useCallback(() => {
    transitionTimerIds.current.forEach((timerId) => window.clearTimeout(timerId));
    transitionTimerIds.current = [];
  }, []);

  const scheduleTransition = useCallback((callback: () => void, delay: number) => {
    const timerId = window.setTimeout(() => {
      transitionTimerIds.current = transitionTimerIds.current.filter((id) => id !== timerId);
      callback();
    }, delay);

    transitionTimerIds.current = [...transitionTimerIds.current, timerId];
  }, []);

  useEffect(() => clearTransitionTimers, [clearTransitionTimers]);

  const runToStory = useCallback(() => {
    clearTransitionTimers();
    playCue("select");
    setExperienceState("focusing");
    scheduleTransition(
      () => setExperienceState("transitioning"),
      prefersReducedMotion ? 120 : 640,
    );
    scheduleTransition(
      () => {
        window.sessionStorage.setItem(INTRO_SEEN_KEY, "true");
        setIsIntroSeen(true);
        window.scrollTo({ top: 0, behavior: "auto" });
        setExperienceState("story-reveal");
      },
      prefersReducedMotion ? 180 : 1480,
    );
    scheduleTransition(
      () => setExperienceState("story-ready"),
      prefersReducedMotion ? 360 : 2340,
    );
  }, [clearTransitionTimers, playCue, prefersReducedMotion, scheduleTransition]);

  const returnToIntro = useCallback(() => {
    clearTransitionTimers();
    setExperienceState("transitioning");
    scheduleTransition(
      () => {
        window.sessionStorage.removeItem(INTRO_SEEN_KEY);
        if (isPartTwoPage) {
          window.location.assign("/");
          return;
        }

        setIsIntroSeen(false);
        window.scrollTo({ top: 0, behavior: "auto" });
        setExperienceState("intro");
      },
      prefersReducedMotion ? 200 : 920,
    );
  }, [clearTransitionTimers, isPartTwoPage, prefersReducedMotion, scheduleTransition]);

  return (
    <div className={`app-shell experience-${experienceState} ${isPartTwoPage ? "app-part-two" : "app-part-one"}`} ref={shellRef}>
      {!isPartTwoPage ? <AmbientPetals /> : null}
      {/* A hairline of reading progress; CSS drives it from the page's own scroll (see .reading-progress). */}
      {storyVisible ? <div className="reading-progress" aria-hidden="true" /> : null}
      <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
      {introVisible ? <MemoryIntro onEnterStory={runToStory} phase={experienceState} reducedMotion={prefersReducedMotion} /> : null}
      {storyVisible ? (
        <StoryExperience
          onReturnToIntro={returnToIntro}
          page={page}
          playCue={playCue}
          reducedMotion={prefersReducedMotion}
          soundEnabled={soundEnabled}
        />
      ) : null}
      <MemoryTransitionOverlay phase={experienceState} reducedMotion={prefersReducedMotion} />
    </div>
  );
}
