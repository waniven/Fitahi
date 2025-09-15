// components/analytics/AnalyticsDashboard.jsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  Dimensions
} from 'react-native';
import { LineChart, BarChart, StackedBarChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/Colors';
import { Font, Type, TextVariants } from '../../constants/Font';
import { sampleEntries } from '../../components/common/SampleData';
import CustomButtonThree from '../common/CustomButtonThree';
import FloatingAIButton from '../../app/ai/FloatingAIButton';
import BottomNav from '../navbar/BottomNav';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 80; // Increased padding for better fit

/**
 * AnalyticsDashboard - Enhanced dashboard with StackedBarChart nutrition visualization
 */
const AnalyticsDashboard = ({ onBackPress, onRefresh }) => {
  const theme = Colors["dark"];
  
  // Use sample data - you can replace this with props later if needed
  const data = sampleEntries;

  // Clean white chart configuration
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
    }
  };

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
        dailyMacros.push([proteinCals, carbsCals, fatCals]);
      }
    });

    return {
      labels: days,
      data: dailyMacros,
      barColors: ["#4ECDC4", "#FFB74D", "#5DADE2"] // Protein, Carbs, Fat
    };
  };

  // Biometrics - Line Chart
  const prepareBiometricsData = () => {
    const sortedEntries = [...data.biometricEntries].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    if (sortedEntries.length === 0) {
      return {
        labels: ['Start'],
        datasets: [{ data: [70] }]
      };
    }

    if (sortedEntries.length === 1) {
      return {
        labels: ['Day 1'],
        datasets: [{ data: [sortedEntries[0].weight] }]
      };
    }

    const labels = sortedEntries.map((_, index) => {
      if (index === 0) return 'Start';
      if (index === sortedEntries.length - 1) return 'Latest';
      return `Day ${index + 1}`;
    });
    
    const weights = sortedEntries.map(entry => entry.weight);
    
    return {
      labels: labels,
      datasets: [{ data: weights }]
    };
  };

  const waterData = prepareWaterData();
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
          {/* Water Chart */}
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
                  barPercentage: 0.7,
                }}
                style={styles.chart}
                showValuesOnTopOfBars={false}
                fromZero={true}
                segments={4}
              />
              <Text style={styles.chartPeriod}>This Week</Text>
            </View>
          </View>

          {/* Nutrition Chart - Stacked Bar Chart */}
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
                height={300} // Increased height for better proportions
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                  fillShadowGradient: '#ffffff',
                  fillShadowGradientOpacity: 0.1,
                  barPercentage: 0.6, // Reduce bar width for better spacing
                  style: {
                    borderRadius: 16,
                    paddingRight: 20, // Add right padding
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '3,3',
                    stroke: 'rgba(0, 0, 0, 0.1)',
                    strokeWidth: 1
                  },
                  propsForLabels: {
                    fontSize: 10, // Slightly smaller labels
                    fontFamily: Font.regular
                  },
                  formatYLabel: (value) => Math.round(value).toString(),
                }}
                style={styles.nutritionChart}
                segments={6}
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

          {/* Biometrics Chart */}
          <View style={styles.chartSection}>
            <View style={styles.chartTitleContainer}>
              <Text style={[styles.chartTitle, { color: "#FFFFFF" }]}>
                WEIGHT PROGRESS
              </Text>
              <Text style={[styles.chartSubtitle, { color: "#CCCCCC" }]}>
                Track your journey
              </Text>
            </View>
            
            <View style={styles.chartContainer}>
              <LineChart
                data={biometricsData}
                width={chartWidth}
                height={180}
                chartConfig={{
                  ...whiteChartConfig,
                  color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
                }}
                style={styles.chart}
                bezier
                withDots={true}
                withInnerLines={false}
                withOuterLines={false}
                segments={3}
              />
              <Text style={styles.chartPeriod}>Progress Timeline</Text>
            </View>
          </View>

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
    padding: 15,
    marginHorizontal: 40, // Increased margin for better spacing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    width: screenWidth - 80, // Match the chartWidth
  },
  nutritionChartContainer: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20, // Increased padding
    marginHorizontal: 40, // Increased margin for better spacing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    width: screenWidth - 80, // Match the chartWidth
  },
  chart: {
    borderRadius: 12,
  },
  nutritionChart: {
    borderRadius: 12,
    marginLeft: 5, // Small left margin for better alignment
    marginRight: 5, // Small right margin for better alignment
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
    paddingHorizontal: 10, // Add horizontal padding
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%', // Use full width
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