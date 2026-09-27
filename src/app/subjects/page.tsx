import { PageContainer, PageHeader, PageContent } from "@/components/page-shell";
import { getSubjects } from "@/lib/actions/subjects";
import { SubjectsClient } from "@/components/subjects/subjects-client";
import { ErrorState } from "@/components/error-state";
import { Subject } from "@prisma/client";

// Always render with fresh data from the database (no static prerender/cache).
export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  let subjects: Subject[] = [];
  let hasError = false;

  try {
    subjects = await getSubjects();
  } catch (error) {
    console.error("Failed to load subjects:", error);
    hasError = true;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Mata Kuliah"
        description="Kelola mata kuliah Anda untuk mengorganisir tugas."
      />
      <PageContent>
        {hasError ? (
          <ErrorState
            title="Gagal memuat mata kuliah"
            description="Terjadi kesalahan saat mengambil data. Silakan muat ulang halaman."
          />
        ) : (
          <SubjectsClient subjects={subjects} />
        )}
      </PageContent>
    </PageContainer>
  );
}
