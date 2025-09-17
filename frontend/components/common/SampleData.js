// data/SampleData.js

// Generate dynamic dates for more realistic data
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const dayBefore = new Date(today);
dayBefore.setDate(dayBefore.getDate() - 2);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

export const sampleEntries = {
  // Water entries with realistic hydration times
  waterEntries: [
    {
      id: "water_1",
      amount: 500,
      time: "08:00",
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0).toISOString(), // 8:00 AM
    },
    {
      id: "water_2", 
      amount: 350,
      time: "12:30",
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 30).toISOString(), // 12:30 PM
    },
    {
      id: "water_3",
      amount: 400,
      time: "16:45",
      timestamp: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 16, 45).toISOString(), // 4:45 PM yesterday
    },
    {
      id: "water_4",
      amount: 300,
      time: "20:15",
      timestamp: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 20, 15).toISOString(), // 8:15 PM yesterday
    }
  ],
  
  // Nutrition entries with realistic meal times
  nutritionEntries: [
    {
      id: "nutrition_1",
      foodName: "Oatmeal with Berries",
      mealType: "breakfast",
      calories: 320,
      protein: 12,
      carbs: 54,
      fat: 8,
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 30).toISOString(), // 7:30 AM
    },
    {
      id: "nutrition_2",
      foodName: "Grilled Chicken Salad",
      mealType: "lunch", 
      calories: 450,
      protein: 35,
      carbs: 20,
      fat: 25,
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 45).toISOString(), // 12:45 PM
    },
    {
      id: "nutrition_3",
      foodName: "Salmon with Rice",
      mealType: "dinner",
      calories: 520,
      protein: 40,
      carbs: 45,
      fat: 18,
      timestamp: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 19, 0).toISOString(), // 7:00 PM yesterday
    },
    {
      id: "nutrition_4",
      foodName: "Greek Yogurt",
      mealType: "snack",
      calories: 150,
      protein: 15,
      carbs: 12,
      fat: 5,
      timestamp: new Date(dayBefore.getFullYear(), dayBefore.getMonth(), dayBefore.getDate(), 15, 30).toISOString(), // 3:30 PM day before
    }
  ],

  // Biometric entries with morning weigh-in times
  biometricEntries: [
    {
      id: "biometric_1",
      height: 175,
      weight: 70.5,
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 6, 30).toISOString(), // 6:30 AM
    },
    {
      id: "biometric_2",
      height: 175,
      weight: 70.2,
      timestamp: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 6, 45).toISOString(), // 6:45 AM yesterday
    },
    {
      id: "biometric_3",
      height: 175,
      weight: 70.8,
      timestamp: new Date(dayBefore.getFullYear(), dayBefore.getMonth(), dayBefore.getDate(), 6, 15).toISOString(), // 6:15 AM day before
    }
  ],

  // Reminder entries with realistic scheduling times
  reminderEntries: [
    {
      id: "reminder_1",
      title: "Take vitamins",
      notes: "Vitamin D and B12 supplements",
      date: today.toISOString().split('T')[0],
      time: "09:00", // 9:00 AM
      repeat: "Daily"
    },
    {
      id: "reminder_2",
      title: "Gym workout",
      notes: "Leg day - squats and deadlifts",
      date: today.toISOString().split('T')[0], 
      time: "18:00", // 6:00 PM
      repeat: "Weekly"
    },
    {
      id: "reminder_3",
      title: "Meal prep",
      notes: "Prepare lunch for tomorrow",
      date: yesterday.toISOString().split('T')[0],
      time: "19:30", // 7:30 PM
      repeat: "None"
    }
  ],

  // Workout entries with realistic exercise times
  workoutEntries: [
    {
      id: "workout_1",
      workoutName: "Upper Body Strength",
      totalTimeSpent: 2700, // 45 minutes in seconds
      completedExercises: ["Push-ups", "Pull-ups", "Bench Press", "Shoulder Press"],
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 30).toISOString(), // 5:30 PM
    },
    {
      id: "workout_2", 
      workoutName: "Cardio Session",
      totalTimeSpent: 1800, // 30 minutes in seconds
      completedExercises: ["Treadmill", "Cycling"],
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 6, 0).toISOString(), // 6:00 AM
    },
    {
      id: "workout_3",
      workoutName: "Leg Day",
      totalTimeSpent: 3300, // 55 minutes in seconds
      completedExercises: ["Squats", "Deadlifts", "Leg Press", "Calf Raises"],
      timestamp: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 18, 0).toISOString(), // 6:00 PM yesterday
    },
    {
      id: "workout_4",
      workoutName: "Core Workout", 
      totalTimeSpent: 1200, // 20 minutes in seconds
      completedExercises: ["Planks", "Crunches", "Russian Twists"],
      timestamp: new Date(dayBefore.getFullYear(), dayBefore.getMonth(), dayBefore.getDate(), 7, 15).toISOString(), // 7:15 AM day before
    },
    {
      id: "workout_5",
      workoutName: "Full Body HIIT",
      totalTimeSpent: 2400, // 40 minutes in seconds
      completedExercises: ["Burpees", "Mountain Climbers", "Jump Squats", "Push-ups"],
      timestamp: new Date(threeDaysAgo.getFullYear(), threeDaysAgo.getMonth(), threeDaysAgo.getDate(), 19, 30).toISOString(), // 7:30 PM three days ago
    }
  ],

  // Placeholder for other features you might add later
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