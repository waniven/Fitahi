// app/main/nutrition.jsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import LogScreen from '../../components/common/LogScreen';
import NutritionEntryModal from '../../components/nutrition/NutritionEntryModal';
import NutritionDashboard from '../../components/nutrition/NutritionDashboard';
import { sampleEntries } from '../../components/common/SampleData';
import CustomToast from '../../components/common/CustomToast';
import { postNutrition, getNutrition, deleteNutrition } from '../../services/nutritionService';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //back button logic
  const handleBackPress = () => router.back();

  const handleAddFood = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

const toUI = (row) => ({
  id: row.id ?? row._id ?? row.uuid,
  name: row.name,
  type: row.type,                  // keep both for safety
  mealType: row.type,
  calories: Number(row.calories) || 0,
  protein: Number(row.protein ?? row.protine) || 0,
  fat: Number(row.fat ?? row.fats) || 0,
  carbs: Number(row.carbs) || 0,
  // 👇 THIS is the key bit for the dashboard's date filtering
  timestamp: row.timestamp ?? row.createdAt ?? new Date().toISOString(),
});

  //load from api
  useEffect (() => {
    let mounted = true;

    const loadNutrition = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getNutrition();
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const normalized = rows.map(toUI);

        if (!mounted) {
          return;
        }

        setNutritionEntries(normalized);

        if (rows.length > 0) {
          setShowDashboard(true);
        } 
      } catch (err) {
        if (!mounted){
          return;
        }

        CustomToast.error('Error loading nutrition logs');
        console.warn('GET /nutrition failed', err);
        setShowDashboard(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadNutrition();
    return() => { mounted = false; };
  }, []);

  const handleSaveNutritionEntry = async (newEntry) => {
    try {
      const entryToSave = {
        name: newEntry.foodName,
        type: newEntry.mealType,
        calories: Number(newEntry.calories),
        protein: Number(newEntry.protein),
        fat: Number(newEntry.fat),
        carbs: Number(newEntry.carbs),
      }

      const saved = await postNutrition(entryToSave);
      const normalizedSaved = toUI(saved);

      console.log('New nutrition entry saved:', normalizedSaved);

      setNutritionEntries(prevEntries => [...prevEntries, normalizedSaved]);
      // Navigate to dashboard after adding entry
      setShowDashboard(true);
      CustomToast.nutritionSaved(saved.name ?? newEntry.name, newEntry.mealType);
    } catch (err) {
      console.warn('New Nutrition log save failed:', err);
      CustomToast.error('Could not save meal entry');
    } finally {
      setModalVisible(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
  const toDelete = nutritionEntries.find(e => String(e.id) === String(entryId));
  const deletedName = toDelete?.name ?? toDelete?.foodName ?? 'Entry';

    try { 
      await deleteNutrition(entryId);

      //update local array 
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
      CustomToast.nutritionDeleted(deletedName);
    } catch (err) {
      console.warn('Delete failed:', err);
      CustomToast.error('Could not delete nutrition log');
    }
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