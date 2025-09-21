import * as Notifications from 'expo-notifications';
import CustomToast from '@/components/common/CustomToast';
import { Platform } from 'react-native';

// notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// Android notification channel
if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('reminders', {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6761d7ff',
    });
}

// request permission
export async function requestNotificationPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        CustomToast.info(
            "You won't get notifications!",
            'Enable notifications to get reminders.',
            6000
        );
        return false;
    }

    return true;
}

// cancel a list of notifications
export async function cancelNotifications(ids) {
    if (!ids) return;
    if (Array.isArray(ids)) {
        for (const id of ids) {
            await Notifications.cancelScheduledNotificationAsync(id);
        }
    } else {
        await Notifications.cancelScheduledNotificationAsync(ids);
    }
}

// cancel all scheduled notifications for the app
export async function cancelAllNotifications() {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
    console.log('All scheduled notifications canceled');
}

// schedule upcoming notifications for the next `daysAhead` days
export async function scheduleReminderNotification(reminder, daysAhead = 7) {
    if (!reminder.time) return [];

    const [hour, minute] = reminder.time.split(':').map(Number);
    const notifications = [];
    const startDate = new Date(reminder.date || new Date());

    for (let i = 0; i < daysAhead; i++) {
        const current = new Date(startDate);

        if (reminder.repeat === 'Daily') {
            current.setDate(startDate.getDate() + i);
        } else if (reminder.repeat === 'Weekly') {
            current.setDate(startDate.getDate() + i);
            if (current.getDay() !== startDate.getDay()) continue;
        } else if (reminder.repeat === 'Monthly') {
            const monthIndex = startDate.getMonth() + i;
            const year = startDate.getFullYear() + Math.floor(monthIndex / 12);
            const month = monthIndex % 12;
            const day = Math.min(
                startDate.getDate(),
                new Date(year, month + 1, 0).getDate()
            );
            current.setFullYear(year, month, day);
        } else {
            current.setDate(startDate.getDate());
        }

        current.setHours(hour, minute, 0, 0);

        // skip past notifications
        if (current <= new Date()) continue;

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: reminder.title,
                body: reminder.notes || '',
                sound: 'default',
            },
            trigger: { type: 'date', date: current },
        });

        notifications.push(id);
    }

    return notifications;
}

// reschedule all upcoming notifications (call on app start)
export async function rescheduleUpcomingNotifications(reminders) {
    await cancelAllNotifications();
    const updatedReminders = [];

    for (const reminder of reminders) {
        const ids = await scheduleReminderNotification(reminder, 7);
        updatedReminders.push({ ...reminder, notificationIds: ids });
    }

    return updatedReminders;
}
