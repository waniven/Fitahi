import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LineChart, BarChart, StackedBarChart } from "react-native-chart-kit";
import { Colors } from "../../constants/Colors";
import { Type, TextVariants } from "../../constants/Font";
import CustomButtonThree from "../common/CustomButtonThree";
import FloatingAIButton from "../../app/ai/FloatingAIButton";
import BottomNav from "../navbar/BottomNav";
import LoadingProgress from "../LoadingProgress";

import { getAllWater } from "../../services/waterServices";
import { getWorkoutResults } from "../../services/workoutResultService";
import { getAllNutrition } from "../../services/nutritionService";
import { getBiometrics } from "../../services/biometricService";
import Toast from "react-native-toast-message";

const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth - 60;
const chartContainerWidth = screenWidth - 40;

const AnalyticsDashboard = () => {
  const router = useRouter(); // Router for navigation
  const theme = Colors["dark"]; // Current theme colors

  // State for different logs and loading
  const [waterEntries, setWaterEntries] = useState([]); // Water intake logs
  const [workoutEntries, setWorkoutEntries] = useState([]); // Workout session logs
  const [nutritionEntries, setNutritionEntries] = useState([]); // Nutrition logs
  const [biometricEntries, setBiometricEntries] = useState([]); // Biometric logs
  const [loading, setLoading] = useState(true); // Loading state for data fetch
  const [progress, setProgress] = useState(0); // Progress for loading indicator

  // Fetch all logs when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Start loading
        setProgress(0); // Reset progress

        let water = [],
          workouts = [],
          nutrition = [],
          biometrics = [];

        // Fetch water logs
        try {
          water = await getAllWater();
          setProgress(0.25); // Update progress
        } catch (err) {
          CustomToast.error(
            "Could not load Water Intake logs",
            "Please try again."
          );
        }

        // Fetch workout logs
        try {
          workouts = await getWorkoutResults();
          setProgress(0.5);
        } catch (err) {
          CustomToast.error("Could not load Workout logs", "Please try again.");
        }

        // Fetch nutrition logs
        try {
          nutrition = await getAllNutrition();
          setProgress(0.75);
        } catch (err) {
          CustomToast.error(
            "Could not load Nutrition logs",
            "Please try again."
          );
        }

        // Fetch biometric logs
        try {
          biometrics = await getBiometrics();
          setProgress(1);
        } catch (err) {
          CustomToast.error(
            "Could not load Biometric logs",
            "Please try again."
          );
        }

        // Update state with fetched data
        setWaterEntries(water);
        setWorkoutEntries(workouts);
        setNutritionEntries(nutrition);
        setBiometricEntries(biometrics);
      } catch (err) {
        CustomToast.error(
          "Error fetching your Analytics",
          "Please try again soon."
        );
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchData();
  }, []); // Run once on mount

  // Helper to convert seconds to minutes
  const secondsToMinutes = (seconds) => seconds / 60;

  // Helper to get start and end dates for current week
  const getWeekBounds = () => {
    const now = new Date();
    const day = now.getDay(); // 0=Sun … 6=Sat
    const diffToMonday = (day + 6) % 7; // shift so Monday=0
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(0, 0, 0, 0);

    return { startOfWeek, endOfWeek };
  };

  const { startOfWeek, endOfWeek } = getWeekBounds(); // Current week range

  // Check if there are logs for current week
  const hasWaterLogs = waterEntries.some((entry) => {
    const date = new Date(entry.timestamp || entry.createdAt);
    return date >= startOfWeek && date < endOfWeek;
  });

  const hasWorkoutLogs = workoutEntries.some((entry) => {
    const date = new Date(entry.dateCompleted || entry.timestamp);
    return date >= startOfWeek && date < endOfWeek;
  });

  const hasNutritionLogs = nutritionEntries.some((entry) => {
    const date = new Date(entry.timestamp || entry.createdAt);
    return date >= startOfWeek && date < endOfWeek;
  });

  const hasBiometricLogs = biometricEntries.some((entry) => {
    const date = new Date(entry.timestamp);
    return date >= startOfWeek && date < endOfWeek;
  });

  // Prepare water chart data for current week
  const prepareWaterData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const waterByDay = Array(7).fill(0);

    waterEntries.forEach((entry) => {
      const date = new Date(entry.timestamp || entry.createdAt);
      if (date >= startOfWeek && date < endOfWeek) {
        const dayIndex = (date.getDay() + 6) % 7; // Monday=0
        waterByDay[dayIndex] += entry.amount || 0;
      }
    });

    return { labels: days, datasets: [{ data: waterByDay }] };
  };

  // Prepare workout chart data for current week
  const prepareWorkoutData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const workoutByDay = Array(7).fill(0);

    workoutEntries.forEach((entry) => {
      if (!entry.totalTimeSpent) return; // Skip if no data
      const date = new Date(entry.dateCompleted || entry.timestamp);
      if (date >= startOfWeek && date < endOfWeek) {
        const dayIndex = (date.getDay() + 6) % 7;
        workoutByDay[dayIndex] += secondsToMinutes(entry.totalTimeSpent);
      }
    });

    return { labels: days, datasets: [{ data: workoutByDay }] };
  };

  // Prepare stacked nutrition chart data for current week
  const prepareNutritionStackedData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dailyMacros = [];

    days.forEach((day, dayIndex) => {
      let proteinGrams = 0,
        carbsGrams = 0,
        fatGrams = 0;

      nutritionEntries.forEach((entry) => {
        const date = new Date(entry.timestamp || entry.createdAt);
        const entryDayIndex = (date.getDay() + 6) % 7;
        if (
          entryDayIndex === dayIndex &&
          date >= startOfWeek &&
          date < endOfWeek
        ) {
          proteinGrams += entry.protein || 0;
          carbsGrams += entry.carbs || 0;
          fatGrams += entry.fat || 0;
        }
      });

      dailyMacros.push([
        Math.round(proteinGrams),
        Math.round(carbsGrams),
        Math.round(fatGrams),
      ]);
    });

    return {
      labels: days,
      data: dailyMacros,
      barColors: ["#4ECDC4", "#FFB74D", "#5DADE2"],
    };
  };

  // Prepare biometrics chart data for current week
  const prepareBiometricsData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weights = Array(7).fill(null);

    const filtered = biometricEntries
      .filter((entry) => {
        const date = new Date(entry.timestamp);
        return date >= startOfWeek && date < endOfWeek;
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    filtered.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const dayIndex = (date.getDay() + 6) % 7;
      weights[dayIndex] = entry.weight;
    });

    return { labels: days, datasets: [{ data: weights }] };
  };

  // Prepare data for charts
  const waterData = prepareWaterData();
  const workoutData = prepareWorkoutData();
  const nutritionStackedData = prepareNutritionStackedData();
  const biometricsData = prepareBiometricsData();

  // Show loading progress while fetching data
  if (loading) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
      >
        {/* Show loading progress bar */}
        <LoadingProgress progress={progress} message="Fetching analytics..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.backButtonContainer}>
            <CustomButtonThree onPress={() => router.back()} />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Your Analytics
          </Text>
        </View>
        <Text style={[styles.subtitle, { color: "#CCCCCC" }]}>
          Take a visual look at your progress.
        </Text>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Water Chart */}
          {hasWaterLogs && (
            <TouchableOpacity
              onPress={() => router.push("/analytics/WaterAnalyticsScreen")}
              activeOpacity={0.8}
            >
              <View style={styles.chartSection}>
                <View style={styles.chartTitleContainer}>
                  <Text style={[styles.chartTitle, { color: "#FFFFFF" }]}>
                    WATER INTAKE
                  </Text>
                  <Text style={[styles.chartSubtitle, { color: "#CCCCCC" }]}>
                    Daily consumption (millilitres)
                  </Text>
                </View>
                <View style={styles.chartContainer}>
                  <BarChart
                    data={waterData}
                    width={chartWidth}
                    height={200}
                    chartConfig={{
                      backgroundColor: "#fff",
                      backgroundGradientFrom: "#fff",
                      backgroundGradientTo: "#fff",
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                      labelColor: (opacity = 1) =>
                        `rgba(51, 51, 51, ${opacity})`,
                    }}
                    style={styles.chart}
                    fromZero
                    segments={4}
                  />
                  <Text style={styles.chartPeriod}>Current Week</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Workout Chart */}
          {hasWorkoutLogs && (
            <TouchableOpacity
              onPress={() => router.push("/analytics/WorkoutAnalyticsScreen")}
              activeOpacity={0.8}
            >
              <View style={styles.chartSection}>
                <View style={styles.chartTitleContainer}>
                  <Text style={[styles.chartTitle, { color: "#FFFFFF" }]}>
                    WORKOUT TIME
                  </Text>
                  <Text style={[styles.chartSubtitle, { color: "#CCCCCC" }]}>
                    Daily workout duration (minutes)
                  </Text>
                </View>
                <View style={styles.chartContainer}>
                  <BarChart
                    data={workoutData}
                    width={chartWidth}
                    height={200}
                    chartConfig={{
                      backgroundColor: "#fff",
                      backgroundGradientFrom: "#fff",
                      backgroundGradientTo: "#fff",
                      decimalPlaces: 2,
                      color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                      labelColor: (opacity = 1) =>
                        `rgba(51, 51, 51, ${opacity})`,
                    }}
                    style={styles.chart}
                    fromZero
                    segments={4}
                  />
                  <Text style={styles.chartPeriod}>Current Week</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Nutrition Chart */}
          {hasNutritionLogs && (
            <TouchableOpacity
              onPress={() => router.push("/analytics/NutritionAnalyticsScreen")}
              activeOpacity={0.8}
            >
              <View style={styles.chartSection}>
                <View style={styles.chartTitleContainer}>
                  <Text style={[styles.chartTitle, { color: "#FFFFFF" }]}>
                    TOTAL PER DAY
                  </Text>
                  <Text style={[styles.chartSubtitle, { color: "#CCCCCC" }]}>
                    Calories by macronutrient breakdown (grams)
                  </Text>
                </View>
                <View style={styles.nutritionChartContainer}>
                  <StackedBarChart
                    data={nutritionStackedData}
                    width={chartWidth}
                    height={300}
                    chartConfig={{
                      backgroundColor: "#fff",
                      backgroundGradientFrom: "#fff",
                      backgroundGradientTo: "#fff",
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                      labelColor: (opacity = 1) =>
                        `rgba(51, 51, 51, ${opacity})`,
                    }}
                    style={styles.nutritionChart}
                    fromZero
                    segments={5}
                  />

                  <View style={styles.nutritionLegend}>
                    <View style={styles.legendRow}>
                      <View style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: "#4ECDC4" },
                          ]}
                        />
                        <Text style={styles.legendText}>Protein</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: "#FFB74D" },
                          ]}
                        />
                        <Text style={styles.legendText}>Carbs</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: "#5DADE2" },
                          ]}
                        />
                        <Text style={styles.legendText}>Fat</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.chartPeriod}>Current Week</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Biometrics Chart */}
          {hasBiometricLogs && (
            <TouchableOpacity
              onPress={() =>
                router.push("/analytics/BiometricsAnalyticsScreen")
              }
              activeOpacity={0.8}
            >
              <View style={styles.chartSection}>
                <View style={styles.chartTitleContainer}>
                  <Text style={[styles.chartTitle, { color: "#FFFFFF" }]}>
                    WEIGHT PROGRESS
                  </Text>
                  <Text style={[styles.chartSubtitle, { color: "#CCCCCC" }]}>
                    Daily weight tracking (kilograms)
                  </Text>
                </View>
                <View style={styles.chartContainer}>
                  <LineChart
                    data={biometricsData}
                    width={chartWidth}
                    height={200}
                    chartConfig={{
                      backgroundColor: "#fff",
                      backgroundGradientFrom: "#fff",
                      backgroundGradientTo: "#fff",
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
                      labelColor: (opacity = 1) =>
                        `rgba(51, 51, 51, ${opacity})`,
                    }}
                    style={styles.chart}
                    bezier
                    withDots
                    withInnerLines={false}
                    withOuterLines={false}
                    segments={4}
                  />
                  <Text style={styles.chartPeriod}>Current Week</Text>
                </View>
              </View>
              <Toast />
            </TouchableOpacity>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      <BottomNav />
      <FloatingAIButton />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 45,
    paddingBottom: 10,
    position: "relative",
    paddingHorizontal: 20,
  },
  backButtonContainer: { position: "absolute", left: 20, top: 45 },
  title: { ...TextVariants.h1, textAlign: "center" },
  subtitle: {
    ...TextVariants.body,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  scrollContainer: { flex: 1 },
  scrollContent: {
    paddingBottom: 140,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  chartSection: { marginBottom: 40, width: "100%", alignItems: "center" },
  chartTitleContainer: { marginBottom: 20, alignItems: "center" },
  chartTitle: {
    ...Type.semibold,
    fontSize: 18,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  chartSubtitle: {
    ...Type.regular,
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },
  chartContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    width: chartContainerWidth,
    minWidth: chartContainerWidth,
  },
  nutritionChartContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    width: chartContainerWidth,
    minWidth: chartContainerWidth,
  },
  chart: { borderRadius: 12 },
  nutritionChart: { borderRadius: 12 },
  chartPeriod: {
    ...TextVariants.caption,
    color: "#666",
    marginTop: 10,
    fontStyle: "italic",
    textAlign: "center",
  },
  nutritionLegend: {
    marginTop: 15,
    marginBottom: 5,
    paddingHorizontal: 10,
    width: "100%",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { ...Type.regular, fontSize: 12, color: "#333" },
  bottomSpacing: { height: 20 },
});

export default AnalyticsDashboard;
