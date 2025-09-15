import { Montserrat_400Regular, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_800ExtraBold, useFonts } from '@expo-google-fonts/montserrat';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import AIProvider from './ai/AIContext';
import Toast from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_800ExtraBold,
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
<<<<<<< HEAD
      <Slot />
      <Toast />
=======
        <Slot />
>>>>>>> 68a93c8c (index)
    </AIProvider>
  );
}

