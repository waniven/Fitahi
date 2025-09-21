import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import AnalyticsLogScreen from "../../components/analytics/AnalyticsLogScreen";
import AnalyticsUniversalCard from "../../components/analytics/AnalyticsUniversalCard";
import { getBiometrics } from "../../services/biometricService";
import CustomToast from "@/components/common/CustomToast";

export default function BiometricsAnalyticsScreen() {
  const router = useRouter();
  const [biometricEntries, setBiometricEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBiometrics() {
      try {
        const data = await getBiometrics();
        setBiometricEntries(data);
      } catch (err) {
        CustomToast.error("Could not load Biometric logs", "Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchBiometrics();
  }, []);

  const handleBack = () => router.back();

  if (loading) {
    return (
      <AnalyticsLogScreen
        title="Biometrics Logs"
        subtitle="Loading..."
        onBackPress={handleBack}
      />
    );
  }

  if (biometricEntries.length === 0) {
    return (
      <AnalyticsLogScreen
        title="Biometrics Logs"
        subtitle="No biometrics logs found."
        onBackPress={handleBack}
      />
    );
  }

  return (
    <AnalyticsLogScreen
      title="Biometrics Logs"
      subtitle="Your previous logs:"
      onBackPress={handleBack}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
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
