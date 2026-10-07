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
const partThreeItems = storyScrollItems.filter((item) => item.partId === "too-fast");

describe("story expansion across the parts", () => {
  it("organizes the real-life continuation as three chapters with three scenes in the final chapter", () => {
    expect(storyParts.map((part) => part.id)).toEqual(["before-meeting", "together-offline", "too-fast"]);
    expect(storyParts[1].chapters).toHaveLength(3);
    expect(storyParts[1].chapters[2].scenes?.map((scene) => scene.id)).toEqual([
      "aquarium",
      "cafe",
      "sunset",
    ]);
  });

  it("tells Part III in six chapters: the day at Ba Đình, the rough week of the sore leg and the birthday month in stops", () => {
    const partThree = storyParts[2];
    expect(partThree.number).toBe(3);
    expect(partThree.chapters.map((chapter) => chapter.id)).toEqual([
      "first-homestay",
      "loving-more",
      "hoang-mai-afternoon",
      "ba-dinh-day",
      "rough-patch",
      "birthday-month",
    ]);
    expect(partThree.chapters[3].scenes?.map((scene) => scene.id)).toEqual(["lang-bac", "chua-mot-cot", "rain-and-dusk"]);
    expect(partThree.chapters[4].scenes?.map((scene) => scene.year)).toEqual(["15.09.2026", "16.09.2026", "16.09.2026", "19.09.2026", "19.09.2026"]);
    expect(partThree.chapters[5].scenes?.map((scene) => scene.year)).toEqual(["23.09.2026", "24.09.2026", "26.09.2026", "01.10.2026"]);
    expect(partThreeItems).toHaveLength(15);
    expect(partThreeItems.every((item) => item.partNumber === 3)).toBe(true);
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
      "first-homestay",
      "loving-more",
      "hoang-mai-afternoon",
      "lang-bac",
      "chua-mot-cot",
      "rain-and-dusk",
      "rainy-karaoke",
      "clinic-day",
      "van-quan-rain",
      "tiny-cafe",
      "cuc-cu-night",
      "birthday-plans",
      "mid-autumn",
      "phung-khoang",
      "hoang-birthday",
    ]);
  });

  it("renders the part-two transition and only the supplied real events", () => {
    render(<StoryScrollytelling parts={storyParts} reducedMotion soundEnabled={false} />);

    expect(screen.getByRole("heading", { name: "Thật sự đứng cạnh nhau" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Đi lượn cùng nhau" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hai cốc Mixue và bốn giờ bên nhau" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Thủy cung" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Café Hồ Tây" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ngắm hoàng hôn" })).toBeInTheDocument();
    expect(screen.getAllByText("Ai mà chả có rất nhiều lần đầu tiên.").length).toBeGreaterThan(0);
  });

  it("shows every Part II visual in reading order with reduced motion on desktop", () => {
    const { container } = render(<StoryScrollytelling parts={[storyParts[1]]} reducedMotion soundEnabled={false} />);
    expect(container.querySelector(".sticky-memory-stage")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".mobile-chapter-block")).toHaveLength(5);
    expect(screen.getByTestId("scene-aquarium")).toBeInTheDocument();
    expect(screen.getByTestId("scene-sunset")).toBeInTheDocument();
    expect(screen.queryByText("18:07")).not.toBeInTheDocument();
  });

  it("shows every Part III visual in reading order with reduced motion on desktop", () => {
    const { container } = render(<StoryScrollytelling parts={[storyParts[2]]} reducedMotion soundEnabled={false} />);
    expect(container.querySelector(".sticky-memory-stage")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".mobile-chapter-block")).toHaveLength(15);
    for (const scene of ["homestay", "apps", "office", "museum", "pagoda", "rain", "karaoke", "clinic", "lakeside", "notebook", "acoustic", "planner", "lantern", "bento", "birthday"]) {
      expect(screen.getByTestId(`scene-${scene}`)).toBeInTheDocument();
    }
    expect(screen.getByRole("heading", { name: "Chiếc home cho buổi tối đầu tiên" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Chùa Một Cột" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sinh nhật anh iu" })).toBeInTheDocument();
    // The page she left for him: her "Tadaaaa", then his own words, on the stage and in the reading column.
    expect(container.querySelector(".p3-his-letter b")).toHaveTextContent("Tadaaaa");
    expect(container.querySelector(".p3-his-letter p")).toHaveTextContent("ngày tuyệt vời nhất trên đời");
    expect(container.querySelector(".story-step-reply figcaption")).toHaveTextContent("Phần riêng anh viết");
    expect(container.querySelector(".story-step-reply")).toHaveTextContent("Lần đầu tiên a có ai đó ở bên cùng tổ chức sinh nhật.");
    // The message to her father sits in a phone; the print that takes over from the main photo stays a photo.
    expect(container.querySelector(".part-three-scene-notebook .p3-chat-phone img")).toHaveAttribute("src", "/images/story/part-three/permission-chat.jpg");
    expect(container.querySelector(".part-three-scene-notebook .p3-photo-second img")).toHaveAttribute("src", "/images/story/part-three/tiny-lego.jpg");
    expect(container.querySelector(".part-three-scene-bento .p3-photo img")).toHaveAttribute("src", "/images/story/part-three/saku-dinner.jpg");
    expect(container.querySelectorAll(".p3-lilies .lily-sprite")).toHaveLength(3);
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

  it("stands in for the café photo that was never taken with the café bill", () => {
    render(<StoryScrollytelling parts={storyParts} reducedMotion soundEnabled={false} />);

    expect(screen.getAllByText("hai bạn giữ ý tứ giúp mình nhé").length).toBeGreaterThan(0);
    expect(screen.getAllByText("một buổi chiều không muốn về").length).toBeGreaterThan(0);
    expect(screen.queryByText(/Thêm ảnh café/)).not.toBeInTheDocument();
  });

  it("provides compact navigation for every story part", () => {
    render(<StoryScrollytelling parts={storyParts} reducedMotion soundEnabled={false} />);

    const navigation = screen.getByRole("navigation", { name: "Điều hướng các phần câu chuyện" });
    const links = within(navigation).getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute("href", "#part-before-meeting");
    expect(links[1]).toHaveAttribute("href", "/part-2/");
    expect(links[2]).toHaveAttribute("href", "/part-3/");
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

  it("turns the Part III sticky panel into a fifteen-stop strip, naming the stop in hand and its chapter", () => {
    render(
      <StickyMemoryStage
        chapter={partThreeItems[1]}
        chapters={partThreeItems}
        activeIndex={1}
        reducedMotion
      />,
    );

    const journey = screen.getByRole("navigation", { name: "Hành trình ngoài đời" });
    expect(within(journey).getAllByRole("link").map((stop) => stop.textContent)).toEqual([
      "Homestay",
      "Bi & Bơ",
      "Hoàng Mai",
      "Lăng Bác",
      "Chùa",
      "Chiều tà",
      "Đi hát",
      "Phòng khám",
      "Văn Quán",
      "Tiny cf",
      "Cúc cu",
      "Lên lịch",
      "Trung thu",
      "Phùng Khoang",
      "Sinh nhật",
    ]);
    expect(journey).toHaveClass("is-compact");
    expect(within(journey).getByRole("link", { name: "Bi & Bơ" })).toHaveAttribute("aria-current", "step");
    expect(journey.querySelector(".memory-route-heading")).toHaveTextContent("Chương 02 · Bi & Bơ02 / 15");
    expect(journey.querySelectorAll("li.opens-chapter")).toHaveLength(5);
    expect(screen.getByText("Thước phim mùa thu")).toBeInTheDocument();
  });
});
