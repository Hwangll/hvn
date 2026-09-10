import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { PartOneChapterIndex } from "./PartOneChapterIndex";
import { storyScrollItems } from "../data/story";

const items = storyScrollItems.filter(item => item.partNumber === 1);

it("links every chapter to the existing story target and marks the current chapter", async () => {
  vi.mocked(Element.prototype.scrollIntoView).mockClear();
  const user = userEvent.setup();
  render(<><div id={items[2].id} /><PartOneChapterIndex items={items} activeId={items[2].id} compact /></>);
  const links = within(screen.getByRole("navigation", { name: "Chọn chương Phần I" })).getAllByRole("link");
  expect(links).toHaveLength(items.length);
  items.forEach((item, index) => expect(links[index]).toHaveAttribute("href", `#${item.id}`));
  expect(links[2]).toHaveAttribute("aria-current", "step");
  expect(links[0]).not.toHaveAttribute("aria-current");
  await user.click(links[2]);
  expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
});

it("shows a readable overview without marking an unread chapter as current", () => {
  render(<PartOneChapterIndex items={items} />);
  const nav = screen.getByRole("navigation", { name: "Mục lục Phần I" });
  expect(within(nav).getByText("Năm chương, một hành trình")).toBeInTheDocument();
  expect(nav.querySelector("[aria-current]")).toBeNull();
});
