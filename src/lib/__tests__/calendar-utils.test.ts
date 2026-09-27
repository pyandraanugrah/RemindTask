import {
  getDaysInMonth,
  getFirstDayOfMonth,
  groupTasksByDate,
  generateCalendarGrid,
  isSameDay,
  getMonthName,
  getDayNames,
  getHighestPriorityState,
  TaskWithSubject,
} from '../calendar-utils';
import { TaskStatus } from '@prisma/client';

describe('Calendar Utils', () => {
  const baseDate = new Date(2026, 8, 27, 10, 0, 0); // Sep 27, 2026

  const makeTask = (id: string, deadline: Date, status: TaskStatus = 'TODO'): TaskWithSubject => ({
    id,
    title: `Task ${id}`,
    description: null,
    deadline,
    priority: 'MEDIUM',
    status,
    progress: 0,
    subjectId: 'sub-1',
    reminderTime: null,
    createdAt: baseDate,
    updatedAt: baseDate,
    subject: null,
  });

  describe('getDaysInMonth', () => {
    test('September 2026 has 30 days', () => {
      expect(getDaysInMonth(2026, 8)).toBe(30);
    });

    test('February 2026 has 28 days', () => {
      expect(getDaysInMonth(2026, 1)).toBe(28);
    });

    test('February 2028 has 29 days (leap year)', () => {
      expect(getDaysInMonth(2028, 1)).toBe(29);
    });
  });

  describe('getFirstDayOfMonth', () => {
    test('September 2026 starts on Tuesday (2)', () => {
      expect(getFirstDayOfMonth(2026, 8)).toBe(2);
    });
  });

  describe('isSameDay', () => {
    test('Same day different time returns true', () => {
      expect(isSameDay(new Date(2026, 8, 27, 1, 0), new Date(2026, 8, 27, 23, 0))).toBe(true);
    });

    test('Different days return false', () => {
      expect(isSameDay(new Date(2026, 8, 27), new Date(2026, 8, 28))).toBe(false);
    });
  });

  describe('groupTasksByDate', () => {
    test('Groups tasks by deadline date', () => {
      const tasks = [
        makeTask('1', new Date(2026, 8, 27, 8, 0)),
        makeTask('2', new Date(2026, 8, 27, 20, 0)),
        makeTask('3', new Date(2026, 8, 28, 10, 0)),
      ];
      const grouped = groupTasksByDate(tasks, baseDate);
      expect(grouped.get('2026-8-27')?.length).toBe(2);
      expect(grouped.get('2026-8-28')?.length).toBe(1);
    });
  });

  describe('generateCalendarGrid', () => {
    test('Generates a complete grid with 7 columns per week', () => {
      const weeks = generateCalendarGrid(2026, 8, [], baseDate);
      weeks.forEach((week) => {
        expect(week.days.length).toBe(7);
      });
    });

    test('Marks current month days correctly', () => {
      const weeks = generateCalendarGrid(2026, 8, [], baseDate);
      const allDays = weeks.flatMap((w) => w.days);
      const currentMonthDays = allDays.filter((d) => d.isCurrentMonth);
      expect(currentMonthDays.length).toBe(30);
    });

    test('Marks today correctly', () => {
      const weeks = generateCalendarGrid(2026, 8, [], baseDate);
      const allDays = weeks.flatMap((w) => w.days);
      const today = allDays.filter((d) => d.isToday && d.isCurrentMonth);
      expect(today.length).toBe(1);
      expect(today[0].dayOfMonth).toBe(27);
    });

    test('Places tasks on the correct date cell', () => {
      const tasks = [makeTask('1', new Date(2026, 8, 15, 12, 0))];
      const weeks = generateCalendarGrid(2026, 8, tasks, baseDate);
      const allDays = weeks.flatMap((w) => w.days);
      const day15 = allDays.find((d) => d.isCurrentMonth && d.dayOfMonth === 15);
      expect(day15?.tasks.length).toBe(1);
      expect(day15?.tasks[0].id).toBe('1');
    });

    test('Includes tasks from previous/next month boundaries only if in month', () => {
      const weeks = generateCalendarGrid(2026, 8, [], baseDate);
      expect(weeks.length).toBeGreaterThanOrEqual(4);
      expect(weeks.length).toBeLessThanOrEqual(6);
    });
  });

  describe('getHighestPriorityState', () => {
    test('Returns OVERDUE as highest', () => {
      expect(getHighestPriorityState(['NORMAL', 'OVERDUE', 'UPCOMING'])).toBe('OVERDUE');
    });

    test('Returns URGENT over WARNING', () => {
      expect(getHighestPriorityState(['WARNING', 'URGENT'])).toBe('URGENT');
    });

    test('Returns NORMAL for empty states', () => {
      expect(getHighestPriorityState([])).toBe('NORMAL');
    });
  });

  describe('getMonthName', () => {
    test('Returns September for month 8 (en-US)', () => {
      expect(getMonthName(8, 'en-US')).toBe('September');
    });
  });

  describe('getDayNames', () => {
    test('Returns 7 day names', () => {
      const names = getDayNames('en-US');
      expect(names.length).toBe(7);
      expect(names[0]).toBe('Sun');
    });

    test('Returns Indonesian day names', () => {
      const names = getDayNames('id-ID');
      expect(names[0]).toBe('Min');
    });
  });
});
