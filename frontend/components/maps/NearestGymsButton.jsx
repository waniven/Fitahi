import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";

/**
 * NearestGymsButton
 * ------------------------------------------------------------------
 * Small CTA chip that says "Nearest gyms".
 * Used in the filters row to let the user quickly search based on
 * current GPS location.
 *
 * Props:
 * - onPress        (function): callback when tapped
 * - tint           (string, optional): borderColor override
 * - font           (object, optional): { semibold } to control font weight
 * - disabled       (boolean): disables press + lowers opacity
 * - style          (object|array): extra styles for container
 */
export default function NearestGymsButton({
  onPress, // Tap handler
  tint, // Border color override (optional)
  font = {}, // { semibold } font toggle
  disabled = false, // Disable button + lower opacity
  style, // Extra container styles

}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Find nearest gyms"
      style={[
        styles.btn,
        { borderColor: tint, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
    >
      {/* Icon + label row */}
      <View style={styles.row}>
        <Ionicons
          name="navigate"
          size={16}
          color={theme.tint}
          style={{ marginRight: 6 }}
        />

        {/* Button text */}
        <Text
          style={[
            styles.text,
            { color: theme.tint },
            font?.semibold && { fontFamily: Font.semibold },
          ]}
        >
          Nearest gyms
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1, // Allows this button to share horizontal space evenly in a row
    alignSelf: "stretch",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center" },
  text: { fontSize: 14 },
});
