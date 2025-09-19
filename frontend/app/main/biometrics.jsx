import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import LogScreen from "../../components/common/LogScreen";
import BiometricEntryModal from "../../components/biometrics/BiometricEntryModal";
import BiometricsDashboard from "../../components/biometrics/BiometricsDashboard";
import LoadingProgress from "@/components/LoadingProgress";
import {
  getBiometrics,
  createBiometric,
  deleteBiometric,
} from "../../services/biometricService";
import CustomToast from "@/components/common/CustomToast";

export default function BiometricsScreen() {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [biometricEntries, setBiometricEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0); // animated progress

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        // Start progress at 30%
        setProgress(0.3);

        // fetch biometrics
        const data = await getBiometrics();

        // update progress to 70% after fetch
        setProgress(0.7);

        // set data
        setBiometricEntries(data);

        // complete progress
        setProgress(1);
      } catch (err) {
        console.error("Failed to fetch biometrics:", err);
        CustomToast.error("Error", "Could not fetch biometrics.");
      } finally {
        // add a short delay so users see the progress complete
        setTimeout(() => setLoading(false), 300);
      }
    };

    fetchEntries();
  }, []);

  const handleBackPress = () => router.back();
  const handleAddBiometric = () => setIsModalVisible(true);
  const handleCloseModal = () => setIsModalVisible(false);

  // handle biometric entry creation
  const handleSaveEntry = async (entryData) => {
    try {
      const created = await createBiometric(entryData);
      setBiometricEntries((prev) => [created, ...prev]);
      setIsModalVisible(false);
    } catch (err) {
      CustomToast.error("Error", "Could not add new entry.");
    }
  };

  // handle biometric entry deletion
  const handleDeleteEntry = async (entryId) => {
    try {
      // Find the entry so we can get its weight
      const entry = biometricEntries.find((e) => e._id === entryId);
      if (!entry) return;

      await deleteBiometric(entryId);

      // Show toast after successful deletion
      CustomToast.info(
        "Measurement Removed",
        `${entry.weight?.toFixed(1) || "?"}kg entry deleted from your log`
      );

      // Update state to remove deleted entry
      setBiometricEntries((prev) => prev.filter((e) => e._id !== entryId));
    } catch (err) {
      console.error("Failed to delete biometric:", err);
      CustomToast.error("Error", "Could not delete entry.");
    }
  };

  // Show loading overlay while fetching
  if (loading) {
    return (
      <LoadingProgress progress={progress} message="Fetching biometrics..." />
    );
  }

  // Show empty state if no entries
  if (biometricEntries.length === 0) {
    return (
      <>
        <LogScreen
          title="Biometrics Log"
          subtitle="Track your biometrics"
          showBackButton={true}
          showAddButton={true}
          onBackPress={handleBackPress}
          onAddPress={handleAddBiometric}
        />
        <BiometricEntryModal
          visible={isModalVisible}
          onClose={handleCloseModal}
          onSave={handleSaveEntry}
        />
      </>
    );
  }

  // Show dashboard if entries exist
  return (
    <>
      <BiometricsDashboard
        entries={biometricEntries}
        onDeleteEntry={handleDeleteEntry}
        onAddEntry={handleAddBiometric}
        onBackPress={handleBackPress}
      />
      <BiometricEntryModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveEntry}
      />
    </>
  );
}
