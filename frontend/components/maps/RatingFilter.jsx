import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";

// Rating options the user can pick.
// null = "Any rating" (no filter), otherwise minimum rating.
const OPTIONS = [null, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5];

/**
 * Stars
 * ------------------------------------------------------------------
 * Renders a static 0–5 star row based on a rating (supports halves).
 * Used in the dropdown list to visually preview each rating option.
 *
 * Props:
 * - value        number|null  Rating value (ex: 3.5). null is treated like 0.
 * - size         number       Icon size (default 16).
 * - color        string       Filled star color (optional).
 * - emptyColor   string       Outline star color (optional).
 */
function Stars({ value, size = 16, color, emptyColor }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  // Pick colors; fallback to theme
  const _color = color ?? theme.warning;
  const _emptyColor = emptyColor ?? theme.textSecondary;

  // Normalize rating value to range 0..5
  const rating = Math.max(0, Math.min(5, Number(value) || 0));
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const total = 5;

  // Build 5 icons: full / half / outline
  const stars = [];
  for (let i = 0; i < total; i++) {
    let name = "star-outline";
    let starColor = _emptyColor;
    if (i < full) {
      name = "star";
      starColor = _color;
    } else if (i === full && hasHalf) {
      name = "star-half";
      starColor = _color;
    }
    stars.push(<Ionicons key={i} name={name} size={size} color={starColor} />);
  }
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      {stars}
    </View>
  );
}

/**
 * RatingFilter
 * ------------------------------------------------------------------
 * A dropdown chip that lets the user pick a minimum gym rating.
 * Example options: "Any rating", "3.0", "4.5".
 *
 * Props:
 * - value        number|null      Currently selected min rating
 *                                  (null = Any rating / no filter)
 * - onChange     function         Called with the new rating (or null)
 * - themeColors  object?          Optional theming overrides
 * - font         object?          Font overrides, e.g. { semibold }
 */
export default function RatingFilter({
  value, // null | 2.0 | 2.5 | 3.0 | ...
  onChange, // (v) => void
  themeColors, // { tint, textPrimary, card, inputBg } (optional, for theming)
  font, // { regular, semibold, bold } (optional)
}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  // Local dropdown open/close state
  const [open, setOpen] = useState(false);

  // Theme overrides (currently not fully used, but kept for API symmetry)
  const tint = themeColors ?? theme.tint;
  const textPrimary = themeColors ?? theme.textPrimary;
  const card = theme.background;

  // Label shown on trigger (e.g., “Any rating” or “3.5”)
  const label = value == null ? "Any rating" : `${value.toFixed(1)}`;

  return (
    <View style={styles.wrap}>
      {/* Trigger button */}
      <TouchableOpacity
        onPress={() => setOpen((p) => !p)}
        activeOpacity={0.85}
        style={[styles.trigger, { borderColor: theme.tint }]}
      >
        {/* Star icon on the left */}
        <Ionicons
          name="star"
          size={16}
          color={theme.tint}
          style={{ marginRight: 6 }}
        />

        {/* "Rating" label */}
        <Text
          style={[
            styles.triggerText,
            { color: theme.tint },
            font?.semibold && { fontFamily: Font.semibold },
          ]}
        >
          Rating
        </Text>

        {/* Chevron to indicate dropdown state */}
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={theme.tint}
          style={{ marginLeft: 6 }}
        />
      </TouchableOpacity>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop to close on outside tap */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
          />

          {/* Actual dropdown list */}
          <View style={[styles.dropdown, { backgroundColor: card }]}>
            {OPTIONS.map((opt, idx) => {
              const selected =
                (opt == null && value == null) ||
                (opt != null && opt === value);
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.85}
                  style={[
                    styles.option,
                    selected && {
                      backgroundColor: theme.background,
                      borderColor: theme.tint,
                    },
                  ]}
                  onPress={() => {
                    onChange?.(opt);
                    setOpen(false);
                  }}
                >
                  {/* Option label text: “Any rating” or “3.5” */}
                  <Text
                    style={[
                      styles.optionText,
                      { color: theme.textPrimary },
                      font?.regular && { fontFamily: Font.regular },
                    ]}
                  >
                    {opt == null ? "Any rating" : opt.toFixed(1)}
                  </Text>

                  {/* Right side: visual preview of rating stars
                     or a dash if it's "Any rating". */}
                  {opt == null ? (
                    <Text style={{ opacity: 0.6 }}>—</Text>
                  ) : (
                    <Stars value={opt} />
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
  // Outer container for the RatingFilter component.
  // flex: 1 so this chip can sit next to others (like "Hours") and share the row evenly.
  wrap: {
    flex: 1, // so it shares the row evenly with the other button
  },

  // The visible pill/chip the user taps (shows "Rating ▼").
  // Bordered, rounded, horizontal layout with icon + label + chevron.
  trigger: {
    height: 40,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  // Text style inside the trigger chip ("Rating").
  triggerText: {
    fontSize: 14,
  },

  // The dropdown panel that appears under the chip.
  // Absolutely positioned below the trigger, with shadow/elevation so it floats above the map.
  dropdown: {
    position: "absolute",
    top: 44,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    paddingVertical: 6,
    zIndex: 999,
    elevation: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },

  // One row inside the dropdown (e.g. "3.5  ⭐⭐⭐✩✩").
  // We space label on the left and the stars (or dash) on the right.
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: "transparent",
    justifyContent: "space-between",
  },

  // Text style for the left side of each row ("Any rating", "3.5", etc.).
  optionText: {
    fontSize: 14,
    marginRight: 12, // Breathing room before stars
  },
});
