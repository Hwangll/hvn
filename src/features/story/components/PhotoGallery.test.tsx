import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PhotoGallery } from "./PhotoGallery";

const photos = [
  { src: "/first.jpg", alt: "Ảnh đầu", caption: "Buổi sáng" },
  { alt: "Chưa có ảnh", caption: "Đang chờ" },
  { src: "/last.jpg", alt: "Ảnh cuối", caption: "Buổi chiều" },
];

describe("PhotoGallery viewer", () => {
  it("browses available photos with buttons and arrow keys, skipping placeholders", async () => {
    const user = userEvent.setup();
    render(<PhotoGallery label="Những tấm ảnh" photos={photos} />);
    await user.click(screen.getByRole("button", { name: "Mở ảnh: Buổi sáng" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Ảnh tiếp theo" }));
    expect(within(dialog).getByRole("img")).toHaveAttribute("alt", "Ảnh cuối");
    await user.keyboard("{ArrowRight}");
    expect(within(dialog).getByRole("img")).toHaveAttribute("alt", "Ảnh đầu");
    await user.keyboard("{ArrowLeft}");
    expect(within(dialog).getByRole("img")).toHaveAttribute("alt", "Ảnh cuối");
    expect(within(dialog).getByText("2 / 2")).toBeInTheDocument();
  });

  it("contains keyboard focus, locks background scrolling and restores focus on close", async () => {
    const user = userEvent.setup();
    render(<PhotoGallery label="Những tấm ảnh" photos={photos} />);
    const opener = screen.getByRole("button", { name: "Mở ảnh: Buổi sáng" });
    await user.click(opener);
    const dialog = screen.getByRole("dialog");
    const close = within(dialog).getByRole("button", { name: "Đóng ảnh" });
    expect(close).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
    await user.tab({ shift: true });
    expect(within(dialog).getByRole("button", { name: "Ảnh tiếp theo" })).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
