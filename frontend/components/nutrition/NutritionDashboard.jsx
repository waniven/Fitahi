// components/nutrition/NutritionDashboard.jsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../../constants/Colors';
import CustomButton from '../common/CustomButton';
import CustomButtonThree from '../common/CustomButtonThree';
import NutritionDataCard from './NutritionDataCard';
import FloatingAIButton from '../../app/ai/FloatingAIButton';
import globalStyles from '../../styles/globalStyles';

/**
 * NutritionDashboard - Main dashboard view for nutrition data
 * Shows header with back button, donut chart, macronutrient progress bars, calories summary, and today's entries
 */
const NutritionDashboard = ({ entries, onDeleteEntry, onAddEntry, onBackPress, dailyGoals = { calories: 3000, protein: 200, carbs: 200, fat: 200 } }) => {
  const router = useRouter();
  const theme = Colors["dark"];

  /**
   * Calculate total nutrition consumed today
   */
  const calculateTotalNutrition = () => {
    const today = new Date().toDateString();
    const todaysEntries = entries.filter(entry => new Date(entry.timestamp).toDateString() === today);
    
    return todaysEntries.reduce((totals, entry) => ({
      calories: totals.calories + entry.calories,
      protein: totals.protein + entry.protein,
      carbs: totals.carbs + entry.carbs,
      fat: totals.fat + entry.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  /**
   * Get today's entries only
   */
  const getTodaysEntries = () => {
    const today = new Date().toDateString();
    return entries.filter(entry => new Date(entry.timestamp).toDateString() === today);
  };

  /**
   * Donut Chart Component with outer ring for macros and inner circle for total
   */
  const DonutChart = ({ nutrition, size = 140 }) => {
    const total = nutrition.protein + nutrition.carbs + nutrition.fat;
    const center = size / 2;
    const outerRadius = size / 2 - 10;
    const innerRadius = size / 2 - 35;
    
    if (total === 0) {
      return (
        <View style={[styles.pieChartContainer, { width: size, height: size }]}>
          <View style={styles.emptyPieChart}>
            <Text style={styles.pieChartCenterText}>0</Text>
            <Text style={styles.pieChartCenterSubtext}>kcal</Text>
          </View>
        </View>
      );
    }

    // Calculate angles for each segment
    const proteinAngle = (nutrition.protein / total) * 360;
    const carbsAngle = (nutrition.carbs / total) * 360;
    const fatAngle = (nutrition.fat / total) * 360;

    // Helper function to create SVG path for donut segments
    const createDonutPath = (startAngle, endAngle, outerR, innerR) => {
      const startAngleRad = (startAngle - 90) * (Math.PI / 180);
      const endAngleRad = (endAngle - 90) * (Math.PI / 180);
      
      const x1 = center + outerR * Math.cos(startAngleRad);
      const y1 = center + outerR * Math.sin(startAngleRad);
      const x2 = center + outerR * Math.cos(endAngleRad);
      const y2 = center + outerR * Math.sin(endAngleRad);
      
      const x3 = center + innerR * Math.cos(endAngleRad);
      const y3 = center + innerR * Math.sin(endAngleRad);
      const x4 = center + innerR * Math.cos(startAngleRad);
      const y4 = center + innerR * Math.sin(startAngleRad);
      
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      
      return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
    };

    // Calculate label positions
    const getLabelPosition = (startAngle, endAngle, radius) => {
      const midAngle = (startAngle + endAngle) / 2;
      const midAngleRad = (midAngle - 90) * (Math.PI / 180);
      return {
        x: center + radius * Math.cos(midAngleRad),
        y: center + radius * Math.sin(midAngleRad)
      };
    };

    const labelRadius = (outerRadius + innerRadius) / 2;
    let currentAngle = 0;

    const segments = [
      { value: nutrition.protein, color: '#4ECDC4', label: 'Protein', angle: proteinAngle },
      { value: nutrition.carbs, color: '#FFA726', label: 'Carbs', angle: carbsAngle },
      { value: nutrition.fat, color: '#45B7D1', label: 'Fat', angle: fatAngle }
    ].filter(segment => segment.value > 0);

    return (
      <View style={[styles.pieChartContainer, { width: size, height: size }]}>
        <Svg height={size} width={size}>
          {segments.map((segment, index) => {
            const startAngle = currentAngle;
            const endAngle = currentAngle + segment.angle;
            const path = createDonutPath(startAngle, endAngle, outerRadius, innerRadius);
            const labelPos = getLabelPosition(startAngle, endAngle, labelRadius);
            
            currentAngle += segment.angle;
            
            return (
              <React.Fragment key={index}>
                <Path
                  d={path}
                  fill={segment.color}
                  stroke="#fff"
                  strokeWidth="2"
                />
              </React.Fragment>
            );
          })}
          
          {/* Inner circle background */}
          <Circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="#F5F5F5"
            stroke="#fff"
            strokeWidth="2"
          />
        </Svg>
        
        {/* Labels positioned around the donut */}
        <View style={styles.donutLabelsContainer}>
          {segments.map((segment, index) => {
            let currentAngleForLabel = 0;
            for (let i = 0; i < index; i++) {
              currentAngleForLabel += segments[i].angle;
            }
            const startAngle = currentAngleForLabel;
            const endAngle = currentAngleForLabel + segment.angle;
            const labelPos = getLabelPosition(startAngle, endAngle, outerRadius + 15);
            
            return (
              <View
                key={index}
                style={[
                  styles.donutLabel,
                  {
                    left: labelPos.x - 25,
                    top: labelPos.y - 10,
                  }
                ]}
              >
                <Text style={styles.donutLabelText}>{segment.value} kcal</Text>
                <Text style={styles.donutLabelSubtext}>{segment.label}</Text>
              </View>
            );
          })}
        </View>
        
        {/* Center text showing total */}
        <View style={styles.donutCenter}>
          <Text style={styles.donutCenterText}>{total}</Text>
          <Text style={styles.donutCenterSubtext}>kcal total</Text>
        </View>
      </View>
    );
  };

  const totalNutrition = calculateTotalNutrition();
  const todaysEntries = getTodaysEntries();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.dark.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.background} />
      
      <View style={[globalStyles.container, { backgroundColor: Colors.dark.background }]}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.backButtonContainer}>
            <CustomButtonThree onPress={onBackPress} />
          </View>
          <Text style={[styles.title, globalStyles.welcomeText, { color: Colors.dark.textPrimary }]}>
            Nutrition Log
          </Text>
        </View>

        {/* Your Totals Title */}
        <Text style={styles.totalsSectionTitle}>YOUR TOTALS FOR TODAY</Text>

        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Donut Chart and Macronutrient Progress Section */}
          <View style={styles.nutritionOverviewContainer}>
            {/* Donut Chart */}
            <View style={styles.pieChartSection}>
              <DonutChart nutrition={totalNutrition} size={140} />
            </View>

            {/* Macronutrient Progress Bars */}
            <View style={styles.macroProgressSection}>
              {/* Protein */}
              <View style={styles.macroProgressItem}>
                <Text style={styles.macroLabel}>Protein</Text>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      styles.proteinProgress,
                      { width: `${Math.min((totalNutrition.protein / dailyGoals.protein) * 100, 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.macroText}>
                  {totalNutrition.protein} kcal / {dailyGoals.protein} kcal
                </Text>
              </View>

              {/* Fat */}
              <View style={styles.macroProgressItem}>
                <Text style={styles.macroLabel}>Fat</Text>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      styles.fatProgress,
                      { width: `${Math.min((totalNutrition.fat / dailyGoals.fat) * 100, 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.macroText}>
                  {totalNutrition.fat} kcal / {dailyGoals.fat} kcal
                </Text>
              </View>

              {/* Carbs */}
              <View style={styles.macroProgressItem}>
                <Text style={styles.macroLabel}>Carbs</Text>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      styles.carbsProgress,
                      { width: `${Math.min((totalNutrition.carbs / dailyGoals.carbs) * 100, 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.macroText}>
                  {totalNutrition.carbs} kcal / {dailyGoals.carbs} kcal
                </Text>
              </View>
            </View>
          </View>

          {/* Calories Summary Card - Matching Water Dashboard */}
          <View style={styles.caloriesCard}>
            <View style={styles.caloriesContent}>
              <View style={styles.caloriesAmountRow}>
                <Text style={styles.caloriesLabel}>Calories</Text>
                <Text style={styles.caloriesAmount}>
                  {totalNutrition.calories} kcal <Text style={styles.caloriesGoal}>/ {dailyGoals.calories}</Text>
                </Text>
              </View>
              
              {/* Calories Progress Bar */}
              <View style={styles.caloriesProgressContainer}>
                <View 
                  style={[
                    styles.caloriesProgressBar,
                    { width: `${Math.min((totalNutrition.calories / dailyGoals.calories) * 100, 100)}%` }
                  ]} 
                />
                <View style={styles.caloriesProgressBackground} />
              </View>
            </View>
          </View>

          {/* Today's Entries Section */}
          <View style={styles.entriesSection}>
            <Text style={styles.entriesSectionTitle}>TODAY'S ENTRIES</Text>
            
            <View style={styles.entriesContainer}>
              {todaysEntries.length > 0 ? (
                todaysEntries.map((entry) => (
                  <NutritionDataCard
                    key={entry.id}
                    entry={entry}
                    onDelete={onDeleteEntry}
                    showDeleteButton={true}
                    style={styles.entryCard}
                  />
                ))
              ) : (
                <View style={styles.noEntriesContainer}>
                  <Text style={styles.noEntriesText}>
                    No food entries for today
                  </Text>
                  <Text style={styles.noEntriesSubtext}>
                    Tap the button below to log your first meal!
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Floating Add New Entry Button */}
        <View style={styles.floatingButtonContainer}>
          <CustomButton
            title="Log New Food Entry"
            onPress={onAddEntry}
            variant="primary"
            size="large"
            style={styles.floatingButton}
          />
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={[globalStyles.bottomNav, { backgroundColor: "#fff" }]}>
        <TouchableOpacity style={globalStyles.navItem} onPress={() => router.push("/home/index")}>
          <Ionicons name="home-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.navItem} onPress={() => router.push("/main/analytics")}>
          <Ionicons name="stats-chart-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.navItem} onPress={() => router.push("/main/supplements")}>
          <Ionicons name="medkit-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>Supplements</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.navItem} onPress={() => router.push("/profile/AccountSettings")}>
          <Ionicons name="settings-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Floating AI Button */}
      <FloatingAIButton />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    position: 'relative',
  },

  backButtonContainer: {
    position: 'absolute',
    left: 0,
    top: 20,
  },

  title: {
    fontSize: 20,
    textAlign: 'center',
  },

  totalsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 1,
    paddingHorizontal: 20,
  },

  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  scrollContent: {
    paddingBottom: 140,
  },

  // Nutrition Overview Section
  nutritionOverviewContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 20,
  },

  pieChartSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pieChartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyPieChart: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  donutLabelsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  donutLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 55,
    height: 20,
  },

  donutLabelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  donutLabelSubtext: {
    fontSize: 8,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  donutCenterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
  },

  donutCenterSubtext: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },

  pieChartCenterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_700Bold',
  },

  pieChartCenterSubtext: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_400Regular',
  },

  macroProgressSection: {
    flex: 1,
    justifyContent: 'space-around',
  },

  macroProgressItem: {
    marginBottom: 15,
  },

  macroLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    fontFamily: 'Montserrat_700Bold',
  },

  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 5,
  },

  progressBar: {
    height: '100%',
    borderRadius: 4,
  },

  proteinProgress: {
    backgroundColor: '#4ECDC4',
  },

  fatProgress: {
    backgroundColor: '#45B7D1',
  },

  carbsProgress: {
    backgroundColor: '#FFA726',
  },

  macroText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_400Regular',
  },

  // Calories Card Styles - Matching Water Dashboard
  caloriesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    width: '110%',
    maxWidth: 350,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  caloriesContent: {
    alignItems: 'stretch',
  },

  caloriesAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },

  caloriesLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },

  caloriesAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
    fontFamily: 'Montserrat_700Bold',
  },

  caloriesGoal: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'normal',
    fontFamily: 'Montserrat_400Regular',
  },

  caloriesProgressContainer: {
    height: 12,
    backgroundColor: '#E5E5E5',
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },

  caloriesProgressBar: {
    height: '100%',
    backgroundColor: '#FF5A5A',
    borderRadius: 6,
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },

  caloriesProgressBackground: {
    height: '100%',
    width: '100%',
    backgroundColor: '#E5E5E5',
    borderRadius: 6,
  },

  // Entries Section Styles
  entriesSection: {
    flex: 1,
  },

  entriesSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 1,
  },

  entriesContainer: {
    gap: 0,
  },

  entryCard: {
    marginHorizontal: 0,
    marginVertical: 8,
  },

  // No Entries Styles
  noEntriesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  noEntriesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
  },

  noEntriesSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 20,
  },

  // Floating Button Styles
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    zIndex: 1000,
  },

  floatingButton: {
    width: '100%',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
});

export default NutritionDashboard;