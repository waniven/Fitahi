import React from "react";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
} from "react-native";

/**
 * GymSearchBar
 * ----------------------------------------------------------------------------
 * Compact search row with a text input and "Search" button.
 *
 * Props:
 * - value            current search text (string)
 * - onChangeText     called when user types (text => void)
 * - onSearch         called when user submits (query => void)
 *
 * Optional style overrides:
 * - tint             accent color for border/button
 * - inputBg          background color of the input wrapper
 * - textPrimary      main text color
 * - textSecondary    placeholder color
 * - style            extra container styles
 *
 * Notes:
 * - Calls onSearch only if there's a non-empty trimmed query.
 * - Uses theme colors by default, can be overridden per-screen.
 */
export default function GymSearchBar({
  value,
  onChangeText,
  onSearch,
  // Optional overrides - will fall back to theme
  tint, // defaults to theme.tint
  inputBg, // defaults to theme.inputField or a soft bg
  textPrimary, // defaults to theme.textPrimary
  textSecondary, // defaults to theme.textSecondary
  style,
}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  // Resolved colors, preferring explicit prop overrides
  const _tint = tint ?? theme.tint;
  const _inputBg = inputBg ?? theme.background; // keeps your white-on-dark contrast
  const _textPrimary = textPrimary ?? theme.textPrimary;
  const _textSecondary = textSecondary ?? theme.textPrimary;

  // Handle both return key press and button press
  const handleSubmit = () => {
    const q = (value || "").trim();
    if (q.length) onSearch?.(q);
  };

  return (
    <View
      style={[
        styles.wrap,
        { borderColor: _tint, backgroundColor: _inputBg },
        style,
      ]}
    >
      {/* Text input for gym name / query */}
      <TextInput
        placeholder="Search gyms…"
        placeholderTextColor={_textSecondary}
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.input,
          { color: _textPrimary, fontFamily: Font.regular },
        ]}
        returnKeyType="search"
        onSubmitEditing={handleSubmit}
        autoCorrect={false}
        autoCapitalize="none"
      />

      {/* Submit button ("Search") */}
      <TouchableOpacity
        onPress={handleSubmit}
        activeOpacity={0.85}
        style={[styles.btn, { backgroundColor: _tint }]}
        accessibilityRole="button"
        accessibilityLabel="Search gyms"
      >
        <Text
          style={[
            styles.btnText,
            { color: _textPrimary, fontFamily: Font.semibold },
          ]}
        >
          Search
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Row container around input + button
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 6,
    gap: 6,
  },

  // Text field
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },

  // "Search" button on the right
  btn: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  // Button label
  btnText: { fontSize: 16 },
});
