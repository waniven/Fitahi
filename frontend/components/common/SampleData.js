// data/SampleData.js

// Generate dynamic dates for more realistic data
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const dayBefore = new Date(today);
dayBefore.setDate(dayBefore.getDate() - 2);

export const sampleEntries = {
  // Water entries matching WaterEntryModal format
  waterEntries: [
    {
      id: "water_1",
      amount: 500,
      time: "08:00",
      timestamp: today.toISOString(),
    },
    {
      id: "water_2", 
      amount: 350,
      time: "12:30",
      timestamp: today.toISOString(),
    },
    {
      id: "water_3",
      amount: 400,
      time: "16:45",
      timestamp: yesterday.toISOString(),
    },
    {
      id: "water_4",
      amount: 300,
      time: "20:15",
      timestamp: yesterday.toISOString(),
    }
  ],
  
  // Nutrition entries matching NutritionEntryModal format
  nutritionEntries: [
    {
      id: "nutrition_1",
      foodName: "Oatmeal with Berries",
      mealType: "breakfast",
      calories: 320,
      protein: 12,
      carbs: 54,
      fat: 8,
      timestamp: today.toISOString(),
    },
    {
      id: "nutrition_2",
      foodName: "Grilled Chicken Salad",
      mealType: "lunch", 
      calories: 450,
      protein: 35,
      carbs: 20,
      fat: 25,
      timestamp: today.toISOString(),
    },
    {
      id: "nutrition_3",
      foodName: "Salmon with Rice",
      mealType: "dinner",
      calories: 520,
      protein: 40,
      carbs: 45,
      fat: 18,
      timestamp: yesterday.toISOString(),
    },
    {
      id: "nutrition_4",
      foodName: "Greek Yogurt",
      mealType: "snack",
      calories: 150,
      protein: 15,
      carbs: 12,
      fat: 5,
      timestamp: dayBefore.toISOString(),
    }
  ],

  // Biometric entries matching BiometricEntryModal format
  biometricEntries: [
    {
      id: "biometric_1",
      height: 175,
      weight: 70.5,
      timestamp: today.toISOString(),
    },
    {
      id: "biometric_2",
      height: 175,
      weight: 70.2,
      timestamp: yesterday.toISOString(),
    },
    {
      id: "biometric_3",
      height: 175,
      weight: 70.8,
      timestamp: dayBefore.toISOString(),
    }
  ],

  // Reminder entries matching ReminderModal format
  reminderEntries: [
    {
      id: "reminder_1",
      title: "Take vitamins",
      notes: "Vitamin D and B12 supplements",
      date: today.toISOString().split('T')[0],
      time: "09:00",
      repeat: "Daily"
    },
    {
      id: "reminder_2",
      title: "Gym workout",
      notes: "Leg day - squats and deadlifts",
      date: today.toISOString().split('T')[0], 
      time: "18:00",
      repeat: "Weekly"
    },
    {
      id: "reminder_3",
      title: "Meal prep",
      notes: "Prepare lunch for tomorrow",
      date: yesterday.toISOString().split('T')[0],
      time: "19:30",
      repeat: "None"
    }
  ],

  // Placeholder for other features you might add later
  workoutEntries: [],
  supplementEntries: [],
};

// Calculate total entries for easy access
export const getTotalEntries = () => {
  return Object.values(sampleEntries).reduce((total, entries) => {
    return total + (Array.isArray(entries) ? entries.length : 0);
  }, 0);
};

// Get entries for specific feature
export const getEntriesFor = (featureType) => {
  const key = `${featureType}Entries`;
  return sampleEntries[key] || [];
};

// Get analytics data in the format your analytics expects
export const getAnalyticsData = () => {
  return {
    ...sampleEntries,
    totalEntries: getTotalEntries()
  };
};