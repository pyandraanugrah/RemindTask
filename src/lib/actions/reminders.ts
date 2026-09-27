"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { Reminder, Task, Subject } from "@prisma/client";
import { calculateReminderTimes, ReminderInterval } from "@/lib/reminder-utils";

type TaskWithSubject = Task & { subject?: Subject | null };
export type ReminderWithTask = Reminder & { task: TaskWithSubject };

/**
 * Replace all reminders for a task with the given intervals.
 * Deletes existing reminders and creates new ones based on the task deadline.
 */
export async function setTaskReminders(
  taskId: string,
  intervals: ReminderInterval[]
): Promise<{ success: boolean; message?: string }> {
  try {
    const task = await db.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return { success: false, message: "Tugas tidak ditemukan" };
    }

    const reminderTimes = calculateReminderTimes(task.deadline, intervals);

    await db.$transaction([
      db.reminder.deleteMany({ where: { taskId } }),
      ...reminderTimes.map((r) =>
        db.reminder.create({
          data: { taskId, remindAt: r.remindAt },
        })
      ),
    ]);

    revalidatePath("/tasks");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to set task reminders:", error);
    return { success: false, message: "Gagal menyimpan reminder" };
  }
}

export async function getRemindersForTask(taskId: string): Promise<Reminder[]> {
  try {
    return await db.reminder.findMany({
      where: { taskId },
      orderBy: { remindAt: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch reminders:", error);
    throw new Error("Gagal memuat reminder");
  }
}

/**
 * Get all unsent reminders that are due (remindAt <= now), with their task.
 * Used by the in-app notification checker while the app is open.
 */
export async function getRemindersToNotify(now: Date = new Date()): Promise<ReminderWithTask[]> {
  try {
    return await db.reminder.findMany({
      where: {
        remindAt: { lte: now },
        isSent: false,
      },
      include: { task: { include: { subject: true } } },
      orderBy: { remindAt: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch reminders to notify:", error);
    return [];
  }
}

export async function markRemindersAsSent(reminderIds: string[]): Promise<void> {
  if (reminderIds.length === 0) return;
  try {
    await db.reminder.updateMany({
      where: { id: { in: reminderIds } },
      data: { isSent: true },
    });
  } catch (error) {
    console.error("Failed to mark reminders as sent:", error);
  }
}

export async function deleteReminder(
  reminderId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    await db.reminder.delete({ where: { id: reminderId } });
    revalidatePath("/tasks");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete reminder:", error);
    return { success: false, message: "Gagal menghapus reminder" };
  }
}
