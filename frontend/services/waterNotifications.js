import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { getWater } from "@/services/waterServices";
import { getMe } from "@/services/userService";

export function useWaterNotifications() {
    useEffect(() => {
        let notificationsActive = true; // stop service after final goal message
        let waterEntries = [];
        let dailyGoal = 2000;

        // helper: refresh water + goal
        const refreshWaterData = async () => {
            try {
                const me = await getMe();
                dailyGoal = me.intakeGoals?.dailyWater ?? 2000;

                const res = await getWater();
                const waterData = Array.isArray(res) ? res : res?.data; // handle raw array or axios-style {data}

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

        // helper: compute stats
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

        const interval = setInterval(async () => {
            if (!notificationsActive) return;

            // refresh entries/goal on each tick
            await refreshWaterData();

            const { lastEntry, remaining, now } = getWaterStats();

            const hour = now.getHours();

            // skip night hours (10pm – 8am)
            if (hour >= 22 || hour < 8) return;

            const lastTime = lastEntry ?? new Date(0);
            const diffHours = (now - lastTime) / 1000 / 60 / 60;

            // production = trigger after 3+ hours of inactivity  >= 3
            // testing = trigger after roughly 36 sec to see quick notifications  >= 0.01
            if (diffHours >= 3) {
                let title, message;

                if (remaining > 0) {
                    title = `💧 You are ${remaining} mL away from your water goal today!`;
                    message = `Don't forget to hydrate!`;
                } else {
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

        return () => clearInterval(interval);
    }, []);
}
