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

  const _tint = tint ?? theme.tint;
  const _inputBg = inputBg ?? theme.background; // keeps your white-on-dark contrast
  const _textPrimary = textPrimary ?? theme.textPrimary;
  const _textSecondary = textSecondary ?? theme.textPrimary;
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
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 6,
    gap: 6,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  btn: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontSize: 16 },
});
