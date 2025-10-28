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

/**
 * GymListItem
 * ----------------------------------------------------------------------------
 * Renders a single gym row inside the gym results list.
 *
 * Shows:
 * - Gym name
 * - Address
 * - Rating + today's open/close hours (computed in parent)
 * - "Map" button that opens the gym in native maps
 *
 * Props:
 * - item        (object)   Google Places result item for this gym
 * - selected    (bool)     If true, highlight border to show it's focused on the map
 * - onPress     (func)     Called when the row itself is pressed (e.g. center map there)
 * - onOpenMaps  (func)     Called when "Map" button is pressed (deep link to Maps)
 * - hoursText   (string)   Pre-formatted "Open: X · Close: Y" text from parent
 * - colors      (object)   { textPrimary, textSecondary, tint, card } (not strictly needed now,
 *                           theme handles most styling, but kept for future overrides)
 * - font        (object)   { regular, semibold, bold } font families (also mostly handled via Font)
 *
 * Notes:
 * - Wrapped in React.memo at export so FlatList doesn't re-render every row unnecessarily.
 */
function GymListItem({
  item,
  selected = false,
  onPress, // () => void
  onOpenMaps, // () => void
  hoursText,
  colors, // { textPrimary, textSecondary, tint, card }
  font, // { regular, semibold, bold }
}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  // Prefer 'vicinity' (nearby search) and fall back to 'formatted_address' (text search)
  const addr = item.vicinity || item.formatted_address || "—";

  // Open_now comes directly from Google Places for quick status, but we
  // No longer render it directly — we show hoursText instead.
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
      {/* Left column: name, address, rating + hours */}
      <View style={{ flex: 1 }}>
        {/* Gym name */}
        <Text
          style={[
            styles.rowTitle,
            { color: theme.textPrimary, fontFamily: Font.bold },
          ]}
          numberOfLines={1}
        >
          {item.name || "Gym"}
        </Text>

        {/* Address / vicinity */}
        <Text
          style={[
            styles.rowSubtitle,
            { color: theme.textSecondary, fontFamily: Font.regular },
          ]}
          numberOfLines={2}
        >
          {addr}
        </Text>

        {/* Rating + hours text (e.g. "⭐ 4.5 · Open: 6:00 AM · Close: 10:00 PM") */}
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

      {/* Right column: "Map" button */}
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
  // Outer card for each gym row
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    gap: 10,
  },

  // Gym title
  rowTitle: { fontSize: 16 },

  // Address text
  rowSubtitle: { fontSize: 13, marginTop: 2 },

  // Rating + hours line
  metaLine: { fontSize: 12, marginTop: 6 },

  // "Map" chip/button on the right
  rowBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default React.memo(GymListItem);
