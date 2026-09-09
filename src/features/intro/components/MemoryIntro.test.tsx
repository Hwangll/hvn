import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import "../../../test/animationMocks";
import { MemoryIntro } from "./MemoryIntro";

vi.mock("../../memories/components/MemoryFlower3D", () => ({
  MemoryFlower3D: ({ variant }: { variant: string }) => <span data-testid="intro-flower" data-variant={variant} />,
}));

describe("intro flower selection", () => {
  it("changes the keepsake and its destination with the selected story part", async () => {
    const user = userEvent.setup();
    const enterStory = vi.fn();
    render(<MemoryIntro onEnterStory={enterStory} phase="intro" reducedMotion />);
    expect(await screen.findByTestId("intro-flower")).toHaveAttribute("data-variant", "sunflower");
    await user.click(screen.getByRole("button", { name: "Xem phần tiếp theo" }));
    expect(screen.getByTestId("intro-flower")).toHaveAttribute("data-variant", "hydrangea");
    expect(screen.getByRole("button", { name: "Chạm vào cẩm tú cầu để mở Phần II" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sắc xanh của những ngày có nhau" })).toBeInTheDocument();
    expect(enterStory).not.toHaveBeenCalled();
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
    fireEvent.scroll(viewport, { target: { scrollLeft: 300 } });
    expect(screen.getByTestId("intro-flower")).toHaveAttribute("data-variant", "hydrangea");
    fireEvent.scroll(viewport, { target: { scrollLeft: 0 } });
    expect(screen.getByTestId("intro-flower")).toHaveAttribute("data-variant", "sunflower");
  });
});
