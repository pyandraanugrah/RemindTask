"use client";

import { Subject, Task } from "@prisma/client";
import { TaskCard } from "./task-card";

type TaskWithSubject = Task & { subject?: Subject | null };

interface TaskListProps {
  tasks: TaskWithSubject[];
  onEdit: (task: TaskWithSubject) => void;
  onDelete: (task: TaskWithSubject) => void;
  onComplete?: (task: TaskWithSubject) => void;
}

export function TaskList({ tasks, onEdit, onDelete, onComplete }: TaskListProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={() => onEdit(task)}
          onDelete={() => onDelete(task)}
          onComplete={onComplete ? () => onComplete(task) : undefined}
        />
      ))}
    </div>
  );
}
