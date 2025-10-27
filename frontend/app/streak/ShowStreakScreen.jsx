import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { shouldShowStreakScreen } from "@/constants/utils/streakLogic";

/**
 * Full-page controller for showing StreakScreen once per day.
 * If streak is already shown today, navigates directly to Home.
 */
export default function ShowStreakScreen() {
  const router = useRouter();

  useEffect(() => {
    async function checkStreak() {
      const show = await shouldShowStreakScreen();

      if (show) {
        // Navigate to full-page streak screen
        router.replace("/streak/StreakScreen");
      } else {
        // Go straight to Home
        router.replace("/main/Home");
      }
    }

    checkStreak();
  }, []);

  // Nothing rendered, just decides where to go
  return null;
}
