import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";

/**
 * GymListItem
 * - Pure presentational row for a gym result
 * - Memoized to avoid re-renders in FlatList
 */
function GymListItem({
  item,
  selected = false,
  onPress, // () => void
  onOpenMaps, // () => void
  hoursText,
  colors,         // { textPrimary, textSecondary, tint, card }
  font,           // { regular, semibold, bold }
}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const addr = item.vicinity || item.formatted_address || "—";
  const isOpen =
    item.opening_hours?.open_now != null ? item.opening_hours.open_now : null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.rowCard,
        {
          borderColor: selected ? theme.tint : "transparent",
          backgroundColor: theme.card,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.rowTitle,
            { color: theme.textPrimary, fontFamily: Font.bold },
          ]}
          numberOfLines={1}
        >
          {item.name || "Gym"}
        </Text>

        <Text
          style={[
            styles.rowSubtitle,
            { color: theme.textSecondary, fontFamily: Font.regular },
          ]}
          numberOfLines={2}
        >
          {addr}
        </Text>

        <Text
          style={[
            styles.metaLine,
            { color: theme.tint, fontFamily: Font.regular },
          ]}
        >
          {item.rating ? `⭐ ${item.rating}  ·  ` : ""}
          {hoursText || "Hours: —"}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onOpenMaps}
        style={[styles.rowBtn, { backgroundColor: theme.tint }]}
      >
        <Text
          style={{
            color: theme.textPrimary,
            fontFamily: Font.semibold,
            fontWeight: "700",
          }}
        >
          Map
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    gap: 10,
  },
  rowTitle: { fontSize: 16 },
  rowSubtitle: { fontSize: 13, marginTop: 2 },
  metaLine: { fontSize: 12, marginTop: 6 },
  rowBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default React.memo(GymListItem);
