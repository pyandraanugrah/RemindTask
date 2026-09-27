"use client";

import { TaskWithSubject } from "@/lib/calendar-utils";
import { Dialog } from "@/components/ui/dialog";
import { TaskCard } from "@/components/tasks/task-card";

interface CalendarDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  tasks: TaskWithSubject[];
  onEditTask?: (task: TaskWithSubject) => void;
  onDeleteTask?: (task: TaskWithSubject) => void;
  onCompleteTask?: (task: TaskWithSubject) => void;
}

export function CalendarDayModal({
  isOpen,
  onClose,
  date,
  tasks,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
}: CalendarDayModalProps) {
  if (!date) return null;

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={`Tugas: ${formattedDate}`}
      description={`${tasks.length} tugas jatuh tempo pada tanggal ini`}
    >
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Tidak ada tugas dengan deadline pada tanggal ini.
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              compact
              onEdit={onEditTask ? () => onEditTask(task) : undefined}
              onDelete={onDeleteTask ? () => onDeleteTask(task) : undefined}
              onComplete={onCompleteTask ? () => onCompleteTask(task) : undefined}
            />
          ))
        )}
      </div>
    </Dialog>
  );
}
