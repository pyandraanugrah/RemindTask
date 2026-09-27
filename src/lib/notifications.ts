/**
 * Simple Notification API helpers.
 *
 * Important constraint (PRD §17): this app does NOT run a background worker,
 * service worker, Redis, or queue. Browser notifications therefore only fire
 * *while the app is open in a tab*. We never pretend they will arrive when the
 * browser is fully closed.
 */

export type NotificationSupport = "unsupported" | "default" | "granted" | "denied";

export function getNotificationSupport(): NotificationSupport {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function canNotify(): boolean {
  return isNotificationSupported() && Notification.permission === "granted";
}

/**
 * Ask the user for notification permission.
 * Returns the current permission if already decided — never spams the prompt.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return "denied";
  }

  if (Notification.permission !== "default") {
    return Notification.permission;
  }

  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

interface NotifyOptions {
  title: string;
  body: string;
}

/**
 * Show a browser notification if permission has been granted.
 * Returns true when a notification was actually shown.
 */
export function showNotification({ title, body }: NotifyOptions): boolean {
  if (!canNotify()) {
    return false;
  }

  try {
    new Notification(title, {
      body,
      icon: "/favicon.svg",
      tag: "remindtask-reminder",
    });
    return true;
  } catch {
    return false;
  }
}
