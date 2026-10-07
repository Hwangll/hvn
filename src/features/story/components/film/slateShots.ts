import { partThreeFilmCopy, type StoryScrollItem } from "../../data/story";
import type { SlateShot } from "./Clapperboard";

const pad = (value: number) => String(value).padStart(2, "0");

/** Whether a stop is the first of its chapter: where the slate comes down. */
export const opensChapter = (items: readonly StoryScrollItem[], index: number) =>
  index === 0 || items[index - 1]?.chapterIndex !== items[index]?.chapterIndex;

/** The slate for a chapter's first stop at a given take: "CHƯƠNG 05 · CẢNH 01 · TAKE 1 · 15.09.2026". */
export function shotFor(item: StoryScrollItem, take: number): SlateShot {
  return {
    production: partThreeFilmCopy.production,
    chapter: pad(item.chapterIndex),
    scene: pad(item.sceneIndex ?? 1),
    take,
    date: item.chapterYear,
    title: item.chapterTitle,
  };
}

/** The day of a stop, dd.mm: its own date, or its chapter's for the stops of a day told in parts ("Điểm dừng 02"). */
export function stopDay(item: StoryScrollItem) {
  const source = /^\d{2}\.\d{2}\./.test(item.year) ? item.year : item.chapterYear;
  return source.slice(0, 5);
}
