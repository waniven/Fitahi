// components/analytics/AnalyticsUniversalCard.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { Type } from "../../constants/Font";
import * as userService from "../../services/userService";
import CustomToast from "../common/CustomToast";

const screenWidth = Dimensions.get("window").width;
const cardWidth = screenWidth - 40;

// helper to calculate age from DOB
const calculateAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const AnalyticsUniversalCard = ({
  entry,
  type, // 'water', 'workout', or 'biometric'
  onDelete,
  onPress,
  showDeleteButton = false,
  style,
  cardSpacing = 16,
  ...props
}) => {
  const [age, setAge] = useState(null);

  // fetch DOB from userService once and calculate age
  useEffect(() => {
    async function fetchUserAge() {
      try {
        const me = await userService.getMe();
        if (me?.dateofbirth) {
          setAge(calculateAge(me.dateofbirth));
        }
      } catch (err) {
        CustomToast.error(
          "Failed to fetch your birthdate",
          "Please try again later."
        );
      }
    }
    fetchUserAge();
  }, []);

  // bmi logic
  const parseBmiValue = () => {
    const raw = entry?.bmi ?? null; // prefer virtual field in db schema
    if (raw != null) {
      const n = typeof raw === "string" ? Number(raw) : raw;
      return Number.isFinite(n) ? Math.round(n * 10) / 10 : null;
    }
    if (entry?.weight != null && entry?.height != null) {
      const w = Number(entry.weight);
      const h = Number(entry.height) / 100;
      if (!isNaN(w) && !isNaN(h) && h > 0) {
        const val = w / (h * h);
        return Math.round(val * 10) / 10;
      }
    }
    return null;
  };

  const getBMIStatus = (bmi) => {
    if (bmi == null) return { text: "-", color: "#999" };
    if (bmi < 18.5) return { text: "Underweight", color: "#4FC3F7" };
    if (bmi < 25) return { text: "Normal", color: "#66BB6A" };
    if (bmi < 30) return { text: "Overweight", color: "#FFB74D" };
    return { text: "Obese", color: "#EF5350" };
  };

  // timestamp formatting
  const getTimestamp = () => {
    if (type === "water")
      return entry?.time ?? entry?.createdAt ?? entry?.timestamp;
    if (type === "workout")
      return entry?.dateCompleted ?? entry?.createdAt ?? entry?.timestamp;
    return (
      entry?.timestamp ??
      entry?.createdAt ??
      entry?.time ??
      entry?.dateCompleted
    );
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "-";
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

  const formatDurationText = (seconds) => {
    if (!seconds || isNaN(seconds)) return "-";
    const minutes = Math.round(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  };

  const handlePress = () => onPress && onPress(entry);

  const getMainDisplay = () => {
    if (type === "water") {
      return {
        value: entry?.amount != null ? entry.amount.toFixed(0) : "0",
        unit: "mL",
        subtitle: "water goal",
        color: Colors.light.primary,
      };
    } else if (type === "workout") {
      const totalTime = entry?.totalTimeSpent;
      return {
        value:
          totalTime && !isNaN(totalTime) && totalTime > 0
            ? formatDurationText(totalTime)
            : "---",
        unit: "",
        subtitle: `${
          entry?.completedExercises?.length || 0
        } exercises finished`,
        color: "#6761d7ff",
      };
    } else if (type === "biometric") {
      const bmiVal = parseBmiValue();
      const bmiStatus = getBMIStatus(bmiVal);
      return {
        value: entry?.weight != null ? Number(entry.weight).toFixed(2) : "-",
        unit: "kg",
        subtitle: bmiStatus.text,
        color: bmiStatus.color,
      };
    }
  };

  const getDetails = () => {
    if (type === "water") {
      return `Goal met at this point? • No`;
    } else if (type === "workout") {
      const workoutName =
        entry?.workout_id?.name || entry?.workoutName || "Deleted Workout";
      const totalExercises = entry?.completedExercises?.length || 0;
      return `Workout Name: ${workoutName} | Exercises finished: ${totalExercises}`;
    } else if (type === "biometric") {
      const bmiVal = parseBmiValue();
      return `Height: ${
        entry?.height != null ? entry.height.toFixed(1) : "-"
      } cm | BMI: ${bmiVal ?? "-"} | Age: ${age ?? "-"}`;
    }
  };

  const mainDisplay = getMainDisplay();

  const dynamicStyles = StyleSheet.create({
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
  });

  const CardContent = (
    <>
      <View style={[styles.accentBar, { backgroundColor: "#4F9AFF" }]} />

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View style={styles.spacer} />
          <Text style={styles.timestamp}>
            {formatTimestamp(getTimestamp())}
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

        <View style={styles.mainSection}>
          <Text style={[styles.mainValue, { color: "#4F9AFF" }]}>
            {mainDisplay.value}
          </Text>
          {mainDisplay.unit && (
            <Text style={styles.unit}>{mainDisplay.unit}</Text>
          )}
        </View>

        <View style={styles.subtitleSection}>
          <Text style={[styles.subtitle, { color: mainDisplay.color }]}>
            {mainDisplay.subtitle}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <Text
            style={styles.detailText}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {getDetails()}
          </Text>
        </View>
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[dynamicStyles.cardContainer, style]}
        onPress={handlePress}
        activeOpacity={0.7}
        {...props}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[dynamicStyles.cardContainer, style]} {...props}>
      {CardContent}
    </View>
  );
};

const styles = StyleSheet.create({
  accentBar: {
    position: "absolute",
    left: 20,
    top: 15,
    width: 8,
    height: 110,
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
    fontSize: 15,
    color: "#666",
    textAlign: "right",
    ...Type.regular,
  },

  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },

  mainSection: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
    marginTop: -10,
  },

  mainValue: {
    fontSize: 30,
    lineHeight: 34,
    ...Type.bold,
  },

  unit: {
    fontSize: 16,
    color: "#666",
    marginLeft: 4,
    ...Type.regular,
  },

  subtitleSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
  },

  subtitle: {
    fontSize: 15,
    ...Type.bold,
  },

  detailsRow: {
    marginTop: 4,
    justifyContent: "flex-end",
    flex: 1,
  },

  detailText: {
    fontSize: 14,
    color: "#333",
    ...Type.regular,
    lineHeight: 18,
  },
});

export default AnalyticsUniversalCard;
