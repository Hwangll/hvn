/**
 * How long two people have been together, counted the way Inlove shows it: whole years and months since the start
 * date, then the days left over as weeks and days ("0 năm 4 tháng 2 tuần 3 ngày"), plus the plain count of days.
 * Calendar days are read in Vietnam time, so the count turns over at midnight in Hà Nội wherever it is read.
 */
export interface LoveDuration {
  years: number;
  months: number;
  weeks: number;
  days: number;
  totalDays: number;
}

interface CalendarDay {
  year: number;
  month: number;
  day: number;
}

const vietnamDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" });

function calendarDay(moment: Date): CalendarDay {
  const parts = Object.fromEntries(vietnamDate.formatToParts(moment).map((part) => [part.type, part.value]));
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

const dayNumber = ({ year, month, day }: CalendarDay) => Date.UTC(year, month - 1, day) / 86_400_000;

/** The start date moved on by whole months; a day the month does not have falls back to its last day (31/1 → 28/2). */
function addMonths(start: CalendarDay, months: number): CalendarDay {
  const index = start.month - 1 + months;
  const year = start.year + Math.floor(index / 12);
  const month = (index % 12 + 12) % 12 + 1;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { year, month, day: Math.min(start.day, lastDay) };
}

export function loveDuration(startIso: string, now: Date = new Date()): LoveDuration {
  const start = calendarDay(new Date(startIso));
  const today = calendarDay(now);
  const totalDays = Math.max(0, dayNumber(today) - dayNumber(start));
  let months = (today.year - start.year) * 12 + (today.month - start.month);
  if (dayNumber(addMonths(start, months)) > dayNumber(today)) months -= 1;
  months = Math.max(0, months);
  const rest = Math.max(0, dayNumber(today) - dayNumber(addMonths(start, months)));
  return { years: Math.floor(months / 12), months: months % 12, weeks: Math.floor(rest / 7), days: rest % 7, totalDays };
}
