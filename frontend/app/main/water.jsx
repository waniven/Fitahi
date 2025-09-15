// app/main/water.jsx
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import LogScreen from '../../components/common/LogScreen';
import WaterEntryModal from '../../components/water/WaterEntryModal';
import WaterDashboard from '../../components/water/WaterDashboard';
import { sampleEntries } from '../../components/common/SampleData';


/**
 * Water - Water intake logging screen
 * Uses the reusable LogScreen component with water-specific configuration
 * Shows dashboard when entries exist, otherwise shows initial log screen
 */

const Water = () => {
  const [waterEntries, setWaterEntries] = useState(sampleEntries.waterEntries);
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleBackPress = () => {
    if (showDashboard) {
      setShowDashboard(false);
    } else {
      router.back();
    }
  };

  const handleAddWater = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSaveWaterEntry = (newEntry) => {
    console.log('New water entry saved:', newEntry);
    setWaterEntries(prevEntries => [...prevEntries, newEntry]);
    // Navigate to dashboard after adding entry
    setShowDashboard(true);
  };

  const handleDeleteEntry = (entryId) => {
    console.log('Attempting to delete entry with ID:', entryId);
    console.log('Current entries before delete:', waterEntries);
    
    setWaterEntries(prevEntries => {
      const newEntries = prevEntries.filter(entry => entry.id !== entryId);
      console.log('New entries after delete:', newEntries);
      
      // Check if no entries remain and update dashboard state
      if (newEntries.length === 0) {
        console.log('No entries remaining, returning to base screen');
        setTimeout(() => setShowDashboard(false), 100);
      }
      
      return newEntries;
    });
  };

  // Show dashboard if we have entries and showDashboard is true
  if (showDashboard && waterEntries.length > 0) {
    return (
      <>
        <WaterDashboard
          entries={waterEntries}
          onDeleteEntry={handleDeleteEntry}
          onAddEntry={handleAddWater}
          onBackPress={handleBackPress}
          dailyGoal={2000}
        />
        
        <WaterEntryModal
          visible={modalVisible}
          onClose={handleCloseModal}
          onSave={handleSaveWaterEntry}
        />
      </>
    );
  }

  // Show initial log screen
  return (
    <>
      <LogScreen
        title="Water Log"
        subtitle="Log your water intake"
        showBackButton={true}
        showAddButton={true}
        onBackPress={handleBackPress}
        onAddPress={handleAddWater}
      />
      
      <WaterEntryModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveWaterEntry}
      />
    </>
  );
};

export default Water;