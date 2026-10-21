import type { CalendarDay } from "./ai.functions";

const esc = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Adds day offsets to a start date (YYYY-MM-DD) and returns ISO dates. */
export function dateForDay(start: string, day: number): string {
  const d = new Date(`${start}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + day - 1);
  return d.toISOString().slice(0, 10);
}

export function calendarToCsv(days: CalendarDay[], start: string): string {
  const rows = [["Day", "Date", "Theme", "Format", "Idea", "Hook"]];
  for (const d of days) rows.push([String(d.day), dateForDay(start, d.day), d.theme, d.format, d.idea, d.hook]);
  return rows.map((r) => r.map(esc).join(",")).join("\n");
}
