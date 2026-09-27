"use client";

import { Reminder, Task } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TaskPriorityBadge, TaskStatusBadge } from "./task-badges";
import { Bell, Calendar, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { type DeadlineState } from "@/lib/deadline";
import { DeadlineBadge, useDeadlineCountdown } from "./deadline-display";

type TaskWithSubject = Task & {
  subject?: { id: string; name: string; color: string } | null;
  reminders?: Reminder[];
};

interface TaskCardProps {
  task: TaskWithSubject;
  onEdit?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
  compact?: boolean;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onComplete,
  compact = false,
}: TaskCardProps) {
  const isCompleted = task.status === "COMPLETED";
  const { state: deadlineState, countdown, mounted } = useDeadlineCountdown(
    task.deadline,
    task.status
  );

  const stateColors: Record<DeadlineState, string> = {
    OVERDUE: "border-rose-500/40 bg-rose-500/5",
    URGENT: "border-amber-500/40 bg-amber-500/5",
    WARNING: "border-amber-500/30 bg-amber-500/5",
    UPCOMING: "border-blue-500/20 bg-blue-500/5",
    NORMAL: "border-muted",
    COMPLETED: "opacity-75",
  };

  const stateBadgeColors: Record<DeadlineState, string> = {
    OVERDUE: "bg-rose-500 text-white",
    URGENT: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-semibold",
    WARNING: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
    UPCOMING: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    NORMAL: "bg-muted text-muted-foreground",
    COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  };

  const hasActions = Boolean(onEdit || onDelete || onComplete);

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-colors",
        compact ? "p-3" : "hover:border-accent/50",
        stateColors[deadlineState]
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3
              className={cn(
                "text-base font-medium text-foreground truncate",
                isCompleted && "line-through opacity-60"
              )}
            >
              {task.title}
            </h3>
            {!isCompleted && deadlineState !== "NORMAL" && (
              <DeadlineBadge state={deadlineState} />
            )}
          </div>

          {!compact && task.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {task.subject && (
              <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: task.subject.color }}
                />
                {task.subject.name}
              </span>
            )}

            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span suppressHydrationWarning>
                {mounted
                  ? new Date(task.deadline).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : ""}
              </span>
            </span>

            <span
              className={cn(
                "px-2 py-0.5 text-xs rounded-full flex items-center gap-1",
                stateBadgeColors[deadlineState]
              )}
            >
              <Clock className="w-3 h-3" />
              <span suppressHydrationWarning>{countdown}</span>
            </span>

            <TaskPriorityBadge priority={task.priority} />
            <TaskStatusBadge status={task.status} />

            {task.reminders && task.reminders.length > 0 && (
              <span
                className="inline-flex items-center gap-1 text-muted-foreground"
                title={`${task.reminders.length} reminder aktif`}
              >
                <Bell className="w-3 h-3 text-accent" />
                <span>{task.reminders.length}</span>
              </span>
            )}
          </div>
        </div>

        {!compact && (
          <div className="w-full sm:w-32">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-1.5" />
          </div>
        )}

        {hasActions && (
          <div className="flex gap-2 sm:flex-col sm:gap-1 sm:w-auto">
            {!isCompleted && onComplete && (
              <button
                onClick={onComplete}
                className="p-2 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
                title="Selesaikan tugas"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className={compact ? "w-8" : "w-full"}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              >
                Hapus
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
