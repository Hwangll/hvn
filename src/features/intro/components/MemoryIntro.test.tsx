import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import "../../../test/animationMocks";
import { storyParts } from "../../story/data/story";
import { MemoryIntro } from "./MemoryIntro";

vi.mock("../../memories/components/MemoryFlower3D", () => ({
  MemoryFlower3D: ({ variant }: { variant: string }) => <span data-testid="intro-flower" data-variant={variant} />,
}));

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("intro flower selection", () => {
  it("changes the keepsake and its destination with the selected story part", async () => {
    const user = userEvent.setup();
    const enterStory = vi.fn();
    render(<MemoryIntro onEnterStory={enterStory} phase="intro" reducedMotion />);
    expect(await screen.findByTestId("intro-flower")).toHaveAttribute("data-variant", "sunflower");
    expect(screen.getByText("01 / 03")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Xem phần tiếp theo" }));
    expect(screen.getByTestId("intro-flower")).toHaveAttribute("data-variant", "hydrangea");
    expect(screen.getByRole("button", { name: "Chạm vào cẩm tú cầu để mở Phần II" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sắc xanh của những ngày có nhau" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Xem phần tiếp theo" }));
    expect(screen.getByTestId("intro-flower")).toHaveAttribute("data-variant", "lily");
    expect(screen.getByRole("button", { name: "Chạm vào hoa ly để mở Phần III" })).toBeInTheDocument();
    // "lần đầu" is held together by a no-break space, which the heading's name keeps.
    expect(screen.getByRole("heading", { name: "Sắc đỏ của những lần\u00a0đầu" })).toBeInTheDocument();
    expect(screen.getByText("KỶ VẬT 03 / HOA LY ĐỎ")).toBeInTheDocument();
    expect(screen.getByText("LOT 03")).toBeInTheDocument();
    expect(screen.getByText("03 / 03")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xem phần tiếp theo" })).toBeDisabled();
    expect(enterStory).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Xem phần trước" }));
    await user.click(screen.getByRole("button", { name: "Xem phần trước" }));
    expect(screen.getByTestId("intro-flower")).toHaveAttribute("data-variant", "sunflower");
    await user.click(screen.getByRole("button", { name: "Chạm vào bó hoa để mở câu chuyện" }));
    expect(enterStory).toHaveBeenCalledOnce();
  });

  it("also follows a swipe of the part picker", async () => {
    const { container } = render(<MemoryIntro onEnterStory={vi.fn()} phase="intro" reducedMotion />);
    await screen.findByTestId("intro-flower");
    const viewport = container.querySelector(".memory-picker-viewport")!;
    Object.defineProperty(viewport, "clientWidth", { value: 300 });
    fireEvent.scroll(viewport, { target: { scrollLeft: 600 } });
    expect(screen.getByTestId("intro-flower")).toHaveAttribute("data-variant", "lily");
    expect(container.querySelector(".memory-intro")).toHaveClass("is-part-three-selected");
    fireEvent.scroll(viewport, { target: { scrollLeft: 320 } });
    expect(screen.getByTestId("intro-flower")).toHaveAttribute("data-variant", "hydrangea");
    fireEvent.scroll(viewport, { target: { scrollLeft: 0 } });
    expect(screen.getByTestId("intro-flower")).toHaveAttribute("data-variant", "sunflower");
  });
});

describe("the part picker", () => {
  it("offers all three parts, listing the stops of a short part and the chapters of a long one", () => {
    const { container } = render(<MemoryIntro onEnterStory={vi.fn()} phase="intro" reducedMotion />);
    expect(screen.getByText("Hai người. Ba phần. Một câu chuyện.")).toBeInTheDocument();
    expect(container.querySelectorAll(".memory-picker-dots span")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Đi thẳng tới Phần II" })).toHaveAttribute("href", "/part-2/");
    const card = container.querySelector<HTMLElement>(".memory-part-card-three")!;
    expect(within(card).getByText("PHẦN III")).toBeInTheDocument();
    expect(within(card).getByText("Quá nhanh, quá nguy hiểm")).toBeInTheDocument();
    expect(within(card).getByText("Một mùa thu toàn những lần đầu với nhau.")).toBeInTheDocument();
    expect(within(card).getByRole("link", { name: "Đi thẳng tới Phần III" })).toHaveAttribute("href", "/part-3/");
    // Phần III has fifteen stops, too many for a card: it lists its six chapters instead.
    const stops = Array.from(card.querySelectorAll(".memory-part-stops li"), (stop) => stop.textContent);
    expect(stops).toEqual(storyParts[2].chapters.map((chapter) => chapter.shortTitle));
    expect(stops).toContain("Sinh nhật");
    // Phần II's five stops are all listed, scenes included.
    expect(container.querySelectorAll(".memory-part-card-two .memory-part-stops li")).toHaveLength(5);
    expect(within(container.querySelector<HTMLElement>(".memory-part-card-two")!).getByText("Thủy cung")).toBeInTheDocument();
  });

  it("leaves for Phần III's own page behind a red bloom", () => {
    vi.useFakeTimers();
    const { container } = render(<MemoryIntro onEnterStory={vi.fn()} phase="intro" reducedMotion={false} />);
    const viewport = container.querySelector(".memory-picker-viewport")!;
    Object.defineProperty(viewport, "clientWidth", { value: 300 });
    fireEvent.scroll(viewport, { target: { scrollLeft: 600 } });
    fireEvent.click(screen.getByRole("link", { name: "Đi thẳng tới Phần III" }));
    const room = container.querySelector(".memory-intro")!;
    expect(room).toHaveClass("is-leaving");
    expect(room).toHaveClass("is-part-three-selected");
  });
});
