import * as notificationService from "@/services/notificationService";
import * as reminderService from "@/services/reminderService";

export async function scheduleWorkoutReminders(workout) {
    try {
        // if no days are selected, exit early
        if (!workout.selectedDays || workout.selectedDays.length === 0) return;

        const now = new Date();

        for (let dayIdx of workout.selectedDays) {
            const reminderDate = new Date(now);

            // calculate how many days to add to get to the selected weekday
            // shift dayIdx by 1 to match JS Date.getDay() (Sunday=0)
            const jsDayIdx = (dayIdx + 1) % 7;
            let daysUntil = (jsDayIdx - now.getDay() + 7) % 7;

            // if today is selected, keep it today if the time hasn't passed yet
            const reminderHour = 10; // 10am
            const reminderMinute = 0; // 00 minutes
            if (
                daysUntil === 0 &&
                (now.getHours() > reminderHour ||
                    (now.getHours() === reminderHour && now.getMinutes() >= reminderMinute))
            ) {
                // if the time already passed today, schedule for next week
                daysUntil = 7;
            }

            // move the reminderDate to the correct weekday
            reminderDate.setDate(reminderDate.getDate() + daysUntil);
            reminderDate.setHours(reminderHour, reminderMinute, 0, 0);

            // save as local date string and time string
            const localDateStr = reminderDate.toLocaleDateString("en-CA"); // YYYY-MM-DD
            const localTimeStr = `${String(reminderHour).padStart(2, "0")}:${String(
                reminderMinute
            ).padStart(2, "0")}`;

            const reminderData = {
                title: `👋 Hey - Don't forget about your workout: ${workout.workoutName}!`,
                notes: `💪 You can do it!!`,
                date: localDateStr, // store local string
                repeat: "Weekly",
                time: localTimeStr,
            };

            // save reminder to backend
            const savedReminder = await reminderService.createReminder(reminderData);

            // schedule notification using JS Date object
            const notifDate = new Date(`${localDateStr}T${localTimeStr}:00`);

            // third param (notifDate) ensures it triggers at the correct time
            const ids = await notificationService.scheduleReminderNotification(savedReminder, 1, notifDate);

            // keep track of notification IDs for potential cancellation
            savedReminder.notificationIds = ids;

            console.log("Workout reminder scheduled:", savedReminder);
        }
    } catch (err) {
        console.warn("Failed to schedule workout reminders", err);
    }
}
