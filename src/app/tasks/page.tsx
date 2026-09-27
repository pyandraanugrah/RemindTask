import { PageContainer, PageHeader, PageContent } from "@/components/page-shell";
import { getSubjects } from "@/lib/actions/subjects";
import { getTasks } from "@/lib/actions/tasks";
import { TasksClient } from "@/components/tasks/tasks-client";
import { ErrorState } from "@/components/error-state";
import { Subject, Task } from "@prisma/client";

// Always render with fresh data from the database (no static prerender/cache).
export const dynamic = "force-dynamic";

export default async function TasksPage() {
  let tasks: Task[] = [];
  let subjects: Subject[] = [];
  let hasError = false;

  try {
    const [tasksData, subjectsData] = await Promise.all([getTasks(), getSubjects()]);
    tasks = tasksData;
    subjects = subjectsData;
  } catch (error) {
    console.error("Failed to load tasks:", error);
    hasError = true;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Tasks"
        description="Kelola semua tugas dan deadline Anda."
      />
      <PageContent>
        {hasError ? (
          <ErrorState
            title="Gagal memuat tugas"
            description="Terjadi kesalahan saat mengambil data. Silakan muat ulang halaman."
          />
        ) : (
          <TasksClient tasks={tasks} subjects={subjects} />
        )}
      </PageContent>
    </PageContainer>
  );
}
