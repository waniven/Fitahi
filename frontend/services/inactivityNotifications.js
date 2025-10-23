import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { getInactivityNotifications, startInactivityConversation } from "./messageService";
import { getWorkouts } from "./workoutService";
import { getAllWater } from "./waterServices";
import { getAllNutrition } from "./nutritionService";
import { getBiometrics } from "./biometricService";
import { cancelNotifications } from "./notificationService";

// will hold reference to the active inactivity check timer
let inactivityTimer = null;

// will hold the currently scheduled notification ids
let scheduledNotificationIds = [];

// track if monitor has been started this session (cold start)
let hasStartedThisSession = false;

// helper to schedule notifications for the next month, 5 hours apart, respecting quiet hours
async function scheduleNotifications(notifications) {
    // cancel any existing scheduled notifications first
    await cancelNotifications(scheduledNotificationIds);
    scheduledNotificationIds = [];

    const now = new Date();
    // set range to schedule notifications for 30 days ahead
    const monthAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // first notification fires after 5 hours of inactivity
    let nextTime = new Date(now.getTime() + 5 * 60 * 60 * 1000);

    // testing = first notification fires after 30 seconds for testing
    // let nextTime = new Date(now.getTime() + 30 * 1000);

    for (const notif of notifications) {
        // stop scheduling if we've gone past a month ahead
        if (nextTime > monthAhead) break;

        // skip quiet hours between 10pm and 8am
        const hour = nextTime.getHours();
        if (hour >= 22) {
            nextTime.setDate(nextTime.getDate() + 1);
            nextTime.setHours(8, 0, 0, 0);
        }

        // schedule the notification
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: notif.title,
                body: notif.body,
                data: { type: "inactivity" },
            },
            trigger: { type: "date", date: nextTime },
        });
        scheduledNotificationIds.push(id);

        // move to 5 hours later for the next notification
        nextTime = new Date(nextTime.getTime() + 5 * 60 * 60 * 1000);

        // testing = move to 30 seconds later for the next notification
        // nextTime = new Date(nextTime.getTime() + 30 * 1000);
    }
}

export function useInactivityMonitor() {
    const hasStartedRef = useRef(false);

    useEffect(() => {

        // prevent multiple starts 
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        async function startMonitor() {

            const checkInterval = 0.5 * 60 * 1000;
            // production = check every 5 hours = 5 * 60 * 60 * 1000
            // testing = check every 30 seconds = 0.5 * 60 * 1000

            async function checkInactivity() {
                try {
                    // fetch all user activity logs
                    const [workouts, water, nutrition, biometrics] = await Promise.all([
                        getWorkouts(),
                        getAllWater(),
                        getAllNutrition(),
                        getBiometrics(),
                    ]);

                    // combine all logs and normalise timestamps
                    const allLogs = [
                        ...workouts.map((x) => ({ ...x, time: x.createdAt })),
                        ...water.map((x) => ({ ...x, time: x.createdAt || x.time })),
                        ...nutrition.map((x) => ({ ...x, time: x.createdAt })),
                        ...biometrics.map((x) => ({ ...x, time: x.timestamp })),
                    ].filter((log) => log.time);

                    // find the latest activity
                    const latestLog = allLogs.sort(
                        (a, b) => new Date(b.time) - new Date(a.time)
                    )[0];

                    // calculate hours since last activity
                    const lastActivity = latestLog ? new Date(latestLog.time) : new Date(0);
                    const now = new Date();
                    const hoursSince = (now - lastActivity) / (60 * 60 * 1000);

                    // production = trigger after 5+ hours of inactivity >= 5
                    // testing = trigger after roughly 36 sec to see quick notifications  >= 0.01
                    if (hoursSince >= 0.01) {
                        // get the next batch of inactivity notifications
                        const notifications = await getInactivityNotifications();

                        // schedule inactivity notifications for the next month
                        await scheduleNotifications(notifications);

                        // if user was already inactive before login, fire one immediately
                        if (!hasStartedThisSession) {
                            const latest = notifications[0];
                            await Notifications.scheduleNotificationAsync({
                                content: {
                                    title: latest.title,
                                    body: latest.body,
                                    data: { type: "inactivity" },
                                },
                                trigger: null, // fire immediately
                            });
                            await startInactivityConversation(latest.title, latest.body);
                        }

                        // mark that the session has started
                        hasStartedThisSession = true;
                    } else {
                        // reschedule notifications instead of creating new batche, if user is active
                        if (scheduledNotificationIds.length > 0) {
                            const notifications = await getInactivityNotifications();
                            await scheduleNotifications(notifications);
                        }
                    }
                } catch (err) {
                    console.error("inactivity check failed: ", err);
                }
            }

            // run first check immediately, then repeat every interval
            await checkInactivity();
            inactivityTimer = setInterval(checkInactivity, checkInterval);
        }

        startMonitor();

        // cleanup when monitor unmounts
        return () => {
            if (inactivityTimer) clearInterval(inactivityTimer);
            cancelNotifications(scheduledNotificationIds);
            scheduledNotificationIds = [];
            hasStartedThisSession = false;
        };
    }, []);
}
