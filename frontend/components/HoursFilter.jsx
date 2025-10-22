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
 * Chip that opens a dropdown with "Open" and "Close" time rows.
 * Uses native DateTimePicker for each row and returns times via onChange.
 * Props:
 *  - value: { open?: Date|null, close?: Date|null }
 *  - onChange: (nextValue) => void
 */
export default function HoursFilter({ value = {}, onChange }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  // UI state: dropdown + which picker is visible
  const [expanded, setExpanded] = useState(false);
  const [showOpenPicker, setShowOpenPicker] = useState(false);
  const [showClosePicker, setShowClosePicker] = useState(false);

  // Current selected times
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

  return (
    // IMPORTANT: position + zIndex so the absolute dropdown can float above the map
    <View style={{ flex: 1, position: "relative", zIndex: 50 }}>
      {/* Trigger chip */}
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

      {/* Absolute dropdown so it’s not clipped & stays above MapView */}
      {expanded && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: theme.card,
              borderColor: theme.tint,
              // absolute overlay under the chip
              position: "absolute",
              left: 0,
              right: 0,
              top: 44, // chip height (40) + small gap
              zIndex: 999,
              ...(Platform.OS === "android" ? { elevation: 12 } : {}),
              // optional soft shadow on iOS
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

      {/* Native pickers */}
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
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontSize: 14 },
  dropdown: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rowLabel: { fontSize: 14 },
  rowValue: { fontSize: 14 },
});
