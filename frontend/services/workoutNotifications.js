import * as reminderService from "../services/reminderService";
import * as notificationService from "../services/notificationService";
import CustomToast from "@/components/common/CustomToast";

export async function scheduleWorkoutReminders(workout) {
    try {
        if (!workout.selectedDays || workout.selectedDays.length === 0) return;

        const today = new Date();
        const daysAhead = 90;
        const notifications = [];

        for (let i = 0; i < daysAhead; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            const dayNum = date.getDay();

            if (workout.selectedDays.some(d => weekdaysMap[d] === dayNum)) {
                const reminderData = {
                    title: `Workout: ${workout.workoutName}`,
                    notes: "Time to complete your workout!",
                    date: date.toISOString().split("T")[0],
                    time: workout.time || "07:00",
                    repeat: "Weekly",
                };

                const savedReminder = await reminderService.createReminder(reminderData);
                const ids = await notificationService.scheduleReminderNotification(savedReminder, daysAhead);
                savedReminder.notificationIds = ids;
                notifications.push(savedReminder);
            }
        }

        CustomToast.reminderSaved(`Reminders set for ${workout.workoutName}`);
        return notifications;
    } catch (err) {
        console.log(err);
        CustomToast.error("Failed to schedule workout reminders", "");
    }
}
