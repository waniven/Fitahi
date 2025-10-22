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

const OPTIONS = [null, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5];

/**
 * Stars
 * Renders a 0–5 star row (supports halves).
 * @param {number|null} value - Rating value (null treated as 0).
 * @param {number} [size=16] - Icon size.
 * @param {string} [color] - Filled star color (defaults to theme.warning).
 * @param {string} [emptyColor] - Empty star color (defaults to theme.textSecondary).
 */
function Stars({
  value,
  size = 16,
  color,
  emptyColor,
}) {
  const scheme = useColorScheme();
    const theme = Colors[scheme ?? "light"];
  // value could be null; treat null as 0 for display in options except "Any rating"
  const _color = color ?? theme.warning;
  const _emptyColor = emptyColor ?? theme.textSecondary;

  // Clamp & decompose rating
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
 * Dropdown filter to choose minimum rating (Any, 2.0 … 4.5).
 *
 * Props:
 * - value: number|null (current selection; null = Any rating)
 * - onChange: (val) => void (called with chosen option)
 * - themeColors, font: optional style overrides
 */
export default function RatingFilter({
  value, // null | 2.0 | 2.5 | 3.0 | ...
  onChange, // (v) => void
  themeColors, // { tint, textPrimary, card, inputBg } (optional, for theming)
  font, // { regular, semibold, bold } (optional)
}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const [open, setOpen] = useState(false);

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
        <Ionicons
          name="star"
          size={16}
          color={theme.tint}
          style={{ marginRight: 6 }}
        />
        <Text
          style={[
            styles.triggerText,
            { color: theme.tint },
            font?.semibold && { fontFamily: Font.semibold },
          ]}
        >
          Rating
        </Text>
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
                  <Text
                    style={[
                      styles.optionText,
                      { color: theme.textPrimary },
                      font?.regular && { fontFamily: Font.regular },
                    ]}
                  >
                    {opt == null ? "Any rating" : opt.toFixed(1)}
                  </Text>

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
  wrap: {
    flex: 1, // so it shares the row evenly with the other button
  },
  trigger: {
    height: 40,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  triggerText: {
    fontSize: 14,
  },
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
  optionText: {
    fontSize: 14,
    marginRight: 12,
  },
});
