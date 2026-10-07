import { describe, expect, it } from "vitest";
import { loveDuration } from "./loveCounter";

const start = "2026-04-24T00:00:00+07:00";

describe("loveDuration", () => {
  it("matches the Inlove screenshot taken on 10/9/2026", () => {
    expect(loveDuration(start, new Date("2026-09-10T09:35:00+07:00"))).toEqual({ years: 0, months: 4, weeks: 2, days: 3, totalDays: 139 });
  });

  it("turns over at midnight in Hà Nội, not in the reader's own time zone", () => {
    // 23:30 UTC on 5/10 is already 6/10 in Vietnam.
    expect(loveDuration(start, new Date("2026-10-05T23:30:00Z")).totalDays).toBe(165);
    expect(loveDuration(start, new Date("2026-10-05T16:30:00Z")).totalDays).toBe(164);
  });

  it("counts a whole month on the monthly anniversary and whole years after twelve", () => {
    expect(loveDuration(start, new Date("2026-05-24T08:00:00+07:00"))).toMatchObject({ years: 0, months: 1, weeks: 0, days: 0 });
    expect(loveDuration(start, new Date("2027-04-24T08:00:00+07:00"))).toMatchObject({ years: 1, months: 0, weeks: 0, days: 0, totalDays: 365 });
  });

  it("falls back to the last day of a short month", () => {
    expect(loveDuration("2026-01-31T00:00:00+07:00", new Date("2026-02-28T12:00:00+07:00"))).toMatchObject({ months: 1, weeks: 0, days: 0 });
  });

  it("never counts backwards before the start", () => {
    expect(loveDuration(start, new Date("2026-04-01T12:00:00+07:00"))).toEqual({ years: 0, months: 0, weeks: 0, days: 0, totalDays: 0 });
  });
});
