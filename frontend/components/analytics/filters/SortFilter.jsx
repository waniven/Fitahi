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
 * SortFilter
 * ------------------------------------------------------------------
 * Dropdown filter button for sorting nutrition logs by various criteria.
 * 
 * Available sort options:
 * - "date-desc": Sort by date, newest first (default)
 * - "date-asc": Sort by date, oldest first
 * - "calories-desc": Sort by calories, highest first
 * - "calories-asc": Sort by calories, lowest first
 * - "name-asc": Sort by name, A to Z
 * - "name-desc": Sort by name, Z to A
 * 
 * Props:
 * @param {string} value - Current sort option (e.g., "date-desc", "calories-asc")
 * @param {function} onChange - Callback function when user selects a sort option
 *                              Receives the selected sort string as parameter
 * @param {boolean} isOpen - Whether this dropdown is currently open
 * @param {function} onToggle - Callback to notify parent when dropdown opens/closes
 * 
 * Features:
 * - Themed dropdown with sort icon
 * - Clear labels for each sort option
 * - Solid background that covers content below
 * - Visual indicator for current selection
 * - Auto-closes after selection
 * - Platform-specific shadows/elevation
 */
export default function SortFilter({ value = "date-desc", onChange, isOpen = false, onToggle }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  // Sort options with descriptive labels
  const options = [
    { value: "date-desc", label: "Date: Newest first" },
    { value: "date-asc", label: "Date: Oldest first" },
    { value: "calories-desc", label: "Calories: High to Low" },
    { value: "calories-asc", label: "Calories: Low to High" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
  ];

  // Get display label for current sort
  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || "Date: Newest first";

  // Handle sort option selection
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
            name="sort"
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
            Sort By
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
          {/* Backdrop - tap outside to close */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => onToggle?.(false)}
          />

          {/* Sort options list */}
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
  // Wrapper container with relative positioning
  container: {
    flex: 1,
    position: "relative",
    zIndex: 1, // Base z-index for the container
  },

  // Main button
  button: {
    alignSelf: "stretch",
    height: 40,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  // Button inner content
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  // Icon margin
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
    top: 44, // Button height + spacing
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

  // Individual sort option
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