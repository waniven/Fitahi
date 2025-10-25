import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Font } from "@/constants/Font";
import { Colors } from "@/constants/Colors";

/**
 * ClearFiltersButton
 * Button component that resets all active filters to their default state.
 */
export default function ClearFiltersButton({ onPress, style }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.button, { borderColor: theme.tint }, style]}
    >
      <Ionicons name="close-circle-outline" size={16} color={theme.tint} style={styles.icon} />
      <Text
        style={[
          styles.text,
          { color: theme.tint, fontFamily: Font.semibold },
        ]}
      >
        Clear Filters
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Button container
  button: {
    alignSelf: "stretch",
    height: 40,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  // Icon spacing
  icon: {
    marginRight: 6,
  },

  // Button text
  text: {
    fontSize: 14,
  },
});