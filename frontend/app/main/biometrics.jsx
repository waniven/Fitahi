// app/main/biometrics.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LogScreen from '../../components/common/LogScreen';
import BiometricEntryModal from '../../components/common/BiometricEntryModal';
import { Colors } from '../../constants/Colors';
import globalStyles from '../../styles/globalStyles';

/**
 * BiometricEntryCard - Displays individual biometric entries with height, weight, and date
 */
const BiometricEntryCard = ({ entry, onDelete }) => {
  const theme = Colors["dark"];
  
  return (
    <View style={[styles.entryCard, { backgroundColor: '#fff' }]}>
      <View style={styles.entryHeader}>
        <Text style={[globalStyles.cardText, { color: theme.tint }]}>
          Biometric Entry
        </Text>
        <TouchableOpacity onPress={() => onDelete(entry.id)}>
          <Ionicons name="trash-outline" size={20} color="#FF5252" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.entryDetails}>
        <View style={styles.entryRow}>
          <Text style={[styles.entryLabel, { color: '#666' }]}>Height:</Text>
          <Text style={[styles.entryValue, { color: '#000' }]}>{entry.height} cm</Text>
        </View>
        <View style={styles.entryRow}>
          <Text style={[styles.entryLabel, { color: '#666' }]}>Weight:</Text>
          <Text style={[styles.entryValue, { color: '#000' }]}>{entry.weight} kg</Text>
        </View>
        <Text style={[styles.entryDate, { color: '#999' }]}>
          {new Date(entry.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};

/**
 * Dedicated Biometrics Screen
 * This screen is accessed when users click the "Biometrics" button from the home screen
 * Uses the reusable LogScreen component with proper navigation integration
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

  // Handle entry deletion with confirmation
  const handleDeleteEntry = (entryId) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setBiometricEntries(previousEntries => 
            previousEntries.filter(entry => entry.id !== entryId))
        }
      ]
    );
  };

  // Render content based on whether entries exist
  const renderContent = () => {
    if (biometricEntries.length === 0) {
      return null; // Show default LogScreen content
    }

    return (
      <ScrollView style={styles.entriesContainer} showsVerticalScrollIndicator={false}>
        <Text style={[styles.entriesTitle, globalStyles.cardText, { color: Colors.dark.textPrimary }]}>
          Your Entries
        </Text>
        {biometricEntries.map((entry) => (
          <BiometricEntryCard 
            key={entry.id} 
            entry={entry} 
            onDelete={handleDeleteEntry}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <>
      <LogScreen
        title="Biometrics Log"
        subtitle="Track Your Biometrics"
        showBackButton={true}
        showAddButton={true}
        onBackPress={handleBackPress}
        onAddPress={handleAddBiometric}
      >
        {renderContent()}
      </LogScreen>
      
      <BiometricEntryModal 
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveEntry}
      />
    </>
  );
}

const styles = StyleSheet.create({
  // Entries container
  entriesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  
  // Header text for entries list
  entriesTitle: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  
  // Individual entry card styling
  entryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Entry card header with title and delete button
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  // Container for entry data rows
  entryDetails: {
    gap: 8,
  },
  
  // Individual data row layout
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Label text styling (Height:, Weight:)
  entryLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat_700Bold',
  },
  
  // Value text styling (185 cm, 75 kg)
  entryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  
  // Date display at bottom of card
  entryDate: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
    fontFamily: 'Montserrat_400Regular',
  },
});