import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";

import ShowGymsFinder from "../maps/ShowGymsFinder";


const Stack = createNativeStackNavigator();


export default function GymsFinderMainScreen() {
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
          name="ShowGymsFinder"
          component={ShowGymsFinder}
          options={{ title: "Gym Finder" }}
        />
      </Stack.Navigator>
    </>
  );
}