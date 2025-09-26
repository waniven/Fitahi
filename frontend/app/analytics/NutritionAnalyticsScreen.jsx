import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import AnalyticsLogScreen from "../../components/analytics/AnalyticsLogScreen";
import AnalyticsNutritionCard from "../../components/analytics/AnalyticsNutritionCard";
import { getAllNutrition } from "../../services/nutritionService";
import CustomToast from "@/components/common/CustomToast";

/**
 * Screen that displays a scrollable list of nutrition log entries
 * Shows historical nutrition data with specialized nutrition card formatting
 */
export default function NutritionAnalyticsScreen() {
  // router for navigation actions
  const router = useRouter();

  // stores all fetched nutrition entries
  const [nutritionEntries, setNutritionEntries] = useState([]);

  // loading state for fetch process
  const [loading, setLoading] = useState(true);

  // fetch nutrition entries on mount
  useEffect(() => {
    async function fetchNutrition() {
      try {
        const data = await getAllNutrition();
        setNutritionEntries(data); // save fetched data to state
      } catch (err) {
        CustomToast.error("Could not load Nutrition logs", "Please try again.");
      } finally {
        setLoading(false); // stop loading state
      }
    }

    fetchNutrition();
  }, []);

  // handler to navigate back
  const handleBack = () => router.back();

  // show loading screen while fetching
  if (loading) {
    return (
      <AnalyticsLogScreen
        title="Nutrition Logs"
        subtitle="Loading..."
        onBackPress={handleBack}
      />
    );
  }

  // show empty state if no entries exist
  if (nutritionEntries.length === 0) {
    return (
      <AnalyticsLogScreen
        title="Nutrition Logs"
        subtitle="No nutrition logs found."
        onBackPress={handleBack}
      />
    );
  }

  // render list of nutrition entries
  return (
    <AnalyticsLogScreen
      title="Nutrition Logs"
      subtitle="Your previous logs:"
      onBackPress={handleBack}
    >
      {/* Scrollable container for all nutrition cards */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Map over all nutrition entries and render as cards */}
        {nutritionEntries.map((entry, index) => (
          <AnalyticsNutritionCard key={entry._id || index} entry={entry} />
        ))}
      </ScrollView>
    </AnalyticsLogScreen>
  );
}
