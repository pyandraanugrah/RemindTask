import { PageContainer, PageHeader, PageContent } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { TaskCard } from "@/components/tasks/task-card";
import { DeadlineCountdown } from "@/components/tasks/deadline-display";
import { db } from "@/lib/db";
import Link from "next/link";
import { CheckSquare, ArrowRight, AlertTriangle } from "lucide-react";
import { Task, Subject } from "@prisma/client";
import { getDeadlineState } from "@/lib/deadline";

// Always render with fresh data from the database (no static prerender/cache).
export const dynamic = "force-dynamic";

type TaskWithSubject = Task & { subject?: Subject | null };

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export default async function Dashboard() {
  const greeting = getGreeting();
  const date = formatDate(new Date());

  let tasks: TaskWithSubject[] = [];
  try {
    tasks = await db.task.findMany({
      include: { subject: true },
      orderBy: { deadline: "asc" },
    });
  } catch (error) {
    console.error("Failed to load dashboard tasks:", error);
  }

  const now = new Date();

  const activeTasks = tasks.filter((t) => t.status !== "COMPLETED");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
  const overdueTasks = activeTasks.filter((t) => getDeadlineState(t.deadline, t.status, now) === "OVERDUE");
  const dueSoonTasks = activeTasks.filter((t) => {
    const state = getDeadlineState(t.deadline, t.status, now);
    return state === "URGENT" || state === "WARNING";
  });

  const focusTasks = [...activeTasks]
    .sort((a, b) => {
      const aState = getDeadlineState(a.deadline, a.status, now);
      const bState = getDeadlineState(b.deadline, b.status, now);

      const aOverdue = aState === "OVERDUE" ? 1 : 0;
      const bOverdue = bState === "OVERDUE" ? 1 : 0;
      if (aOverdue !== bOverdue) return bOverdue - aOverdue;

      const aDeadlineMs = new Date(a.deadline).getTime() - now.getTime();
      const bDeadlineMs = new Date(b.deadline).getTime() - now.getTime();
      if (aDeadlineMs !== bDeadlineMs) return aDeadlineMs - bDeadlineMs;

      const priorityWeight: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const aPriority = priorityWeight[a.priority] || 0;
      const bPriority = priorityWeight[b.priority] || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;

      const aInProgress = a.status === "IN_PROGRESS" ? 1 : 0;
      const bInProgress = b.status === "IN_PROGRESS" ? 1 : 0;
      if (aInProgress !== bInProgress) return bInProgress - aInProgress;

      return b.progress - a.progress;
    })
    .slice(0, 3);

  const upcomingTasks = activeTasks
    .filter((t) => getDeadlineState(t.deadline, t.status, now) !== "OVERDUE")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description={`${greeting}! Today is ${date}.`}
      />
      <PageContent>
        <div className="grid gap-8">
          {/* In-app reminder summary (PRD §17) */}
          {(overdueTasks.length > 0 || dueSoonTasks.length > 0) && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-sm text-foreground">
                {overdueTasks.length > 0 && (
                  <span className="font-medium">
                    Anda punya {overdueTasks.length} tugas terlambat
                  </span>
                )}
                {overdueTasks.length > 0 && dueSoonTasks.length > 0 && " · "}
                {dueSoonTasks.length > 0 && (
                  <span>
                    {dueSoonTasks.length} tugas jatuh tempo dalam 3 hari
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-5 rounded-xl border bg-input/40">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-medium">
                Active Tasks
              </div>
              <div className="text-3xl font-semibold text-foreground">{activeTasks.length}</div>
            </div>
            <div className="p-5 rounded-xl border bg-input/40">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-medium">
                Due Soon
              </div>
              <div className={`text-3xl font-semibold ${dueSoonTasks.length > 0 ? "text-amber-500" : "text-foreground"}`}>
                {dueSoonTasks.length}
              </div>
            </div>
            <div className="p-5 rounded-xl border bg-input/40">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-medium">
                Overdue
              </div>
              <div className={`text-3xl font-semibold ${overdueTasks.length > 0 ? "text-rose-500" : "text-foreground"}`}>
                {overdueTasks.length}
              </div>
            </div>
            <div className="p-5 rounded-xl border bg-input/40">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-medium">
                Completed
              </div>
              <div className="text-3xl font-medium text-muted-foreground">{completedTasks.length}</div>
            </div>
          </div>

          {tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description="Add your first assignment and start organizing your work."
              action={
                <Link href="/tasks">
                  <Button variant="primary">+ Add Task</Button>
                </Link>
              }
            />
          ) : (
            <>
              {/* Today's Focus */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Today&apos;s Focus</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Prioritas tugas yang memerlukan perhatian Anda sekarang
                    </p>
                  </div>
                  {activeTasks.length > 3 && (
                    <Link href="/tasks">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <CheckSquare className="w-4 h-4 mr-1" />
                        View all tasks ({activeTasks.length})
                      </Button>
                    </Link>
                  )}
                </div>

                {focusTasks.length === 0 ? (
                  <div className="p-6 rounded-lg border text-center text-sm text-muted-foreground">
                    Semua tugas aktif sudah selesai!
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {focusTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Tasks & Recent Tasks (2 Column on Desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upcoming Deadlines */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-foreground">Upcoming Deadlines</h2>
                    <Link href="/tasks" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                      All <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  {upcomingTasks.length === 0 ? (
                    <div className="p-4 rounded-lg border text-center text-xs text-muted-foreground">
                      Tidak ada deadline mendatang
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {upcomingTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start justify-between p-3.5 rounded-lg border hover:bg-input/20 transition-colors gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {task.title}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                              {task.subject && (
                                <span className="flex items-center gap-1">
                                  <span
                                    className="w-2 h-2 rounded-full inline-block"
                                    style={{ backgroundColor: task.subject.color }}
                                  />
                                  {task.subject.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <DeadlineCountdown
                              deadline={task.deadline}
                              status={task.status}
                              showRelativeLabel={false}
                              showExact={false}
                              className="text-xs text-muted-foreground"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Tasks */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-foreground">Recent Tasks</h2>
                    <Link href="/tasks" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                      All <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  {recentTasks.length === 0 ? (
                    <div className="p-4 rounded-lg border text-center text-xs text-muted-foreground">
                      Belum ada riwayat aktivitas
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {recentTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3.5 rounded-lg border"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                            <div
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                task.status === "COMPLETED"
                                  ? "bg-emerald-500"
                                  : task.status === "IN_PROGRESS"
                                  ? "bg-accent"
                                  : "bg-muted-foreground"
                              }`}
                            />
                            <span
                              className={`text-sm font-medium truncate ${
                                task.status === "COMPLETED" ? "line-through text-muted-foreground" : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0 capitalize">
                            {task.status.replace("_", " ").toLowerCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Quick Action footer */}
          <div className="p-6 rounded-xl border bg-input/30 text-center">
            <h3 className="text-base font-medium mb-1 text-foreground">Siap mulai belajar?</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Tambahkan tugas baru untuk mengatur jadwal kuliah Anda
            </p>
            <Link href="/tasks">
              <Button variant="primary" size="md">
                + Tambah Tugas Baru
              </Button>
            </Link>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
}
