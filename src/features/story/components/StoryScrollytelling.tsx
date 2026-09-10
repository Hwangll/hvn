import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StoryPart, StoryPartId, StoryScrollItem } from "../data/story";
import { createStoryScrollItems } from "../data/story";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import { useActiveStoryStep } from "../hooks/useActiveStoryStep";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { usePartTwoScroll } from "../hooks/usePartTwoScroll";
import { useActiveStorySound } from "../hooks/useActiveStorySound";
import { MobileChapterJourney } from "./MobileChapterJourney";
import { StickyMemoryStage } from "./StickyMemoryStage";
import { StoryPartNavigation } from "./StoryPartNavigation";
import { StoryPartTransition } from "./StoryPartTransition";
import { PartOneChapterIndex } from "./PartOneChapterIndex";
import { StoryStep } from "./StoryStep";

interface StoryScrollytellingProps {
  navigationParts?: readonly StoryPart[];
  parts: readonly StoryPart[];
  onActiveItemChange?: (item: StoryScrollItem) => void;
  playCue?: (cue: SoundCue) => void;
  reducedMotion: boolean;
  startWithTransition?: boolean;
  soundEnabled: boolean;
  visitedStoryIds?: ReadonlySet<string>;
}

export function StoryScrollytelling({
  parts,
  navigationParts = parts,
  onActiveItemChange,
  playCue,
  reducedMotion,
  startWithTransition = false,
  soundEnabled,
  visitedStoryIds,
}: StoryScrollytellingProps) {
  const isMobile = useMediaQuery("(max-width: 900px)");
  const items = useMemo(() => createStoryScrollItems(parts), [parts]);
  const stepIds = useMemo(() => items.map((item) => item.id), [items]);
  const [navigationPartId, setNavigationPartId] = useState<StoryPartId>(items[0]?.partId ?? "before-meeting");
  const handleStepEnter = useCallback((stepId: string) => {
    const enteredItem = items.find((item) => item.id === stepId);
    if (enteredItem) {
      setNavigationPartId(enteredItem.partId);
    }
  }, [items]);
  const activeId = useActiveStoryStep({
    stepIds,
    disabled: items.length === 0,
    layoutKey: `${isMobile}-${reducedMotion}`,
    onStepEnter: handleStepEnter,
  });
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];
  const scope = useRef<HTMLDivElement | null>(null);
  usePartTwoScroll(scope, isMobile, reducedMotion);
  const activeSoundSource = activeItem?.partId === navigationPartId ? activeItem.optionalSound : undefined;
  useActiveStorySound(activeSoundSource, soundEnabled);

  useEffect(() => {
    if (!activeItem) {
      return;
    }

    onActiveItemChange?.(activeItem);
  }, [activeItem, onActiveItemChange]);

  return (
    <div className="story-sequence" id="story" ref={scope} aria-label="Hai phần của câu chuyện">
      <StoryPartNavigation
        activePartId={navigationPartId}
        currentPagePartId={parts[0]?.id ?? "before-meeting"}
        onNavigate={setNavigationPartId}
        parts={navigationParts}
      />

      {parts.map((part, partIndex) => {
        const partItems = items.filter((item) => item.partId === part.id);
        const activePartIndex = Math.max(0, partItems.findIndex((item) => item.id === activeId));
        const partActiveItem = partItems[activePartIndex] ?? partItems[0];

        return (
          <div className={`story-part story-part-${part.number}`} key={part.id}>
            {partIndex === 0 && !startWithTransition ? (
              <header className="story-part-heading" id={`part-${part.id}`} data-memory-reveal>
                <span>{part.eyebrow}</span>
                <h2>{part.title}</h2>
                <p>{part.subtitle}</p>
                {part.number === 1 ? <PartOneChapterIndex items={partItems} /> : null}
              </header>
            ) : (
              <StoryPartTransition onInView={setNavigationPartId} part={part} />
            )}

            <section className="story-scrollytelling" aria-label={`${part.eyebrow}: ${part.title}`}>
              {isMobile || (reducedMotion && part.id === "together-offline") ? (
                <MobileChapterJourney
                  items={partItems}
                  activeId={activeId}
                  playCue={playCue}
                  reducedMotion={reducedMotion}
                  soundEnabled={soundEnabled}
                  visitedStoryIds={visitedStoryIds}
                />
              ) : (
                <div className="story-scrollytelling-desktop">
                  <StickyMemoryStage
                    chapter={partActiveItem}
                    chapters={partItems}
                    activeIndex={activePartIndex}
                    reducedMotion={reducedMotion}
                    visitedStoryIds={visitedStoryIds}
                  />
                  <div className="story-steps">
                    {partItems.map((item, index) => (
                      <StoryStep
                        chapter={item}
                        index={index}
                        isActive={item.id === activeId}
                        key={item.id}
                        playCue={playCue}
                        soundEnabled={soundEnabled}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        );
      })}
    </div>
  );
}
