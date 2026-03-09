import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Request notification permissions from the user.
 * Returns true if granted, false otherwise.
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted.');
        return false;
    }

    // Android requires a notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('score100-coach', {
            name: 'Score 100 Coach',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#3B82F6',
        });
    }

    return true;
};

/**
 * Schedule the recurring 7:00 AM "Morning Call" notification.
 * Fires daily to remind the user to start planning.
 */
export const scheduleMorningCall = async () => {
    // Cancel any existing morning call first to avoid duplicates
    await cancelNotificationsByTag('morning-call');

    await Notifications.scheduleNotificationAsync({
        content: {
            title: '☀️ Rise & Score',
            body: 'The board is empty. 100 points of potential are waiting. Plan your day.',
            data: { tag: 'morning-call' },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 7,
            minute: 0,
        },
    });
};

/**
 * Schedule the recurring 9:00 PM "Night Prior" planning reminder.
 * Encourages users to plan tomorrow's tasks tonight.
 */
export const scheduleNightPriorReminder = async () => {
    await cancelNotificationsByTag('night-prior');

    await Notifications.scheduleNotificationAsync({
        content: {
            title: '🌙 Plan Tomorrow',
            body: "Plan your tomorrow. 100 points of focus are waiting. Set your targets now.",
            data: { tag: 'night-prior' },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 21,
            minute: 0,
        },
    });
};

/**
 * Schedule a task "Start Nudge" — fires 2 minutes before startTime.
 */
export const scheduleTaskStartNudge = async (taskId: string, taskName: string, points: number, startTime: string) => {
    const fireDate = parseTimeToDate(startTime);
    if (!fireDate) return;

    // 2 minutes before
    fireDate.setMinutes(fireDate.getMinutes() - 2);

    // Don't schedule if the time has already passed
    if (fireDate <= new Date()) return;

    await Notifications.scheduleNotificationAsync({
        content: {
            title: '🎯 Lock In',
            body: `"${taskName}" starts in 2 mins. ${points} points on the line. Focus up.`,
            data: { tag: `task-start-${taskId}` },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: fireDate,
        },
    });
};

/**
 * Schedule a task "Overrun Check" — fires 5 minutes after endTime.
 */
export const scheduleTaskOverrunCheck = async (taskId: string, taskName: string, endTime: string) => {
    const fireDate = parseTimeToDate(endTime);
    if (!fireDate) return;

    // 5 minutes after
    fireDate.setMinutes(fireDate.getMinutes() + 5);

    if (fireDate <= new Date()) return;

    await Notifications.scheduleNotificationAsync({
        content: {
            title: '⏰ Check-In',
            body: `Did you finish "${taskName}"? Or are we slipping? Mark it now.`,
            data: { tag: `task-overrun-${taskId}` },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: fireDate,
        },
    });
};

/**
 * Schedule all notifications for a set of tasks.
 */
export const scheduleAllTaskNotifications = async (tasks: { id: string; name: string; points: number; startTime: string; endTime: string }[]) => {
    // Cancel all existing task notifications first
    await cancelAllTaskNotifications();

    for (const task of tasks) {
        await scheduleTaskStartNudge(task.id, task.name, task.points, task.startTime);
        await scheduleTaskOverrunCheck(task.id, task.name, task.endTime);
    }
};

/**
 * Cancel all scheduled task-specific notifications.
 */
export const cancelAllTaskNotifications = async () => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
        const tag = (notif.content.data as any)?.tag as string | undefined;
        if (tag && (tag.startsWith('task-start-') || tag.startsWith('task-overrun-'))) {
            await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
    }
};

/**
 * Cancel notifications by their custom tag.
 */
const cancelNotificationsByTag = async (tag: string) => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
        if ((notif.content.data as any)?.tag === tag) {
            await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
    }
};

/**
 * Parse a time string like "09:00 AM" into a Date object for today.
 */
const parseTimeToDate = (timeStr: string): Date | null => {
    try {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    } catch {
        return null;
    }
};

/**
 * Schedule "Habit Late Reminders" — fires 1 hour after the habit's scheduled time.
 * If intervalHours is set, it schedules a recurring reminder every X hours.
 */
export const scheduleHabitLateReminders = async (loopItems: { id: string; name: string; time: string; intervalHours?: number }[]) => {
    // Cancel any existing habit reminders
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
        const tag = (notif.content.data as any)?.tag as string | undefined;
        if (tag && tag.startsWith('habit-late-')) {
            await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
    }

    for (const item of loopItems) {
        if (item.intervalHours && item.intervalHours > 0) {
            // Recurring Interval Nudge (e.g. Every 3 hours)
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '➰ Loop Rhythm',
                    body: `Time for your "${item.name}" habit. Keep the rhythm.`,
                    data: { tag: `habit-late-${item.id}` },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: item.intervalHours * 3600,
                    repeats: true,
                },
            });
        } else {
            // Single Daily Late Reminder
            const fireDate = parseTimeToDate(item.time);
            if (!fireDate) continue;

            // 1 hour after
            fireDate.setHours(fireDate.getHours() + 1);

            // Don't schedule if the time has already passed today
            if (fireDate <= new Date()) continue;

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '📈 Habit Check-In',
                    body: `Did you complete your "${item.name}" habit? Don't let the score tax hit you.`,
                    data: { tag: `habit-late-${item.id}` },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: fireDate,
                },
            });
        }
    }
};

/**
 * Initialize all recurring notifications (Morning Call + Night Prior).
 * Call this once on app startup after permissions are granted.
 */
export const initializeRecurringNotifications = async (loopItems: { id: string; name: string; time: string; intervalHours?: number }[]) => {
    const granted = await requestNotificationPermissions();
    if (!granted) return;

    await scheduleMorningCall();
    await scheduleNightPriorReminder();
    await scheduleHabitLateReminders(loopItems);
};
