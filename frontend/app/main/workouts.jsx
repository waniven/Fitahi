// app/main/workouts.jsx
import React from 'react';
import { useRouter } from 'expo-router';
import LogScreen from '../../components/common/LogScreen';

/**
 * Dedicated Workout Screen
 * This screen is accessed when users click the "Workouts" button from the home screen
 * Uses the reusable WorkoutLogScreen component with proper navigation integration
 */

export default function WorkoutsScreen() {
  const router = useRouter();

  // Handle back navigation to home screen
  const handleBackPress = () => {
    router.back();
  };

  // Handle add workout action
  const handleAddWorkout = () => {
    // TODO: Navigate to create workout screen when implemented
    // router.push('/main/create-workout');
    console.log('Navigate to create workout screen');
  };

  return (
    <LogScreen
      title="Workout Log"
      subtitle="Create your first workout"
      showBackButton={true}
      showAddButton={true}
      onBackPress={handleBackPress}
      onAddPress={handleAddWorkout}
    />
  );
}