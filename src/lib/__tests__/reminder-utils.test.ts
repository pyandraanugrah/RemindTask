import {
  calculateReminderTime,
  calculateReminderTimes,
  shouldTriggerReminder,
  formatReminderLabel,
  REMINDER_INTERVALS,
  ReminderInterval,
} from '../reminder-utils';

describe('Reminder Utils', () => {
  const deadline = new Date('2026-09-30T14:00:00Z');

  describe('calculateReminderTime', () => {
    test('1 hour before', () => {
      const result = calculateReminderTime(deadline, '1h');
      expect(result.toISOString()).toBe('2026-09-30T13:00:00.000Z');
    });

    test('6 hours before', () => {
      const result = calculateReminderTime(deadline, '6h');
      expect(result.toISOString()).toBe('2026-09-30T08:00:00.000Z');
    });

    test('1 day before', () => {
      const result = calculateReminderTime(deadline, '1d');
      expect(result.toISOString()).toBe('2026-09-29T14:00:00.000Z');
    });

    test('3 days before', () => {
      const result = calculateReminderTime(deadline, '3d');
      expect(result.toISOString()).toBe('2026-09-27T14:00:00.000Z');
    });

    test('7 days before', () => {
      const result = calculateReminderTime(deadline, '7d');
      expect(result.toISOString()).toBe('2026-09-23T14:00:00.000Z');
    });
  });

  describe('REMINDER_INTERVALS', () => {
    test('contains all predefined intervals from PRD', () => {
      const values = REMINDER_INTERVALS.map((r) => r.value);
      expect(values).toContain('7d');
      expect(values).toContain('3d');
      expect(values).toContain('1d');
      expect(values).toContain('6h');
      expect(values).toContain('1h');
    });

    test('minutesBefore values are correct', () => {
      const map = Object.fromEntries(
        REMINDER_INTERVALS.map((r) => [r.value, r.minutesBefore])
      );
      expect(map['1h']).toBe(60);
      expect(map['6h']).toBe(360);
      expect(map['1d']).toBe(1440);
      expect(map['3d']).toBe(4320);
      expect(map['7d']).toBe(10080);
    });
  });

  describe('calculateReminderTimes', () => {
    test('calculates multiple reminder times sorted', () => {
      const results = calculateReminderTimes(deadline, ['1d', '1h']);
      expect(results).toHaveLength(2);
      expect(results[0].interval).toBe('1d');
      expect(results[1].interval).toBe('1h');
      expect(results[0].remindAt.toISOString()).toBe('2026-09-29T14:00:00.000Z');
      expect(results[1].remindAt.toISOString()).toBe('2026-09-30T13:00:00.000Z');
    });
  });

  describe('shouldTriggerReminder', () => {
    test('triggers when remindAt <= now and not sent', () => {
      const remindAt = new Date('2026-09-30T10:00:00Z');
      const now = new Date('2026-09-30T11:00:00Z');
      expect(shouldTriggerReminder(remindAt, false, now)).toBe(true);
    });

    test('does not trigger when already sent', () => {
      const remindAt = new Date('2026-09-30T10:00:00Z');
      const now = new Date('2026-09-30T11:00:00Z');
      expect(shouldTriggerReminder(remindAt, true, now)).toBe(false);
    });

    test('does not trigger when remindAt is in future', () => {
      const remindAt = new Date('2026-09-30T12:00:00Z');
      const now = new Date('2026-09-30T11:00:00Z');
      expect(shouldTriggerReminder(remindAt, false, now)).toBe(false);
    });
  });

  describe('formatReminderLabel', () => {
    test('returns "Sent" when already sent', () => {
      expect(formatReminderLabel(deadline, true, new Date('2026-09-29T00:00:00Z'))).toBe('Sent');
    });

    test('returns "in Xd" for days', () => {
      const remindAt = new Date('2026-09-30T14:00:00Z');
      const now = new Date('2026-09-27T14:00:00Z');
      expect(formatReminderLabel(remindAt, false, now)).toBe('in 3d');
    });

    test('returns "in Xh" for hours', () => {
      const remindAt = new Date('2026-09-30T14:00:00Z');
      const now = new Date('2026-09-30T08:00:00Z');
      expect(formatReminderLabel(remindAt, false, now)).toBe('in 6h');
    });

    test('returns "in Xm" for minutes', () => {
      const remindAt = new Date('2026-09-30T14:00:00Z');
      const now = new Date('2026-09-30T13:30:00Z');
      expect(formatReminderLabel(remindAt, false, now)).toBe('in 30m');
    });

    test('returns "Overdue" for past remindAt', () => {
      const remindAt = new Date('2026-09-30T14:00:00Z');
      const now = new Date('2026-09-30T15:00:00Z');
      expect(formatReminderLabel(remindAt, false, now)).toBe('Overdue');
    });
  });

  describe('notifications helpers', () => {
    test('valid ReminderInterval union type is accepted', () => {
      const intervals: ReminderInterval[] = ['1h', '6h', '1d', '3d', '7d'];
      expect(intervals).toHaveLength(5);
    });
  });
});
