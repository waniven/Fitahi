import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";

import CreateWorkout from "../workout/CreateWorkoutScreen";
import StartWorkoutScreen from "../workout/StartWorkoutScreen";
import WorkoutResultScreen from "../workout/WorkoutResultScreen";

const Stack = createNativeStackNavigator();

/**
 * Main navigation container for the workout feature
 * Manages the complete workout flow from creation to completion and results
 */
export default function WorkoutMainScreen() {
  // Gets safe area insets and theme for consistent UI across devices
  const insets = useSafeAreaInsets();
  const theme = Colors[useColorScheme() ?? "light"];
  
  // Ensures minimum top padding for header on devices without notch
  const topPad = Math.max(insets.top, 24);

  return (
    <>
      <StatusBar style="light" translucent={false}/>
      <Stack.Navigator
        screenOptions={{
          headerTopInsetEnabled: true,
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
        {/* Main workout creation and selection screen */}
        <Stack.Screen
          name="CreateWorkout"
          component={CreateWorkout}
          options={{ title: "Workout Log" }}
        />
        
        {/* Active workout execution screen with dynamic title based on workout name */}
        <Stack.Screen
          name="StartWorkoutScreen"
          component={StartWorkoutScreen}
          options={({ route }) => ({
            title:
              route?.params?.workoutDetail?.name ??
              route?.params?.workout?.name ??
              "Start Workout",
          })}
        />
        
        {/* Post-workout results and summary screen */}
        <Stack.Screen
          name="WorkoutResult"
          component={WorkoutResultScreen}
          options={{ title: "" }}
        />
      </Stack.Navigator>
    </>
  );
}