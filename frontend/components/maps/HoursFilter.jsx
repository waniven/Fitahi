import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useColorScheme,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Font } from "@/constants/Font";
import { Colors } from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * HoursFilter
 * ------------------------------------------------------------------
 * Dropdown selector for gym opening/closing hours.
 *
 * - Renders a "Hours" chip.
 * - When tapped, shows a dropdown with two rows: "Open" and "Close".
 * - Tapping a row opens a native time picker (DateTimePicker).
 * - After picking a time, calls onChange with the updated { open, close }.
 *
 * Props:
 *  - value: { open?: Date|null, close?: Date|null }
 *  - onChange(nextValue: { open?: Date|null, close?: Date|null }): void
 *
 * Notes:
 *  - The dropdown is absolutely positioned and uses zIndex/elevation so it
 *    floats above the MapView and doesn't get clipped.
 */
export default function HoursFilter({ value = {}, onChange }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  // UI state: dropdown + which picker is visible
  const [expanded, setExpanded] = useState(false);
  const [showOpenPicker, setShowOpenPicker] = useState(false);
  const [showClosePicker, setShowClosePicker] = useState(false);

  // Read current selected times from parent-controlled value
  const openTime = value.open ?? null;
  const closeTime = value.close ?? null;

  // Format Date -> "h:mm AM/PM", fallback label when no date
  const formatT = (d) => {
    if (!d) return "Select time";
    const h24 = d.getHours();
    const m = d.getMinutes();
    const ampm = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 || 12;
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${h12}:${pad(m)} ${ampm}`;
  };

  // IMPORTANT: position + zIndex so the absolute dropdown can float above the map
  return (
    <View style={{ flex: 1, position: "relative", zIndex: 50 }}>
      {/* Trigger chip (taps to expand/collapse dropdown) */}
      <TouchableOpacity
        onPress={() => setExpanded((e) => !e)}
        activeOpacity={0.85}
        style={[styles.btn, { borderColor: theme.tint }]}
      >
        <View style={styles.rowCenter}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color={theme.tint}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.btnText,
              { color: theme.tint, fontFamily: Font.semibold },
            ]}
          >
            Hours
          </Text>
        </View>
      </TouchableOpacity>

      {/* Dropdown body (only rendered when expanded === true) */}
      {expanded && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: theme.card,
              borderColor: theme.tint,
              // Position right under the chip
              position: "absolute",
              left: 0,
              right: 0,
              top: 44, // Chip height (40) + small gap
              zIndex: 999,

              // Elevation/shadow so it floats above map and other content
              ...(Platform.OS === "android" ? { elevation: 12 } : {}),
              // Optional soft shadow on iOS
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOpacity: 0.15,
                  shadowOffset: { width: 0, height: 6 },
                  shadowRadius: 12,
                },
              }),
            },
          ]}
        >
          {/* "Open" row -> shows picker for opening time */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.row}
            onPress={() => setShowOpenPicker(true)}
          >
            <Text
              style={[
                styles.rowLabel,
                { color: theme.textPrimary, fontFamily: Font.semibold },
              ]}
            >
              Open
            </Text>
            <Text
              style={[
                styles.rowValue,
                { color: theme.textPrimary, fontFamily: Font.regular },
              ]}
            >
              {formatT(openTime)}
            </Text>
          </TouchableOpacity>

          {/* "Close" row -> shows picker for closing time */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.row}
            onPress={() => setShowClosePicker(true)}
          >
            <Text
              style={[
                styles.rowLabel,
                { color: theme.textPrimary, fontFamily: Font.semibold },
              ]}
            >
              Close
            </Text>
            <Text
              style={[
                styles.rowValue,
                { color: theme.textPrimary, fontFamily: Font.regular },
              ]}
            >
              {formatT(closeTime)}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Native time picker for "Open" */}
      {showOpenPicker && (
        <DateTimePicker
          value={openTime || new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => {
            // Close the picker either way
            setShowOpenPicker(false);
            // Only update when a time is actually chosen
            if (event?.type === "set" && date) {
              onChange && onChange({ ...value, open: date });
            }
          }}
        />
      )}

      {/* Native time picker for "Close" */}
      {showClosePicker && (
        <DateTimePicker
          value={closeTime || new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => {
            setShowClosePicker(false);
            if (event?.type === "set" && date) {
              onChange && onChange({ ...value, close: date });
              // ✅ collapse the dropdown after picking Close
              setExpanded(false);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // The "Hours" chip button
  btn: {
    alignSelf: "stretch",
    height: 40,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  // Layout for icon + label inside the chip
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontSize: 14 },

  // Floating dropdown container
  dropdown: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 4,
  },

  // A row inside dropdown ("Open" / "Close")
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  // Label text (e.g. "Open")
  rowLabel: { fontSize: 14 },

  // Value text (e.g. "9:00 AM")
  rowValue: { fontSize: 14 },
});
