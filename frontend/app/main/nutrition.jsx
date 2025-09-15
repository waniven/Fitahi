// app/main/nutrition.jsx
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import LogScreen from '../../components/common/LogScreen';
import NutritionEntryModal from '../../components/nutrition/NutritionEntryModal';
import NutritionDashboard from '../../components/nutrition/NutritionDashboard';
import { sampleEntries } from '../../components/common/SampleData';

/**
 * Nutrition - Food intake logging screen
 * Uses the reusable LogScreen component with nutrition-specific configuration
 * Shows dashboard when entries exist, otherwise shows initial log screen
 */

const Nutrition = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [nutritionEntries, setNutritionEntries] = useState(sampleEntries.nutritionEntries);


  const handleBackPress = () => {
    if (showDashboard) {
      setShowDashboard(false);
    } else {
      router.back();
    }
  };

  const handleAddFood = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSaveNutritionEntry = (newEntry) => {
    console.log('New nutrition entry saved:', newEntry);
    setNutritionEntries(prevEntries => [...prevEntries, newEntry]);
    // Navigate to dashboard after adding entry
    setShowDashboard(true);
  };

  const handleDeleteEntry = (entryId) => {
    console.log('Attempting to delete entry with ID:', entryId);
    console.log('Current entries before delete:', nutritionEntries);
    
    setNutritionEntries(prevEntries => {
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
  if (showDashboard && nutritionEntries.length > 0) {
    return (
      <>
        <NutritionDashboard
          entries={nutritionEntries}
          onDeleteEntry={handleDeleteEntry}
          onAddEntry={handleAddFood}
          onBackPress={handleBackPress}
          dailyGoals={{ calories: 3000, protein: 200, carbs: 200, fat: 200 }}
        />
        
        <NutritionEntryModal
          visible={modalVisible}
          onClose={handleCloseModal}
          onSave={handleSaveNutritionEntry}
        />
      </>
    );
  }

  // Show initial log screen
  return (
    <>
      <LogScreen
        title="Nutrition Log"
        subtitle="Log your food"
        showBackButton={true}
        showAddButton={true}
        onBackPress={handleBackPress}
        onAddPress={handleAddFood}
      />
      
      <NutritionEntryModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveNutritionEntry}
      />
    </>
  );
};

export default Nutrition;