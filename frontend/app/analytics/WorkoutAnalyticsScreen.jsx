import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import AnalyticsLogScreen from "../../components/analytics/AnalyticsLogScreen";
import AnalyticsUniversalCard from "../../components/analytics/AnalyticsUniversalCard";
import { getWorkoutResults } from "../../services/workoutResultService";
import CustomToast from "@/components/common/CustomToast";

/**
 * Screen that displays a scrollable list of workout log entries
 * Shows historical workout data with navigation to detailed workout results
 */
export default function WorkoutAnalyticsScreen() {
  const router = useRouter();
  const [workoutEntries, setWorkoutEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkouts() {
      try {
        const data = await getWorkoutResults();
        setWorkoutEntries(data);
      } catch (err) {
        CustomToast.error("Could not load Workout logs", "Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchWorkouts();
  }, []);

  const handleBack = () => router.back();
  const handleWorkoutPress = (workoutEntry) => {
    router.push({
      pathname: "/analytics/WorkoutResult",
      params: {
        workoutData: JSON.stringify(workoutEntry),
        returnTo: "analytics",
      },
    });
  };

  if (loading) {
    return (
      <AnalyticsLogScreen
        title="Workout Logs"
        subtitle="Loading..."
        onBackPress={handleBack}
      />
    );
  }

  if (workoutEntries.length === 0) {
    return (
      <AnalyticsLogScreen
        title="Workout Logs"
        subtitle="No workout logs found."
        onBackPress={handleBack}
      />
    );
  }

  return (
    <AnalyticsLogScreen
      title="Workout Logs"
      subtitle="Your previous logs:"
      onBackPress={handleBack}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {workoutEntries.map((entry, index) => (
          <AnalyticsUniversalCard
            key={entry._id || index}
            entry={entry}
            type="workout"
            onPress={handleWorkoutPress}
          />
        ))}
      </ScrollView>
    </AnalyticsLogScreen>
  );
}
