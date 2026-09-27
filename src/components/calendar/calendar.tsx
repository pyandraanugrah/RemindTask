"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskWithSubject } from "@/lib/calendar-utils";
import {
  generateCalendarGrid,
  getMonthName,
  getDayNames,
  getHighestPriorityState,
  isSameDay,
} from "@/lib/calendar-utils";
import { CalendarDayModal } from "./calendar-day-modal";
import { cn } from "@/lib/utils";

interface CalendarProps {
  initialTasks: TaskWithSubject[];
  onEditTask?: (task: TaskWithSubject) => void;
  onDeleteTask?: (task: TaskWithSubject) => void;
  onCompleteTask?: (task: TaskWithSubject) => void;
}

const stateColors: Record<string, string> = {
  OVERDUE: "bg-rose-500/20 border-rose-500/50",
  URGENT: "bg-rose-500/10 border-rose-500/30",
  WARNING: "bg-amber-500/10 border-amber-500/30",
  COMPLETED: "bg-emerald-500/10 border-emerald-500/20",
  UPCOMING: "bg-blue-500/10 border-blue-500/20",
  NORMAL: "bg-muted/40 border-muted/50",
};

export function Calendar({
  initialTasks,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
}: CalendarProps) {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const weeks = generateCalendarGrid(currentDate.getFullYear(), currentDate.getMonth(), initialTasks, now);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const selectedTasks = selectedDate
    ? initialTasks.filter((task) => {
        const taskDate = new Date(task.deadline);
        return isSameDay(taskDate, selectedDate);
      })
    : [];

  const dayNames = getDayNames("id-ID");
  const monthName = getMonthName(currentDate.getMonth(), "id-ID");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">
          {monthName} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevMonth}
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1))}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-border rounded-lg overflow-hidden bg-background">
        {/* Day Names Header */}
        <div className="grid grid-cols-7 bg-input/40 border-b border-border">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div>
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 auto-rows-[150px] md:auto-rows-[120px]">
              {week.days.map((day, dayIdx) => {
                const highestState = getHighestPriorityState(day.deadlineStates);
                const hasMultipleTasks = day.tasks.length > 1;
                const isInteractive = day.isCurrentMonth && day.tasks.length > 0;

                return (
                  <div
                    key={dayIdx}
                    role={isInteractive ? "button" : undefined}
                    tabIndex={isInteractive ? 0 : undefined}
                    aria-label={
                      isInteractive
                        ? `${day.dayOfMonth}: ${day.tasks.length} tugas`
                        : undefined
                    }
                    onClick={() => isInteractive && handleDateClick(day.date)}
                    onKeyDown={(e) => {
                      if (isInteractive && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        handleDateClick(day.date);
                      }
                    }}
                    className={cn(
                      "border-r border-b border-border p-2 text-sm transition-colors",
                      isInteractive && "cursor-pointer hover:bg-input/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      day.isCurrentMonth ? "" : "bg-muted/20 opacity-50",
                      day.isToday && "bg-accent/10 border-accent",
                      day.tasks.length > 0 && highestState && stateColors[highestState]
                    )}
                  >
                    {/* Date Number */}
                    <div
                      className={cn(
                        "text-sm font-semibold mb-1",
                        day.isToday && "text-accent",
                        !day.isCurrentMonth && "text-muted-foreground"
                      )}
                    >
                      {day.dayOfMonth}
                    </div>

                    {/* Task Count and Indicators */}
                    {day.tasks.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {day.tasks.slice(0, 3).map((task, idx) => {
                          const taskState = day.deadlineStates[idx];
                          const stateColor =
                            taskState === "OVERDUE"
                              ? "bg-rose-500"
                              : taskState === "URGENT"
                              ? "bg-rose-500/70"
                              : taskState === "WARNING"
                              ? "bg-amber-500"
                              : taskState === "COMPLETED"
                              ? "bg-emerald-500"
                              : taskState === "UPCOMING"
                              ? "bg-blue-500"
                              : "bg-muted";

                          return (
                            <div
                              key={idx}
                              className={cn(
                                "w-2 h-2 rounded-full",
                                stateColor
                              )}
                              title={`${task.title} (${taskState})`}
                            />
                          );
                        })}
                        {hasMultipleTasks && day.tasks.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{day.tasks.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <CalendarDayModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        date={selectedDate}
        tasks={selectedTasks}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onCompleteTask={onCompleteTask}
      />
    </div>
  );
}
