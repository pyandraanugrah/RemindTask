"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { VALID_SUBJECT_COLOR_VALUES } from "@/lib/constants";

const validColorValues = VALID_SUBJECT_COLOR_VALUES;

const SubjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama mata kuliah wajib diisi")
    .max(100, "Nama mata kuliah maksimal 100 karakter"),
  color: z
    .string()
    .refine((val) => (validColorValues as readonly string[]).includes(val), {
      message: "Warna yang dipilih tidak valid",
    })
    .default("#3b82f6"),
});

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: {
    name?: string[];
    color?: string[];
  };
};

export async function getSubjects() {
  try {
    return await db.subject.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch subjects:", error);
    throw new Error("Gagal memuat daftar mata kuliah");
  }
}

export async function createSubject(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    name: formData.get("name"),
    color: formData.get("color") || "#3b82f6",
  };

  const validated = SubjectSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { name, color } = validated.data;

  try {
    const existing = await db.subject.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return {
        success: false,
        errors: {
          name: ["Mata kuliah dengan nama ini sudah ada"],
        },
      };
    }

    await db.subject.create({
      data: { name, color },
    });

    revalidatePath("/subjects");
    revalidatePath("/tasks");
    revalidatePath("/calendar");
    revalidatePath("/");
    return {
      success: true,
      message: "Mata kuliah berhasil ditambahkan",
    };
  } catch (error) {
    console.error("Failed to create subject:", error);
    return {
      success: false,
      message: "Gagal menyimpan mata kuliah. Silakan coba lagi.",
    };
  }
}

export async function updateSubject(
  id: string,
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    name: formData.get("name"),
    color: formData.get("color") || "#3b82f6",
  };

  const validated = SubjectSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { name, color } = validated.data;

  try {
    const existing = await db.subject.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        NOT: {
          id,
        },
      },
    });

    if (existing) {
      return {
        success: false,
        errors: {
          name: ["Mata kuliah dengan nama ini sudah ada"],
        },
      };
    }

    await db.subject.update({
      where: { id },
      data: { name, color },
    });

    revalidatePath("/subjects");
    revalidatePath("/tasks");
    revalidatePath("/calendar");
    revalidatePath("/");
    return {
      success: true,
      message: "Mata kuliah berhasil diperbarui",
    };
  } catch (error) {
    console.error("Failed to update subject:", error);
    return {
      success: false,
      message: "Gagal memperbarui mata kuliah. Silakan coba lagi.",
    };
  }
}

export async function deleteSubject(id: string): Promise<ActionState> {
  try {
    await db.subject.delete({
      where: { id },
    });

    revalidatePath("/subjects");
    revalidatePath("/tasks");
    revalidatePath("/calendar");
    revalidatePath("/");
    return {
      success: true,
      message: "Mata kuliah berhasil dihapus",
    };
  } catch (error) {
    console.error("Failed to delete subject:", error);
    return {
      success: false,
      message: "Gagal menghapus mata kuliah. Silakan coba lagi.",
    };
  }
}
