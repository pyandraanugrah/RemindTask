import { PageContainer, PageHeader, PageContent } from "@/components/page-shell";
import { CalendarClient } from "@/components/calendar/calendar-client";
import { EmptyState } from "@/components/empty-state";
import { getTasks } from "@/lib/actions/tasks";
import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { Task, Subject } from "@prisma/client";

type TaskWithSubject = Task & { subject?: Subject | null };

export default async function CalendarPage() {
  let tasks: TaskWithSubject[] = [];
  let hasError = false;

  try {
    tasks = await getTasks();
  } catch (error) {
    console.error("Failed to load calendar tasks:", error);
    hasError = true;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Calendar"
        description="Lihat deadline tugas Anda dalam satu visualisasi bulanan."
      />
      <PageContent>
        {hasError ? (
          <ErrorState
            title="Gagal memuat kalender"
            description="Terjadi kesalahan saat mengambil data. Silakan muat ulang halaman."
          />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon className="w-8 h-8 text-muted-foreground" />}
            title="Kalender kosong"
            description="Belum ada tugas dengan deadline. Buat tugas pertama Anda untuk melihatnya di sini."
            action={
              <Link href="/tasks">
                <Button variant="primary">+ Tambah Tugas</Button>
              </Link>
            }
          />
        ) : (
          <CalendarClient tasks={tasks} />
        )}
      </PageContent>
    </PageContainer>
  );
}
