import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import AnalyticsLogScreen from "@/components/analytics/AnalyticsLogScreen";
import AnalyticsUniversalCard from "@/components/analytics/AnalyticsUniversalCard";
import { getAllWater } from "@/services/waterServices";
import CustomToast from "@/components/common/CustomToast";

/**
 * Screen that displays a scrollable list of water intake log entries
 * Shows historical water consumption data in a standardized analytics format
 */
export default function WaterAnalyticsPage() {
  const router = useRouter();
  const [waterEntries, setWaterEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWater() {
      try {
        const data = await getAllWater();
        setWaterEntries(data);
      } catch (err) {
        CustomToast.error("Could not load Water logs", "Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchWater();
  }, []);

  const handleBack = () => router.back();

  if (loading) {
    return (
      <AnalyticsLogScreen
        title="Water Logs"
        subtitle="Loading..."
        onBackPress={handleBack}
      />
    );
  }

  if (waterEntries.length === 0) {
    return (
      <AnalyticsLogScreen
        title="Water Logs"
        subtitle="No water logs found."
        onBackPress={handleBack}
      />
    );
  }

  return (
    <AnalyticsLogScreen
      title="Water Logs"
      subtitle="Your previous logs:"
      onBackPress={handleBack}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {waterEntries.map((entry, index) => (
          <AnalyticsUniversalCard
            key={entry._id || index}
            entry={entry}
            type="water"
          />
        ))}
      </ScrollView>
    </AnalyticsLogScreen>
  );
}
