import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useColorScheme,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Font } from "@/constants/Font";
import { Colors } from "@/constants/Colors";

/**
 * BMICategoryFilter
 * Dropdown filter button for filtering biometric logs by BMI category.
 */
export default function BMICategoryFilter({ value = "all", onChange, isOpen = false, onToggle }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  // BMI category options with display labels
  const options = [
    { value: "all", label: "All categories" },
    { value: "underweight", label: "Underweight (< 18.5)" },
    { value: "normal", label: "Normal (18.5-24.9)" },
    { value: "overweight", label: "Overweight (25-29.9)" },
    { value: "obese", label: "Obese (≥ 30)" },
  ];

  // Get display label for current selection
  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || "All categories";

  // Handle option selection
  const handleSelect = (optionValue) => {
    onChange?.(optionValue);
    onToggle?.(false);
  };

  // Handle toggle button press
  const handleToggle = () => {
    onToggle?.(!isOpen);
  };

  return (
    <View style={styles.container}>
      {/* Trigger button */}
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.85}
        style={[styles.button, { borderColor: theme.tint }]}
      >
        <View style={styles.buttonContent}>
          <MaterialCommunityIcons
            name="human-male-height"
            size={16}
            color={theme.tint}
            style={styles.icon}
          />
          <Text
            style={[
              styles.buttonText,
              { color: theme.tint, fontFamily: Font.semibold },
            ]}
          >
            BMI Category
          </Text>
          <MaterialCommunityIcons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={16}
            color={theme.tint}
          />
        </View>
      </TouchableOpacity>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop - closes dropdown when tapped */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => onToggle?.(false)}
          />

          {/* Options list */}
          <View
            style={[
              styles.dropdown,
              {
                backgroundColor: theme.card,
                borderColor: theme.border || "rgba(0,0,0,0.1)",
              },
            ]}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.85}
                  style={[
                    styles.option,
                    isSelected && {
                      backgroundColor: theme.background,
                      borderColor: theme.tint,
                    },
                  ]}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: theme.textPrimary, fontFamily: Font.regular },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <MaterialCommunityIcons
                      name="check"
                      size={18}
                      color={theme.tint}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Container with relative positioning for absolute dropdown
  container: {
    flex: 1,
    position: "relative",
    zIndex: 1,
  },

  // Main trigger button
  button: {
    alignSelf: "stretch",
    height: 40,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  // Button content layout
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  // Icon spacing
  icon: {
    marginRight: 6,
  },

  // Button text
  buttonText: {
    fontSize: 14,
    marginRight: 6,
  },

  // Dropdown container
  dropdown: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 6,
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 20,
      },
    }),
  },

  // Individual option item
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },

  // Option text style
  optionText: {
    fontSize: 14,
  },
});