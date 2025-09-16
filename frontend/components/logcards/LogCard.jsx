// components/logcards/LogCard.jsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Font } from "@/constants/Font";

export default function LogCard({ title, icon, color, width, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: "#fff",
          width: width * 0.9, 
          borderColor: color,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Text style={[styles.icon, { color }]} numberOfLines={1}>
          {icon}
        </Text>
        <Text
          style={[styles.title, { color, fontFamily: Font.semibold }]}
          numberOfLines={2} // prevent text from being cut off
          adjustsFontSizeToFit //  shrink font slightly if too long
          minimumFontScale={0.8} 
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingVertical: 16, 
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  content: {
    alignItems: "center",
  },
  icon: {
    fontSize: 26, 
    marginBottom: 6,
  },
  title: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
    flexWrap: "wrap", //if text is too long wrap
  },
});
