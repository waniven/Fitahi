import { Platform, TouchableOpacity, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function BackButton({ to = "/main", onPress }) {
  const navigation = useNavigation();
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];

  const handlePress = () => {
    if (typeof onPress === "function") return onPress();

    // 1) Pop inside this stack if possible
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    // 2) Pop the parent navigator if exists
    const parent = navigation.getParent?.();
    if (parent?.canGoBack?.()) {
      parent.goBack();
      return;
    }

    // 3) Fallback: jump to Home (or any route we pass via `to`)
    router.replace(to);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Back"
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
      }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      activeOpacity={0.7}
    >
      <Ionicons
        name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
        size={24}
        color={theme.textPrimary}
      />
    </TouchableOpacity>
  );
}
