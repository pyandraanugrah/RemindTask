"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Subject } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionState } from "@/lib/actions/tasks";
import { REMINDER_INTERVALS, type ReminderInterval } from "@/lib/reminder-utils";
import { Bell } from "lucide-react";

interface TaskFormProps {
  subjects: Subject[];
  onSubmit: (formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    title: string;
    description?: string | null;
    subjectId: string;
    priority: string;
    status: string;
    progress: number;
    deadline: string;
    reminders?: ReminderInterval[];
  };
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? "Menyimpan..." : isEdit ? "Perbarui Tugas" : "Tambahkan Tugas"}
    </Button>
  );
}

export function TaskForm({ subjects, onSubmit, defaultValues }: TaskFormProps) {
  const isEdit = !!defaultValues;
  const [errors, setErrors] = useState<{ [key: string]: string[] } | null>(null);
  const [status, setStatus] = useState(defaultValues?.status || "TODO");
  const [progress, setProgress] = useState(defaultValues?.progress ?? 0);
  const [selectedReminders, setSelectedReminders] = useState<ReminderInterval[]>(
    defaultValues?.reminders || []
  );

  const toggleReminder = (interval: ReminderInterval) => {
    setSelectedReminders((prev) =>
      prev.includes(interval) ? prev.filter((r) => r !== interval) : [...prev, interval]
    );
  };

  const handleSubmit = async (formData: FormData) => {
    // Auto-set progress to 100 if completed
    if (status === "COMPLETED") {
      formData.set("progress", "100");
    }
    // Append selected reminders
    formData.delete("reminders");
    selectedReminders.forEach((r) => formData.append("reminders", r));

    const result = await onSubmit(formData);
    if (!result.success && result.errors) {
      setErrors(result.errors);
    } else {
      setErrors(null);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-4 pt-2">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Judul Tugas <span className="text-rose-500">*</span>
        </label>
        <Input
          type="text"
          name="title"
          placeholder="Contoh: Laporan AES-128"
          defaultValue={defaultValues?.title || ""}
          required
          className={errors?.title ? "border-rose-500" : ""}
        />
        {errors?.title && <p className="text-xs text-rose-500 mt-1">{errors.title[0]}</p>}
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Mata Kuliah <span className="text-rose-500">*</span>
        </label>
        <select
          name="subjectId"
          defaultValue={defaultValues?.subjectId || ""}
          required
          className={`flex h-10 w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 ${
            errors?.subjectId ? "border-rose-500" : "border-border"
          }`}
        >
          <option value="" disabled>
            Pilih mata kuliah
          </option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
        {errors?.subjectId && <p className="text-xs text-rose-500 mt-1">{errors.subjectId[0]}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">Deskripsi</label>
        <textarea
          name="description"
          placeholder="Detail tambahan, instruksi, atau catatan..."
          defaultValue={defaultValues?.description || ""}
          rows={3}
          className={`flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            errors?.description ? "border-rose-500" : "border-border"
          }`}
        />
        {errors?.description && (
          <p className="text-xs text-rose-500 mt-1">{errors.description[0]}</p>
        )}
      </div>

      {/* Deadline */}
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Deadline <span className="text-rose-500">*</span>
        </label>
        <Input
          type="datetime-local"
          name="deadline"
          defaultValue={defaultValues?.deadline || ""}
          required
          className={errors?.deadline ? "border-rose-500" : ""}
        />
        {errors?.deadline && <p className="text-xs text-rose-500 mt-1">{errors.deadline[0]}</p>}
      </div>

      {/* Priority & Status grid */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Prioritas</label>
          <select
            name="priority"
            defaultValue={defaultValues?.priority || "MEDIUM"}
            className="flex h-10 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Status</label>
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium text-foreground">
            Progress {status === "COMPLETED" && <span className="text-muted-foreground">(100% otomatis)</span>}
          </label>
          <span className="text-sm text-muted-foreground">{status === "COMPLETED" ? 100 : progress}%</span>
        </div>
        <input
          type="range"
          name="progress"
          min="0"
          max="100"
          step="5"
          value={status === "COMPLETED" ? 100 : progress}
          onChange={(e) => setProgress(parseInt(e.target.value))}
          disabled={status === "COMPLETED"}
          className="w-full accent-accent disabled:opacity-50"
        />
        {errors?.progress && <p className="text-xs text-rose-500 mt-1">{errors.progress[0]}</p>}
      </div>

      {/* Reminder */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2 text-foreground">
          <Bell className="w-4 h-4" />
          Pengingat (opsional)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {REMINDER_INTERVALS.map((reminder) => {
            const checked = selectedReminders.includes(reminder.value);
            return (
              <label
                key={reminder.value}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                  checked
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border text-muted-foreground hover:bg-input/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleReminder(reminder.value)}
                  className="accent-accent"
                />
                {reminder.label}
              </label>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Notifikasi muncul selama aplikasi terbuka di browser.
        </p>
      </div>

      <div className="pt-2">
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  );
}
