import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Font } from "@/constants/Font";
import { Colors } from "@/constants/Colors";

/**
 * ClearFiltersButton
 * ------------------------------------------------------------------
 * Small, themed outline button that triggers a "clear filters" action.
 *
 * Props:
 * - onPress   (function, required): Handler invoked when the button is pressed.
 * - tint      (string, optional):   Unused here (kept for API parity with other buttons).
 * - textColor (string, optional):   Unused here (theme decides); can be wired if needed.
 * - style     (object, optional):   Extra style(s) merged into the outer TouchableOpacity.
 *
 * Notes:
 * - Uses the app theme via useColorScheme -> Colors to pick border/text color.
 * - Keeps visuals consistent with your other filter chips (height, radius, border).
 */
export default function ClearFiltersButton({ onPress, tint, textColor, style }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.btn, { borderColor: theme.tint }, style]}
    >
      <Text style={[styles.txt, { color: theme.tint, fontFamily: Font.semibold }]}>
        Clear filters
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: "stretch",
    height: 40,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  txt: { fontSize: 14 },
});
