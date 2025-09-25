import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";
import { MaterialIcons } from "@expo/vector-icons";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function formatDays(indices = []) {
  if (!Array.isArray(indices)) return "—";
  const uniq = [...new Set(indices)].filter((i) => i >= 0 && i <= 6);
  if (uniq.length === 7) return "Every day";
  return uniq.sort((a, b) => a - b).map((i) => DAY_LABELS[i]).join(", ");
}

export default function ListCardItemGeneral({
  item,
  onEdit,
  onDelete,
  onStart,
  showStart = true,
  labelName = "item name",
  labelType = "item type",          // e.g. "Dosage & Time"
  labelDays = "Days to be taken",
  days,                              // int[] 0..6
}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  // days can come in via prop or item
  const dayIndices = Array.isArray(days) ? days : (item?.selectedDays ?? item?.days ?? []);
  const daysText = formatDays(dayIndices);

  return (
    <View style={[styles.card, { backgroundColor: theme.textPrimary ?? theme.backgroundAlt }]}>
      <View style={[styles.leftCol, { paddingRight: showStart ? 12 : 0 }]}>
        {/* Row 1: Name + Type (Dosage & Time) + Edit */}
        <View style={styles.row}>
          {/* Name group */}
          <View style={[styles.group, styles.shrink]}>
            <Text style={[styles.label, { color: theme.overlayDark, fontFamily: Font.regular }]}>
              {labelName}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.value, { color: theme.background, fontFamily: Font.bold }]}
            >
              {item?.name || "—"}
            </Text>
          </View>

          {/* Type group (next to name) */}
          <View style={[styles.group, styles.shrink]}>
            <Text style={[styles.label, { color: theme.overlayDark, fontFamily: Font.regular }]}>
              {labelType}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.value, { color: theme.background, fontFamily: Font.bold }]}
            >
              {item?.type || "—"}
            </Text>
          </View>

          {/* Edit */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onEdit?.(item)}
            style={[styles.actionBtn, { borderColor: theme.tint, backgroundColor: theme.tint }]}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${item?.name ?? "item"}`}
          >
            <Text style={{ color: theme.textPrimary, fontFamily: Font.bold }}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.overlayLight ?? "#0000001a" }]} />

        {/* Row 2: Days + Delete */}
        <View style={styles.row}>
          <View style={[styles.group, styles.shrink]}>
            <Text style={[styles.label, { color: theme.overlayDark, fontFamily: Font.regular }]}>
              {labelDays}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.value, { color: theme.background, fontFamily: Font.bold }]}
            >
              {daysText}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onDelete?.(item.id)}
            style={[styles.actionBtn, { borderColor: theme.error, backgroundColor: theme.error }]}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${item?.name ?? "item"}`}
          >
            <Text style={{ color: theme.textPrimary, fontFamily: Font.bold }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showStart && (
        <View style={styles.rightCol}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onStart?.(item)}
            style={[styles.playBtn, { backgroundColor: theme.tint }]}
            accessibilityRole="button"
            accessibilityLabel={`Start ${item?.name ?? "item"}`}
          >
            <MaterialIcons name="play-arrow" size={30} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const BTN_HEIGHT = 40;
const BTN_WIDTH = 80;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    // Make the card “wider” by bleeding a bit into the parent's side padding
    // (adjust -8/-10 to match your screen padding)
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
  shrink: { minWidth: 0, flexBasis: 0 }, // allow text to ellipsize instead of pushing buttons off screen

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
