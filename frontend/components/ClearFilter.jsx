import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Font } from "@/constants/Font";
import { Colors } from "@/constants/Colors";

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
