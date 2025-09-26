import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import LogCard from "./LogCard";

const { width } = Dimensions.get("window");
const GAP = 20; // spacing between cards

// LogCards - Renders a responsive grid of LogCard components, 2 per row, with optional filler for odd numbers
export default function LogCards({ cards }) {
  const cardWidth = (width - GAP * 3) / 2; // 2 cards per row with padding

  // Split cards into rows of 2 for grid layout
  const rows = [];
  for (let i = 0; i < cards.length; i += 2) {
    rows.push(cards.slice(i, i + 2));
  }

  return (
    <>
      {/* Main render */}
      {rows.map((row, rowIndex) => (
        <View style={styles.row} key={rowIndex}>
          {/* Render each card in the row */}
          {row.map((card, index) => (
            <LogCard
              key={index}
              title={card.title}
              icon={card.icon}
              color={card.color}
              width={cardWidth}
              onPress={card.onPress}
            />
          ))}
          {/* Filler to keep grid shape if odd number of cards */}
          {row.length === 1 && <View style={{ width: cardWidth }} />}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: GAP,
    marginBottom: 16,
  },
});
