const NOTIFICATION_KEY = "ai_finance_tracker_notifications_enabled";
const SCHEDULE_KEY = "ai_finance_tracker_notification_schedule";
let scheduledTimers = [];

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch (error) {
    console.error("Service worker registration failed:", error);
    return null;
  }
}

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationsEnabled() {
  return notificationsSupported() && Notification.permission === "granted" && localStorage.getItem(NOTIFICATION_KEY) === "true";
}

export async function enableNotifications() {
  if (!notificationsSupported()) throw new Error("Notifications are not supported in this browser.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission was not allowed.");

  localStorage.setItem(NOTIFICATION_KEY, "true");
  await registerServiceWorker();
  scheduleLocalNotifications();
  return true;
}

export function disableNotifications() {
  localStorage.removeItem(NOTIFICATION_KEY);
  localStorage.removeItem(SCHEDULE_KEY);
}

async function showNotification(title, body) {
  if (!notificationsEnabled()) return;

  const registration = await navigator.serviceWorker?.ready;
  if (registration?.showNotification) {
    await registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "ai-finance-tracker",
      renotify: false,
      data: { url: "/" },
    });
  } else if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/icon-192.png" });
  }
}

function getNextDailyTarget(hour, minute = 0) {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target;
}

function getNextMonthlyTarget(day) {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), day, 9, 0, 0, 0);
  if (target <= now) target.setMonth(target.getMonth() + 1);
  return target;
}

function schedule(label, target, title, body) {
  const delay = Math.max(target.getTime() - Date.now(), 1000);
  const timer = window.setTimeout(async () => {
    await showNotification(title, body);
    scheduleLocalNotifications();
  }, delay);
  scheduledTimers.push(timer);

  return { label, at: target.toISOString() };
}

export function scheduleLocalNotifications() {
  scheduledTimers.forEach((timer) => window.clearTimeout(timer));
  scheduledTimers = [];
  if (!notificationsEnabled()) return;

  const jobs = [
    schedule("morning", getNextDailyTarget(7), "🌅 Morning finance check", "Don't forget to track today's expenses."),
    schedule("noon", getNextDailyTarget(12), "💰 Midday finance check", "Have you made any expenses today? Add them now."),
    schedule("evening", getNextDailyTarget(19), "📊 Day-end finance check", "Add today's remaining expenses before you finish the day."),
    schedule("month-start", getNextMonthlyTarget(1), "💼 Monthly income update", "Did your salary, allowance or other regular income change? Update your profile."),
    schedule("month-five", getNextMonthlyTarget(5), "🔔 Income update reminder", "If you haven't updated your salary, allowance or income yet, check your profile."),
  ];

  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(jobs));
}

export function initNotificationScheduling() {
  if (notificationsEnabled()) scheduleLocalNotifications();
}
