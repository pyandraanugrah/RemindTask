"use client";

import { Subject } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  DeadlineFilter,
  PriorityFilter,
  StatusFilter,
  TaskFilterOptions,
  hasActiveFilters,
} from "@/lib/task-filter";

interface TaskFiltersProps {
  subjects: Subject[];
  onFilterChange: (filters: TaskFilterOptions) => void;
  filters: TaskFilterOptions;
}

const STATUSES: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

const PRIORITIES: { value: PriorityFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const DEADLINES: { value: DeadlineFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "TODAY", label: "Today" },
  { value: "THIS_WEEK", label: "This Week" },
  { value: "UPCOMING", label: "Upcoming" },
];

export function TaskFilters({
  subjects,
  onFilterChange,
  filters,
}: TaskFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      search: e.target.value,
    });
  };

  const handleFilterChange = <K extends keyof TaskFilterOptions>(
    key: K,
    value: TaskFilterOptions[K]
  ) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const handleReset = () => {
    onFilterChange({
      search: "",
      subjectId: "ALL",
      priority: "ALL",
      status: "ALL",
      deadline: "ALL",
    });
  };

  const active = hasActiveFilters(filters);

  return (
    <div className="space-y-4 mb-6">
      {/* Search Input */}
      <div>
        <Input
          type="text"
          placeholder="Cari tugas berdasarkan judul, deskripsi, atau mata kuliah..."
          value={filters.search || ""}
          onChange={handleSearchChange}
          className="w-full"
        />
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
            Status
          </label>
          <select
            value={filters.status || "ALL"}
            onChange={(e) => handleFilterChange("status", e.target.value as StatusFilter)}
            className="flex h-10 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
            Priority
          </label>
          <select
            value={filters.priority || "ALL"}
            onChange={(e) => handleFilterChange("priority", e.target.value as PriorityFilter)}
            className="flex h-10 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Deadline Filter */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
            Deadline
          </label>
          <select
            value={filters.deadline || "ALL"}
            onChange={(e) => handleFilterChange("deadline", e.target.value as DeadlineFilter)}
            className="flex h-10 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {DEADLINES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Filter */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
            Subject
          </label>
          <select
            value={filters.subjectId || "ALL"}
            onChange={(e) => handleFilterChange("subjectId", e.target.value)}
            className="flex h-10 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="ALL">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reset Button */}
      {active && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3 mr-1" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
