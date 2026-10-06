import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../../test/animationMocks";
import { StoryScrollytelling } from "./StoryScrollytelling";
import { ScrollRibbon } from "./ScrollRibbon";
import { storyParts } from "../data/story";
import * as mediaQueryHook from "../../../shared/hooks/useMediaQuery";
import { ReadingProgress } from "../../../shared/components/ReadingProgress";

describe("scroll life", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(mediaQueryHook, "useMediaQuery").mockReturnValue(false);
  });

  it("keeps Part I's title whole for assistive tech while its letters move one by one", () => {
    const [partOne] = storyParts;
    render(<StoryScrollytelling parts={[partOne]} reducedMotion={false} soundEnabled={false} />);
    const heading = screen.getByRole("heading", { level: 2, name: partOne.title });
    expect(heading.querySelectorAll(".heading-letter")).toHaveLength(Array.from(partOne.title.replace(/\s+/g, "")).length);
    heading.querySelectorAll(".heading-word").forEach((word) => expect(word).toHaveAttribute("aria-hidden", "true"));
  });

  it("keeps ribbons out of the reading order and runs each band's words round it", () => {
    const { container } = render(<ScrollRibbon tone="rose" placement="opening" front={["nhớ", "gặp"]} back={["thương"]} reducedMotion />);
    const ribbon = container.querySelector(".scroll-ribbon");
    expect(ribbon).toHaveAttribute("aria-hidden", "true");
    expect(ribbon).toHaveClass("is-rose", "at-opening");
    const frontWords = ribbon?.querySelectorAll(".scroll-ribbon-band.is-front .scroll-ribbon-word") ?? [];
    // Several runs of the same words, so the loop always covers the screen.
    expect(frontWords.length).toBeGreaterThan(2);
    expect(frontWords.length % 2).toBe(0);
    expect(Array.from(frontWords, (word) => word.textContent).slice(0, 2)).toEqual(["nhớ", "gặp"]);
  });

  it("draws the reading progress and its rider as decoration only", () => {
    const { container } = render(<ReadingProgress variant="day" />);
    expect(container.querySelector(".reading-progress")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".reading-rider-track")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".reading-rider")).toHaveClass("is-day");
  });
});
