import { Task, Subject } from "@prisma/client";
import { getDeadlineState, type DeadlineState } from "./deadline";

export type TaskWithSubject = Task & { subject?: Subject | null };

export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: TaskWithSubject[];
  deadlineStates: DeadlineState[];
}

export interface CalendarWeek {
  days: CalendarDay[];
}

/**
 * Get the number of days in a given month.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get the day of the week (0=Sunday, 6=Saturday) for the first day of a month.
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * Group tasks by their deadline date (ignoring time).
 */
export function groupTasksByDate(
  tasks: TaskWithSubject[]
): Map<string, TaskWithSubject[]> {
  const grouped = new Map<string, TaskWithSubject[]>();

  tasks.forEach((task) => {
    const date = new Date(task.deadline);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(task);
  });

  return grouped;
}

/**
 * Generate a calendar grid for a given month/year.
 * Returns a 2D array of CalendarDay objects representing weeks.
 */
export function generateCalendarGrid(
  year: number,
  month: number,
  tasks: TaskWithSubject[],
  now: Date = new Date()
): CalendarWeek[] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const groupedTasks = groupTasksByDate(tasks);

  const weeks: CalendarWeek[] = [];
  let currentWeek: CalendarDay[] = [];

  // Fill in days from previous month
  const daysInPrevMonth = getDaysInMonth(year, month - 1);
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayOfMonth = daysInPrevMonth - i;
    const date = new Date(year, month - 1, dayOfMonth);
    currentWeek.push({
      date,
      dayOfMonth,
      isCurrentMonth: false,
      isToday: isSameDay(date, now),
      tasks: [],
      deadlineStates: [],
    });
  }

  // Fill in days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const dayTasks = groupedTasks.get(dateKey) || [];

    const deadlineStates = dayTasks.map((task) =>
      getDeadlineState(task.deadline, task.status, now)
    );

    currentWeek.push({
      date,
      dayOfMonth: day,
      isCurrentMonth: true,
      isToday: isSameDay(date, now),
      tasks: dayTasks,
      deadlineStates,
    });

    if (currentWeek.length === 7) {
      weeks.push({ days: currentWeek });
      currentWeek = [];
    }
  }

  // Fill in days from next month
  const remainingDays = 7 - currentWeek.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    currentWeek.push({
      date,
      dayOfMonth: day,
      isCurrentMonth: false,
      isToday: isSameDay(date, now),
      tasks: [],
      deadlineStates: [],
    });
  }

  if (currentWeek.length > 0) {
    weeks.push({ days: currentWeek });
  }

  return weeks;
}

/**
 * Check if two dates are the same day (ignoring time).
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get the month name.
 */
export function getMonthName(month: number, locale: string = "en-US"): string {
  return new Date(2026, month, 1).toLocaleString(locale, { month: "long" });
}

/**
 * Get day names (Sun, Mon, Tue, ...).
 */
export function getDayNames(locale: string = "en-US"): string[] {
  const days = [];
  // Start from 2026-01-04 which is a Sunday
  for (let i = 0; i < 7; i++) {
    days.push(new Date(2026, 0, 4 + i).toLocaleString(locale, { weekday: "short" }));
  }
  return days;
}

/**
 * Get the highest deadline state priority for a date
 * (to determine the color of the date cell).
 */
export function getHighestPriorityState(states: DeadlineState[]): DeadlineState | null {
  const priority: Record<DeadlineState, number> = {
    OVERDUE: 5,
    URGENT: 4,
    WARNING: 3,
    COMPLETED: 2,
    UPCOMING: 1,
    NORMAL: 0,
  };

  return (
    states.reduce((highest, state) => {
      return priority[state] > priority[highest] ? state : highest;
    }, "NORMAL" as DeadlineState) || null
  );
}
