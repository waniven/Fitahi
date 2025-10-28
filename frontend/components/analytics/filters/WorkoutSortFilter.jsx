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
 * WorkoutSortFilter
 * Dropdown filter button for sorting workout logs by date or duration.
 */
export default function WorkoutSortFilter({ value = "date-desc", onChange, isOpen = false, onToggle }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  // Sort options with descriptive labels
  const options = [
    { value: "date-desc", label: "Date: Newest first" },
    { value: "date-asc", label: "Date: Oldest first" },
    { value: "duration-desc", label: "Duration: Longest first" },
    { value: "duration-asc", label: "Duration: Shortest first" },
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
    zIndex: 1,
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