import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import { getInactivityNotifications, startInactivityConversation } from "./messageService";
import { getWorkouts } from "./workoutService";
import { getAllWater } from "./waterServices";
import { getAllNutrition } from "./nutritionService";
import { getBiometrics } from "./biometricService";
import { cancelNotifications } from "./notificationService";

const TEST_MODE = true;

// global state variables
let inactivityTimer = null;
let scheduledNotificationIds = [];
let hasStartedThisSession = false;
let inactivityBatch = null;
let lastNotifIndex = 0;
let lastFiredIndex = -1;
let lastScheduledActivity = 0;
let scheduledNotificationMap = []; // { id, timeMs, index }

// reset everything on logout
export function resetInactivityState() {
    if (inactivityTimer) clearInterval(inactivityTimer);
    cancelNotifications(scheduledNotificationIds);
    inactivityTimer = null;
    scheduledNotificationIds = [];
    hasStartedThisSession = false;
    inactivityBatch = null;
    lastNotifIndex = 0;
    lastFiredIndex = -1;
    lastScheduledActivity = 0;
    scheduledNotificationMap = [];
    console.log("🔄 Inactivity state fully reset");
}

// get cached inactivity batch (AI-generated)
async function getCachedInactivityBatch() {
    if (!inactivityBatch) {
        console.log("📦 Fetching new inactivity batch from API");
        inactivityBatch = await getInactivityNotifications();
        lastNotifIndex = 0;
    } else {
        console.log("📦 Using cached inactivity batch");
    }
    return inactivityBatch;
}

// schedule notifications
async function scheduleNotifications(notifications, startTime, force = false) {
    if (force || scheduledNotificationIds.length === 0) {
        if (scheduledNotificationIds.length > 0) {
            await cancelNotifications(scheduledNotificationIds);
            console.log("🧹 Cancelled existing scheduled inactivity notifications");
        }
        scheduledNotificationIds = [];
        scheduledNotificationMap = [];
    }

    const now = startTime ? new Date(startTime) : new Date();
    const monthAhead = new Date(now.getTime() + (TEST_MODE ? 30 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000));
    let nextTime = TEST_MODE
        ? new Date(now.getTime() + 60 * 1000)
        : new Date(Math.max(now.getTime() + 5 * 60 * 60 * 1000, lastScheduledActivity + 5 * 60 * 60 * 1000));

    let index = 0;

    while (nextTime.getTime() < monthAhead.getTime()) {
        const notif = notifications[index % notifications.length];

        if (!TEST_MODE) {
            const hour = nextTime.getHours();
            if (hour >= 22) {
                nextTime.setDate(nextTime.getDate() + 1);
                nextTime.setHours(8, 0, 0, 0);
            }
        }

        const id = await Notifications.scheduleNotificationAsync({
            content: { title: notif.title, body: notif.body, data: { type: "inactivity", index } },
            trigger: { type: "date", date: nextTime },
        });

        scheduledNotificationIds.push(id);
        scheduledNotificationMap.push({ id, timeMs: nextTime.getTime(), index });
        console.log(`📅 Scheduled "${notif.title}" at ${nextTime.toLocaleString()} (index=${index})`);

        nextTime = TEST_MODE
            ? new Date(nextTime.getTime() + 2 * 60 * 1000)
            : new Date(nextTime.getTime() + 5 * 60 * 60 * 1000);

        index++;
    }

    lastScheduledActivity = now.getTime();
    console.log("✅ Notifications scheduled up to:", new Date(nextTime).toLocaleString());
}

// inactivity monitor hook
export function useInactivityMonitor() {
    const hasStartedRef = useRef(false);
    const appStateRef = useRef(AppState.currentState);

    useEffect(() => {
        if (hasStartedRef.current) {
            console.log("⏩ Inactivity monitor already started in this session");
            return;
        }
        hasStartedRef.current = true;

        if (hasStartedThisSession) {
            console.log("⏩ Inactivity monitor already active (global flag)");
            return;
        }

        hasStartedThisSession = true;
        console.log("✅ Inactivity monitor initialized");

        async function startMonitor() {
            const checkInterval = TEST_MODE ? 30 * 1000 : 5 * 60 * 60 * 1000;

            // core inactivity check
            async function checkInactivity() {
                try {
                    console.log("⏱️ Running inactivity check...");
                    const [workouts, water, nutrition, biometrics] = await Promise.all([
                        getWorkouts(),
                        getAllWater(),
                        getAllNutrition(),
                        getBiometrics(),
                    ]);

                    const allLogs = [
                        ...workouts.map(x => ({ ...x, time: x.createdAt })),
                        ...water.map(x => ({ ...x, time: x.createdAt || x.time })),
                        ...nutrition.map(x => ({ ...x, time: x.createdAt })),
                        ...biometrics.map(x => ({ ...x, time: x.timestamp })),
                    ].filter(log => log.time);

                    const latestLog = allLogs.sort((a, b) => new Date(b.time) - new Date(a.time))[0];
                    const lastActivityMs = latestLog ? new Date(latestLog.time).getTime() : 0;
                    const hoursSince = (Date.now() - lastActivityMs) / (60 * 60 * 1000);

                    const notifications = await getCachedInactivityBatch();

                    if (hoursSince >= (TEST_MODE ? 0.01 : 5)) {
                        if (scheduledNotificationIds.length === 0) {
                            console.log("🔔 User inactive — scheduling notifications");
                            await scheduleNotifications(notifications, new Date());
                        }
                    } else {
                        if (lastActivityMs > lastScheduledActivity + 1000) {
                            console.log("🏃 User active — rescheduling notifications");
                            await scheduleNotifications(notifications, new Date(lastActivityMs), true);
                        }
                    }
                } catch (err) {
                    console.error("⚠️ Inactivity check failed:", err);
                }
            }

            await checkInactivity();
            inactivityTimer = setInterval(checkInactivity, checkInterval);
            console.log("⏱️ Inactivity timer started with interval:", checkInterval / 1000, "seconds");

            // foreground notifications
            receivedSub = Notifications.addNotificationReceivedListener(async notification => {
                try {
                    const data = notification?.request?.content?.data;
                    const content = notification.request.content;

                    if (data?.type !== "inactivity") return;

                    const idx = data.index ?? lastNotifIndex - 1;
                    if (idx <= lastFiredIndex) {
                        console.log("⏭️ Skipping duplicate foreground notification");
                        return;
                    }

                    console.log(`💬 Foreground notification — starting conversation: ${content.title}`);
                    await startInactivityConversation(content.title, content.body);
                    lastFiredIndex = idx;
                } catch (err) {
                    console.error("⚠️ Failed handling foreground notification:", err);
                }
            });

            // app resume handler
            const handleAppStateChange = async nextAppState => {
                const prev = appStateRef.current;
                appStateRef.current = nextAppState;

                if (nextAppState !== "active") return;

                console.log("📲 App resumed — checking for missed notifications");

                try {
                    const nowMs = Date.now();
                    const missed = scheduledNotificationMap
                        .filter(s => s.timeMs <= nowMs)
                        .filter(s => s.index > lastFiredIndex);

                    if (missed.length === 0) {
                        console.log("✅ No missed notifications found");
                        return;
                    }

                    const latestMissed = missed.reduce((a, b) => (a.timeMs > b.timeMs ? a : b));
                    const batch = await getCachedInactivityBatch();
                    const notif = batch?.[latestMissed.index];

                    if (notif) {
                        console.log("🔔 Starting conversation for latest missed notification:", notif.title);
                        await startInactivityConversation(notif.title, notif.body);
                        lastFiredIndex = latestMissed.index;
                    }
                } catch (err) {
                    console.error("⚠️ Failed processing missed notifications on resume:", err);
                }
            };

            appStateListener = AppState.addEventListener("change", handleAppStateChange);

            // no cleanup on unmount - monitor runs for whole app session
            return () => {
                console.log("ℹ️ Inactivity monitor cleanup ignored (runs for full session)");
            };
        }

        let cleanupFn;
        (async () => {
            cleanupFn = await startMonitor();
        })();

        // component unmount does nothing
        return () => {
            console.log("ℹ️ Component unmounted — inactivity monitor continues running");
        };
    }, []);
}
