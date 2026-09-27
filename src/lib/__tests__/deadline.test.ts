import { getDeadlineState, formatCountdown, formatExactDeadline, getDeadlineRelativeLabel } from '../deadline';

describe('Deadline Engine', () => {
  const baseTime = new Date('2026-09-27T12:00:00Z');

  describe('getDeadlineState', () => {
    test('COMPLETED - status is COMPLETED', () => {
      const futureDeadline = new Date(baseTime.getTime() + 7 * 24 * 60 * 60 * 1000);
      expect(getDeadlineState(futureDeadline, 'COMPLETED', baseTime)).toBe('COMPLETED');
    });

    test('OVERDUE - deadline passed, status not COMPLETED', () => {
      const pastDeadline = new Date(baseTime.getTime() - 1 * 60 * 60 * 1000);
      expect(getDeadlineState(pastDeadline, 'TODO', baseTime)).toBe('OVERDUE');
    });

    test('URGENT - deadline <= 24 hours', () => {
      const urgentDeadline = new Date(baseTime.getTime() + 12 * 60 * 60 * 1000);
      expect(getDeadlineState(urgentDeadline, 'TODO', baseTime)).toBe('URGENT');
    });

    test('WARNING - deadline <= 3 days', () => {
      const warningDeadline = new Date(baseTime.getTime() + 2 * 24 * 60 * 60 * 1000);
      expect(getDeadlineState(warningDeadline, 'TODO', baseTime)).toBe('WARNING');
    });

    test('UPCOMING - deadline <= 7 days', () => {
      const upcomingDeadline = new Date(baseTime.getTime() + 5 * 24 * 60 * 60 * 1000);
      expect(getDeadlineState(upcomingDeadline, 'TODO', baseTime)).toBe('UPCOMING');
    });

    test('NORMAL - deadline > 7 days', () => {
      const normalDeadline = new Date(baseTime.getTime() + 10 * 24 * 60 * 60 * 1000);
      expect(getDeadlineState(normalDeadline, 'TODO', baseTime)).toBe('NORMAL');
    });

    test('Boundary: exactly 24 hours = URGENT', () => {
      const exactUrgent = new Date(baseTime.getTime() + 24 * 60 * 60 * 1000);
      expect(getDeadlineState(exactUrgent, 'TODO', baseTime)).toBe('URGENT');
    });

    test('Boundary: exactly 3 days = WARNING', () => {
      const exactWarning = new Date(baseTime.getTime() + 3 * 24 * 60 * 60 * 1000);
      expect(getDeadlineState(exactWarning, 'TODO', baseTime)).toBe('WARNING');
    });

    test('Boundary: exactly 7 days = UPCOMING', () => {
      const exactUpcoming = new Date(baseTime.getTime() + 7 * 24 * 60 * 60 * 1000);
      expect(getDeadlineState(exactUpcoming, 'TODO', baseTime)).toBe('UPCOMING');
    });
  });

  describe('formatCountdown', () => {
    test('COMPLETED - returns "Completed"', () => {
      const futureDeadline = new Date(baseTime.getTime() + 7 * 24 * 60 * 60 * 1000);
      expect(formatCountdown(futureDeadline, 'COMPLETED', baseTime)).toBe('Completed');
    });

    test('Days left - 5 days', () => {
      const deadline = new Date(baseTime.getTime() + 5 * 24 * 60 * 60 * 1000);
      expect(formatCountdown(deadline, 'TODO', baseTime)).toBe('5 days left');
    });

    test('Days left - 1 day', () => {
      const deadline = new Date(baseTime.getTime() + 1 * 24 * 60 * 60 * 1000);
      expect(formatCountdown(deadline, 'TODO', baseTime)).toBe('1 day left');
    });

    test('Hours left - 12 hours', () => {
      const deadline = new Date(baseTime.getTime() + 12 * 60 * 60 * 1000);
      expect(formatCountdown(deadline, 'TODO', baseTime)).toBe('12 hours left');
    });

    test('Hours left - 1 hour', () => {
      const deadline = new Date(baseTime.getTime() + 1 * 60 * 60 * 1000);
      expect(formatCountdown(deadline, 'TODO', baseTime)).toBe('1 hour left');
    });

    test('Minutes left - 42 minutes', () => {
      const deadline = new Date(baseTime.getTime() + 42 * 60 * 1000);
      expect(formatCountdown(deadline, 'TODO', baseTime)).toBe('42 minutes left');
    });

    test('Due now - less than 1 minute', () => {
      const deadline = new Date(baseTime.getTime() + 30 * 1000);
      expect(formatCountdown(deadline, 'TODO', baseTime)).toBe('Due now');
    });

    test('Overdue - 2 days past', () => {
      const deadline = new Date(baseTime.getTime() - 2 * 24 * 60 * 60 * 1000);
      expect(formatCountdown(deadline, 'TODO', baseTime)).toBe('Overdue by 2 days');
    });

    test('Overdue - 1 day past', () => {
      const deadline = new Date(baseTime.getTime() - 1 * 24 * 60 * 60 * 1000);
      expect(formatCountdown(deadline, 'TODO', baseTime)).toBe('Overdue by 1 day');
    });

    test('Overdue - 3 hours past', () => {
      const deadline = new Date(baseTime.getTime() - 3 * 60 * 60 * 1000);
      expect(formatCountdown(deadline, 'TODO', baseTime)).toBe('Overdue by 3 hours');
    });
  });

  describe('getDeadlineRelativeLabel', () => {
    test('Due today', () => {
      const today = new Date(baseTime.getFullYear(), baseTime.getMonth(), baseTime.getDate(), 23, 59);
      expect(getDeadlineRelativeLabel(today, baseTime)).toBe('Due today');
    });

    test('Due tomorrow', () => {
      const tomorrow = new Date(baseTime.getTime() + 24 * 60 * 60 * 1000);
      expect(getDeadlineRelativeLabel(tomorrow, baseTime)).toBe('Due tomorrow');
    });

    test('Due in N days', () => {
      const in5Days = new Date(baseTime.getTime() + 5 * 24 * 60 * 60 * 1000);
      expect(getDeadlineRelativeLabel(in5Days, baseTime)).toBe('Due in 5 days');
    });

    test('Overdue yesterday', () => {
      const yesterday = new Date(baseTime.getTime() - 24 * 60 * 60 * 1000);
      expect(getDeadlineRelativeLabel(yesterday, baseTime)).toBe('Due yesterday');
    });

    test('Overdue N days', () => {
      const overdue2Days = new Date(baseTime.getTime() - 2 * 24 * 60 * 60 * 1000);
      expect(getDeadlineRelativeLabel(overdue2Days, baseTime)).toBe('Overdue by 2 days');
    });
  });

  describe('formatExactDeadline', () => {
    test('Formats date and time correctly', () => {
      const deadline = new Date('2026-09-27T14:30:00Z');
      const result = formatExactDeadline(deadline, 'en-US');
      expect(result).toMatch(/Sep|September/);
      expect(result).toMatch(/27/);
      expect(result).toMatch(/2026/);
      // Time portion contains HH:MM format (24h) regardless of local timezone
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    test('Handles invalid date', () => {
      const result = formatExactDeadline('invalid', 'en-US');
      expect(result).toBe('Invalid date');
    });
  });
});
