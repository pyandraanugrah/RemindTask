"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { Subject, Task } from "@prisma/client";
import {
  calculateReminderTime,
  REMINDER_INTERVALS,
  type ReminderInterval,
} from "@/lib/reminder-utils";

type TaskWithSubject = Task & { subject?: Subject | null };

const VALID_REMINDER_INTERVALS = REMINDER_INTERVALS.map((r) => r.value);

function parseReminderIntervals(formData: FormData): ReminderInterval[] {
  return formData
    .getAll("reminders")
    .map((v) => String(v))
    .filter((v): v is ReminderInterval =>
      (VALID_REMINDER_INTERVALS as string[]).includes(v)
    );
}

const TaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul tugas wajib diisi")
    .max(150, "Judul tugas maksimal 150 karakter"),
  description: z.string().optional(),
  subjectId: z.string().uuid("Subject tidak valid"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).default("TODO"),
  progress: z.coerce
    .number()
    .int()
    .min(0, "Progress minimal 0%")
    .max(100, "Progress maksimal 100%")
    .default(0),
  deadline: z.coerce.date("Deadline harus berupa tanggal yang valid"),
});

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: {
    title?: string[];
    subjectId?: string[];
    deadline?: string[];
    progress?: string[];
    description?: string[];
  };
  data?: TaskWithSubject;
};

export async function getTasks() {
  try {
    return await db.task.findMany({
      include: { subject: true, reminders: true },
      orderBy: { deadline: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    throw new Error("Gagal memuat daftar tugas");
  }
}

export async function getTaskById(id: string) {
  try {
    return await db.task.findUnique({
      where: { id },
      include: { subject: true, reminders: true },
    });
  } catch (error) {
    console.error("Failed to fetch task:", error);
    throw new Error("Gagal memuat tugas");
  }
}

export async function createTask(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    title: formData.get("title"),
    description: formData.get("description") || "",
    subjectId: formData.get("subjectId"),
    priority: formData.get("priority") || "MEDIUM",
    status: formData.get("status") || "TODO",
    progress: formData.get("progress") ? parseInt(formData.get("progress") as string) : 0,
    deadline: formData.get("deadline"),
  };

  const validated = TaskSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { title, description, subjectId, priority, status, progress, deadline } = validated.data;

  try {
    const subject = await db.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      return {
        success: false,
        errors: {
          subjectId: ["Mata kuliah tidak ditemukan"],
        },
      };
    }

    const reminderIntervals = parseReminderIntervals(formData);

    const task = await db.task.create({
      data: {
        title,
        description: description || null,
        subjectId,
        priority,
        status,
        progress,
        deadline,
        reminders: {
          create: reminderIntervals.map((interval) => ({
            remindAt: calculateReminderTime(deadline, interval),
          })),
        },
      },
      include: { subject: true, reminders: true },
    });

    revalidatePath("/tasks");
    revalidatePath("/");
    return {
      success: true,
      message: "Tugas berhasil ditambahkan",
      data: task,
    };
  } catch (error) {
    console.error("Failed to create task:", error);
    return {
      success: false,
      message: "Gagal menyimpan tugas. Silakan coba lagi.",
    };
  }
}

export async function updateTask(
  id: string,
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    title: formData.get("title"),
    description: formData.get("description") || "",
    subjectId: formData.get("subjectId"),
    priority: formData.get("priority") || "MEDIUM",
    status: formData.get("status") || "TODO",
    progress: formData.get("progress") ? parseInt(formData.get("progress") as string) : 0,
    deadline: formData.get("deadline"),
  };

  const validated = TaskSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { title, description, subjectId, priority, status, progress, deadline } = validated.data;

  try {
    const subject = await db.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      return {
        success: false,
        errors: {
          subjectId: ["Mata kuliah tidak ditemukan"],
        },
      };
    }

    let finalProgress = progress;
    if (status === "COMPLETED") {
      finalProgress = 100;
    }

    const reminderIntervals = parseReminderIntervals(formData);

    const task = await db.$transaction(async (tx) => {
      await tx.reminder.deleteMany({ where: { taskId: id } });

      const updatedTask = await tx.task.update({
        where: { id },
        data: {
          title,
          description: description || null,
          subjectId,
          priority,
          status,
          progress: finalProgress,
          deadline,
          reminders: {
            create: reminderIntervals.map((interval) => ({
              remindAt: calculateReminderTime(deadline, interval),
            })),
          },
        },
        include: { subject: true, reminders: true },
      });

      return updatedTask;
    });

    revalidatePath("/tasks");
    revalidatePath("/");
    return {
      success: true,
      message: "Tugas berhasil diperbarui",
      data: task,
    };
  } catch (error) {
    console.error("Failed to update task:", error);
    return {
      success: false,
      message: "Gagal memperbarui tugas. Silakan coba lagi.",
    };
  }
}

export async function completeTask(id: string): Promise<ActionState> {
  try {
    const task = await db.task.update({
      where: { id },
      data: {
        status: "COMPLETED",
        progress: 100,
      },
      include: { subject: true },
    });

    revalidatePath("/tasks");
    revalidatePath("/");
    return {
      success: true,
      message: "Tugas berhasil diselesaikan",
      data: task,
    };
  } catch (error) {
    console.error("Failed to complete task:", error);
    return {
      success: false,
      message: "Gagal menyelesaikan tugas. Silakan coba lagi.",
    };
  }
}

export async function deleteTask(id: string): Promise<ActionState> {
  try {
    await db.task.delete({ where: { id } });

    revalidatePath("/tasks");
    revalidatePath("/");
    return {
      success: true,
      message: "Tugas berhasil dihapus",
    };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return {
      success: false,
      message: "Gagal menghapus tugas. Silakan coba lagi.",
    };
  }
}
