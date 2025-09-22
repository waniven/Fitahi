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
  const router = useRouter();
  const [nutritionEntries, setNutritionEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNutrition() {
      try {
        const data = await getAllNutrition();
        setNutritionEntries(data);
      } catch (err) {
        CustomToast.error("Could not load Nutrition logs", "Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchNutrition();
  }, []);

  const handleBack = () => router.back();

  if (loading) {
    return (
      <AnalyticsLogScreen
        title="Nutrition Logs"
        subtitle="Loading..."
        onBackPress={handleBack}
      />
    );
  }

  if (nutritionEntries.length === 0) {
    return (
      <AnalyticsLogScreen
        title="Nutrition Logs"
        subtitle="No nutrition logs found."
        onBackPress={handleBack}
      />
    );
  }

  return (
    <AnalyticsLogScreen
      title="Nutrition Logs"
      subtitle="Your previous logs:"
      onBackPress={handleBack}
    >
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {nutritionEntries.map((entry, index) => (
          <AnalyticsNutritionCard key={entry._id || index} entry={entry} />
        ))}
      </ScrollView>
    </AnalyticsLogScreen>
  );
}
