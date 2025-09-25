import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Type } from "../../constants/Font";

const screenWidth = Dimensions.get("window").width;
const cardWidth = screenWidth - 40;

// BMI classification ranges with associated colors for status indication
const BMI_RANGES = {
  underweight: { min: 0, max: 18.5, text: "Underweight", color: "#4FC3F7" },
  normal: { min: 18.5, max: 25, text: "Normal", color: "#66BB6A" },
  overweight: { min: 25, max: 30, text: "Overweight", color: "#FFB74D" },
  obese: { min: 30, max: 100, text: "Obese", color: "#EF5350" },
};

// Typography styles using Font constants for consistent text rendering
const textStyles = {
  bodyMedium: { fontSize: 16, ...Type.regular },
  bodySmall: { fontSize: 16, ...Type.regular },
  weightValue: { fontSize: 32, ...Type.bold },
  bmiStatus: { fontSize: 16, ...Type.bold },
};

/**
 * Biometric data card component displaying weight, BMI status, and measurement details
 * Features BMI calculation, color-coded health status, and optional deletion functionality
 */
const BiometricDataCard = ({
  entry,
  onDelete,
  showDeleteButton = true,
  style,
  bmiRanges = BMI_RANGES,
}) => {
  // Calculates BMI from weight (kg) and height (cm) with null handling
  const calculateBMI = (weightKg, heightCm) => {
    if (!weightKg || !heightCm) return null;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
  };

  // Determines BMI health status category with appropriate color coding
  const getBMIStatus = (bmi) => {
    if (bmi == null) return { text: "--", color: "#999" };
    if (bmi < bmiRanges.underweight.max) {
      return {
        text: bmiRanges.underweight.text,
        color: bmiRanges.underweight.color,
      };
    } else if (bmi >= bmiRanges.normal.min && bmi < bmiRanges.normal.max) {
      return { text: bmiRanges.normal.text, color: bmiRanges.normal.color };
    } else if (
      bmi >= bmiRanges.overweight.min &&
      bmi < bmiRanges.overweight.max
    ) {
      return {
        text: bmiRanges.overweight.text,
        color: bmiRanges.overweight.color,
      };
    } else {
      return { text: bmiRanges.obese.text, color: bmiRanges.obese.color };
    }
  };

  // Formats timestamp to readable date and time format (08 Aug, 07:00am)
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "--";
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleDateString("en-US", { month: "short" });
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${day} ${month}, ${hours
      .toString()
      .padStart(2, "0")}:${minutes}${ampm}`;
  };

  // Handles entry deletion using backend ID
  const handleDelete = () => {
    onDelete(entry._id);
  };

  const bmi = calculateBMI(entry.weight, entry.height);
  const bmiStatus = getBMIStatus(bmi);

  return (
    <View style={[styles.cardContainer, style]}>
      <View style={styles.accentBar} />

      <View style={styles.contentContainer}>
        {/* Header with timestamp and optional delete button */}
        <View style={styles.headerRow}>
          <View style={styles.spacer} />
          <Text style={[textStyles.bodySmall, styles.timestamp]}>
            {formatTimestamp(entry.timestamp)}
          </Text>
          {showDeleteButton && onDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Main weight display section */}
        <View style={styles.weightSection}>
          <Text style={[textStyles.weightValue, styles.weightValue]}>
            {entry.weight?.toFixed(2) || "--"}
          </Text>
          <Text style={[textStyles.bodyMedium, styles.weightUnit]}>kg</Text>
        </View>

        {/* BMI status with color-coded health category */}
        <View style={styles.bmiSection}>
          <Text
            style={[
              textStyles.bmiStatus,
              styles.bmiStatus,
              { color: bmiStatus.color },
            ]}
          >
            {bmiStatus.text}
          </Text>
          <Text style={[textStyles.bodyMedium, styles.bmiValue]}>
            {" "}
            {bmi != null ? `(BMI ${bmi})` : ""}
          </Text>
        </View>

        {/* Additional measurement details */}
        <View style={styles.detailsRow}>
          <Text style={[textStyles.bodySmall, styles.detailText]}>
            Height: {entry.height?.toFixed(1) || "--"} cm
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginVertical: 6,
    marginHorizontal: 0,
    width: cardWidth,
    minHeight: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
    alignSelf: "center",
  },

  accentBar: {
    position: "absolute",
    left: 20,
    top: 12,
    width: 8,
    height: 116,
    backgroundColor: "#4F9AFF",
    borderRadius: 4,
  },

  contentContainer: {
    flex: 1,
    padding: 16,
    paddingLeft: 44,
    paddingTop: 10,
    paddingRight: 16,
    paddingBottom: 16,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 6,
    minHeight: 20,
  },

  spacer: {
    flex: 1,
  },

  timestamp: {
    color: "#666",
    textAlign: "right",
    fontSize: 15,
    ...Type.regular,
  },

  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },

  weightSection: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
    marginTop: -10,
  },

  weightValue: {
    color: "#4F9AFF",
    lineHeight: 34,
    fontSize: 30,
    ...Type.bold,
  },

  weightUnit: {
    color: "#666",
    marginLeft: 4,
    fontSize: 16,
    ...Type.regular,
  },

  bmiSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
  },

  bmiStatus: {
    fontSize: 15,
    ...Type.bold,
  },

  bmiValue: {
    color: "#666",
    fontSize: 14,
    ...Type.regular,
  },

  detailsRow: {
    marginTop: 4,
    justifyContent: "flex-end",
    flex: 1,
  },

  detailText: {
    color: "#333",
    fontSize: 14,
    ...Type.regular,
    lineHeight: 18,
  },
});

export default BiometricDataCard;