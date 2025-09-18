// components/analytics/AnalyticsDashboard.jsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { LineChart, BarChart, StackedBarChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/Colors';
import { Font, Type, TextVariants } from '../../constants/Font';
import { sampleEntries } from '../../components/common/SampleData';
import CustomButtonThree from '../common/CustomButtonThree';
import FloatingAIButton from '../../app/ai/FloatingAIButton';
import BottomNav from '../navbar/BottomNav';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 60; // Reduced padding for better fit
const chartContainerWidth = screenWidth - 40; // Container width

/**
 * AnalyticsDashboard - Enhanced dashboard with workout analytics and navigation
 */
const AnalyticsDashboard = ({ onBackPress, onRefresh }) => {
  const router = useRouter(); // Use Expo Router instead of navigation prop
  const theme = Colors["dark"];

  // Use sample data - you can replace this with props later if needed
  const data = sampleEntries;

  // Navigation handlers for each chart using Expo Router
  const navigateToWaterLogs = () => {
    router.push('/analytics/WaterAnalyticsScreen');
  };

  const navigateToWorkoutLogs = () => {
    router.push('/analytics/WorkoutAnalyticsScreen');
  };

  const navigateToNutritionLogs = () => {
    router.push('/analytics/NutritionAnalyticsScreen');
  };

  const navigateToBiometricLogs = () => {
    router.push('/analytics/BiometricsAnalyticsScreen');
  };

  // Enhanced chart configuration with better padding and margins
  const whiteChartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#ffffff'
    },
    propsForBackgroundLines: {
      strokeDasharray: '3,3',
      stroke: 'rgba(0, 0, 0, 0.1)',
      strokeWidth: 1
    },
    propsForLabels: {
      fontSize: 11,
      fontFamily: Font.regular
    },
    paddingRight: 30, // Add right padding to prevent label cutoff
    paddingLeft: 10,   // Add left padding for better spacing
  };

  // Helper function to convert seconds to minutes
  const secondsToMinutes = (seconds) => Math.round(seconds / 60);

  // Water data - Bar Chart
  const prepareWaterData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const waterByDay = Array(7).fill(0);

    data.waterEntries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
      waterByDay[dayIndex] += entry.amount;
    });

    return {
      labels: days,
      datasets: [{
        data: waterByDay.map(amount => amount || 0) // Show 0 if no water logged
      }]
    };
  };

  // Workout data - Bar Chart showing total time spent per day
  const prepareWorkoutData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const workoutByDay = Array(7).fill(0);

    data.workoutEntries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
      workoutByDay[dayIndex] += entry.totalTimeSpent || 0;
    });

    return {
      labels: days,
      datasets: [{
        data: workoutByDay.map(seconds => secondsToMinutes(seconds)) // Convert to minutes
      }]
    };
  };

  // Nutrition Chart with StackedBarChart using real sample data
  const prepareNutritionStackedData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyMacros = [];

    // Process each day
    days.forEach((day, dayIndex) => {
      let proteinCals = 0;
      let carbsCals = 0;
      let fatCals = 0;

      data.nutritionEntries.forEach(entry => {
        const date = new Date(entry.timestamp);
        const entryDayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

        if (entryDayIndex === dayIndex) {
          proteinCals += (entry.protein || 0) * 4;
          carbsCals += (entry.carbs || 0) * 4;
          fatCals += (entry.fat || 0) * 9;
        }
      });

      // Only add default values if absolutely no data exists
      if (proteinCals === 0 && carbsCals === 0 && fatCals === 0) {
        dailyMacros.push([0, 0, 0]); // Show empty bars for days with no data
      } else {
        dailyMacros.push([
          Math.round(proteinCals),
          Math.round(carbsCals),
          Math.round(fatCals)
        ]);
      }
    });

    return {
      labels: days,
      data: dailyMacros,
      barColors: ["#4ECDC4", "#FFB74D", "#5DADE2"] // Protein, Carbs, Fat
    };
  };

  // Biometrics - Line Chart with current week format
  const prepareBiometricsData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // If we have biometric entries, map them to the current week
    const sortedEntries = [...data.biometricEntries].sort((a, b) =>
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    if (sortedEntries.length === 0) {
      return {
        labels: days,
        datasets: [{ data: [70, 70, 70, 70, 70, 70, 70] }] // Flat line if no data
      };
    }

    // Create weight data for each day of the week
    const weeklyWeights = Array(7).fill(null);
    
    // Map existing entries to days (simplified - you might want more sophisticated logic)
    sortedEntries.forEach((entry, index) => {
      if (index < 7) {
        weeklyWeights[index] = entry.weight;
      }
    });

    // Fill missing days with the last known weight
    let lastKnownWeight = sortedEntries[sortedEntries.length - 1].weight;
    for (let i = 0; i < weeklyWeights.length; i++) {
      if (weeklyWeights[i] === null) {
        weeklyWeights[i] = lastKnownWeight;
      } else {
        lastKnownWeight = weeklyWeights[i];
      }
    }

    return {
      labels: days,
      datasets: [{ data: weeklyWeights }]
    };
  };

  const waterData = prepareWaterData();
  const workoutData = prepareWorkoutData();
  const nutritionStackedData = prepareNutritionStackedData();
  const biometricsData = prepareBiometricsData();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />

      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.backButtonContainer}>
            <CustomButtonThree onPress={onBackPress} />
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
          {/* Water Chart - Clickable */}
          <TouchableOpacity onPress={navigateToWaterLogs} activeOpacity={0.8}>
            <View style={styles.chartSection}>
              <View style={styles.chartTitleContainer}>
                <Text style={[styles.chartTitle, { color: "#FFFFFF" }]}>
                  WATER INTAKE
                </Text>
                <Text style={[styles.chartSubtitle, { color: "#CCCCCC" }]}>
                  Daily consumption (mL)
                </Text>
              </View>

              <View style={styles.chartContainer}>
                <BarChart
                  data={waterData}
                  width={chartWidth}
                  height={200}
                  chartConfig={{
                    ...whiteChartConfig,
                    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                    barPercentage: 0.6,
                  }}
                  style={styles.chart}
                  showValuesOnTopOfBars={false}
                  fromZero={true}
                  segments={4}
                />
                <Text style={styles.chartPeriod}>Current Week</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Workout Chart - Clickable */}
          <TouchableOpacity onPress={navigateToWorkoutLogs} activeOpacity={0.8}>
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
                    ...whiteChartConfig,
                    color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // Pink/Red color for workouts
                    barPercentage: 0.6,
                  }}
                  style={styles.chart}
                  showValuesOnTopOfBars={false}
                  fromZero={true}
                  segments={4}
                />
                <Text style={styles.chartPeriod}>Current Week</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Nutrition Chart - Clickable */}
          <TouchableOpacity onPress={navigateToNutritionLogs} activeOpacity={0.8}>
            <View style={styles.chartSection}>
              <View style={styles.chartTitleContainer}>
                <Text style={[styles.chartTitle, { color: "#FFFFFF" }]}>
                  TOTAL PER DAY (KCAL)
                </Text>
                <Text style={[styles.chartSubtitle, { color: "#CCCCCC" }]}>
                  Calories by macronutrient breakdown
                </Text>
              </View>

              <View style={styles.nutritionChartContainer}>
                <StackedBarChart
                  data={nutritionStackedData}
                  width={chartWidth}
                  height={300}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                    fillShadowGradient: '#ffffff',
                    fillShadowGradientOpacity: 0.1,
                    barPercentage: 0.5,
                    style: {
                      borderRadius: 16,
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: '3,3',
                      stroke: 'rgba(0, 0, 0, 0.1)',
                      strokeWidth: 1
                    },
                    propsForLabels: {
                      fontSize: 10,
                      fontFamily: Font.regular
                    },
                    formatYLabel: (value) => Math.floor(value).toString(),
                    yAxisInterval: 100,
                    paddingRight: 40, // Increased right padding
                    paddingLeft: 15,   // Increased left padding
                  }}
                  style={styles.nutritionChart}
                  segments={5}
                  withHorizontalLabels={true}
                  withVerticalLabels={true}
                  showBarTops={false}
                />

                {/* Clean Legend */}
                <View style={styles.nutritionLegend}>
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#4ECDC4' }]} />
                      <Text style={styles.legendText}>Protein</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#FFB74D' }]} />
                      <Text style={styles.legendText}>Carbs</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#5DADE2' }]} />
                      <Text style={styles.legendText}>Fat</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.chartPeriod}>Current Week</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Biometrics Chart - Clickable */}
          <TouchableOpacity onPress={navigateToBiometricLogs} activeOpacity={0.8}>
            <View style={styles.chartSection}>
              <View style={styles.chartTitleContainer}>
                <Text style={[styles.chartTitle, { color: "#FFFFFF" }]}>
                  WEIGHT PROGRESS
                </Text>
                <Text style={[styles.chartSubtitle, { color: "#CCCCCC" }]}>
                  Daily weight tracking (kg)
                </Text>
              </View>

              <View style={styles.chartContainer}>
                <LineChart
                  data={biometricsData}
                  width={chartWidth}
                  height={200}
                  chartConfig={{
                    ...whiteChartConfig,
                    color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
                  }}
                  style={styles.chart}
                  bezier
                  withDots={true}
                  withInnerLines={false}
                  withOuterLines={false}
                  segments={4}
                />
                <Text style={styles.chartPeriod}>Current Week</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      <BottomNav />
      <FloatingAIButton />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 45,
    paddingBottom: 10,
    position: 'relative',
    paddingHorizontal: 20,
  },
  backButtonContainer: {
    position: 'absolute',
    left: 20,
    top: 45,
  },
  title: {
    ...TextVariants.h1,
    textAlign: 'center',
  },
  subtitle: {
    ...TextVariants.body,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
    alignItems: 'center',
    paddingHorizontal: 10, // Add horizontal padding to scroll content
  },
  chartSection: {
    marginBottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  chartTitleContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  chartTitle: {
    ...Type.semibold,
    fontSize: 18,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  chartSubtitle: {
    ...Type.regular,
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20, // Increased padding for better spacing
    marginHorizontal: 20, // Reduced margin for bigger containers
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    width: chartContainerWidth, // Use container width
    minWidth: chartContainerWidth, // Ensure minimum width
  },
  nutritionChartContainer: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 25, // Increased padding for nutrition chart
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    width: chartContainerWidth,
    minWidth: chartContainerWidth,
  },
  chart: {
    borderRadius: 12,
    marginLeft: 0, // Remove left margin
    marginRight: 0, // Remove right margin
  },
  nutritionChart: {
    borderRadius: 12,
    marginLeft: -10, // Negative margin to center better
    marginRight: 0,
  },
  chartPeriod: {
    ...TextVariants.caption,
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  nutritionLegend: {
    marginTop: 15,
    marginBottom: 5,
    paddingHorizontal: 10,
    width: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    ...Type.regular,
    fontSize: 12,
    color: '#333',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default AnalyticsDashboard;