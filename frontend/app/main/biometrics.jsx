// app/main/biometrics.jsx
import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LogScreen from '../../components/common/LogScreen';
import BiometricEntryModal from '../../components/biometrics/BiometricEntryModal';
import BiometricsDashboard from '../../components/biometrics/BiometricsDashboard';
import { Colors } from '../../constants/Colors';
import { sampleEntries } from '../../components/common/SampleData';


/**
 * Dedicated Biometrics Screen
 * Shows LogScreen when empty, BiometricsDashboard when entries exist
 */
export default function BiometricsScreen() {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [biometricEntries, setBiometricEntries] = useState(sampleEntries.biometricEntries);


  // Handle back navigation to home screen
  const handleBackPress = () => {
    router.back();
  };

  // Handle add biometric entry action
  const handleAddBiometric = () => {
    setIsModalVisible(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  // Handle saving new biometric entry
  const handleSaveEntry = (entryData) => {
    setBiometricEntries(previousEntries => [entryData, ...previousEntries]);
    setIsModalVisible(false);
  };

  // Handle entry deletion
  const handleDeleteEntry = (entryId) => {
    setBiometricEntries(previousEntries => 
      previousEntries.filter(entry => entry.id !== entryId));
  };

  // Render empty state with LogScreen
  if (biometricEntries.length === 0) {
    return (
      <>
        <LogScreen
          title="Biometrics Log"
          subtitle="Track Your Biometrics"
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