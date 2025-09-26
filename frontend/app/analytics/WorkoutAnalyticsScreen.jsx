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
  // router for navigation actions
  const router = useRouter();

  // stores all fetched workout entries
  const [workoutEntries, setWorkoutEntries] = useState([]);

  // loading state for fetch process
  const [loading, setLoading] = useState(true);

  // fetch workout entries on mount
  useEffect(() => {
    async function fetchWorkouts() {
      try {
        const data = await getWorkoutResults();
        setWorkoutEntries(data); // save fetched data to state
      } catch (err) {
        CustomToast.error("Could not load Workout logs", "Please try again.");
      } finally {
        setLoading(false); // stop loading state
      }
    }

    fetchWorkouts();
  }, []);

  // handler to navigate back
  const handleBack = () => router.back();

  // handler for pressing a specific workout entry
  const handleWorkoutPress = (workoutEntry) => {
    router.push({
      pathname: "/analytics/WorkoutResult",
      params: {
        workoutData: JSON.stringify(workoutEntry),
        returnTo: "analytics",
      },
    });
  };

  // show loading screen while fetching
  if (loading) {
    return (
      <AnalyticsLogScreen
        title="Workout Logs"
        subtitle="Loading..."
        onBackPress={handleBack}
      />
    );
  }

  // show empty state if no entries exist
  if (workoutEntries.length === 0) {
    return (
      <AnalyticsLogScreen
        title="Workout Logs"
        subtitle="No workout logs found."
        onBackPress={handleBack}
      />
    );
  }

  // render list of workout entries
  return (
    <AnalyticsLogScreen
      title="Workout Logs"
      subtitle="Your previous logs:"
      onBackPress={handleBack}
    >
      {/* Scrollable container for all workout cards */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Map over all workout entries and render as cards */}
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
