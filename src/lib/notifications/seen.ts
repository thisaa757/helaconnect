// Sample notifications stay unread until the alerts page is opened.

const KEY = "hela-notifications-read";

export const NOTIFICATION_COUNT = 4;

const listeners = new Set<() => void>();

function readFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function getUnreadCount(): number {
  return readFlag() ? 0 : NOTIFICATION_COUNT;
}

export function getServerUnreadCount(): number {
  return 0;
}

export function subscribeUnread(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function markNotificationsRead() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    // The badge still clears for this visit.
  }
  listeners.forEach((listener) => listener());
}
