import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StoryPicture } from "./StoryPicture";

describe("story photo sources", () => {
  it("offers AVIF, then WebP, and keeps the original as the decoding <img>", () => {
    const { container } = render(<StoryPicture src="/images/story/lover/cap-phone.png" alt="Mũ xanh" />);
    const sources = [...container.querySelectorAll("source")];
    expect(sources.map((source) => [source.getAttribute("type"), source.getAttribute("srcset")])).toEqual([
      ["image/avif", "/images/story/lover/cap-phone.avif"],
      ["image/webp", "/images/story/lover/cap-phone.webp"],
    ]);
    const image = screen.getByRole("img", { name: "Mũ xanh" });
    expect(image).toHaveAttribute("src", "/images/story/lover/cap-phone.png");
    expect(image).toHaveAttribute("decoding", "async");
  });

  it("offers no twins for a photo that is still a placeholder or already modern", () => {
    const { container, rerender } = render(<StoryPicture alt="Chưa có ảnh" />);
    expect(container.querySelectorAll("source")).toHaveLength(0);
    rerender(<StoryPicture src="/images/story/ending.webp" alt="Ảnh kết" />);
    expect(container.querySelectorAll("source")).toHaveLength(0);
  });
});
