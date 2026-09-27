"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";
import {
  getRemindersToNotify,
  markRemindersAsSent,
  type ReminderWithTask,
} from "@/lib/actions/reminders";
import {
  canNotify,
  isNotificationSupported,
  requestNotificationPermission,
  showNotification,
} from "@/lib/notifications";
import { Button } from "@/components/ui/button";

const CHECK_INTERVAL_MS = 60_000; // check once per minute while app is open

const emptySubscribe = () => () => {};

/**
 * Reads the browser's current notification permission without triggering a
 * setState-in-effect (React 19 lint rule). Returns "unsupported" on the server.
 */
function useNotificationPermission(): NotificationPermission | "unsupported" {
  return useSyncExternalStore(
    emptySubscribe,
    () =>
      isNotificationSupported()
        ? Notification.permission
        : ("unsupported" as const),
    () => "default" as NotificationPermission
  );
}

/**
 * In-app reminder banner + browser notification dispatcher.
 *
 * Architecture (per PRD §17): simple client-side polling while the app is open.
 * No service worker, no Redis, no queue, no background worker. Notifications
 * do NOT run when the browser is fully closed — this is intentional and honest.
 */
export function ReminderWatcher() {
  const [dueReminders, setDueReminders] = useState<ReminderWithTask[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [permissionOverride, setPermissionOverride] = useState<
    NotificationPermission | null
  >(null);
  const [permissionDismissed, setPermissionDismissed] = useState(false);
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  const queriedPermission = useNotificationPermission();
  const permission = permissionOverride ?? queriedPermission;

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const reminders = await getRemindersToNotify(new Date());
        if (cancelled) return;

        // Filter out ones already notified this session
        const fresh = reminders.filter((r) => !notifiedIdsRef.current.has(r.id));
        if (fresh.length === 0) return;

        // Browser notification for each fresh reminder (if granted)
        if (canNotify()) {
          fresh.forEach((r) => {
            const shown = showNotification({
              title: `Reminder: ${r.task.title}`,
              body: `${r.task.subject?.name || "Tugas"} · deadline ${new Date(
                r.task.deadline
              ).toLocaleString("id-ID")}`,
            });
            if (shown) notifiedIdsRef.current.add(r.id);
          });
        } else {
          // Mark as notified-in-session so the in-app banner still shows
          fresh.forEach((r) => notifiedIdsRef.current.add(r.id));
        }

        setDueReminders((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const merged = [...prev, ...fresh.filter((f) => !ids.has(f.id))];
          return merged;
        });

        // Persist sent state so we don't re-fire after reload
        await markRemindersAsSent(fresh.map((r) => r.id));
      } catch (error) {
        console.error("Reminder check failed:", error);
      }
    };

    check();
    const timer = setInterval(check, CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setPermissionOverride(result);
  };

  const showPermissionPrompt =
    permission === "default" && !permissionDismissed;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-[calc(100%-2rem)] sm:w-full">
      {/* Permission prompt — asked once, dismissible */}
      {showPermissionPrompt && (
        <div className="rounded-lg border border-border bg-background shadow-lg p-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                Aktifkan notifikasi browser?
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Kami akan mengingatkan Anda saat deadline dekat — hanya selama
                aplikasi terbuka.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="primary" onClick={handleEnableNotifications}>
                  Aktifkan
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPermissionDismissed(true)}
                >
                  Nanti
                </Button>
              </div>
            </div>
            <button
              onClick={() => setPermissionDismissed(true)}
              className="text-muted-foreground hover:text-foreground p-1"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {permission === "unsupported" && !permissionDismissed && (
        <div className="rounded-lg border border-border bg-background shadow-lg p-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                Notifikasi tidak didukung
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Browser ini tidak mendukung notifikasi. Pengingat tetap muncul
                di dalam aplikasi.
              </p>
            </div>
            <button
              onClick={() => setPermissionDismissed(true)}
              className="text-muted-foreground hover:text-foreground p-1"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {permission === "denied" && !permissionDismissed && (
        <div className="rounded-lg border border-border bg-background shadow-lg p-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                Notifikasi diblokir
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Anda menolak izin notifikasi. Pengingat tetap muncul di dalam
                aplikasi. Ubah izin melalui pengaturan situs di browser Anda.
              </p>
            </div>
            <button
              onClick={() => setPermissionDismissed(true)}
              className="text-muted-foreground hover:text-foreground p-1"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* In-app due reminders banner */}
      {dueReminders.length > 0 && !dismissed && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 shadow-lg p-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {dueReminders.length} pengingat tugas
              </p>
              <ul className="mt-2 space-y-1.5">
                {dueReminders.slice(0, 3).map((r) => (
                  <li key={r.id} className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{r.task.title}</span>
                    {" · "}
                    {new Date(r.task.deadline).toLocaleString("id-ID")}
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <Link href="/tasks">
                  <Button size="sm" variant="ghost" className="text-xs px-0">
                    Lihat tugas →
                  </Button>
                </Link>
              </div>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-muted-foreground hover:text-foreground p-1"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
