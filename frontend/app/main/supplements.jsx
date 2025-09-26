import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";

import LogSupplements from "../supplements/LogSupplementScreen";

// Create the stack navigator for this section
const Stack = createNativeStackNavigator();

// Main component for the Supplements stack
export default function SupplementsMainScreen() {
  // Get safe area insets for devices with notches/status bars
  const insets = useSafeAreaInsets();

  // Determine theme based on system color scheme
  const theme = Colors[useColorScheme() ?? "light"];

  // Ensure a minimum top padding for header
  const topPad = Math.max(insets.top, 24);

  return (
    <>
      {/* Set status bar style for this screen */}
      <StatusBar style="light" translucent={false} />

      {/* Configure stack navigator for the supplements section */}
      <Stack.Navigator
        screenOptions={{
          // Styling for the header
          headerStyle: {
            backgroundColor: theme.background,
            borderBottomColor: "#fff",
            borderBottomWidth: 1,
            shadowColor: "#fff",
            elevation: 4,
            paddingTop: topPad,
            height: 56 + topPad,
          },
          // Color of header text and icons
          headerTintColor: theme.textPrimary,
          // Align header title to center
          headerTitleAlign: "center",
          // Font style for header title
          headerTitleStyle: { fontFamily: Font.bold },
          // Show shadow under header
          headerShadowVisible: true,
          // Background color for content below header
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        {/* Define the main screen in this stack */}
        <Stack.Screen
          name="LogSupplements"
          component={LogSupplements}
          options={{ title: "Supplement Log" }}
        />
      </Stack.Navigator>
    </>
  );
}
