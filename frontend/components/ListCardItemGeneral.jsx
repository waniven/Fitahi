import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";
import { MaterialIcons } from "@expo/vector-icons";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Helper: converts array of day indices (0..6) to human-readable string
function formatDays(indices = []) {
  if (!Array.isArray(indices)) return "—";
  const uniq = [...new Set(indices)].filter((i) => i >= 0 && i <= 6);
  if (uniq.length === 7) return "Every day";
  return uniq
    .sort((a, b) => a - b)
    .map((i) => DAY_LABELS[i])
    .join(", ");
}

// ListCardItemGeneral - generic card for displaying items (workouts, supplements, etc.)
// Shows name, type, days, with Edit/Delete buttons and optional Start button
export default function ListCardItemGeneral({
  item, // object to display
  onEdit, // callback for Edit button
  onDelete, // callback for Delete button
  onStart, // callback for Start button
  showStart = true, // whether to show start button
  labelName = "item name", // customizable label for name
  labelType = "item type", // customizable label for type
  labelDays = "Days to be taken", // customizable label for days
  days, // optional array of day indices 0..6
}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"]; // dynamic theme

  // Determine days to display (from prop or item)
  const dayIndices = Array.isArray(days)
    ? days
    : item?.selectedDays ?? item?.days ?? [];
  const daysText = formatDays(dayIndices);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.textPrimary ?? theme.backgroundAlt },
      ]}
    >
      {/* Left column: item info + edit/delete buttons */}
      <View style={[styles.leftCol, { paddingRight: showStart ? 12 : 0 }]}>
        {/* Row 1: Name + Type + Edit */}
        <View style={styles.row}>
          {/* Name */}
          <View style={[styles.group, styles.shrink]}>
            <Text
              style={[
                styles.label,
                { color: theme.overlayDark, fontFamily: Font.regular },
              ]}
            >
              {labelName}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.value,
                { color: theme.background, fontFamily: Font.bold },
              ]}
            >
              {item?.name || "—"}
            </Text>
          </View>

          {/* Type */}
          <View style={[styles.group, styles.shrink]}>
            <Text
              style={[
                styles.label,
                { color: theme.overlayDark, fontFamily: Font.regular },
              ]}
            >
              {labelType}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.value,
                { color: theme.background, fontFamily: Font.bold },
              ]}
            >
              {item?.type || "—"}
            </Text>
          </View>

          {/* Edit button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onEdit?.(item)}
            style={[
              styles.actionBtn,
              { borderColor: theme.tint, backgroundColor: theme.tint },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${item?.name ?? "item"}`}
          >
            <Text style={{ color: theme.textPrimary, fontFamily: Font.bold }}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.overlayLight ?? "#0000001a" },
          ]}
        />

        {/* Row 2: Days + Delete */}
        <View style={styles.row}>
          <View style={[styles.group, styles.shrink]}>
            <Text
              style={[
                styles.label,
                { color: theme.overlayDark, fontFamily: Font.regular },
              ]}
            >
              {labelDays}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.value,
                { color: theme.background, fontFamily: Font.bold },
              ]}
            >
              {daysText}
            </Text>
          </View>

          {/* Delete button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onDelete?.(item.id)}
            style={[
              styles.actionBtn,
              { borderColor: theme.error, backgroundColor: theme.error },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${item?.name ?? "item"}`}
          >
            <Text style={{ color: theme.textPrimary, fontFamily: Font.bold }}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Right column: optional Start button */}
      {showStart && (
        <View style={styles.rightCol}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onStart?.(item)}
            style={[styles.playBtn, { backgroundColor: theme.tint }]}
            accessibilityRole="button"
            accessibilityLabel={`Start ${item?.name ?? "item"}`}
          >
            <MaterialIcons
              name="play-arrow"
              size={30}
              color={theme.textPrimary}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// constants for button sizing
const BTN_HEIGHT = 40;
const BTN_WIDTH = 80;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: -8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  leftCol: { flex: 1 },
  rightCol: { width: 50, alignItems: "center", justifyContent: "center" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "space-between",
  },
  group: { flexGrow: 1 },
  shrink: { minWidth: 0, flexBasis: 0 },

  label: { fontSize: 13, marginBottom: 4 },
  value: { fontSize: 16 },

  actionBtn: {
    height: BTN_HEIGHT,
    width: BTN_WIDTH,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  divider: { height: 0, marginVertical: 4, opacity: 0.6 },

  playBtn: {
    width: 50,
    height: 50,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
});
