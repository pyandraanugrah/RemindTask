import { Task, Subject, TaskPriority, TaskStatus } from "@prisma/client";
import { getDeadlineState } from "./deadline";

export type TaskWithSubject = Task & { subject?: Subject | null };

export type DeadlineFilter = "ALL" | "TODAY" | "THIS_WEEK" | "UPCOMING" | "OVERDUE";
export type StatusFilter = "ALL" | TaskStatus;
export type PriorityFilter = "ALL" | TaskPriority;

export interface TaskFilterOptions {
  search?: string;
  subjectId?: string;
  priority?: PriorityFilter;
  status?: StatusFilter;
  deadline?: DeadlineFilter;
}

export function filterTasks(
  tasks: TaskWithSubject[],
  filters: TaskFilterOptions,
  now: Date = new Date()
): TaskWithSubject[] {
  const query = filters.search?.trim().toLowerCase();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // End of current week (Sunday 23:59:59.999)
  // getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  const currentDay = now.getDay();
  const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
  const endOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysUntilSunday,
    23,
    59,
    59,
    999
  );

  return tasks.filter((task) => {
    // 1. Search Query
    if (query) {
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchDesc = task.description?.toLowerCase().includes(query) ?? false;
      const matchSubject = task.subject?.name.toLowerCase().includes(query) ?? false;

      if (!matchTitle && !matchDesc && !matchSubject) {
        return false;
      }
    }

    // 2. Subject Filter
    if (filters.subjectId && filters.subjectId !== "ALL") {
      if (task.subjectId !== filters.subjectId) {
        return false;
      }
    }

    // 3. Priority Filter
    if (filters.priority && filters.priority !== "ALL") {
      if (task.priority !== filters.priority) {
        return false;
      }
    }

    // 4. Status Filter
    if (filters.status && filters.status !== "ALL") {
      if (task.status !== filters.status) {
        return false;
      }
    }

    // 5. Deadline Filter
    if (filters.deadline && filters.deadline !== "ALL") {
      const taskDeadline = new Date(task.deadline);
      const isOverdue = getDeadlineState(task.deadline, task.status, now) === "OVERDUE";

      switch (filters.deadline) {
        case "OVERDUE":
          if (!isOverdue) return false;
          break;

        case "TODAY":
          // Must fall within today (00:00:00 - 23:59:59)
          if (taskDeadline < startOfToday || taskDeadline > endOfToday) {
            return false;
          }
          break;

        case "THIS_WEEK":
          // Must fall between start of today and end of this week
          if (taskDeadline < startOfToday || taskDeadline > endOfWeek) {
            return false;
          }
          break;

        case "UPCOMING":
          // Deadline in the future and not overdue
          if (taskDeadline < now || isOverdue) {
            return false;
          }
          break;
      }
    }

    return true;
  });
}

export function hasActiveFilters(filters: TaskFilterOptions): boolean {
  return Boolean(
    (filters.search && filters.search.trim().length > 0) ||
      (filters.subjectId && filters.subjectId !== "ALL") ||
      (filters.priority && filters.priority !== "ALL") ||
      (filters.status && filters.status !== "ALL") ||
      (filters.deadline && filters.deadline !== "ALL")
  );
}
