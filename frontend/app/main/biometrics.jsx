// app/main/biometrics.jsx
import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LogScreen from '../../components/common/LogScreen';
import BiometricEntryModal from '../../components/biometrics/BiometricEntryModal';
import BiometricsDashboard from '../../components/biometrics/BiometricsDashboard';
import { Colors } from '../../constants/Colors';

/**
 * Dedicated Biometrics Screen
 * Shows LogScreen when empty, BiometricsDashboard when entries exist
 */
export default function BiometricsScreen() {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [biometricEntries, setBiometricEntries] = useState([]);

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

  // Render dashboard when entries exist
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Biometrics Log</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Dashboard */}
      <BiometricsDashboard
        entries={biometricEntries}
        onDeleteEntry={handleDeleteEntry}
        onAddEntry={handleAddBiometric}
      />

      {/* Modal */}
      <BiometricEntryModal 
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveEntry}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.dark.background,
  },

  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#333',
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Montserrat_700Bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },

  headerSpacer: {
    width: 40, // Same width as back button to center title
  },
});