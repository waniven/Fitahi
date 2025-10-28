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
import { Ionicons } from "@expo/vector-icons";
import { Font } from "@/constants/Font";
import { Colors } from "@/constants/Colors";

/**
 * MealTypeFilter
 * ------------------------------------------------------------------
 * Dropdown filter button for filtering nutrition logs by meal type.
 * 
 * Available meal types:
 * - "all": Show all meals (no filtering)
 * - "breakfast": Show only breakfast entries
 * - "lunch": Show only lunch entries
 * - "dinner": Show only dinner entries
 * - "snack": Show only snack entries
 * 
 * Props:
 * @param {string} value - Currently selected meal type ("all", "breakfast", "lunch", "dinner", "snack")
 * @param {function} onChange - Callback function invoked when user selects a meal type
 *                              Receives the selected meal type string as parameter
 * @param {boolean} isOpen - Whether this dropdown is currently open
 * @param {function} onToggle - Callback to notify parent when dropdown opens/closes
 * 
 * Features:
 * - Themed dropdown button with restaurant icon
 * - Shows current selection on button label
 * - Dropdown with all meal type options
 * - Solid background that covers content below
 * - Visual checkmark for selected option
 * - Backdrop dismissal
 * - Smooth transitions and feedback
 */
export default function MealTypeFilter({ value = "all", onChange, isOpen = false, onToggle }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  // Meal type options with display labels
  const options = [
    { value: "all", label: "All meals" },
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snack", label: "Snack" },
  ];

  // Get display label for current selection
  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || "All meals";

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
          <Ionicons
            name="restaurant-outline"
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
            Meal Type
          </Text>
          <Ionicons
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
                    <Ionicons name="checkmark" size={18} color={theme.tint} />
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
    zIndex: 1, // Base z-index for the container
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
    top: 44, // Button height + gap
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 6,
    zIndex: 9999, // Very high z-index to appear above everything
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 20, // Higher elevation for Android
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