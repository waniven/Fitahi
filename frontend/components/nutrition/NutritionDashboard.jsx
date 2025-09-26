import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../../constants/Colors';
import { Font, Type, TextVariants } from '../../constants/Font';
import CustomButton from '../common/CustomButton';
import CustomButtonThree from '../common/CustomButtonThree';
import NutritionDataCard from './NutritionDataCard';
import FloatingAIButton from '../../app/ai/FloatingAIButton';
import BottomNav from '../navbar/BottomNav';

// Local text styles using Font constants
const textStyles = {
  heading2: { fontSize: 24, ...Type.bold },
  heading3: { fontSize: 20, ...Type.bold },
  heading4: { fontSize: 18, ...Type.bold },
  welcomeText: { fontSize: 18, fontWeight: '600', ...Type.bold },
  bodyMedium: { fontSize: 16, ...Type.regular },
  bodySmall: { fontSize: 14, ...Type.regular },
};

/**
 * NutritionDashboard - Comprehensive nutrition tracking dashboard
 * Features donut chart visualization, macronutrient progress, and meal logging
 */
const NutritionDashboard = ({ entries, onDeleteEntry, onAddEntry, onBackPress, dailyGoals = { calories: 3000, protein: 200, carbs: 200, fat: 200 } }) => {
  /**
   * Aggregates nutritional values for current day
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
   * Filters entries to show only today's meals
   */
  const getTodaysEntries = () => {
    const today = new Date().toDateString();
    return entries.filter(entry => new Date(entry.timestamp).toDateString() === today);
  };

  /**
   * DonutChart - Renders interactive macronutrient distribution visualization
   * Shows protein, carbs, and fat as colored segments with center total
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
            <Text style={[textStyles.heading3, styles.emptyChartText]}>0</Text>
            <Text style={[textStyles.bodySmall, styles.emptyChartSubtext]}>grams</Text>
          </View>
        </View>
      );
    }

    // Calculate proportional angles for each macronutrient
    const proteinAngle = (nutrition.protein / total) * 360;
    const carbsAngle = (nutrition.carbs / total) * 360;
    const fatAngle = (nutrition.fat / total) * 360;

    /**
     * Generates SVG path data for donut chart segments
     */
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

    /**
     * Calculates optimal label positioning around donut chart
     */
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
          
          <Circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="#F5F5F5"
            stroke="#fff"
            strokeWidth="2"
          />
        </Svg>
        
        {/* Positioned labels for each macronutrient */}
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
                <Text style={styles.donutLabelText}>{segment.value} g</Text>
                <Text style={styles.donutLabelSubtext}>{segment.label}</Text>
              </View>
            );
          })}
        </View>
        
        {/* Center display showing total grams */}
        <View style={styles.donutCenter}>
          <Text style={[textStyles.bodyMedium, styles.donutCenterText]}>{total}</Text>
          <Text style={styles.donutCenterSubtext}>grams total</Text>
        </View>
      </View>
    );
  };

  const totalNutrition = calculateTotalNutrition();
  const todaysEntries = getTodaysEntries();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.dark.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.background} />
      
      <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
        {/* Header navigation with title */}
        <View style={styles.header}>
          <View style={styles.backButtonContainer}>
            <CustomButtonThree onPress={onBackPress} />
          </View>
          <Text style={[textStyles.welcomeText, styles.title, { color: Colors.dark.textPrimary }]}>
            Nutrition Log
          </Text>
        </View>

        {/* Fixed title section */}
        <Text style={[textStyles.heading4, styles.totalsSectionTitle]}>YOUR TOTALS FOR TODAY</Text>

        {/* Fixed nutrition overview section */}
        <View style={styles.nutritionOverviewContainer}>
          <View style={styles.pieChartSection}>
            <DonutChart nutrition={totalNutrition} size={140} />
          </View>

          {/* Individual macronutrient progress indicators */}
          <View style={styles.macroProgressSection}>
            <View style={styles.macroProgressItem}>
              <Text style={[textStyles.bodyMedium, styles.macroLabel]}>Protein</Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    styles.proteinProgress,
                    { width: `${Math.min((totalNutrition.protein / dailyGoals.protein) * 100, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={[textStyles.bodySmall, styles.macroText]}>
                {totalNutrition.protein} g / {dailyGoals.protein} g
              </Text>
            </View>

            <View style={styles.macroProgressItem}>
              <Text style={[textStyles.bodyMedium, styles.macroLabel]}>Fat</Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    styles.fatProgress,
                    { width: `${Math.min((totalNutrition.fat / dailyGoals.fat) * 100, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={[textStyles.bodySmall, styles.macroText]}>
                {totalNutrition.fat} g / {dailyGoals.fat} g
              </Text>
            </View>

            <View style={styles.macroProgressItem}>
              <Text style={[textStyles.bodyMedium, styles.macroLabel]}>Carbs</Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    styles.carbsProgress,
                    { width: `${Math.min((totalNutrition.carbs / dailyGoals.carbs) * 100, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={[textStyles.bodySmall, styles.macroText]}>
                {totalNutrition.carbs} g / {dailyGoals.carbs} g
              </Text>
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Total calories summary card */}
          <View style={styles.caloriesCard}>
            <View style={styles.caloriesContent}>
              <View style={styles.caloriesAmountRow}>
                <Text style={[textStyles.bodyMedium, styles.caloriesLabel]}>Calories</Text>
                <Text style={[textStyles.heading2, styles.caloriesAmount]}>
                  {totalNutrition.calories} kcal <Text style={[textStyles.bodyMedium, styles.caloriesGoal]}>/ {dailyGoals.calories}</Text>
                </Text>
              </View>
              
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

          {/* List of today's food entries */}
          <View style={styles.entriesSection}>
            <Text style={[textStyles.heading4, styles.entriesSectionTitle]}>TODAY'S ENTRIES</Text>
            
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
                  <Text style={[textStyles.heading3, styles.noEntriesText]}>
                    No food entries for today
                  </Text>
                  <Text style={[textStyles.bodyMedium, styles.noEntriesSubtext]}>
                    Tap the button below to log your first meal!
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Fixed position add meal button */}
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
    paddingHorizontal: 20 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    position: 'relative',
  },
  backButtonContainer: {
    position: 'absolute',
    left: 0,
    top: 40,
  },
  title: {
    textAlign: 'center',
  },
  totalsSectionTitle: {
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 1,
    paddingHorizontal: 20,
  },
  nutritionOverviewContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 20,
    paddingHorizontal: 20,
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
  emptyChartText: {
    color: '#FFFFFF',
  },
  emptyChartSubtext: {
    color: '#FFFFFF',
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
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    ...Type.bold,
  },
  donutLabelSubtext: {
    fontSize: 8,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    ...Type.regular,
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterText: {
    color: '#333',
  },
  donutCenterSubtext: {
    fontSize: 10,
    color: '#666',
    ...Type.regular,
  },
  macroProgressSection: {
    flex: 1,
    justifyContent: 'space-around',
  },
  macroProgressItem: {
    marginBottom: 15,
  },
  macroLabel: {
    color: '#FFFFFF',
    marginBottom: 5,
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
    color: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 140,
  },
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
    color: '#666',
  },
  caloriesAmount: {
    color: '#4F9AFF',
  },
  caloriesGoal: {
    color: '#666',
    fontWeight: 'normal',
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
  entriesSection: {
    flex: 1,
  },
  entriesSectionTitle: {
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 1,
  },
  entriesContainer: {
    gap: 0,
  },
  entryCard: {
    marginHorizontal: 0,
    marginVertical: 8,
  },
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
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  noEntriesSubtext: {
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
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