// components/Fab.js
import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function Fab({
  onPress,
  bottom = 80,
  size = 68,
  color = "#00CFFF",
  icon = "add",
  iconColor = "#000",
  accessibilityLabel = "Primary action",
  activeOpacity = 0.7,
  floating = true,
  style,
  containerStyle,
}) {
  const buttonStyle = [
    styles.button,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      marginBottom: floating ? 0 : 120,
    },
    style,
  ];

  if (!floating) {
    // Absolute mode: no workouts
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={buttonStyle}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialIcons name={icon} size={32} color={iconColor} />
      </TouchableOpacity>
    );
  }

  // Floating mode: centered horizontally above nav bar
  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        { bottom },
        containerStyle,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={buttonStyle}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialIcons name={icon} size={32} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // full-width bar to center the FAB horizontally when floating
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
    ...(Platform.OS === "android" ? { elevation: 10 } : {}),
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    marginBottom: 60,
    ...(Platform.OS === "android" ? { elevation: 6 } : {}),
  },
});