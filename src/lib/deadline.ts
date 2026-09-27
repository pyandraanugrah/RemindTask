import { TaskStatus } from "@prisma/client";

export type DeadlineState =
  | "COMPLETED"
  | "OVERDUE"
  | "URGENT"
  | "WARNING"
  | "UPCOMING"
  | "NORMAL";

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

export function getDeadlineState(
  deadline: Date | string | number,
  status: TaskStatus,
  now: Date = new Date()
): DeadlineState {
  if (status === "COMPLETED") {
    return "COMPLETED";
  }

  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();

  // Passed deadline
  if (diffMs <= 0) {
    return "OVERDUE";
  }

  // 24 hours or less
  if (diffMs <= MS_PER_DAY) {
    return "URGENT";
  }

  // 3 days or less
  if (diffMs <= 3 * MS_PER_DAY) {
    return "WARNING";
  }

  // 7 days or less
  if (diffMs <= 7 * MS_PER_DAY) {
    return "UPCOMING";
  }

  return "NORMAL";
}

export function formatCountdown(
  deadline: Date | string | number,
  status: TaskStatus,
  now: Date = new Date()
): string {
  if (status === "COMPLETED") {
    return "Completed";
  }

  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();

  // Overdue
  if (diffMs < 0) {
    const overdueMs = Math.abs(diffMs);
    const overdueDays = Math.floor(overdueMs / MS_PER_DAY);
    const overdueHours = Math.floor(overdueMs / MS_PER_HOUR);
    const overdueMinutes = Math.floor(overdueMs / MS_PER_MINUTE);

    if (overdueDays >= 1) {
      return `Overdue by ${overdueDays} day${overdueDays > 1 ? "s" : ""}`;
    }
    if (overdueHours >= 1) {
      return `Overdue by ${overdueHours} hour${overdueHours > 1 ? "s" : ""}`;
    }
    if (overdueMinutes >= 1) {
      return `Overdue by ${overdueMinutes} minute${overdueMinutes > 1 ? "s" : ""}`;
    }
    return "Due now";
  }

  // Exact or less than a minute
  if (diffMs < MS_PER_MINUTE) {
    return "Due now";
  }

  const days = Math.floor(diffMs / MS_PER_DAY);
  const hours = Math.floor((diffMs % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((diffMs % MS_PER_HOUR) / MS_PER_MINUTE);

  if (days >= 1) {
    return `${days} day${days > 1 ? "s" : ""} left`;
  }

  if (hours >= 1) {
    return `${hours} hour${hours > 1 ? "s" : ""} left`;
  }

  return `${minutes} minute${minutes > 1 ? "s" : ""} left`;
}

export function formatExactDeadline(
  deadline: Date | string | number,
  locale: string = "id-ID"
): string {
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return "Invalid date";

  const dateStr = d.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timeStr = d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${dateStr} · ${timeStr}`;
}

export function getDeadlineRelativeLabel(
  deadline: Date | string | number,
  now: Date = new Date()
): string {
  const d = new Date(deadline);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const dayDiff = Math.round(
    (startOfTarget.getTime() - startOfToday.getTime()) / MS_PER_DAY
  );

  if (dayDiff === 0) return "Due today";
  if (dayDiff === 1) return "Due tomorrow";
  if (dayDiff === -1) return "Due yesterday";
  if (dayDiff < -1) return `Overdue by ${Math.abs(dayDiff)} days`;
  return `Due in ${dayDiff} days`;
}
