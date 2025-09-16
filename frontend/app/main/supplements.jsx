import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";

import LogSupplements from "../supplements/LogSupplementScreen";



const Stack = createNativeStackNavigator();


export default function SupplementsMainScreen() {
  const insets = useSafeAreaInsets();
  const theme = Colors[useColorScheme() ?? "light"];
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
        <Stack.Screen
          name="LogSupplements"
          component={LogSupplements}
          options={{ title: "Supplement Log" }}
        />
        
      </Stack.Navigator>
    </>
  );
}