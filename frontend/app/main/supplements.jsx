import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";

import LogSupplements from "../supplements/LogSupplementScreen";

const Stack = createNativeStackNavigator();

/**
 * Main navigation container for the supplements feature
 * Provides themed stack navigation with safe area handling for supplement logging
 */
export default function SupplementsMainScreen() {
  // Gets safe area insets and theme for consistent UI across devices
  const insets = useSafeAreaInsets();
  const theme = Colors[useColorScheme() ?? "light"];
  
  // Ensures minimum top padding for header on devices without notch
  const topPad = Math.max(insets.top, 24);
  
  return (
    <>
      <StatusBar style="light" translucent={false} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background,
            borderBottomColor: "#fff",
            borderBottomWidth: 1,
            shadowColor: "#fff",
            elevation: 4,
            paddingTop: topPad,
            height: 56 + topPad,
          },
          headerTintColor: theme.textPrimary,
          headerTitleAlign: "center",
          headerTitleStyle: { fontFamily: Font.bold },
          headerShadowVisible: true,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        {/* Main supplement logging screen for tracking supplement intake */}
        <Stack.Screen
          name="LogSupplements"
          component={LogSupplements}
          options={{ title: "Supplement Log" }}
        />
      </Stack.Navigator>
    </>
  );
}