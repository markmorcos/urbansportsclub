import { OFFSET_DAYS } from "./constants";
import { Klass } from "./types";

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const getNextDate = (weekday: string) => {
  const today = new Date();
  const targetDay = WEEKDAYS.indexOf(weekday);
  const daysToAdd = (targetDay - today.getDay() + 7) % 7;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysToAdd);
  const date = targetDate.toISOString().split("T")[0];

  return date;
};

export const getNextDates = (weekdays: string[]) => weekdays.map(getNextDate);

export function getUpcomingClassDates(classes: Record<string, Klass>) {
  const results = [];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const end = new Date(tomorrow);
  end.setDate(tomorrow.getDate() + OFFSET_DAYS);

  for (const [klass, { weekday }] of Object.entries(classes)) {
    const current = new Date(getNextDate(weekday));
    while (current <= end) {
      results.push({ klass, date: current.toISOString().split("T")[0] });
      current.setDate(current.getDate() + 7);
    }
  }
  return results.sort((a, b) => a.date.localeCompare(b.date));
}
