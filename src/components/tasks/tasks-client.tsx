"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Reminder, Subject, Task } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskList } from "@/components/tasks/task-list";
import { TaskFilters } from "@/components/tasks/task-filters";
import {
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  type ActionState,
} from "@/lib/actions/tasks";
import { filterTasks, TaskFilterOptions } from "@/lib/task-filter";

import Link from "next/link";

type TaskWithSubject = Task & { subject?: Subject | null; reminders?: Reminder[] };

interface TasksClientProps {
  tasks: TaskWithSubject[];
  subjects: Subject[];
}

export function TasksClient({ tasks: initialTasks, subjects }: TasksClientProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskWithSubject[]>(initialTasks);
  const [filters, setFilters] = useState<TaskFilterOptions>({
    search: "",
    subjectId: "ALL",
    priority: "ALL",
    status: "ALL",
    deadline: "ALL",
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithSubject | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showFeedback = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCreate = async (formData: FormData): Promise<ActionState> => {
    const result = await createTask(null, formData);
    if (result.success) {
      setIsCreateOpen(false);
      showFeedback(result.message || "Tugas berhasil ditambahkan", "success");
      if (result.data) {
        setTasks([...tasks, result.data]);
      }
      router.refresh();
    } else {
      if (result.message) {
        showFeedback(result.message, "error");
      }
    }
    return result;
  };

  const handleUpdate = async (formData: FormData): Promise<ActionState> => {
    if (!selectedTask) return { success: false };
    const result = await updateTask(selectedTask.id, null, formData);
    if (result.success) {
      setIsEditOpen(false);
      showFeedback(result.message || "Tugas berhasil diperbarui", "success");
      if (result.data) {
        const updatedTask = result.data;
        setTasks(tasks.map((t) => (t.id === selectedTask.id ? updatedTask : t)));
      }
      router.refresh();
    } else {
      if (result.message) {
        showFeedback(result.message, "error");
      }
    }
    return result;
  };

  const handleComplete = async (task: Task) => {
    const result = await completeTask(task.id);
    if (result.success) {
      showFeedback("Tugas diselesaikan", "success");
      setTasks(
        tasks.map((t) =>
          t.id === task.id ? { ...t, status: "COMPLETED", progress: 100 } : t
        )
      );
    } else {
      showFeedback(result.message || "Gagal menyelesaikan tugas", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedTask) return;
    const result = await deleteTask(selectedTask.id);
    if (result.success) {
      setIsDeleteConfirmOpen(false);
      showFeedback("Tugas berhasil dihapus", "success");
      setTasks(tasks.filter((t) => t.id !== selectedTask.id));
      router.refresh();
    } else {
      showFeedback(result.message || "Gagal menghapus tugas", "error");
    }
  };

  const openEdit = (task: TaskWithSubject) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  const openDelete = (task: TaskWithSubject) => {
    setSelectedTask(task);
    setIsDeleteConfirmOpen(true);
  };

  const filteredTasks = filterTasks(tasks, filters);
  const hasFilterActive =
    (filters.search && filters.search.trim().length > 0) ||
    (filters.subjectId && filters.subjectId !== "ALL") ||
    (filters.priority && filters.priority !== "ALL") ||
    (filters.status && filters.status !== "ALL") ||
    (filters.deadline && filters.deadline !== "ALL");

  const resetFilters = () => {
    setFilters({
      search: "",
      subjectId: "ALL",
      priority: "ALL",
      status: "ALL",
      deadline: "ALL",
    });
  };

  if (subjects.length === 0) {
    return (
      <EmptyState
        title="Belum ada tugas"
        description="Untuk menambahkan tugas, Anda perlu membuat mata kuliah terlebih dahulu. Setelah itu kembali ke halaman Tasks."
        action={
          <Link href="/subjects">
            <Button variant="primary">Kelola Mata Kuliah</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Tugas
        </Button>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm border transition-all ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          title="Belum ada tugas"
          description="Tambahkan tugas pertama Anda untuk mulai mengelola pekerjaan kuliah."
          action={
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              + Tambah Tugas
            </Button>
          }
        />
      ) : (
        <>
          <TaskFilters
            subjects={subjects}
            filters={filters}
            onFilterChange={setFilters}
          />

          {filteredTasks.length === 0 ? (
            <EmptyState
              title="Tidak ada tugas yang cocok"
              description="Tidak ada tugas yang sesuai dengan pencarian atau filter Anda. Coba ubah atau reset filter."
              action={
                hasFilterActive && (
                  <Button variant="primary" onClick={resetFilters}>
                    Reset Filter
                  </Button>
                )
              }
            />
          ) : (
            <TaskList
              tasks={filteredTasks}
              onEdit={openEdit}
              onDelete={openDelete}
              onComplete={handleComplete}
            />
          )}
        </>
      )}

      {/* Dialog Create */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Tambah Tugas"
        description="Buat tugas baru untuk mata kuliah Anda."
      >
        <TaskForm subjects={subjects} onSubmit={handleCreate} />
      </Dialog>

      {/* Dialog Edit */}
      {selectedTask && (
        <Dialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          title="Edit Tugas"
          description="Ubah detail tugas Anda."
        >
          <TaskForm
            subjects={subjects}
            onSubmit={handleUpdate}
            defaultValues={{
              title: selectedTask.title,
              description: selectedTask.description,
              subjectId: selectedTask.subjectId,
              priority: selectedTask.priority,
              status: selectedTask.status,
              progress: selectedTask.progress,
              deadline: new Date(selectedTask.deadline).toISOString().slice(0, 16),
              reminders: (selectedTask.reminders || []).map((r) => {
                const diffMinutes = Math.round(
                  (new Date(selectedTask.deadline).getTime() - new Date(r.remindAt).getTime()) / 60000
                );
                const match = [
                  { value: "1h" as const, minutes: 60 },
                  { value: "6h" as const, minutes: 360 },
                  { value: "1d" as const, minutes: 1440 },
                  { value: "3d" as const, minutes: 4320 },
                  { value: "7d" as const, minutes: 10080 },
                ].find((i) => Math.abs(i.minutes - diffMinutes) <= 5);
                return match?.value;
              }).filter((v): v is "1h" | "6h" | "1d" | "3d" | "7d" => Boolean(v)),
            }}
          />
        </Dialog>
      )}

      {/* Dialog Delete Confirmation */}
      <Dialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Hapus Tugas"
        description="Tindakan ini tidak dapat dibatalkan."
      >
        {selectedTask && (
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-input text-sm">
              <p className="font-medium text-foreground">{selectedTask.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{selectedTask.subject?.name}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsDeleteConfirmOpen(false)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Hapus
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
