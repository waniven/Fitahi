// app/main/nutrition.jsx
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

  const [modalVisible, setModalVisible] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [nutritionEntries, setNutritionEntries] = useState(
    sampleEntries.nutritionEntries
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //fall back values calories: 2300, protein: 30% / 4, carbs: 50% / 4, fat: 20% / 9
  const [calorieGoal, setCalorieGoal] = useState(2300);
  const [carbGoal, setCarbGoal] = useState(287.5);
  const [proteinGoal, setProteinGoal] = useState(172.5);
  const [fatGoal, setFatGoal] = useState(51.1111111111);

  //back button logic
  const handleBackPress = () => router.back();

  // helper function to schedule reminder to hydrate 30 mins after meal
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

      // save to backend so it appears on calendar
      const saved = await reminderService.createReminder(waterReminderData);

      // schedule notification
      const ids = await notificationService.scheduleReminderNotification(
        saved,
        1
      );
      saved.notificationIds = ids;

      // update local state in Nutrition.jsx if needed (or refetch reminders in Home)
      console.log("Water reminder scheduled and saved:", saved);
    } catch (err) {
      console.warn("Failed to schedule water reminder", err);
    }
  };

  const handleAddFood = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  //calories: from API, protein: 30% / 4, carbs: 50% / 4, fat: 20% / 9
  const macroBreakdown = (calories) => {
    const cals = Number(calories) || 2300;
    const carbGoal = (cals * 0.5) / 4;
    const proteinGoal = (cals * 0.3) / 4;
    const fatGoal = (cals * 0.2) / 9;

    //rounded to 1 dp
    setCalorieGoal(cals);
    setCarbGoal(parseFloat(carbGoal.toFixed(1)));
    setProteinGoal(parseFloat(proteinGoal.toFixed(1)));
    setFatGoal(parseFloat(fatGoal.toFixed(1)));
  };

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

  //load from api
  useEffect(() => {
    let mounted = true;

    const loadNutrition = async () => {
      setLoading(true);
      setError(null);

      //load daily calorie info from getMe api route
      try {
        const me = await getMe();
        macroBreakdown(me.intakeGoals?.dailyCalories);
      } catch (err) {
        CustomToast.error("Error loading intake goal");
        console.warn("GET /me failed", err);
      }

      try {
        const res = await getNutrition();
        const rows = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        const normalized = rows.map(toUI);

        if (!mounted) {
          return;
        }

        setNutritionEntries(normalized);

        if (rows.length > 0) {
          setShowDashboard(true);
        }
      } catch (err) {
        if (!mounted) {
          return;
        }

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

      setNutritionEntries((prevEntries) => [...prevEntries, normalizedSaved]);
      // Navigate to dashboard after adding entry
      setShowDashboard(true);
      CustomToast.nutritionSaved(
        saved.name ?? newEntry.name,
        newEntry.mealType
      );

      // schedule water reminder to go off 30 mins after having food
      scheduleWaterReminder();
    } catch (err) {
      console.warn("New Nutrition log save failed:", err);
      CustomToast.error("Could not save meal entry");
    } finally {
      setModalVisible(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    const toDelete = nutritionEntries.find(
      (e) => String(e.id) === String(entryId)
    );
    const deletedName = toDelete?.name ?? toDelete?.foodName ?? "Entry";

    try {
      await deleteNutrition(entryId);

      //update local array
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

  // Show dashboard if we have entries and showDashboard is true
  if (showDashboard && nutritionEntries.length > 0) {
    return (
      <>
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
