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

export default function NearestGymsButton({
  onPress,
  tint,
  font = {},
  disabled = false,
  style,
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
      <View style={styles.row}>
        <Ionicons
          name="navigate"
          size={16}
          color={theme.tint}
          style={{ marginRight: 6 }}
        />
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
    flex: 1, // so it shares the row space equally
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
