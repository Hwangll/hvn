import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../../../../test/animationMocks";
import { autumnMapPlaces, partThreeEndingCopy, storyScrollItems } from "../../data/story";
import { StickyMemoryStage } from "../StickyMemoryStage";
import { AutumnMapPocket } from "./AutumnMap";
import { FilmLeader, LEADER_SEEN_KEY } from "./FilmLeader";
import { PostCreditsScene } from "./PostCreditsScene";
import { SceneMoment } from "./SceneMoment";
import { opensChapter, shotFor } from "./slateShots";

const partThreeItems = storyScrollItems.filter((item) => item.partId === "too-fast");
const partTwoItems = storyScrollItems.filter((item) => item.partId === "together-offline");
const item = (id: string) => partThreeItems.find((candidate) => candidate.id === id)!;

describe("Part III as a film", () => {
  beforeEach(() => window.sessionStorage.clear());
  afterEach(() => vi.useRealTimers());

  it("opens on the leader and its rating card, once a visit, and never under reduced motion", () => {
    vi.useFakeTimers();
    const { unmount } = render(<FilmLeader reducedMotion={false} />);
    const gate = () => document.querySelector(".leader-frame.is-current");
    expect(screen.getByRole("button", { name: "Bỏ qua phần mở màn" })).toBeInTheDocument();
    // The curtains part on the head of the leader.
    expect(document.querySelector(".film-leader")).toHaveClass("is-house");
    expect(gate()).toHaveTextContent("Phim bắt đầu");
    act(() => vi.advanceTimersByTime(1500));
    expect(gate()?.querySelector(".leader-count")).toHaveTextContent("5");
    // Either side of the gate, the frames before and after it.
    expect([...document.querySelectorAll(".leader-frame")].map((frame) => frame.textContent?.match(/^\d|Phim bắt đầu/)?.[0] ?? "")).toEqual(["", "Phim bắt đầu", "5", "4", "3"]);
    act(() => vi.advanceTimersByTime(4 * 720));
    expect(gate()?.querySelector(".leader-count")).toHaveTextContent("1");
    act(() => vi.advanceTimersByTime(720));
    expect(gate()).toHaveClass("is-black");
    act(() => vi.advanceTimersByTime(240));
    expect(gate()?.querySelector(".rating-audience")).toHaveTextContent("Phim dành cho: 2 người");
    act(() => vi.advanceTimersByTime(2700));
    expect(document.querySelector(".film-leader")).toHaveClass("is-lift");
    act(() => vi.advanceTimersByTime(900));
    expect(document.querySelector(".film-leader")).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem(LEADER_SEEN_KEY)).toBe("seen");
    unmount();

    // Seen this visit: straight to the film.
    render(<FilmLeader reducedMotion={false} />);
    expect(document.querySelector(".film-leader")).not.toBeInTheDocument();
  });

  it("lets the leader be skipped, and leaves it out under reduced motion", () => {
    vi.useFakeTimers();
    const { unmount } = render(<FilmLeader reducedMotion={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Bỏ qua phần mở màn" }));
    expect(document.querySelector(".film-leader")).toHaveClass("is-lift", "is-quick");
    act(() => vi.advanceTimersByTime(480));
    expect(document.querySelector(".film-leader")).not.toBeInTheDocument();
    unmount();

    window.sessionStorage.clear();
    render(<FilmLeader reducedMotion />);
    expect(document.querySelector(".film-leader")).not.toBeInTheDocument();
  });

  it("slates each chapter's first stop with its chapter, scene, take and the chapter's own date", () => {
    expect(partThreeItems.filter((_, index) => opensChapter(partThreeItems, index)).map((stop) => stop.id)).toEqual([
      "first-homestay", "loving-more", "hoang-mai-afternoon", "lang-bac", "rainy-karaoke", "birthday-plans",
    ]);
    expect(shotFor(item("rainy-karaoke"), 1)).toEqual({
      production: "Quá nhanh, quá nguy hiểm",
      chapter: "05",
      scene: "01",
      take: 1,
      date: "15.09.2026",
      title: "Không phải giai đoạn mới yêu nào cũng suôn sẻ",
    });
    // A stop in the day at Ba Đình is "Điểm dừng 01" on its own; its slate carries the day.
    expect(shotFor(item("lang-bac"), 2)).toMatchObject({ chapter: "04", take: 2, date: "13.09.2026" });
  });

  it("drives Part III's route: the red car on the road and a speedometer into the red at the birthday", () => {
    const { rerender } = render(<StickyMemoryStage chapter={partThreeItems[1]} chapters={partThreeItems} activeIndex={1} reducedMotion />);
    const journey = screen.getByRole("navigation", { name: "Hành trình ngoài đời" });
    expect(journey).toHaveClass("is-driven");
    expect(journey.querySelector(".route-car")).toBeInTheDocument();
    expect(journey.querySelector(".route-speedometer")).not.toHaveClass("is-redline");
    expect(journey.querySelector(".route-speedometer")).toHaveTextContent("8/91/10");

    rerender(<StickyMemoryStage chapter={partThreeItems[14]} chapters={partThreeItems} activeIndex={14} reducedMotion />);
    expect(journey.querySelector(".route-speedometer")).toHaveClass("is-redline");
    expect(journey.querySelector(".speedo-warning")).toHaveTextContent("Quá nguy hiểm");

    rerender(<StickyMemoryStage chapter={partTwoItems[0]} chapters={partTwoItems} activeIndex={0} reducedMotion />);
    expect(screen.getByRole("navigation", { name: "Hành trình ngoài đời" }).querySelector(".route-car, .route-speedometer")).not.toBeInTheDocument();
  });

  it("blows the birthday candles out, from the button or the cake itself, and lights them again", () => {
    const playCue = vi.fn();
    const { container } = render(
      <div>
        <div className="p3-cake" data-testid="cake" />
        <SceneMoment chapter={item("hoang-birthday")} playCue={playCue} />
      </div>,
    );
    const button = screen.getByRole("button", { name: "Ước đi rồi thổi nến" });
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveTextContent("Thắp lại nến");
    expect(container.querySelectorAll(".moment-confetti i").length).toBeGreaterThan(20);
    expect(playCue).toHaveBeenCalledWith("keepsakeCandle");
    fireEvent.click(screen.getByTestId("cake"));
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(container.querySelector(".moment-confetti")).not.toBeInTheDocument();
  });

  it("plays one go on the claw machine at Playik as a little game, and it brings up Bơ", () => {
    vi.useFakeTimers();
    render(<SceneMoment chapter={item("mid-autumn")} />);
    const button = screen.getByRole("button", { name: "Gắp thú · còn 1 lượt" });
    const machine = () => screen.queryByRole("group", { name: "Máy gắp thú ở Playik" });
    // The machine comes up close, and can be put back without spending the go.
    fireEvent.click(button);
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Đang chơi…");
    fireEvent.click(within(machine()!).getByRole("button", { name: "Đóng máy gắp" }));
    expect(machine()).not.toBeInTheDocument();
    expect(button).toBeEnabled();

    // The claw swings over the pile until it is let go; then it goes down, and comes up with Bơ.
    fireEvent.click(button);
    expect(within(machine()!).getByText("Canh cho chuẩn rồi thả gắp nha")).toBeInTheDocument();
    fireEvent.click(within(machine()!).getByRole("button", { name: "Thả gắp!" }));
    expect(within(machine()!).getByRole("button", { name: "Thả gắp!" })).toBeDisabled();
    expect(within(machine()!).getByText("Đang gắp…")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(3800));
    expect(within(machine()!).getByText("Gắp được Bơ rồi!")).toBeInTheDocument();
    // Shown off, then the machine goes back into the scene.
    act(() => vi.advanceTimersByTime(1900));
    act(() => vi.advanceTimersByTime(450));
    expect(machine()).not.toBeInTheDocument();
    expect(button).toHaveTextContent("Gắp được Bơ rồi!");
    expect(button).toBeDisabled();
    expect(document.querySelector(".moment-prize")).toHaveTextContent("Bơ");
  });

  it("puts the thirteen places of the credits on the map, in the order the story reaches them", () => {
    const settings = partThreeEndingCopy.credits.find((credit) => credit.role === "Bối cảnh")!;
    expect([...autumnMapPlaces.map((place) => place.name)].sort()).toEqual([...settings.names].sort());
    const order = autumnMapPlaces.map((place) => partThreeItems.findIndex((stop) => stop.id === place.stopId));
    expect(order.every((index) => index >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("keeps the map in a pocket: the thread as far as the reader has come, and every place a way back", () => {
    const target = document.createElement("section");
    target.id = "lang-bac";
    document.body.append(target);
    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView);
    scrollIntoView.mockClear();
    const visited = new Set(partThreeItems.slice(0, 9).map((stop) => stop.id));
    render(<AutumnMapPocket items={partThreeItems} activeId="van-quan-rain" visitedStoryIds={visited} sectionRef={createRef()} />);

    fireEvent.click(screen.getByRole("button", { name: "Bản đồ: 8/13 nơi" }));
    const map = screen.getByRole("dialog", { name: "13 nơi mình đã đi" });
    const places = within(map).getAllByRole("button").filter((button) => button.closest(".autumn-map-list"));
    expect(places).toHaveLength(13);
    expect(places[7]).toHaveAttribute("aria-current", "location");
    expect(places[7]).toHaveTextContent("Văn Quán16.09 · deep talk với màn mưa");
    expect(places[8]).toHaveTextContent("Tiny cf19.09 · chưa tới");

    fireEvent.click(places[2]);
    expect(map).not.toHaveAttribute("open");
    return vi.waitFor(() => expect(scrollIntoView).toHaveBeenCalled()).finally(() => target.remove());
  });

  it("hides a scene after the credits: the next chapter's slate, the red car, and the line every sequel ends on", () => {
    const { unmount } = render(<PostCreditsScene reducedMotion={false} />);
    const scene = screen.getByRole("region", { name: "Cảnh sau danh đề" });
    expect(scene).toHaveTextContent("Khoan, đừng rời rạp vội…");
    expect(scene).toHaveTextContent("Hát và Nờ sẽ trở lại vào ngày 01.01.2027.");
    expect(scene.querySelector(".clapper-date")).toHaveTextContent("01.01.2027");
    expect(scene.querySelector(".post-credits-return time")).toHaveAttribute("datetime", "2027-01-01");
    // Once its last card is up, it can be played again.
    const film = scene.querySelector(".post-credits-film")!;
    expect(film).toHaveClass("is-playing");
    fireEvent.animationEnd(scene.querySelector(".post-credits-return")!);
    expect(film).toHaveClass("is-ended");
    fireEvent.click(screen.getByRole("button", { name: "Xem lại cảnh này" }));
    expect(film).not.toHaveClass("is-ended");
    expect(screen.queryByRole("button", { name: "Xem lại cảnh này" })).not.toBeInTheDocument();
    unmount();
    render(<PostCreditsScene reducedMotion />);
    expect(document.querySelector(".post-credits-film")).toHaveClass("is-still");
  });
});
