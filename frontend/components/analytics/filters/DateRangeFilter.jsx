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
 * DateRangeFilter
 * ------------------------------------------------------------------
 * Dropdown filter button that allows users to filter logs by date range.
 * 
 * Available options:
 * - "all": Show all logs (no date filtering)
 * - "today": Show only today's logs
 * - "yesterday": Show only yesterday's logs
 * - "last7days": Show logs from the last 7 days
 * 
 * Props:
 * @param {string} value - Current selected date range option ("all", "today", "yesterday", "last7days")
 * @param {function} onChange - Callback function called when user selects a new date range
 *                              Receives the selected option string as parameter
 * @param {boolean} isOpen - Whether this dropdown is currently open
 * @param {function} onToggle - Callback to notify parent when dropdown opens/closes
 * 
 * Features:
 * - Themed button that adapts to light/dark mode
 * - Dropdown menu positioned absolutely to float above content
 * - Solid background that covers content below
 * - Visual indicator (checkmark) for currently selected option
 * - Backdrop press closes the dropdown
 * - Smooth animations and touch feedback
 */
export default function DateRangeFilter({ value = "all", onChange, isOpen = false, onToggle }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  // Date range options with display labels
  const options = [
    { value: "all", label: "All time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7days", label: "Last 7 days" },
  ];

  // Get display label for currently selected value
  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || "All time";

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
            name="calendar-range"
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
            Date Range
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
          {/* Backdrop - tapping outside closes dropdown */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => onToggle?.(false)}
          />

          {/* Options menu */}
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
  // Wrapper with relative positioning for absolute dropdown
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
    top: 44, // Button height (40) + small gap
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

  // Individual option row
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

  // Option text
  optionText: {
    fontSize: 14,
  },
});