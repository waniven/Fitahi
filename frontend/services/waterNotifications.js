import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { getWater } from "@/services/waterServices";
import { getMe } from "@/services/userService";

export function scheduleWaterNotifications() {
    useEffect(() => {
        // stop service after final goal message
        let notificationsActive = true;

        // will hold past water intake records
        let waterEntries = [];

        // default daily goal (mL)
        let dailyGoal = 2000;

        // helper: refresh water + goal from backend
        const refreshWaterData = async () => {
            try {
                const me = await getMe();
                // update daily goal from user settings
                dailyGoal = me.intakeGoals?.dailyWater ?? 2000;

                const res = await getWater();
                // handle either raw array or Axios-style {data}
                const waterData = Array.isArray(res) ? res : res?.data;

                // map water entries into standardized format for calculations
                waterEntries = Array.isArray(waterData)
                    ? waterData.map((doc) => ({
                        id: doc._id,
                        amount: Number(doc.amount ?? doc.consumed),
                        timestamp: doc.time, // align with frontend expectation
                    }))
                    : [];
            } catch (err) {
                console.log("Failed to refresh water info", err);
            }
        };

        // helper: compute water stats
        const getWaterStats = () => {
            const now = new Date();
            const lastEntry = waterEntries.length
                ? new Date(waterEntries[waterEntries.length - 1].timestamp)
                : null;
            const totalConsumed = waterEntries.reduce((sum, e) => sum + e.amount, 0);
            const remaining = Math.max(dailyGoal - totalConsumed, 0);
            return { lastEntry, totalConsumed, remaining, now };
        };

        // first load
        refreshWaterData();

        // main interval loop to check for notifications
        const interval = setInterval(async () => {
            if (!notificationsActive) return; // stop if goal already reached

            // refresh entries/goal on each tick
            await refreshWaterData();

            const { lastEntry, remaining, now } = getWaterStats();

            const hour = now.getHours();

            // skip night hours (10pm – 8am)
            if (hour >= 22 || hour < 8) return;

            // fallback if no entries yet
            const lastTime = lastEntry ?? new Date(0);

            // time since last drink in hours
            const diffHours = (now - lastTime) / 1000 / 60 / 60;

            // production = trigger after 3+ hours of inactivity  >= 3
            // testing = trigger after roughly 36 sec to see quick notifications  >= 0.01
            if (diffHours >= 3) {
                let title, message;

                if (remaining > 0) {
                    // user hasn't met goal yet
                    title = `💧 You are ${remaining} mL away from your water goal today!`;
                    message = `Don't forget to hydrate!`;
                } else {
                    // user has met daily goal
                    title = `💧🎉 Well done meeting your water goal today! Keep it up!`;
                    message = `You've reached your daily water intake goal.`;
                    notificationsActive = false; // stop further notifications after this final message
                }

                try {
                    await Notifications.scheduleNotificationAsync({
                        content: { title, body: message },
                        trigger: null, // immediate notification
                    });
                } catch (err) {
                    console.log("Failed to send water notification", err);
                }
            }
        }, 60 * 60 * 1000);
        // production = check every 1 hour = 60 * 60 * 1000
        // testing = check every 30 seconds = 0.5 * 60 * 1000

        // cleanup: stop interval when component unmounts
        return () => clearInterval(interval);
    }, []);
}
