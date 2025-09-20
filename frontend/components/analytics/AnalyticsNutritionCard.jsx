// components/analytics/AnalyticsNutritionCard.jsx
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Type } from "../../constants/Font";

const screenWidth = Dimensions.get("window").width;
const cardWidth = screenWidth - 40;

const AnalyticsNutritionCard = ({
  entry,
  showDeleteButton = false,
  onDelete,
  style,
  ...props
}) => {
  const {
    name,
    type: mealType,
    calories,
    protein,
    carbs,
    fat,
    createdAt,
    _id,
  } = entry;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleDateString("en-US", { month: "short" });
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    return `${day} ${month}, ${hours}:${minutes}${ampm}`;
  };

  const formatMealType = (mealType) =>
    mealType.charAt(0).toUpperCase() + mealType.slice(1);

  return (
    <View style={[styles.container, style]} {...props}>
      <View
        style={[
          styles.headerSection,
          { paddingRight: showDeleteButton ? 35 : 0 },
        ]}
      >
        <Text style={styles.foodNameText} numberOfLines={2}>
          {name}
        </Text>
      </View>

      <View style={styles.metaSection}>
        <Text style={styles.timestampText}>{formatTimestamp(createdAt)}</Text>
        <View style={styles.mealTypeBadge}>
          <Text style={styles.mealTypeText}>{formatMealType(mealType)}</Text>
        </View>
      </View>

      <View style={styles.nutritionSection}>
        <View style={styles.nutritionRow}>
          <View style={[styles.nutritionBadge, styles.caloriesBadge]}>
            <Text style={styles.badgeText}>Calories: {calories} kcal</Text>
          </View>
          <View style={[styles.nutritionBadge, styles.proteinBadge]}>
            <Text style={styles.badgeText}>Protein: {protein} g</Text>
          </View>
        </View>
        <View style={styles.nutritionRow}>
          <View style={[styles.nutritionBadge, styles.carbsBadge]}>
            <Text style={styles.badgeText}>Carbs: {carbs} g</Text>
          </View>
          <View style={[styles.nutritionBadge, styles.fatBadge]}>
            <Text style={styles.badgeText}>Fat: {fat} g</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 20,
    alignSelf: "center",
    width: cardWidth,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
    minHeight: 160,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  foodNameText: {
    fontSize: 18,
    color: "#4A90E2",
    flex: 1,
    lineHeight: 22,
    ...Type.bold,
  },
  metaSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  timestampText: {
    fontSize: 13,
    color: "#666",
    ...Type.regular,
  },
  mealTypeBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4A90E2",
  },
  mealTypeText: {
    fontSize: 12,
    color: "#4A90E2",
    ...Type.semibold,
  },
  nutritionSection: {
    flex: 1,
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  nutritionBadge: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 0.48,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  caloriesBadge: { backgroundColor: "#FF5A5A" },
  proteinBadge: { backgroundColor: "#4ce6dbff" },
  fatBadge: { backgroundColor: "#45B7D1" },
  carbsBadge: { backgroundColor: "#FFA726" },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 2,
    ...Type.semibold,
  },
});

export default AnalyticsNutritionCard;
