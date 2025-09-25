import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import CustomToast from "@/components/common/CustomToast";
import AnalyticsDashboard from "../../components/analytics/AnalyticsDashboard";
import AnalyticsLogScreen from "../../components/analytics/AnalyticsLogScreen";

// import backend services
import { getBiometrics } from "../../services/biometricService";
import { getAllNutrition } from "../../services/nutritionService";
import { getWorkoutResults } from "../../services/workoutResultService";
import { getAllWater } from "../../services/waterServices";

export default function AnalyticsScreen() {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [workouts, biometrics, nutrition, water] = await Promise.all([
          getWorkoutResults(),
          getBiometrics(),
          getAllNutrition(),
          getAllWater(),
        ]);

        const totalEntries =
          workouts.length + biometrics.length + nutrition.length + water.length;

        setAnalyticsData({
          workoutEntries: workouts,
          biometricEntries: biometrics,
          nutritionEntries: nutrition,
          waterEntries: water,
          totalEntries,
        });

        setShowDashboard(totalEntries >= 2);
      } catch (err) {
        CustomToast.error(
          "Error fetching your Analytics",
          "Please try again soon."
        );
      }
    }

    fetchAnalytics();
  }, []);

  const handleBack = () => {
    router.back();
  };

  return showDashboard && analyticsData ? (
    <AnalyticsDashboard data={analyticsData} />
  ) : (
    <AnalyticsLogScreen
      title="Analytics"
      subtitle={
        analyticsData
          ? "Make some logs and come back to get overviews!"
          : "No analytics data available."
      }
      onBackPress={handleBack}
    />
  );
}
