"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onOpenChange(false);
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onOpenChange]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "p-6 rounded-lg backdrop:bg-black/50 backdrop:backdrop-blur-sm bg-background border border-border text-foreground shadow-lg max-w-md w-full",
        "open:animate-in open:fade-in-0 open:zoom-in-95",
        "fixed inset-0 m-auto"
      )}
    >
      <div className="flex items-center justify-between pb-4">
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        <button
          onClick={() => onOpenChange(false)}
          className="p-1 rounded-md hover:bg-input text-muted-foreground hover:text-foreground"
          aria-label="Tutup dialog"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {description && (
        <p className="text-sm text-muted-foreground pb-4">{description}</p>
      )}

      {children}
    </dialog>
  );
}
