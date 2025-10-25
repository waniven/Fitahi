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
 * ----------------------------------------------------------------------------
 * A small outline-style button that resets all active filters in the gym finder.
 *
 * Typical usage:
 *   <ClearFiltersButton onPress={onClearFilters} />
 *
 * Props:
 * - onPress     (function, required): called when the user taps the button.
 * - tint        (string, optional):   not currently used (theme.tint is used instead),
 *                                     kept for API symmetry with other buttons.
 * - textColor   (string, optional):   not currently used, could override text color.
 * - style       (object|array, opt):  extra container styles merged into TouchableOpacity.
 *
 * Visual notes:
 * - Uses theme.tint for both border and text so it stays consistent with
 *   other filter UI (Hours, Rating, Nearest gyms).
 * - Fixed height (40) + 10 radius so it lines up nicely in a row.
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
      {/* Button label */}
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
