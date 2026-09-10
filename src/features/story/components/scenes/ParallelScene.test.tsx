import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ParallelScene } from "./ParallelScene";
import { storyScrollItems } from "../../data/story";

afterEach(() => vi.restoreAllMocks());

it("cancels the running call timer and shows the settled time when motion is reduced", () => {
  const request = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(42);
  const cancel = vi.spyOn(window, "cancelAnimationFrame");
  const chapter = storyScrollItems.find(item => item.threadState === "parallel")!;
  const { rerender } = render(<ParallelScene chapter={chapter} isActive reducedMotion={false} />);
  expect(request).toHaveBeenCalledOnce();
  rerender(<ParallelScene chapter={chapter} isActive reducedMotion />);
  expect(cancel).toHaveBeenCalledWith(42);
  expect(screen.getByText("08:00:00")).toBeInTheDocument();
  expect(request).toHaveBeenCalledOnce();
});
