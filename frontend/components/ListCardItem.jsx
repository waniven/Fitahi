import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";
import { MaterialIcons } from "@expo/vector-icons";

export default function ListCardItem({
  workout,
  onEdit,
  onDelete,
  onStart,
  showStart = true, 
}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  return (
    <View style={[styles.card, { backgroundColor: theme.textPrimary ?? theme.backgroundAlt }]}>
      <View style={[styles.leftCol, { paddingRight: showStart ? 12 : 0 }]}>
        <View style={styles.row}>
          <View style={styles.group}>
            <Text style={[styles.label, { color: theme.overlayDark, fontFamily: Font.regular }]}>
              Workout name
            </Text>
            <Text style={[styles.value, { color: theme.background, fontFamily: Font.bold }]}>
              {workout?.workoutName || "—"}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onEdit?.(workout)}
            style={[styles.actionBtn, { borderColor: theme.tint, backgroundColor: theme.tint }]}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${workout?.name ?? "workout"}`}
          >
            <Text style={{ color: theme.textPrimary, fontFamily: Font.bold }}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.overlayLight ?? "#0000001a" }]} />

        <View style={styles.row}>
          <View style={styles.group}>
            <Text style={[styles.label, { color: theme.overlayDark, fontFamily: Font.regular }]}>
              Workout type
            </Text>
            <Text style={[styles.value, { color: theme.background, fontFamily: Font.bold }]}>
              {workout?.workoutType || "—"}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onDelete?.(workout._id)}
            style={[styles.actionBtn, { borderColor: theme.error, backgroundColor: theme.error }]}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${workout?.name ?? "workout"}`}
          >
            <Text style={{ color: theme.textPrimary, fontFamily: Font.bold }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showStart && (
        <View style={styles.rightCol}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onStart?.(workout)}
            style={[styles.playBtn, { backgroundColor: theme.tint }]}
            accessibilityRole="button"
            accessibilityLabel={`Start ${workout?.name ?? "workout"}`}
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
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  leftCol: { flex: 1 },
  rightCol: { width: 50, alignItems: "center", justifyContent: "center" },

  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  group: { flexShrink: 1, flexGrow: 1 },

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

  divider: { height: 0, marginVertical: 1, opacity: 0.6 },

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
