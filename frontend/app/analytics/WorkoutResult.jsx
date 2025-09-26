import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import WorkoutResultScreen from "../workout/WorkoutResultScreen";

/**
 * Analytics wrapper for displaying workout results from historical data
 * Transforms analytics workout data to match the expected WorkoutResultScreen format
 */
export default function AnalyticsWorkoutResult() {
  // router for navigation actions
  const router = useRouter();

  // retrieve workoutData passed via query params from analytics screen
  const { workoutData } = useLocalSearchParams();

  // parses the JSON workout data passed from the analytics screen
  const parsedWorkoutData = JSON.parse(workoutData);

  // mock navigation object to emulate WorkoutResultScreen navigation
  const mockNavigation = {
    popToTop: () => router.back(),
  };

  // map backend fields to what WorkoutResultScreen expects
  const mockRoute = {
    params: {
      workout: {
        workoutName:
          parsedWorkoutData.workout_id?.name ||
          parsedWorkoutData.workoutName ||
          "Deleted Workout", // fallback if workout deleted
        id: parsedWorkoutData.workout_id?.id || parsedWorkoutData.id || null,
        dateCompleted:
          parsedWorkoutData.dateCompleted || new Date().toISOString(),
      },
      result: {
        totalTimeSpent: parsedWorkoutData.totalTimeSpent || 0,
        completedExercises: parsedWorkoutData.completedExercises || [],
      },
    },
  };

  {/* Render the actual WorkoutResultScreen with mapped props */}
  return <WorkoutResultScreen route={mockRoute} navigation={mockNavigation} />;
}
