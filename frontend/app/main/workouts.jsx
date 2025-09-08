import {
  NavigationContainer,
  NavigationIndependentTree,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, useColorScheme} from "react-native";
import { Colors } from "../../constants/Colors";
import { Font } from "@/constants/Font";

import ShowWorkoutDetail from "./screens/WorkoutDetailScreen";
import StartExercise from "./screens/StartExerciseScreen";
import StartWorkoutScreen from "./screens/StartWorkoutScreen";
import CreateWorkout from "./screens/CreateWorkoutScreen";

const Stack = createNativeStackNavigator();

export default function WorkoutMainScreen() {
  const scheme = useColorScheme(); // black theme
  const theme = Colors[scheme ?? "light"];
 

  return (
    <>
      <StatusBar style="light" />
      <NavigationIndependentTree>
        <NavigationContainer>
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
              headerTitleStyle: {fontFamily: Font.bold},
              headerShadowVisible: true, 
              contentStyle: { backgroundColor: theme.background},
            }}
          >
            <Stack.Screen
              name="CreateWorkout"
              component={CreateWorkout}
              options={{
                title: "Workout Log",
                headerTitleAlign: "center",
              }}
            />
            {/* <Stack.Screen
              name="ShowWorkoutDetail"
              component={ShowWorkoutDetail}
              options={{
                title: "Workout Overview",
                headerTitleAlign: "center",
              }}
            />  */}
            <Stack.Screen
              name="StartWorkoutScreen"
              component={StartWorkoutScreen}
            />
            <Stack.Screen
              name="StartExercise"
              component={StartExercise}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </NavigationIndependentTree>
    </>
  );
}
//relate from div in HTML to text in react native
const styles = StyleSheet.create({
  
});
