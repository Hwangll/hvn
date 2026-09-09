import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "../test/animationMocks";
import App from "./App";
import { KeepsakePlayground } from "../features/memories/components/KeepsakePlayground";
import { PhotoGallery } from "../features/story/components/PhotoGallery";
import { StoryEnding } from "../features/story/components/StoryEnding";
import { StickyMemoryStage } from "../features/story/components/StickyMemoryStage";
import { StoryStep } from "../features/story/components/StoryStep";
import { PolaroidPhoto } from "../shared/components/visuals/PolaroidPhoto";
import { storyChapters, storyScrollItems } from "../features/story/data/story";

const partOneItems = storyScrollItems.filter((item) => item.partId === "before-meeting");

describe("Hát Và Nờ app", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    document.body.className = "";
  });

  it("shows the memory intro first in a fresh session", () => {
    render(<App />);

    expect(screen.getAllByText("LOT 01")[0]).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hoa của một lần gặp gỡ" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Khám phá câu chuyện" })).toBeInTheDocument();
  });

  it("lets readers swipe or tap from the opening room directly to Part II", () => {
    render(<App />);

    expect(screen.getByRole("region", { name: "Chọn phần câu chuyện" })).toBeInTheDocument();
    expect(screen.getByText("Vuốt để đổi phần")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xem phần tiếp theo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Đi thẳng tới Phần II/ })).toHaveAttribute("href", "/part-2/");
  });

  it("renders every Part I chapter on the main page", () => {
    window.sessionStorage.setItem("hvn-memory-intro-seen", "true");
    render(<App />);

    expect(screen.getByRole("heading", { name: "Hát Và Nờ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Trước khi mọi thứ bắt đầu" })).toBeInTheDocument();
    expect(screen.getByText("Có một người rất xinh nhưng chưa biết sắp bị kéo vào drama tình cảm.")).toBeInTheDocument();
    partOneItems.forEach((chapter) => {
      expect(screen.getByRole("heading", { name: chapter.title })).toBeInTheDocument();
    });
    expect(screen.queryByRole("heading", { name: "Lần này, là ngoài đời" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Đọc nhanh Phần II" })).toHaveAttribute("href", "/part-2/");
  });

  it("keeps sound disabled by default and toggles it by keyboard-accessible button", async () => {
    const user = userEvent.setup();
    render(<App />);

    const soundButton = screen.getByRole("button", { name: "Bật âm thanh" });
    expect(soundButton).toHaveAttribute("aria-pressed", "false");
    expect(window.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();

    await user.click(soundButton);
    expect(screen.getByRole("button", { name: "Tắt âm thanh" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Tình mình lạ kỳ")).toBeInTheDocument();
  });

  it("links the end of Part I to the separate Part II page", () => {
    window.sessionStorage.setItem("hvn-memory-intro-seen", "true");
    render(<App />);

    expect(screen.getByRole("link", { name: "Đọc Phần II" })).toHaveAttribute("href", "/part-2/");
  });

  it("plays ending cues for replay and returning to the intro", async () => {
    const user = userEvent.setup();
    const onReturnToIntro = vi.fn();
    const playCue = vi.fn();
    render(
      <>
        <div id="our-dates" />
        <StoryEnding onReturnToIntro={onReturnToIntro} playCue={playCue} reducedMotion />
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Xem lại từ đầu" }));
    await user.click(screen.getByRole("button", { name: "Xem lại những buổi hẹn" }));
    await user.click(screen.getByRole("button", { name: "Trở lại phòng ký ức" }));

    expect(playCue).toHaveBeenCalledWith("replay");
    expect(playCue).toHaveBeenCalledWith("dissolve");
    expect(onReturnToIntro).toHaveBeenCalled();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
  });

  it("renders fallback when a chapter image is missing", async () => {
    render(<PolaroidPhoto src="/missing.jpg" alt={storyChapters[0].imageAlt} caption="ảnh test" tilt="left" />);

    const firstImage = screen.getByAltText(storyChapters[0].imageAlt);
    fireEvent.error(firstImage);

    await waitFor(() => expect(screen.getByText("ảnh kỷ niệm đang chờ thay")).toBeInTheDocument());
  });

  it("uses active visual content for the first chapter", () => {
    window.sessionStorage.setItem("hvn-memory-intro-seen", "true");
    render(<App />);

    expect(screen.getByText("Bumble")).toBeInTheDocument();
    expect(screen.getByText("Instagram")).toBeInTheDocument();
    expect(screen.getByText(storyChapters[0].memoryCaption)).toBeInTheDocument();
  });

  it("can render with reduced motion preference enabled", () => {
    window.sessionStorage.setItem("hvn-memory-intro-seen", "true");
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<App />);

    expect(screen.getByText("Một câu chuyện về hai người cứ tưởng đã bỏ lỡ nhau.")).toBeInTheDocument();
  });

  it("lets users choose an unlocked interactive keepsake without relying on WebGL", async () => {
    const user = userEvent.setup();
    window.sessionStorage.setItem("hvn-memory-intro-seen", "true");
    render(<App />);

    await user.click(await screen.findByRole("button", { name: /Phong bì/ }));

    expect(screen.getByText(/Đang chọn:/)).toHaveTextContent("Phong bì");
  });

  it("starts the keepsake box with later memories locked", () => {
    render(<KeepsakePlayground visitedStoryIds={new Set(["first-meeting"])} reducedMotion />);

    expect(screen.getByRole("button", { name: /Bó hoa xanh/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Phong bì/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Tim giấy.*Mở ở Phần I · Chương 02/ })).toBeDisabled();
  });

  it("unlocks later keepsakes as readers reach later chapters", async () => {
    const user = userEvent.setup();
    render(<KeepsakePlayground visitedStoryIds={new Set(partOneItems.map((item) => item.id))} reducedMotion />);

    await user.click(screen.getByRole("button", { name: /Polaroid/ }));

    expect(screen.getByText(/Đang chọn:/)).toHaveTextContent("Polaroid");
    expect(screen.getByText(/Polaroid cuối Phần I/i)).toBeInTheDocument();
  });

  it("opens chapter gallery photos in a full image lightbox", async () => {
    const user = userEvent.setup();
    const playCue = vi.fn();
    render(<PhotoGallery label="Album test" photos={storyChapters[0].gallery} playCue={playCue} />);

    expect(screen.getByText("Album test")).toBeInTheDocument();
    expect(screen.getByText("3 tấm")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /Mở ảnh:/i })[0]);

    expect(playCue).toHaveBeenCalledWith("galleryOpen");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Đóng ảnh" })).toHaveLength(2);

    await user.click(screen.getAllByRole("button", { name: "Đóng ảnh" })[1]);

    expect(playCue).toHaveBeenCalledWith("galleryClose");
  });

  it("reveals a secret note from the chapter sticker", async () => {
    const user = userEvent.setup();
    const playCue = vi.fn();
    render(<StoryStep chapter={partOneItems[0]} index={0} isActive playCue={playCue} soundEnabled={false} />);

    const secretButton = screen.getByRole("button", { name: /Mở tin nhắn bí mật/ });
    expect(secretButton).toHaveAttribute("aria-expanded", "false");

    await user.click(secretButton);

    expect(playCue).toHaveBeenCalledWith("secretOpen");
    expect(secretButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/một cú match tưởng vu vơ/i)).toBeInTheDocument();
  });

  it("plays a context-specific cue when an unlocked keepsake is selected", async () => {
    const user = userEvent.setup();
    const playCue = vi.fn();
    render(<KeepsakePlayground visitedStoryIds={new Set(partOneItems.map((item) => item.id))} playCue={playCue} reducedMotion />);

    await user.click(screen.getByRole("button", { name: /Polaroid/ }));

    expect(playCue).toHaveBeenCalledWith("keepsakePolaroid");
  });

  it("renders compact chapter progress from shared data", () => {
    const { container } = render(
      <StickyMemoryStage chapter={partOneItems[2]} chapters={partOneItems} activeIndex={2} reducedMotion />,
    );

    expect(screen.getByText("03 / 05")).toBeInTheDocument();
    expect(screen.getByText("LẠI GẶP")).toBeInTheDocument();
    expect(container.querySelector(".story-chapter-progress-dot.is-active")).toBeInTheDocument();
    expect(container.querySelector(".chapter-progress-marker")).not.toBeInTheDocument();
  });
});
