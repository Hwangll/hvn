import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../../test/animationMocks";
import { StoryScrollytelling } from "./StoryScrollytelling";
import { StickyMemoryStage } from "./StickyMemoryStage";
import { StoryStep } from "./StoryStep";
import { ParallelScene } from "./scenes/ParallelScene";
import { StayingScene } from "./scenes/StayingScene";
import { storyParts, storyScrollItems } from "../data/story";
import * as mediaQueryHook from "../../../shared/hooks/useMediaQuery";

const partOneItems = storyScrollItems.filter((item) => item.partId === "before-meeting");

describe("Story scrollytelling rebuild", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(mediaQueryHook, "useMediaQuery").mockReturnValue(false);
  });

  it("renders all five story chapters from shared data", () => {
    render(<StoryScrollytelling parts={storyParts} reducedMotion soundEnabled={false} />);

    partOneItems.forEach((chapter) => {
      expect(screen.getByRole("heading", { name: chapter.title })).toBeInTheDocument();
    });
  });

  it("updates sticky scene metadata from shared chapter data", () => {
    render(
      <StickyMemoryStage
        chapter={partOneItems[2]}
        chapters={partOneItems}
        activeIndex={2}
        reducedMotion
      />,
    );

    expect(screen.getByText("03 / 05")).toBeInTheDocument();
    expect(screen.getByText("LẠI GẶP")).toBeInTheDocument();
    expect(screen.getByText(partOneItems[2].year)).toBeInTheDocument();
  });

  it("uses the correct thread state per chapter", () => {
    const { container, rerender } = render(
      <StickyMemoryStage
        chapter={partOneItems[0]}
        chapters={partOneItems}
        activeIndex={0}
        reducedMotion
      />,
    );

    expect(container.querySelector('[data-testid="scene-meeting"]')).toBeInTheDocument();

    rerender(
      <StickyMemoryStage
        chapter={partOneItems[3]}
        chapters={partOneItems}
        activeIndex={3}
        reducedMotion
      />,
    );

    expect(container.querySelector('[data-testid="scene-parallel"]')).toBeInTheDocument();
  });

  it("renders parallel scene marker from shared thread state", () => {
    const { container } = render(<ParallelScene chapter={partOneItems[3]} isActive />);

    expect(container.querySelector('[data-testid="parallel-lanes"]')).toBeInTheDocument();
  });

  it("does not render the old disconnected X symbol in staying scene", () => {
    const { container } = render(<StayingScene chapter={partOneItems[4]} isActive />);

    expect(container.querySelector(".staying-calendar")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/✕|×/);
    expect(container.querySelector(".loop-orbit")).not.toBeInTheDocument();
  });

  it("renders a living thread scene in the sticky stage", () => {
    render(
      <StickyMemoryStage
        chapter={partOneItems[0]}
        chapters={partOneItems}
        activeIndex={0}
        reducedMotion
      />,
    );

    expect(screen.getByTestId("scene-meeting")).toBeInTheDocument();
    expect(screen.getByText("Bumble")).toBeInTheDocument();
    expect(screen.getByText("Instagram")).toBeInTheDocument();
  });

  it("shows compact chapter progress for the active chapter", () => {
    render(
      <StickyMemoryStage
        chapter={partOneItems[1]}
        chapters={partOneItems}
        activeIndex={1}
        reducedMotion
      />,
    );

    expect(screen.getByText("02 / 05")).toBeInTheDocument();
    expect(screen.getByText("MẤT KẾT NỐI")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
  });

  it("handles missing optional images without crashing", () => {
    const chapter = { ...partOneItems[0], image: "" };

    expect(() => render(<StoryStep chapter={chapter} index={0} isActive soundEnabled={false} />)).not.toThrow();
  });

  it("falls back when a keepsake image fails to load", async () => {
    render(<StoryStep chapter={partOneItems[0]} index={0} isActive soundEnabled={false} />);

    const images = screen.getAllByAltText(partOneItems[0].imageAlt);
    const image = images[images.length - 1];
    fireEvent.error(image);

    expect(screen.getByText("ảnh kỷ niệm đang chờ thay")).toBeInTheDocument();
  });

  it("uses reduced-motion friendly static scene rendering", () => {
    const { container } = render(
      <StickyMemoryStage
        chapter={partOneItems[0]}
        chapters={partOneItems}
        activeIndex={0}
        reducedMotion
      />,
    );

    expect(container.querySelector('[data-testid="scene-meeting"]')).toBeInTheDocument();
    expect(container.querySelector(".connection-thread")).toBeInTheDocument();
  });

  it("renders mobile journey without desktop sticky stage", () => {
    vi.spyOn(mediaQueryHook, "useMediaQuery").mockReturnValue(true);

    const { container } = render(
      <StoryScrollytelling parts={storyParts} reducedMotion soundEnabled={false} />,
    );

    expect(screen.getAllByTestId("mobile-chapter-journey")).toHaveLength(2);
    expect(container.querySelector(".story-scrollytelling-desktop")).not.toBeInTheDocument();
    expect(container.querySelector(".sticky-memory-stage")).not.toBeInTheDocument();
  });

  it("reveals secret notes from story steps", async () => {
    const user = userEvent.setup();
    render(<StoryStep chapter={partOneItems[0]} index={0} isActive soundEnabled={false} />);

    const secretButton = screen.getByRole("button", { name: /Mở tin nhắn bí mật/ });
    await user.click(secretButton);

    expect(screen.getByText(/một cú match tưởng vu vơ/i)).toBeInTheDocument();
  });
});
