import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import CustomToast from "@/components/common/CustomToast";
import AnalyticsDashboard from "../../components/analytics/AnalyticsDashboard";
import AnalyticsLogScreen from "../../components/analytics/AnalyticsLogScreen";

// Import backend services
import { getBiometrics } from "../../services/biometricService";
import { getAllNutrition } from "../../services/nutritionService";
import { getWorkoutResults } from "../../services/workoutResultService";
import { getAllWater } from "../../services/waterServices";

export default function AnalyticsScreen() {
  const router = useRouter();

  // State to store fetched analytics data
  const [analyticsData, setAnalyticsData] = useState(null);

  // State to determine whether to show dashboard or log screen
  const [showDashboard, setShowDashboard] = useState(false);

  // Fetch all analytics-related data from backend on mount
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [workouts, biometrics, nutrition, water] = await Promise.all([
          getWorkoutResults(),
          getBiometrics(),
          getAllNutrition(),
          getAllWater(),
        ]);

        // Calculate total entries across all analytics categories
        const totalEntries =
          workouts.length + biometrics.length + nutrition.length + water.length;

        // Set analytics data in state
        setAnalyticsData({
          workoutEntries: workouts,
          biometricEntries: biometrics,
          nutritionEntries: nutrition,
          waterEntries: water,
          totalEntries,
        });

        // Show dashboard only if there are at least 2 total entries
        setShowDashboard(totalEntries >= 2);
      } catch (err) {
        // Show toast error if fetching fails
        CustomToast.error(
          "Error fetching your Analytics",
          "Please try again soon."
        );
      }
    }

    fetchAnalytics();
  }, []);

  // Handle navigation back action
  const handleBack = () => {
    router.back();
  };

  return showDashboard && analyticsData ? (
    // Render dashboard view with analytics data
    <AnalyticsDashboard data={analyticsData} />
  ) : (
    // Render log screen if dashboard not available or no analytics data
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
