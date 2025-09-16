// app/analytics/WorkoutResult.jsx
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import WorkoutResultScreen from '../workout/WorkoutResultScreen'; 

export default function AnalyticsWorkoutResult() {
  const router = useRouter();
  const { workoutData, returnTo } = useLocalSearchParams();
  
  const parsedWorkoutData = JSON.parse(workoutData);
  
  // Create navigation object that matches what WorkoutResultScreen expects
  const mockNavigation = {
    popToTop: () => {
      if (returnTo === 'analytics') {
        router.push('/analytics/WorkoutAnalyticsScreen');
      } else {
        router.back();
      }
    }
  };

  // Transform your sample data to match WorkoutResultScreen format
  const mockRoute = {
    params: {
      workout: {
        name: parsedWorkoutData.workoutName
      },
      result: {
        totalTimeSpent: parsedWorkoutData.totalTimeSpent,
        completedExercises: parsedWorkoutData.completedExercises
      }
    }
  };

  return (
    <WorkoutResultScreen 
      route={mockRoute}
      navigation={mockNavigation}
    />
  );
}