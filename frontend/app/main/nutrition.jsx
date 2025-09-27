import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import LogScreen from "../../components/common/LogScreen";
import NutritionEntryModal from "../../components/nutrition/NutritionEntryModal";
import NutritionDashboard from "../../components/nutrition/NutritionDashboard";
import { sampleEntries } from "../../components/common/SampleData";
import CustomToast from "../../components/common/CustomToast";
import { getMe } from "@/services/userService";
import {
  postNutrition,
  getNutrition,
  deleteNutrition,
} from "../../services/nutritionService";
import * as notificationService from "@/services/notificationService";
import * as reminderService from "@/services/reminderService";

/**
 * Nutrition - Food intake logging screen
 * Uses the reusable LogScreen component with nutrition-specific configuration
 * Shows dashboard when entries exist, otherwise shows initial log screen
 */

const Nutrition = () => {
  const router = useRouter();

  // State for modal visibility for adding/editing food entries
  const [modalVisible, setModalVisible] = useState(false);

  // State to determine whether to show dashboard or log screen
  const [showDashboard, setShowDashboard] = useState(false);

  // State to store nutrition entries
  const [nutritionEntries, setNutritionEntries] = useState(
    sampleEntries.nutritionEntries
  );

  // Loading and error state for API requests
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default macro and calorie goals: 2300, protein: 30% / 4, carbs: 50% / 4, fat: 20% / 9
  const [calorieGoal, setCalorieGoal] = useState(2300);
  const [carbGoal, setCarbGoal] = useState(287.5);
  const [proteinGoal, setProteinGoal] = useState(172.5);
  const [fatGoal, setFatGoal] = useState(51.1111111111);

  // Handle back navigation
  const handleBackPress = () => router.back();

  // Schedule water reminder 30 minutes after adding a meal
  const scheduleWaterReminder = async () => {
    try {
      const reminderTime = new Date();
      reminderTime.setMinutes(reminderTime.getMinutes() + 30);

      const waterReminderData = {
        title: " 💧 This is your friendly reminder to hydrate!",
        notes: "Grab a glass of water after your food.",
        date: reminderTime.toISOString(),
        repeat: "None",
        time: `${String(reminderTime.getHours()).padStart(2, "0")}:${String(
          reminderTime.getMinutes()
        ).padStart(2, "0")}`,
      };

      // Save reminder to backend
      const saved = await reminderService.createReminder(waterReminderData);

      // Schedule local notification
      const ids = await notificationService.scheduleReminderNotification(
        saved,
        1
      );
      saved.notificationIds = ids;

      // Log scheduled reminder
      console.log("Water reminder scheduled and saved:", saved);
    } catch (err) {
      console.warn("Failed to schedule water reminder", err);
    }
  };

  // Open food entry modal
  const handleAddFood = () => {
    setModalVisible(true);
  };

  // Close food entry modal
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  // Calculate and update macro breakdown based on calories (from API) - protein: 30% / 4, carbs: 50% / 4, fat: 20% / 9
  const macroBreakdown = (calories) => {
    const cals = Number(calories) || 2300;
    const carbGoal = (cals * 0.5) / 4;
    const proteinGoal = (cals * 0.3) / 4;
    const fatGoal = (cals * 0.2) / 9;

    // Update state rounded to 1 decimal place
    setCalorieGoal(cals);
    setCarbGoal(parseFloat(carbGoal.toFixed(1)));
    setProteinGoal(parseFloat(proteinGoal.toFixed(1)));
    setFatGoal(parseFloat(fatGoal.toFixed(1)));
  };

  // Normalize backend nutrition entry to UI format
  const toUI = (row) => ({
    id: row.id ?? row._id ?? row.uuid,
    name: row.name,
    type: row.type,
    mealType: row.type,
    calories: Number(row.calories) || 0,
    protein: Number(row.protein ?? row.protine) || 0,
    fat: Number(row.fat ?? row.fats) || 0,
    carbs: Number(row.carbs) || 0,
    timestamp: row.timestamp ?? row.createdAt ?? new Date().toISOString(),
  });

  // Load nutrition data and user intake goals on mount
  useEffect(() => {
    let mounted = true;

    const loadNutrition = async () => {
      setLoading(true);
      setError(null);

      // Load daily calorie info from user profile
      try {
        const me = await getMe();
        macroBreakdown(me.intakeGoals?.dailyCalories);
      } catch (err) {
        CustomToast.error("Error loading intake goal");
        console.warn("GET /me failed", err);
      }

      // Load nutrition entries
      try {
        const res = await getNutrition();
        const rows = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        const normalized = rows.map(toUI);

        if (!mounted) return;

        setNutritionEntries(normalized);

        if (rows.length > 0) setShowDashboard(true);
      } catch (err) {
        if (!mounted) return;

        CustomToast.error("Error loading nutrition logs");
        console.warn("GET /nutrition failed", err);
        setShowDashboard(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadNutrition();

    return () => {
      mounted = false;
    };
  }, []);

  // Save new nutrition entry
  const handleSaveNutritionEntry = async (newEntry) => {
    try {
      const entryToSave = {
        name: newEntry.foodName,
        type: newEntry.mealType,
        calories: Number(newEntry.calories),
        protein: Number(newEntry.protein),
        fat: Number(newEntry.fat),
        carbs: Number(newEntry.carbs),
      };

      const saved = await postNutrition(entryToSave);
      const normalizedSaved = toUI(saved);

      console.log("New nutrition entry saved:", normalizedSaved);

      // Update state with new entry
      setNutritionEntries((prevEntries) => [...prevEntries, normalizedSaved]);

      // Show dashboard after adding entry
      setShowDashboard(true);

      CustomToast.nutritionSaved(
        saved.name ?? newEntry.name,
        newEntry.mealType
      );

      // Schedule water reminder after meal
      scheduleWaterReminder();
    } catch (err) {
      console.warn("New Nutrition log save failed:", err);
      CustomToast.error("Could not save meal entry");
    } finally {
      setModalVisible(false);
    }
  };

  // Delete a nutrition entry
  const handleDeleteEntry = async (entryId) => {
    const toDelete = nutritionEntries.find(
      (e) => String(e.id) === String(entryId)
    );
    const deletedName = toDelete?.name ?? toDelete?.foodName ?? "Entry";

    try {
      await deleteNutrition(entryId);

      // Update local nutrition entries array
      setNutritionEntries((prevEntries) => {
        const newEntries = prevEntries.filter((entry) => entry.id !== entryId);
        console.log("New entries after delete:", newEntries);

        // Check if no entries remain and update dashboard state
        if (newEntries.length === 0) {
          console.log("No entries remaining, returning to base screen");
          setTimeout(() => setShowDashboard(false), 100);
        }
        return newEntries;
      });

      CustomToast.nutritionDeleted(deletedName);
    } catch (err) {
      console.warn("Delete failed:", err);
      CustomToast.error("Could not delete nutrition log");
    }
  };

  // Render nutrition dashboard if entries exist
  if (showDashboard && nutritionEntries.length > 0) {
    return (
      <>
        {/* Render nutrition dashboard with entries and daily goals */}
        <NutritionDashboard
          entries={nutritionEntries}
          onDeleteEntry={handleDeleteEntry}
          onAddEntry={handleAddFood}
          onBackPress={handleBackPress}
          dailyGoals={{
            calories: calorieGoal,
            protein: proteinGoal,
            carbs: carbGoal,
            fat: fatGoal,
          }}
        />

        {/* Render modal for adding/editing nutrition entry */}
        <NutritionEntryModal
          visible={modalVisible}
          onClose={handleCloseModal}
          onSave={handleSaveNutritionEntry}
        />
      </>
    );
  }

  // Render initial log screen if no entries
  return (
    <>
      {/* Render base log screen for nutrition */}
      <LogScreen
        title="Nutrition Log"
        subtitle="Log your food"
        showBackButton={true}
        showAddButton={true}
        onBackPress={handleBackPress}
        onAddPress={handleAddFood}
      />

      {/* Render modal for adding nutrition entry */}
      <NutritionEntryModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveNutritionEntry}
      />
    </>
  );
};

export default Nutrition;
