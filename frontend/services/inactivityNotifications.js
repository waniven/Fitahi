import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import { getInactivityNotifications, startInactivityConversation } from "./messageService";
import { getWorkoutResults } from "./workoutResultService";
import { getAllWater } from "./waterServices";
import { getAllNutrition } from "./nutritionService";
import { getBiometrics } from "./biometricService";
import { cancelNotifications } from "./notificationService";

// toggle for test mode for detailed logs (for development purposes)
const TEST_MODE = false;
// toggle for simplified prod mode for less detailed logs
const PROD_LOGS = true;

// global state vars used across sessions
let inactivityTimer = null;         // interval timer ref
let scheduledNotificationIds = [];  // array of scheduled notification ids
let hasStartedThisSession = false;  // flag to prevent multiple starts
let inactivityBatch = null;         // cached batch of inactivity notifications
let lastNotifIndex = 0;             // index for next notification to schedule
let lastFiredIndex = -1;            // index of last notification that triggered conversation
let lastScheduledActivity = 0;      // timestamp of last scheduled activity
let scheduledNotificationMap = [];  // keeps notification id, time, and batch index
let notificationListener = null;    // listener ref to prevent duplicates
let appStateListenerRef = null;     // app state listener ref

function debugLog(...args) {
    if (TEST_MODE || PROD_LOGS) console.log(...args);
}

// reset all inactivity state (used on logout)
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

    // remove listeners to prevent duplicate conversations
    if (notificationListener) {
        notificationListener.remove();
        notificationListener = null;
    }
    if (appStateListenerRef) {
        appStateListenerRef.remove();
        appStateListenerRef = null;
    }

    debugLog("🔄 inactivity state fully reset");
}

// fetch the cached batch of ai-generated notifications or request new ones
async function getCachedInactivityBatch() {
    if (!inactivityBatch) {
        debugLog("📦 fetching new inactivity batch from api");
        inactivityBatch = await getInactivityNotifications();
        lastNotifIndex = 0;
    } else {
        debugLog("📦 using cached inactivity batch");
    }
    return inactivityBatch;
}

// get next message from inactivity batch sequentially
function getNextNotification(notifications) {
    const notif = notifications[lastNotifIndex % notifications.length];
    lastNotifIndex++;
    return notif;
}

// reschedule only pending future notifications if the user becomes active
const reschedulePendingNotifications = async (notifications) => {

    // fetch batch if not provided
    if (!notifications || !Array.isArray(notifications)) {
        notifications = await getCachedInactivityBatch();
    }
    if (!notifications?.length) return; // return if no notifications

    // find future scheduled notifications
    const nowMs = Date.now();
    const futureNotifs = scheduledNotificationMap.filter(n => n.timeMs > nowMs);

    // cancel all future ones
    if (futureNotifs.length > 0) {
        await cancelNotifications(futureNotifs.map(n => n.id));
    }

    // reset tracking arrays for rescheduled ones
    scheduledNotificationIds = [];
    scheduledNotificationMap = [];

    // start from now
    let nextTime = TEST_MODE ? new Date(nowMs + 2 * 60 * 1000) : new Date(nowMs + 5 * 60 * 60 * 1000);

    // reschedule each future notification
    for (let i = 0; i < futureNotifs.length; i++) {
        const notif = notifications[futureNotifs[i].index % notifications.length];
        const originalTime = futureNotifs[i].timeMs;

        // shift the original time by 2 minutes (testing) or 5 hours (prod)
        const nextTime = TEST_MODE
            ? new Date(originalTime + 2 * 60 * 1000)
            : new Date(originalTime + 5 * 60 * 60 * 1000);

        // apply nightly rule (for prod)
        if (!TEST_MODE) {
            const hour = nextTime.getHours();
            if (hour >= 22 || hour < 8) {
                nextTime.setDate(nextTime.getDate() + (hour >= 22 ? 1 : 0));
                nextTime.setHours(8, 0, 0, 0);
            }
        }

        // schedule the notification
        const id = await Notifications.scheduleNotificationAsync({
            content: { title: notif.title, body: notif.body, data: { type: "inactivity", index: futureNotifs[i].index } },
            trigger: { type: "date", date: nextTime },
        });

        // track the scheduled notification
        scheduledNotificationIds.push(id);
        scheduledNotificationMap.push({ id, timeMs: nextTime.getTime(), index: futureNotifs[i].index });

        debugLog(`📅 rescheduled "${notif.title}" for ${nextTime.toLocaleString()}`);
    }

    debugLog(`📋 Rescheduled ${futureNotifs.length} notifications (prod)`);
};

// schedules inactivity notifications at fixed intervals
async function scheduleNotifications(notifications, startTime, force = false) {
    const now = startTime ? new Date(startTime) : new Date();
    const nowMs = now.getTime();
    const graceMs = 60 * 1000; // 1 min grace buffer

    // only cancel and reset if forced or no existing notifications
    if (force || scheduledNotificationIds.length === 0) {
        if (scheduledNotificationIds.length > 0) {
            debugLog("🔍 checking scheduled notifications before rescheduling...");
            const futureNotifs = scheduledNotificationMap.filter(n => n.timeMs > nowMs + graceMs);
            const toCancel = futureNotifs.map(n => n.id);

            // keep notifications that already triggered recently
            const kept = scheduledNotificationMap.filter(n => n.timeMs <= nowMs + graceMs);
            kept.forEach(n => {
                const notif = notifications[n.index % notifications.length];
                debugLog(`⏭️ skipping already-fired: "${notif?.title}"`);
            });

            // cancel future ones
            if (toCancel.length > 0) {
                await cancelNotifications(toCancel);
                debugLog(`🧹 cancelled ${toCancel.length} future notifications`);
            }

            scheduledNotificationMap = kept;
            scheduledNotificationIds = kept.map(n => n.id);
        }
    }

    // schedule range (30 minutes ahead for testing, 15 days in prod)
    const monthAhead = new Date(nowMs + (TEST_MODE ? 30 * 60 * 1000 : 15 * 24 * 60 * 60 * 1000));

    // start scheduling after 1 minute (test) or 5 hours (prod)
    let nextTime = TEST_MODE
        ? new Date(nowMs + 60 * 1000)
        : new Date(Math.max(nowMs + 5 * 60 * 60 * 1000, lastScheduledActivity + 5 * 60 * 60 * 1000));

    let index = 0;

    // loop until we fill our schedule window
    while (nextTime.getTime() < monthAhead.getTime()) {
        const notif = notifications[index % notifications.length];

        // avoid scheduling between 10pm and 8am
        if (!TEST_MODE) {
            const hour = nextTime.getHours();
            if (hour >= 22 || hour < 8) {
                nextTime.setDate(nextTime.getDate() + (hour >= 22 ? 1 : 0));
                nextTime.setHours(8, 0, 0, 0);
            }
        }

        // schedule the notification
        const id = await Notifications.scheduleNotificationAsync({
            content: { title: notif.title, body: notif.body, data: { type: "inactivity", index } },
            trigger: { type: "date", date: nextTime },
        });

        scheduledNotificationIds.push(id);
        scheduledNotificationMap.push({ id, timeMs: nextTime.getTime(), index });

        if (TEST_MODE || index === 0) debugLog(`📅 scheduled "${notif.title}" at ${nextTime.toLocaleString()} (index=${index})`);

        // increment time for next notif
        nextTime = TEST_MODE
            ? new Date(nextTime.getTime() + 2 * 60 * 1000)
            : new Date(nextTime.getTime() + 5 * 60 * 60 * 1000);

        index++;
    }

    // mark last scheduled activity
    lastScheduledActivity = nowMs;
    debugLog("✅ inactivity notifications scheduled");
}

// main hook to start and manage inactivity logic
export function useInactivityMonitor() {
    const hasStartedRef = useRef(false);
    const appStateRef = useRef(AppState.currentState);

    useEffect(() => {
        // prevent multiple monitors running in one session
        if (hasStartedRef.current) {
            debugLog("⏩ inactivity monitor already started");
            return;
        }
        hasStartedRef.current = true;

        // global guard
        if (hasStartedThisSession) {
            debugLog("⏩ inactivity monitor already active globally");
            return;
        }

        // mark global start 
        hasStartedThisSession = true;
        debugLog("✅ inactivity monitor initialized");

        let receivedSub = null;
        let appStateListener = null;

        async function startMonitor() {
            // check interval (30s test, 5hr prod)
            const checkInterval = TEST_MODE ? 30 * 1000 : 5 * 60 * 60 * 1000;

            // runs on each interval to check user logs
            async function checkInactivity() {
                try {
                    if (TEST_MODE) console.log("⏱️ running inactivity check...");
                    const [workoutResults, water, nutrition, biometrics] = await Promise.all([
                        getWorkoutResults(),
                        getAllWater(),
                        getAllNutrition(),
                        getBiometrics(),
                    ]);

                    // merge all logs with timestamps
                    const allLogs = [
                        ...workoutResults.map(x => ({ ...x, time: x.dateCompleted || x.createdAt })),
                        ...water.map(x => ({ ...x, time: x.createdAt || x.time })),
                        ...nutrition.map(x => ({ ...x, time: x.createdAt })),
                        ...biometrics.map(x => ({ ...x, time: x.timestamp })),
                    ].filter(log => log.time);

                    // find most recent activity
                    const latestLog = allLogs.sort((a, b) => new Date(b.time) - new Date(a.time))[0];
                    const lastActivityMs = latestLog ? new Date(latestLog.time).getTime() : 0;
                    const hoursSince = (Date.now() - lastActivityMs) / (60 * 60 * 1000);

                    const notifications = await getCachedInactivityBatch();

                    // schedule if inactive
                    if (hoursSince >= (TEST_MODE ? 0.01 : 5)) {
                        if (scheduledNotificationIds.length === 0) {
                            debugLog("🔔 user inactive — scheduling notifications");
                            await scheduleNotifications(notifications, new Date());
                        }
                    } else {
                        // if user was recently active, refresh future ones
                        if (lastActivityMs > lastScheduledActivity + 1000) {
                            debugLog("🏃 user active — rescheduling future only");
                            await reschedulePendingNotifications(notifications);
                        }
                    }
                } catch (err) {
                    console.error("⚠️ inactivity check failed:", err);
                }
            }

            // run immediately and repeat every interval
            await checkInactivity();
            inactivityTimer = setInterval(checkInactivity, checkInterval);
            if (TEST_MODE) console.log("⏱️ inactivity timer started, interval:", checkInterval / 1000, "s");

            // handle foreground notifications
            notificationListener = Notifications.addNotificationReceivedListener(async notification => {
                try {
                    const data = notification?.request?.content?.data;
                    const content = notification.request.content;

                    // ignore non-inactivity notifications
                    if (data?.type !== "inactivity") return;

                    // prevent duplicate conversations
                    const idx = data.index ?? lastNotifIndex - 1;
                    if (idx <= lastFiredIndex) return;

                    // start ai chat for that notification
                    debugLog(`💬 foreground notification: ${content.title}`);
                    await startInactivityConversation(content.title, content.body);
                    lastFiredIndex = idx;
                } catch (err) {
                    console.error("⚠️ failed handling foreground notification:", err);
                }
            });

            // when app resumes, check for missed notifications
            const handleAppStateChange = async nextAppState => {
                const prev = appStateRef.current;
                appStateRef.current = nextAppState;

                if (nextAppState !== "active") return;

                if (TEST_MODE) console.log("📲 app resumed — checking missed notifications");

                // process missed notifications
                try {
                    const nowMs = Date.now();
                    const missed = scheduledNotificationMap
                        .filter(s => s.timeMs <= nowMs)
                        .filter(s => s.index > lastFiredIndex);

                    if (missed.length === 0) {
                        if (TEST_MODE) console.log("✅ no missed notifications found");
                        return;
                    }

                    // pick the latest missed one and start conversation
                    const latestMissed = missed.reduce((a, b) => (a.timeMs > b.timeMs ? a : b));
                    const batch = await getCachedInactivityBatch();
                    const notif = batch?.[latestMissed.index];

                    if (notif) {
                        debugLog("🔔 starting conversation for missed notification:", notif.title);
                        await startInactivityConversation(notif.title, notif.body);
                        lastFiredIndex = latestMissed.index;
                    }
                } catch (err) {
                    console.error("⚠️ failed processing missed notifications on resume:", err);
                }
            };

            appStateListenerRef = AppState.addEventListener("change", handleAppStateChange);

            // cleanup intentionally left persistent
            return () => {
                debugLog("ℹ️ inactivity monitor cleanup ignored");
            };
        }

        let cleanupFn;
        (async () => {
            cleanupFn = await startMonitor();
        })();

        return () => {
            debugLog("ℹ️ component unmounted — monitor continues running");
        };
    }, []);
}
