"use client";

import { Subject } from "@prisma/client";
import { Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubjectListProps {
  subjects: Subject[];
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

export function SubjectList({ subjects, onEdit, onDelete }: SubjectListProps) {
  if (subjects.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3">
      {subjects.map((subject) => (
        <div
          key={subject.id}
          className="flex items-center justify-between p-4 rounded-lg border hover:border-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-4 h-4 rounded-lg flex-shrink-0"
              style={{ backgroundColor: subject.color }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">{subject.name}</h3>
              <p className="text-xs text-muted-foreground">
                {new Date(subject.createdAt).toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(subject)}
              className="text-xs"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(subject)}
              className="text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
