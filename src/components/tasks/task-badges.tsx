import { Badge } from "@/components/ui/badge";
import { TaskPriority, TaskStatus } from "@prisma/client";

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  switch (priority) {
    case "HIGH":
      return <Badge variant="danger">High</Badge>;
    case "MEDIUM":
      return <Badge variant="warning">Medium</Badge>;
    case "LOW":
      return <Badge variant="muted">Low</Badge>;
  }
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  switch (status) {
    case "COMPLETED":
      return <Badge variant="success">Completed</Badge>;
    case "IN_PROGRESS":
      return <Badge variant="default">In Progress</Badge>;
    case "TODO":
      return <Badge variant="muted">To Do</Badge>;
  }
}
