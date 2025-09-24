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

/**
 * Main biometrics screen that manages biometric data tracking and display
 * Shows dashboard with entries or empty state, handles CRUD operations
 */
export default function BiometricsScreen() {
  const router = useRouter();
  
  // Controls the visibility of the biometric entry modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Stores all biometric entries fetched from the backend
  const [biometricEntries, setBiometricEntries] = useState([]);
  
  // Controls loading state during initial data fetch
  const [loading, setLoading] = useState(true);
  
  // Tracks animated progress during data loading (0-1)
  const [progress, setProgress] = useState(0);

  // Fetches biometric entries on component mount with animated progress
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setProgress(0.3);
        const data = await getBiometrics();
        setProgress(0.7);
        setBiometricEntries(data);
        setProgress(1);
      } catch (err) {
        console.error("Failed to fetch biometrics:", err);
        CustomToast.error("Error", "Could not fetch biometrics.");
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };

    fetchEntries();
  }, []);

  // Navigation handlers
  const handleBackPress = () => router.back();
  const handleAddBiometric = () => setIsModalVisible(true);
  const handleCloseModal = () => setIsModalVisible(false);

  // Creates a new biometric entry and adds it to the top of the list
  const handleSaveEntry = async (entryData) => {
    try {
      const created = await createBiometric(entryData);
      setBiometricEntries((prev) => [created, ...prev]);
      setIsModalVisible(false);
    } catch (err) {
      CustomToast.error("Error", "Could not add new entry.");
    }
  };

  // Deletes a biometric entry with confirmation toast showing the removed weight
  const handleDeleteEntry = async (entryId) => {
    try {
      const entry = biometricEntries.find((e) => e._id === entryId);
      if (!entry) return;

      await deleteBiometric(entryId);

      CustomToast.info(
        "Measurement Removed",
        `${entry.weight?.toFixed(1) || "?"}kg entry deleted from your log`
      );

      setBiometricEntries((prev) => prev.filter((e) => e._id !== entryId));
    } catch (err) {
      console.error("Failed to delete biometric:", err);
      CustomToast.error("Error", "Could not delete entry.");
    }
  };

  // Shows animated loading screen during data fetch
  if (loading) {
    return (
      <LoadingProgress progress={progress} message="Fetching biometrics..." />
    );
  }

  // Shows empty state with add button when no entries exist
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

  // Shows dashboard with biometric entries and management capabilities
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