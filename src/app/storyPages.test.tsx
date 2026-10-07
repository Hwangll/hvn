import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../test/animationMocks";
import { AppShell } from "./AppShell";
import { resolveStoryPage } from "./storyPage";

describe("separate story pages", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** The envelopes open on fixed days; only Date is pinned, so the pages' own timers still run. */
  const pinClock = (iso: string) => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(iso));
  };

  it("resolves both canonical forms of the Part II path", () => {
    expect(resolveStoryPage("/")).toBe("part-one");
    expect(resolveStoryPage("/part-2")).toBe("part-two");
    expect(resolveStoryPage("/part-2/")).toBe("part-two");
  });

  it("resolves both canonical forms of the Part III path", () => {
    expect(resolveStoryPage("/part-3")).toBe("part-three");
    expect(resolveStoryPage("/part-3/")).toBe("part-three");
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
    expect(within(navigation).getByRole("link", { name: /^Phần IIIQuá nhanh/ })).toHaveAttribute("href", "/part-3/");
  });

  it("keeps Part II's envelope sealed until Part III's day, then opens it onto the Part III page", () => {
    pinClock("2026-10-05T23:59:00+07:00");
    const { unmount } = render(<AppShell page="part-two" />);
    expect(screen.queryByRole("link", { name: /Đọc Phần III/ })).not.toBeInTheDocument();
    expect(screen.getByText("Mở vào ngày 06/10/2026")).toBeInTheDocument();
    unmount();

    pinClock("2026-10-06T00:00:01+07:00");
    render(<AppShell page="part-two" />);
    expect(screen.getByRole("link", { name: /Đọc Phần III/ })).toHaveAttribute("href", "/part-3/");
    expect(screen.queryByText("Mở vào ngày 06/10/2026")).not.toBeInTheDocument();
  });

  it("renders only Part III story content on the Part III page, ending on the next sealed envelope", () => {
    pinClock("2026-10-06T12:00:00+07:00");
    render(<AppShell page="part-three" />);

    expect(screen.getByRole("heading", { name: "Chiếc home cho buổi tối đầu tiên" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mưa trưa, mây chiều" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Đi lượn cùng nhau" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Khởi đầu như bao khởi đầu" })).not.toBeInTheDocument();

    const navigation = screen.getByRole("navigation", { name: "Điều hướng các phần câu chuyện" });
    expect(within(navigation).getByRole("link", { name: /^Phần ITrước/ })).toHaveAttribute("href", "/");
    expect(within(navigation).getByRole("link", { name: /^Phần IIThật sự/ })).toHaveAttribute("href", "/part-2/");
    expect(within(navigation).getByRole("link", { name: /^Phần IIIQuá nhanh/ })).toHaveAttribute("href", "#part-too-fast");

    expect(screen.getByRole("heading", { name: "Còn tiếp..." })).toBeInTheDocument();
    expect(screen.getByText("Mở vào ngày 01/01/2027")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Về Phần II" })).toHaveAttribute("href", "/part-2/");
    expect(screen.getByRole("link", { name: "Xem lại từ đầu" })).toHaveAttribute("href", "/");
  });
});
