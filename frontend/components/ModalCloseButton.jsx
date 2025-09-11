import React from "react";
import { TouchableOpacity, StyleSheet, useColorScheme } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

export default function ModalCloseButton({
  onPress,
  size = 26,
  top = 10,
  right = 10,
  showBg = false,  // Subtle bg for contrast if needed
  hitSlop = { top: 8, right: 8, bottom: 8, left: 8 },
}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Close"
      hitSlop={hitSlop}
      style={[
        styles.btn,
        { top, right, backgroundColor: showBg ? "rgba(255,255,255,0.12)" : "transparent" },
      ]}
    >
      <MaterialIcons name="close" size={size} color={theme.background} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});