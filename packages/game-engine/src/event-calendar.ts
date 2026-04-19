import type { CalendarEntry, ScheduledEvent } from '@repo/types';

// ------------------------------------------------------------------
// Game Calendar — maps fictional school year days to readable dates
// Each semester = 90 days. We map them to fictional months.
// ------------------------------------------------------------------

const SEMESTER_MONTHS: Record<number, string[]> = {
  1: ['September', 'October', 'November'],
  2: ['December', 'January', 'February'],
  3: ['March', 'April', 'May'],
  4: ['June', 'July', 'August'],
};

const DAYS_PER_MONTH = 30;
const DAYS_PER_WEEK = 7;

// Semester 1 starts on a Monday
const SEMESTER_START_DAY_OF_WEEK = 1; // 0=Sun, 1=Mon

/**
 * Get the fictional month name for a given game date.
 */
export function getMonthName(semester: number, day: number): string {
  const months = SEMESTER_MONTHS[semester];
  if (!months) return 'Unknown';
  const monthIndex = Math.min(months.length - 1, Math.floor((day - 1) / DAYS_PER_MONTH));
  return months[monthIndex] ?? 'Unknown';
}

/**
 * Get the day of the month (1–30) for a given game date.
 */
export function getDayOfMonth(day: number): number {
  return ((day - 1) % DAYS_PER_MONTH) + 1;
}

/**
 * Get the weekday name for a given game date.
 * Semester 1, Day 1 is a Monday.
 */
export function getWeekDay(semester: number, day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const totalDaysOffset = (semester - 1) * 90 + (day - 1);
  const dayOfWeek = (SEMESTER_START_DAY_OF_WEEK + totalDaysOffset) % DAYS_PER_WEEK;
  return days[dayOfWeek]!;
}

/**
 * Format a game date as a readable string.
 * e.g. "Monday, October 15, Freshman Fall"
 */
export function formatGameDate(semester: number, day: number): string {
  const weekDay = getWeekDay(semester, day);
  const monthName = getMonthName(semester, day);
  const dayOfMonth = getDayOfMonth(day);
  const semesterLabel = getSemesterLabel(semester);
  return `${weekDay}, ${monthName} ${dayOfMonth}, ${semesterLabel}`;
}

/**
 * Get a short weekday abbreviation (Mon, Tue, etc.)
 */
export function getShortWeekDay(semester: number, day: number): string {
  const full = getWeekDay(semester, day);
  return full.slice(0, 3);
}

/**
 * Get an emoji icon representing the day type.
 */
export function getDayIcon(semester: number, day: number): string {
  const events = getEventsForCalendarDay(semester, day);
  const weekDay = getWeekDay(semester, day);

  if (events.length > 0) {
    const category = events[0]!.category;
    const categoryIcons: Record<string, string> = {
      academic: '📚',
      social: '🎉',
      sports: '🏆',
      arts: '🎨',
      drama: '🎭',
      holiday: '🎃',
      crisis: '⚠️',
      opportunity: '✨',
    };
    return categoryIcons[category] ?? '📅';
  }

  if (weekDay === 'Saturday' || weekDay === 'Sunday') {
    return '☀️';
  }

  // Default weekday icons
  const dayIcons: Record<string, string> = {
    Monday: '📘',
    Tuesday: '📗',
    Wednesday: '📙',
    Thursday: '📕',
    Friday: '🎵',
  };
  return dayIcons[weekDay] ?? '📅';
}

/**
 * Check if the given day is a weekend.
 */
export function isWeekend(semester: number, day: number): boolean {
  const weekDay = getWeekDay(semester, day);
  return weekDay === 'Saturday' || weekDay === 'Sunday';
}

/**
 * Check if the given day is a holiday.
 */
export function isHoliday(
  semester: number,
  day: number
): { isHoliday: boolean; name?: string } {
  const HOLIDAYS: Record<number, Array<{ day: number; name: string }>> = {
    1: [
      { day: 60, name: 'Thanksgiving Break' },
      { day: 88, name: 'Winter Break Start' },
    ],
    2: [
      { day: 35, name: "Valentine's Day" },
      { day: 65, name: 'Spring Break' },
      { day: 88, name: 'Easter Break' },
    ],
    3: [
      { day: 1, name: 'New Semester' },
      { day: 88, name: 'Senior Skip Day' },
    ],
    4: [
      { day: 1, name: 'Senior Year Begins' },
      { day: 75, name: 'Graduation Day' },
    ],
  };

  const semesterHolidays = HOLIDAYS[semester] ?? [];
  const holiday = semesterHolidays.find((h) => h.day === day);
  return { isHoliday: !!holiday, name: holiday?.name };
}

/**
 * Get which week of the semester a day falls in (1-indexed).
 */
export function getWeekNumber(day: number): number {
  return Math.floor((day - 1) / DAYS_PER_WEEK) + 1;
}

/**
 * Build a month grid for a specific semester and month index (0, 1, or 2).
 * Returns a 2D array where each inner array is a week of 7 days.
 * Days outside the month are represented as 0.
 */
export function getMonthGrid(
  semester: number,
  monthIndex: number
): Array<Array<{ day: number; inMonth: boolean; isWeekend: boolean; isHoliday: boolean; holidayName?: string; events: ScheduledEvent[] }>> {
  const startDay = monthIndex * DAYS_PER_MONTH + 1;
  const endDay = startDay + DAYS_PER_MONTH - 1;

  // Get the weekday of the first day of this month
  const firstWeekDayName = getWeekDay(semester, startDay);
  const weekDayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(firstWeekDayName);

  const grid: Array<Array<{ day: number; inMonth: boolean; isWeekend: boolean; isHoliday: boolean; holidayName?: string; events: ScheduledEvent[] }>> = [];
  let currentWeek: Array<{ day: number; inMonth: boolean; isWeekend: boolean; isHoliday: boolean; holidayName?: string; events: ScheduledEvent[] }> = [];

  // Fill padding days before the first of the month
  for (let i = 0; i < weekDayIndex; i++) {
    currentWeek.push({ day: 0, inMonth: false, isWeekend: false, isHoliday: false, events: [] });
  }

  for (let d = startDay; d <= Math.min(endDay, 90); d++) {
    const weekend = isWeekend(semester, d);
    const holiday = isHoliday(semester, d);
    const events = getEventsForCalendarDay(semester, d);

    currentWeek.push({
      day: d,
      inMonth: true,
      isWeekend: weekend,
      isHoliday: holiday.isHoliday,
      holidayName: holiday.name,
      events,
    });

    if (currentWeek.length === DAYS_PER_WEEK) {
      grid.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill remaining days in the last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < DAYS_PER_WEEK) {
      currentWeek.push({ day: 0, inMonth: false, isWeekend: false, isHoliday: false, events: [] });
    }
    grid.push(currentWeek);
  }

  return grid;
}

/**
 * Get all calendar entries for a specific semester and month.
 */
export function getCalendarMonth(
  semester: number,
  monthIndex: number
): CalendarEntry[] {
  const startDay = monthIndex * DAYS_PER_MONTH + 1;
  const endDay = Math.min(startDay + DAYS_PER_MONTH - 1, 90);
  const entries: CalendarEntry[] = [];

  for (let d = startDay; d <= endDay; d++) {
    const events = getEventsForCalendarDay(semester, d);
    const holiday = isHoliday(semester, d);
    entries.push({
      date: { semester, day: d },
      events,
      isHoliday: holiday.isHoliday,
      holidayName: holiday.name,
    });
  }

  return entries;
}

/**
 * Get a human-readable label for a semester.
 */
export function getSemesterLabel(semester: number): string {
  const labels: Record<number, string> = {
    1: 'Freshman Fall',
    2: 'Freshman Spring',
    3: 'Sophomore Fall',
    4: 'Senior Year',
  };
  return labels[semester] ?? `Semester ${semester}`;
}

// ------------------------------------------------------------------
// Internal helpers
// ------------------------------------------------------------------

import { getEventsForDay } from './world-events';

function getEventsForCalendarDay(semester: number, day: number): ScheduledEvent[] {
  return getEventsForDay(semester, day);
}
