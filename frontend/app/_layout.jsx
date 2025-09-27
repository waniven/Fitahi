import { Montserrat_400Regular, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_800ExtraBold, useFonts } from '@expo-google-fonts/montserrat';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import AIProvider from './ai/AIContext';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

// Prevents splash screen from auto-hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

/**
 * Root layout component that provides global app configuration and providers
 * Manages font loading, splash screen timing, and wraps app with essential providers
 */
export default function RootLayout() {
  // Loads Montserrat font variants for consistent typography across the app
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_800ExtraBold,
  });

  // Hides splash screen once fonts are fully loaded
  useEffect(() => {
    async function hide() {
      if (fontsLoaded) await SplashScreen.hideAsync();
    }
    hide();
  }, [fontsLoaded]);

  // Prevents app rendering until fonts are available
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AIProvider>
        {/* Renders the current route component */}
        <Slot />
        
        {/* Global toast notification system */}
        <Toast />
      </AIProvider>
    </SafeAreaProvider>
  );
}