"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorPicker } from "./color-picker";
import { useState } from "react";
import { ActionState } from "@/lib/actions/subjects";

interface SubjectFormProps {
  onSubmit: (formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    name: string;
    color: string;
  };
}

export function SubjectForm({ onSubmit, defaultValues }: SubjectFormProps) {
  const { pending } = useFormStatus();
  const [color, setColor] = useState(defaultValues?.color || "#3b82f6");
  const [errors, setErrors] = useState<{ [key: string]: string[] } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    const result = await onSubmit(formData);
    if (!result.success && result.errors) {
      setErrors(result.errors);
    } else {
      setErrors(null);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-4 pt-2">
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Nama Mata Kuliah <span className="text-rose-500">*</span>
        </label>
        <Input
          type="text"
          name="name"
          placeholder="Contoh: Pemrograman Web"
          defaultValue={defaultValues?.name || ""}
          disabled={pending}
          required
          className={errors?.name ? "border-rose-500" : ""}
        />
        {errors?.name && (
          <p className="text-xs text-rose-500 mt-1">{errors.name[0]}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">Nama unik untuk mata kuliah Anda</p>
      </div>

      <ColorPicker value={color} onChange={setColor} />

      <div className="flex gap-2 pt-4">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Menyimpan..." : defaultValues ? "Perbarui" : "Tambahkan"}
        </Button>
      </div>
    </form>
  );
}
