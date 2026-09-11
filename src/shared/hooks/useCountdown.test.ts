import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCountdown } from "./useCountdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-20T19:59:58+07:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down to the target and flips to past when it arrives", () => {
    const { result } = renderHook(() => useCountdown("2026-12-20T20:00:00+07:00"));

    expect(result.current).toMatchObject({ days: 0, hours: 0, minutes: 0, seconds: 2, isPast: false });

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.seconds).toBe(1);

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.isPast).toBe(true);
  });

  it("reports whole days, hours and minutes for a far target", () => {
    const { result } = renderHook(() => useCountdown("2026-12-23T22:30:58+07:00"));

    expect(result.current).toMatchObject({ days: 3, hours: 2, minutes: 31, seconds: 0, isPast: false });
  });

  it("treats a target that has already passed, or cannot be parsed, as open", () => {
    expect(renderHook(() => useCountdown("2020-01-01T00:00:00+07:00")).result.current.isPast).toBe(true);
    expect(renderHook(() => useCountdown("not a date")).result.current.isPast).toBe(true);
  });
});
