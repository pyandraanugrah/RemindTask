"use client";

import { TaskStatus } from "@prisma/client";
import {
  DeadlineState,
  getDeadlineState,
  formatCountdown,
  formatExactDeadline,
  getDeadlineRelativeLabel,
} from "@/lib/deadline";
import { Clock, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

interface DeadlineBadgeProps {
  state: DeadlineState;
  className?: string;
}

export function DeadlineBadge({ state, className }: DeadlineBadgeProps) {
  switch (state) {
    case "OVERDUE":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-rose-500 text-white",
            className
          )}
        >
          <AlertCircle className="w-3 h-3" />
          Overdue
        </span>
      );
    case "URGENT":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-semibold",
            className
          )}
        >
          <AlertTriangle className="w-3 h-3" />
          Urgent
        </span>
      );
    case "WARNING":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
            className
          )}
        >
          <Clock className="w-3 h-3" />
          Warning
        </span>
      );
    case "UPCOMING":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
            className
          )}
        >
          Upcoming
        </span>
      );
    case "COMPLETED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
            className
          )}
        >
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </span>
      );
    case "NORMAL":
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground",
            className
          )}
        >
          Normal
        </span>
      );
  }
}

/**
 * Subscribes to a lightweight in-browser interval. No network requests or
 * database queries are performed — only in-memory React state is refreshed.
 * The interval is disposed of automatically when the component unmounts.
 */
function subscribeToInterval(intervalMs: number) {
  return (callback: () => void) => {
    const timer = setInterval(callback, intervalMs);
    return () => clearInterval(timer);
  };
}

export function useCurrentTime(intervalMs = 30_000) {
  const subscribe = useMemo(() => subscribeToInterval(intervalMs), [intervalMs]);
  const tick = useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / intervalMs),
    () => 0
  );
  // Always use tick * intervalMs — on client, tick is correct immediately.
  // On server, tick is 0 (epoch), which is acceptable for SSR.
  return useMemo(() => new Date(tick * intervalMs), [tick, intervalMs]);
}

const emptySubscribe = () => () => {};

/**
 * Returns `false` during server rendering and `true` after the component has
 * mounted on the client. Unlike a `useEffect` + `setState` pair this does not
 * trigger a cascading render and is safe for hydration-sensitive output.
 */
export function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function useDeadlineCountdown(
  deadline: Date | string | number,
  status: TaskStatus,
  intervalMs = 30_000
) {
  const now = useCurrentTime(intervalMs);
  const mounted = useIsMounted();

  const state = getDeadlineState(deadline, status, now);
  const countdown = formatCountdown(deadline, status, now);
  const relative = getDeadlineRelativeLabel(deadline, now);
  // Formatting an absolute timestamp depends on the browser's timezone, so it
  // is only rendered after mount to avoid SSR/client hydration mismatches.
  const exact = mounted ? formatExactDeadline(deadline) : "";

  return { state, countdown, relative, exact, mounted, now };
}

interface DeadlineCountdownProps {
  deadline: Date | string;
  status: TaskStatus;
  showRelativeLabel?: boolean;
  showExact?: boolean;
  className?: string;
}

export function DeadlineCountdown({
  deadline,
  status,
  showRelativeLabel = false,
  showExact = true,
  className,
}: DeadlineCountdownProps) {
  const { state, countdown, relative, exact, mounted } = useDeadlineCountdown(
    deadline,
    status
  );

  const stateColors: Record<DeadlineState, string> = {
    OVERDUE: "text-rose-600 dark:text-rose-400 font-medium",
    URGENT: "text-rose-600 dark:text-rose-400 font-medium",
    WARNING: "text-amber-600 dark:text-amber-400 font-medium",
    UPCOMING: "text-blue-600 dark:text-blue-400",
    NORMAL: "text-muted-foreground",
    COMPLETED: "text-muted-foreground",
  };

  return (
    <div className={cn("flex flex-col text-xs", className)}>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={cn("flex items-center gap-1", stateColors[state])}>
          <Clock className="w-3 h-3 flex-shrink-0" />
          {countdown}
        </span>
        {showRelativeLabel && state !== "COMPLETED" && (
          <span className="text-muted-foreground">· {relative}</span>
        )}
      </div>
      {showExact && (
        <span className="text-muted-foreground text-[11px] mt-0.5 min-h-[1em]">
          {mounted ? exact : "\u00A0"}
        </span>
      )}
    </div>
  );
}
