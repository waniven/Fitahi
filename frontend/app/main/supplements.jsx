import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";

import LogSupplements from "../supplements/LogSupplementScreen";



const Stack = createNativeStackNavigator();


export default function SupplementsMainScreen() {
  const theme = Colors[useColorScheme() ?? "light"];

  return (
    <>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background,
            borderBottomColor: "#fff",
            borderBottomWidth: 1,
            shadowColor: "#fff",
            elevation: 4,
          },
          headerTintColor: theme.textPrimary,
          headerTitleAlign: "center",
          headerTitleStyle: { fontFamily: Font.bold },
          headerShadowVisible: true,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen
          name="LogSupplements"
          component={LogSupplements}
          options={{ title: "Supplement Log" }}
        />
        {/* <Stack.Screen
          name="StartWorkoutScreen"
          component={StartWorkoutScreen}
          options={({ route }) => ({
            title:
              route?.params?.workoutDetail?.name ??
              route?.params?.workout?.name ??
              "Start Workout",
          })}
        />
        <Stack.Screen
          name="WorkoutResult"
          component={WorkoutResultScreen}
          options={{ title: "" }}
        /> */}
      </Stack.Navigator>
    </>
  );
}