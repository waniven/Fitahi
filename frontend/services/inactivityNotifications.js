import * as Notifications from "expo-notifications";
import { getInactivityNotification, startInactivityConversation } from "./messageService";
import { getWorkouts } from "./workoutService";
import { getAllWater } from "./waterServices";
import { getAllNutrition } from "./nutritionService";
import { getBiometrics } from "./biometricService";

// will hold reference to the active inactivity check timer
let inactivityTimer = null;

export async function startInactivityMonitor() {
    // check inactivity every 5 hours (5 * 60 * 60 * 1000)
    const checkInterval = 5 * 60 * 60 * 1000;

    // main logic to check if user has been inactive
    async function checkInactivity() {
        try {
            // fetch all user activity logs from backend
            const [workouts, water, nutrition, biometrics] = await Promise.all([
                getWorkouts(),
                getAllWater(),
                getAllNutrition(),
                getBiometrics(),
            ]);

            // combine all logs into one array with consistent time field
            const allLogs = [
                ...workouts.map((x) => ({ ...x, time: x.createdAt })),            // workouts use createdAt
                ...water.map((x) => ({ ...x, time: x.createdAt || x.time })),     // water uses createdAt or time
                ...nutrition.map((x) => ({ ...x, time: x.createdAt })),           // nutrition uses createdAt
                ...biometrics.map((x) => ({ ...x, time: x.timestamp })),          // biometrics use timestamp
            ].filter((log) => log.time); // remove any logs with missing time, if any

            // find most recent activity
            const latestLog = allLogs.sort(
                (a, b) => new Date(b.time) - new Date(a.time)
            )[0];

            // determine time since most recent activity
            const lastActivity = latestLog ? new Date(latestLog.time) : new Date(0);
            const now = new Date();
            const hoursSince = (now - lastActivity) / (1000 * 60 * 60);

            // if user has been inactive for 5 or more hours
            if (hoursSince >= 5) {
                // get check-in notification from backend
                const { title, body } = await getInactivityNotification();

                // fire this check-in notification
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title, // question shown in title
                        body,  // more detailed supportive message shown in body
                        data: { type: "inactivity" }, // custom data field
                    },
                    trigger: null, // send immediately
                });

                // create or continue conversation for inactivity check-in, utilising same notification content
                await startInactivityConversation(title, body);
            }
        } catch (err) {
            console.error("inactivity check failed: ", err);
        }
    }

    // run function immediately when monitor starts
    await checkInactivity();

    // recheck every 5 hours to avoid spamming user
    inactivityTimer = setInterval(checkInactivity, checkInterval);
}

// stop the inactivity monitor
export function stopInactivityMonitor() {
    if (inactivityTimer) clearInterval(inactivityTimer);
}
