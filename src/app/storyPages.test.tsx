import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import "../test/animationMocks";
import { AppShell } from "./AppShell";
import { resolveStoryPage } from "./storyPage";

describe("separate story pages", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("resolves both canonical forms of the Part II path", () => {
    expect(resolveStoryPage("/")).toBe("part-one");
    expect(resolveStoryPage("/part-2")).toBe("part-two");
    expect(resolveStoryPage("/part-2/")).toBe("part-two");
  });

  it("keeps Part I on the main page and links to the separate Part II page", () => {
    window.sessionStorage.setItem("hvn-memory-intro-seen", "true");
    render(<AppShell page="part-one" />);

    expect(screen.getByRole("heading", { name: "Hát Và Nờ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Khởi đầu như bao khởi đầu" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Đi lượn cùng nhau" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Đọc Phần II/ })).toHaveAttribute("href", "/part-2/");
  });

  it("renders only Part II story content on the Part II page", () => {
    render(<AppShell page="part-two" />);

    expect(screen.getByRole("heading", { name: "Thật sự đứng cạnh nhau" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Đi lượn cùng nhau" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Khởi đầu như bao khởi đầu" })).not.toBeInTheDocument();

    const navigation = screen.getByRole("navigation", { name: "Điều hướng các phần câu chuyện" });
    expect(within(navigation).getByRole("link", { name: /^Phần ITrước/ })).toHaveAttribute("href", "/");
    expect(within(navigation).getByRole("link", { name: /^Phần IIThật sự/ })).toHaveAttribute("href", "#part-together-offline");
  });
});
