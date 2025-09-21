// app/analytics/WorkoutResult.jsx
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import WorkoutResultScreen from "../workout/WorkoutResultScreen";

export default function AnalyticsWorkoutResult() {
  const router = useRouter();
  const { workoutData } = useLocalSearchParams();

  const parsedWorkoutData = JSON.parse(workoutData);

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
          "Deleted Workout",
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

  return <WorkoutResultScreen route={mockRoute} navigation={mockNavigation} />;
}
