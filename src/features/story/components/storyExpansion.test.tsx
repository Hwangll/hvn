import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import "../../../test/animationMocks";
import { KeepsakePlayground } from "../../memories/components/KeepsakePlayground";
import { storyParts, storyScrollItems } from "../data/story";
import { StoryScrollytelling } from "./StoryScrollytelling";
import { StickyMemoryStage } from "./StickyMemoryStage";
import { StoryStep } from "./StoryStep";

const partTwoItems = storyScrollItems.filter((item) => item.partId === "together-offline");

describe("two-part story expansion", () => {
  it("organizes the real-life continuation as three chapters with three scenes in the final chapter", () => {
    expect(storyParts).toHaveLength(2);
    expect(storyParts[0].id).toBe("before-meeting");
    expect(storyParts[1].id).toBe("together-offline");
    expect(storyParts[1].chapters).toHaveLength(3);
    expect(storyParts[1].chapters[2].scenes?.map((scene) => scene.id)).toEqual([
      "aquarium",
      "cafe",
      "sunset",
    ]);
  });

  it("creates unique stable scroll IDs across parts, chapters, and scenes", () => {
    const ids = storyScrollItems.map((item) => item.id);

    expect(ids).toHaveLength(new Set(ids).size);
    expect(ids).toEqual([
      "first-meeting",
      "lost-connection",
      "meet-again",
      "no-more-chance",
      "turning-point",
      "in-person-meeting",
      "our-dates",
      "aquarium",
      "cafe",
      "sunset",
    ]);
  });

  it("renders the part-two transition and only the supplied real events", () => {
    render(<StoryScrollytelling parts={storyParts} reducedMotion soundEnabled={false} />);

    expect(screen.getByRole("heading", { name: "Thật sự đứng cạnh nhau" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Đi lượn cùng nhau" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hai cốc Mixue và bốn giờ bên nhau" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Thủy cung" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Café" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ngắm hoàng hôn" })).toBeInTheDocument();
    expect(screen.getAllByText("Một ngày thoải mái nhất trên đời.").length).toBeGreaterThan(0);
  });

  it("shows every Part II visual in reading order with reduced motion on desktop", () => {
    const { container } = render(<StoryScrollytelling parts={[storyParts[1]]} reducedMotion soundEnabled={false} />);
    expect(container.querySelector(".sticky-memory-stage")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".mobile-chapter-block")).toHaveLength(5);
    expect(screen.getByTestId("scene-aquarium")).toBeInTheDocument();
    expect(screen.getByTestId("scene-sunset")).toBeInTheDocument();
    expect(screen.queryByText("18:07")).not.toBeInTheDocument();
  });

  it("keeps gallery and secret-note controls usable in a Part II step", async () => {
    const user = userEvent.setup();
    // Borrow supplied content as a test fixture; the real Part II still has placeholders.
    const chapter = { ...partTwoItems[0], gallery: storyScrollItems[0].gallery, secretNote: storyScrollItems[0].secretNote };
    render(<div className="story-part-2"><StoryStep chapter={chapter} index={0} isActive soundEnabled={false} /></div>);
    await user.click(screen.getAllByRole("button", { name: /Mở ảnh:/ })[0]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const secret = screen.getByRole("button", { name: "Mở tin nhắn bí mật" });
    await user.click(secret);
    expect(secret).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(chapter.secretNote!.text)).toBeInTheDocument();
    await user.click(secret);
    expect(secret).toHaveAttribute("aria-expanded", "false");
  });

  it("unlocks keepsakes from visited stable IDs without unlocking skipped chapters", () => {
    render(
      <KeepsakePlayground
        visitedStoryIds={new Set(["first-meeting", "aquarium"])}
        reducedMotion
      />,
    );

    expect(screen.getByRole("button", { name: /Vé thủy cung/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Khung ảnh đôi/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Tách café/ })).toBeDisabled();
  });

  it("shows only the keepsakes that belong to the current story page", () => {
    render(
      <KeepsakePlayground
        partId="together-offline"
        visitedStoryIds={new Set(["in-person-meeting"])}
        reducedMotion
      />,
    );

    expect(screen.getByRole("button", { name: /Khung ảnh đôi/ })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /Bó hoa xanh/ })).not.toBeInTheDocument();
  });

  it("shows intentional photo placeholders for memories that are waiting for real images", () => {
    render(<StoryScrollytelling parts={storyParts} reducedMotion soundEnabled={false} />);

    expect(screen.getAllByText("Thêm ảnh buổi tối Mixue tại đây.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Thêm ảnh ở thủy cung tại đây.").length).toBeGreaterThan(0);
  });

  it("provides compact navigation for both story parts", () => {
    render(<StoryScrollytelling parts={storyParts} reducedMotion soundEnabled={false} />);

    const navigation = screen.getByRole("navigation", { name: "Điều hướng các phần câu chuyện" });
    const links = within(navigation).getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "#part-before-meeting");
    expect(links[1]).toHaveAttribute("href", "/part-2/");
  });

  it("uses an instant chapter jump so skipped steps are not entered", async () => {
    const user = userEvent.setup();
    render(<StoryScrollytelling parts={storyParts} reducedMotion soundEnabled={false} />);

    await user.click(screen.getAllByRole("link", { name: /Chương 03: Lại gặp/ })[0]);

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
  });

  it("turns the part-two sticky panel into a five-stop visual journey", () => {
    render(
      <StickyMemoryStage
        chapter={partTwoItems[4]}
        chapters={partTwoItems}
        activeIndex={4}
        reducedMotion
      />,
    );

    const journey = screen.getByRole("navigation", { name: "Hành trình ngoài đời" });
    const stops = within(journey).getAllByRole("link");

    expect(stops).toHaveLength(5);
    expect(stops.map((stop) => stop.textContent)).toEqual([
      "Đi lượn",
      "Mixue",
      "Thủy cung",
      "Café",
      "Hoàng hôn",
    ]);
    expect(within(journey).getByRole("link", { name: "Hoàng hôn" })).toHaveAttribute("aria-current", "step");
  });
});
