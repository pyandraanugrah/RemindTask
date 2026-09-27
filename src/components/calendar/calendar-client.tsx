"use client";

import { useState } from "react";
import { Task, Subject } from "@prisma/client";
import { Calendar } from "./calendar";
import { completeTask } from "@/lib/actions/tasks";

type TaskWithSubject = Task & { subject?: Subject | null };

interface CalendarClientProps {
  tasks: TaskWithSubject[];
}

export function CalendarClient({ tasks: initialTasks }: CalendarClientProps) {
  const [tasks, setTasks] = useState<TaskWithSubject[]>(initialTasks);

  const handleCompleteTask = async (task: TaskWithSubject) => {
    const result = await completeTask(task.id);
    if (result.success) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: "COMPLETED", progress: 100 } : t
        )
      );
    }
  };

  return <Calendar initialTasks={tasks} onCompleteTask={handleCompleteTask} />;
}
