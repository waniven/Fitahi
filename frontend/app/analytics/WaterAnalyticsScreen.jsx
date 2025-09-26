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
  // router for navigation actions
  const router = useRouter();

  // stores all fetched water entries
  const [waterEntries, setWaterEntries] = useState([]);

  // loading state for fetch process
  const [loading, setLoading] = useState(true);

  // fetch water entries on mount
  useEffect(() => {
    async function fetchWater() {
      try {
        const data = await getAllWater();
        setWaterEntries(data); // save fetched data to state
      } catch (err) {
        CustomToast.error("Could not load Water logs", "Please try again.");
      } finally {
        setLoading(false); // stop loading state
      }
    }

    fetchWater();
  }, []);

  // handler to navigate back
  const handleBack = () => router.back();

  // show loading screen while fetching
  if (loading) {
    return (
      <AnalyticsLogScreen
        title="Water Logs"
        subtitle="Loading..."
        onBackPress={handleBack}
      />
    );
  }

  // show empty state if no entries exist
  if (waterEntries.length === 0) {
    return (
      <AnalyticsLogScreen
        title="Water Logs"
        subtitle="No water logs found."
        onBackPress={handleBack}
      />
    );
  }

  // render list of water entries
  return (
    <AnalyticsLogScreen
      title="Water Logs"
      subtitle="Your previous logs:"
      onBackPress={handleBack}
    >
      {/* Scrollable container for all water cards */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Map over all water entries and render as cards */}
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
