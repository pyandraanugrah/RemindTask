"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { SubjectForm } from "@/components/subjects/subject-form";
import { SubjectList } from "@/components/subjects/subject-list";
import {
  createSubject,
  updateSubject,
  deleteSubject,
  type ActionState,
} from "@/lib/actions/subjects";
import { Subject } from "@prisma/client";

interface SubjectsClientProps {
  subjects: Subject[];
}

export function SubjectsClient({ subjects }: SubjectsClientProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [actionErrors, setActionErrors] = useState<{ [key: string]: string[] } | null>(null);

  const showFeedback = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCreate = async (formData: FormData): Promise<ActionState> => {
    setActionErrors(null);
    const result = await createSubject(null, formData);

    if (result.success) {
      setIsCreateOpen(false);
      showFeedback(result.message || "Mata kuliah berhasil ditambahkan", "success");
      router.refresh();
    } else {
      if (result.errors) {
        setActionErrors(result.errors);
      }
      if (result.message) {
        showFeedback(result.message, "error");
      }
    }
    return result;
  };

  const handleEdit = async (formData: FormData): Promise<ActionState> => {
    if (!selectedSubject) return { success: false };
    setActionErrors(null);
    const result = await updateSubject(selectedSubject.id, null, formData);

    if (result.success) {
      setIsEditOpen(false);
      showFeedback(result.message || "Mata kuliah berhasil diperbarui", "success");
      router.refresh();
    } else {
      if (result.errors) {
        setActionErrors(result.errors);
      }
      if (result.message) {
        showFeedback(result.message, "error");
      }
    }
    return result;
  };

  const handleDelete = async () => {
    if (!selectedSubject) return;
    const result = await deleteSubject(selectedSubject.id);

    if (result.success) {
      setIsDeleteConfirmOpen(false);
      showFeedback(result.message || "Mata kuliah berhasil dihapus", "success");
      router.refresh();
    } else {
      showFeedback(result.message || "Gagal menghapus mata kuliah", "error");
    }
  };

  const openEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setActionErrors(null);
    setIsEditOpen(true);
  };

  const openDelete = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteConfirmOpen(true);
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Mata Kuliah
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

      {subjects.length === 0 ? (
        <EmptyState
          title="Belum ada mata kuliah"
          description="Tambahkan mata kuliah pertama Anda untuk mulai mengorganisasi tugas kuliah."
          action={
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              + Tambah Mata Kuliah
            </Button>
          }
        />
      ) : (
        <SubjectList subjects={subjects} onEdit={openEdit} onDelete={openDelete} />
      )}

      {/* Dialog Create */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Tambah Mata Kuliah"
        description="Buat mata kuliah baru untuk mengelompokkan tugas Anda."
      >
        {actionErrors?.name && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
            {actionErrors.name[0]}
          </div>
        )}
        <SubjectForm onSubmit={handleCreate} />
      </Dialog>

      {/* Dialog Edit */}
      {selectedSubject && (
        <Dialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          title="Edit Mata Kuliah"
          description="Ubah nama atau warna mata kuliah."
        >
          {actionErrors?.name && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
              {actionErrors.name[0]}
            </div>
          )}
          <SubjectForm
            onSubmit={handleEdit}
            defaultValues={{
              name: selectedSubject.name,
              color: selectedSubject.color,
            }}
          />
        </Dialog>
      )}

      {/* Dialog Delete Confirmation */}
      <Dialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Hapus Mata Kuliah"
        description="Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin?"
      >
        {selectedSubject && (
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-input text-sm flex items-center gap-3">
              <div
                className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedSubject.color }}
              />
              <span className="font-medium text-foreground">{selectedSubject.name}</span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
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
