/**
 * Reminder calculation utilities.
 * Supports predefined intervals: 7d, 3d, 1d, 6h, 1h before deadline.
 */

export type ReminderInterval = "7d" | "3d" | "1d" | "6h" | "1h";

export const REMINDER_INTERVALS: { value: ReminderInterval; label: string; minutesBefore: number }[] = [
  { value: "1h", label: "1 hour before", minutesBefore: 60 },
  { value: "6h", label: "6 hours before", minutesBefore: 360 },
  { value: "1d", label: "1 day before", minutesBefore: 1440 },
  { value: "3d", label: "3 days before", minutesBefore: 4320 },
  { value: "7d", label: "7 days before", minutesBefore: 10080 },
];

/**
 * Calculate reminder time from deadline and interval.
 * Example: deadline = 2026-09-30 14:00, interval = "1d" => reminder = 2026-09-29 14:00
 */
export function calculateReminderTime(deadline: Date, interval: ReminderInterval): Date {
  const reminderConfig = REMINDER_INTERVALS.find((r) => r.value === interval);
  if (!reminderConfig) {
    throw new Error(`Unknown reminder interval: ${interval}`);
  }

  const reminderDate = new Date(deadline.getTime() - reminderConfig.minutesBefore * 60 * 1000);
  return reminderDate;
}

/**
 * Calculate all reminder times for a task deadline with selected intervals.
 */
export function calculateReminderTimes(
  deadline: Date,
  selectedIntervals: ReminderInterval[]
): { interval: ReminderInterval; remindAt: Date }[] {
  return selectedIntervals.map((interval) => ({
    interval,
    remindAt: calculateReminderTime(deadline, interval),
  }));
}

/**
 * Check if a reminder should trigger now (remindAt <= now && !isSent).
 */
export function shouldTriggerReminder(remindAt: Date, isSent: boolean, now: Date = new Date()): boolean {
  return !isSent && remindAt <= now;
}

/**
 * Get human-readable label for a reminder based on remindAt vs now.
 */
export function formatReminderLabel(remindAt: Date, isSent: boolean, now: Date = new Date()): string {
  if (isSent) {
    return "Sent";
  }

  const diffMs = remindAt.getTime() - now.getTime();

  if (diffMs < 0) {
    return "Overdue";
  }

  if (diffMs < 60 * 1000) {
    return "Now";
  }

  const minutes = Math.floor(diffMs / (60 * 1000));
  if (minutes < 60) {
    return `in ${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `in ${hours}h`;
  }

  const days = Math.floor(hours / 24);
  return `in ${days}d`;
}
