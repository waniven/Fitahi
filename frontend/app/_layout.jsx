import { Montserrat_400Regular, Montserrat_700Bold, useFonts } from '@expo-google-fonts/montserrat';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import AIProvider from './ai/AIContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  useEffect(() => {
    async function hide() {
      if (fontsLoaded) await SplashScreen.hideAsync();
    }
    hide();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AIProvider>
      <Slot />
    </AIProvider>
  );
}
