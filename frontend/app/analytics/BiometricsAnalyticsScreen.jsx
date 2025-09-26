import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import AnalyticsLogScreen from "../../components/analytics/AnalyticsLogScreen";
import AnalyticsUniversalCard from "../../components/analytics/AnalyticsUniversalCard";
import { getBiometrics } from "../../services/biometricService";
import CustomToast from "@/components/common/CustomToast";

/**
 * Screen that displays a scrollable list of biometric log entries
 * Shows historical biometric data in a standardized analytics format
 */
export default function BiometricsAnalyticsScreen() {
  // router for navigation actions
  const router = useRouter();

  // stores all fetched biometric entries
  const [biometricEntries, setBiometricEntries] = useState([]);

  // loading state for fetch process
  const [loading, setLoading] = useState(true);

  // fetch biometrics on mount
  useEffect(() => {
    async function fetchBiometrics() {
      try {
        const data = await getBiometrics();
        setBiometricEntries(data); // save data in state
      } catch (err) {
        CustomToast.error("Could not load Biometric logs", "Please try again.");
      } finally {
        setLoading(false); // stop loading state
      }
    }

    fetchBiometrics();
  }, []);

  // handler to navigate back
  const handleBack = () => router.back();

  // show loading screen while fetching
  if (loading) {
    return (
      <AnalyticsLogScreen
        title="Biometrics Logs"
        subtitle="Loading..."
        onBackPress={handleBack}
      />
    );
  }

  // show empty state if no entries exist
  if (biometricEntries.length === 0) {
    return (
      <AnalyticsLogScreen
        title="Biometrics Logs"
        subtitle="No biometrics logs found."
        onBackPress={handleBack}
      />
    );
  }

  // list of biometric entries in scrollable view
  return (
    <AnalyticsLogScreen
      title="Biometrics Logs"
      subtitle="Your previous logs:"
      onBackPress={handleBack}
    >
      {/* Scrollable container for all biometric cards */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Map over all biometric entries and render as cards */}
        {biometricEntries.map((entry, index) => (
          <AnalyticsUniversalCard
            key={entry._id || index}
            entry={entry}
            type="biometric"
          />
        ))}
      </ScrollView>
    </AnalyticsLogScreen>
  );
}
