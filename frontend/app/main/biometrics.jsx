// app/main/biometrics.jsx
import React from 'react';
import { useRouter } from 'expo-router';
import LogScreen from '../../components/common/LogScreen';

/**
 * Dedicated Biometrics Screen
 * This screen is accessed when users click the "Biometrics" button from the home screen
 * Uses the reusable LogScreen component with proper navigation integration
 */

export default function BiometricsScreen() {
  const router = useRouter();

  // Handle back navigation to home screen
  const handleBackPress = () => {
    router.back();
  };

  // Handle add biometric entry action
  const handleAddBiometric = () => {
    // TODO: Navigate to add biometric screen when implemented
    // router.push('/main/add-biometric');
    console.log('Navigate to add biometric screen');
  };

  return (
    <LogScreen
      title="Biometrics Log"
      subtitle="Track Your Biometrics"
      showBackButton={true}
      showAddButton={true}
      onBackPress={handleBackPress}
      onAddPress={handleAddBiometric}
    />
  );
}