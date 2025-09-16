// components/biometrics/BiometricsDashboard.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, StatusBar } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../../constants/Colors';
import { Font, Type, TextVariants } from '../../constants/Font';
import CustomButton from '../common/CustomButton';
import CustomButtonThree from '../common/CustomButtonThree';
import BiometricDataCard from '../biometrics/BiometricDataCard';
import FloatingAIButton from '../../app/ai/FloatingAIButton';
import BottomNav from '../navbar/BottomNav';

// Local text styles using Font constants
const textStyles = {
  heading1: { fontSize: 28, ...Type.bold },
  heading2: { fontSize: 24, ...Type.bold },
  heading3: { fontSize: 20, ...Type.bold },
  welcomeText: { fontSize: 18, fontWeight: '600', ...Type.bold },
  bodyMedium: { fontSize: 16, ...Type.regular },
  bodySmall: { fontSize: 14, ...Type.regular },
  captionSmall: { fontSize: 10, ...Type.regular },
};

/**
 * BiometricsDashboard - Body metrics tracking with interactive chart visualization
 * Displays BMI calculations, weight/height comparisons, and trend analysis
 */
const BiometricsDashboard = ({ entries, onDeleteEntry, onAddEntry, onBackPress }) => {
  const [activeView, setActiveView] = useState('entries');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);

  const latestEntry = entries[0];
  const previousEntry = entries[1];

  /**
   * Computes BMI from weight and height measurements
   */
  const calculateBMI = (weightKg, heightCm) => {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
  };

  const currentBMI = calculateBMI(latestEntry.weight, latestEntry.height);

  /**
   * Formats timestamp for popup display with readable date and time
   */
  const formatPopupTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${day} ${month}, ${hours}:${minutes}${ampm}`;
  };

  /**
   * Handles chart data point interaction for detailed view
   */
  const handleDataPointClick = (entry, index) => {
    console.log('Data point clicked:', entry, 'at index:', index);
    setSelectedDataPoint({ entry });
    setShowPopup(true);
  };

  /**
   * DataPointPopup - Modal overlay showing detailed entry information
   */
  const DataPointPopup = () => {
    if (!selectedDataPoint) return null;

    const { entry } = selectedDataPoint;

    return (
      <Modal
        transparent
        visible={showPopup}
        onRequestClose={() => setShowPopup(false)}
        animationType="fade"
        statusBarTranslucent={true}
        hardwareAccelerated={true}
      >
        <TouchableOpacity 
          style={styles.popupOverlay} 
          activeOpacity={1}
          onPress={() => setShowPopup(false)}
          accessible={false}
        >
          <TouchableOpacity 
            style={styles.popupContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[textStyles.bodyMedium, styles.popupTitle]}>DATE & TIME LOGGED</Text>
            <Text style={[textStyles.heading2, styles.popupDate]}>
              {formatPopupTimestamp(entry.timestamp)}
            </Text>
            <Text style={[textStyles.heading3, styles.popupData]}>Height = {entry.height} cm</Text>
            <Text style={[textStyles.heading3, styles.popupData]}>Weight = {entry.weight} kg</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  /**
   * PerfectChart - Renders weight progression line chart with interactive points
   */
  const PerfectChart = ({ chartData, chartWidth, chartHeight }) => {
    const padding = { top: 25, right: 30, bottom: 50, left: 65 };
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;

    // Calculate optimal scale ranges for weight data
    const weights = chartData.map(d => d.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const weightRange = maxWeight - minWeight;
    const yPadding = Math.max(weightRange * 0.15, 3);
    const yMin = Math.max(Math.floor(minWeight - yPadding), 0);
    const yMax = Math.ceil(maxWeight + yPadding);
    const yRange = yMax - yMin;

    // Scale functions for coordinate mapping
    const xScale = (index) => padding.left + (index / (chartData.length - 1)) * innerWidth;
    const yScale = (weight) => padding.top + ((yMax - weight) / yRange) * innerHeight;

    // Generate SVG path data for line chart
    const pathData = chartData.map((point, index) => {
      const x = xScale(index);
      const y = yScale(point.weight);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');

    /**
     * Generates optimal Y-axis tick marks based on data range
     */
    const generatePerfectYTicks = () => {
      const range = yMax - yMin;
      let step;
      if (range <= 10) step = 2;
      else if (range <= 20) step = 5;
      else if (range <= 50) step = 10;
      else step = 20;

      const niceMin = Math.floor(yMin / step) * step;
      const niceMax = Math.ceil(yMax / step) * step;

      const ticks = [];
      for (let value = niceMin; value <= niceMax; value += step) {
        ticks.push({ 
          value: Math.round(value),
          y: yScale(value) 
        });
      }
      return ticks;
    };

    const yTicks = generatePerfectYTicks();

    // Calculate interactive data point positions
    const dataPoints = chartData.map((point, index) => ({
      x: xScale(index),
      y: yScale(point.weight),
      entry: point.entry,
      index
    }));

    return (
      <View style={styles.perfectChartContainer}>
        <Text style={[textStyles.heading2, styles.chartTitle]}>Weight Progression</Text>
        
        <View style={styles.centeredChartArea}>
          <Svg width={chartWidth} height={chartHeight}>
            <Defs>
              <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={Colors.light.primary} stopOpacity="0.9" />
                <Stop offset="100%" stopColor={Colors.light.primary} stopOpacity="1" />
              </LinearGradient>
            </Defs>

            {/* Grid lines for chart background */}
            {yTicks.map((tick, index) => (
              <Line
                key={`grid-${index}`}
                x1={padding.left}
                y1={tick.y}
                x2={chartWidth - padding.right}
                y2={tick.y}
                stroke="#f0f0f0"
                strokeWidth="1"
                strokeDasharray="2,3"
              />
            ))}

            {/* Vertical reference lines */}
            {chartData.map((_, index) => (
              <Line
                key={`vgrid-${index}`}
                x1={xScale(index)}
                y1={padding.top}
                x2={xScale(index)}
                y2={chartHeight - padding.bottom}
                stroke="#f8f8f8"
                strokeWidth="1"
                strokeDasharray="1,2"
              />
            ))}

            {/* Chart axes */}
            <Line
              x1={padding.left}
              y1={yScale(yTicks[yTicks.length - 1].value)}
              x2={padding.left}
              y2={yScale(yTicks[0].value)}
              stroke="#d0d0d0"
              strokeWidth="2"
            />

            <Line
              x1={padding.left}
              y1={chartHeight - padding.bottom}
              x2={chartWidth - padding.right}
              y2={chartHeight - padding.bottom}
              stroke="#d0d0d0"
              strokeWidth="2"
            />

            {/* Weight progression line */}
            <Path
              d={pathData}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive data points */}
            {dataPoints.map((point, index) => (
              <Circle
                key={`point-${index}`}
                cx={point.x}
                cy={point.y}
                r="8"
                fill="#ffffff"
                stroke={Colors.light.primary}
                strokeWidth="4"
              />
            ))}

            {/* Y-axis weight labels */}
            {yTicks.map((tick, index) => (
              <SvgText
                key={`ylabel-${index}`}
                x={padding.left - 15}
                y={tick.y + 4}
                fontSize="11"
                fill="#666"
                textAnchor="end"
                fontWeight="500"
              >
                {`${tick.value}kg`}
              </SvgText>
            ))}

            {/* X-axis date labels */}
            {chartData.map((point, index) => (
              <SvgText
                key={`xlabel-${index}`}
                x={xScale(index)}
                y={chartHeight - padding.bottom + 20}
                fontSize="10"
                fill="#666"
                textAnchor="middle"
                fontWeight="500"
              >
                {point.label}
              </SvgText>
            ))}
          </Svg>

          {/* Touch overlay for data point interaction */}
          <View style={styles.touchOverlay}>
            {dataPoints.map((point, index) => (
              <TouchableOpacity
                key={`touch-${index}`}
                style={[
                  styles.touchArea,
                  {
                    left: point.x - 20,
                    top: point.y - 20,
                  }
                ]}
                onPress={() => handleDataPointClick(point.entry, index)}
                activeOpacity={0.3}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              />
            ))}
          </View>
        </View>

        {/* Chart legend */}
        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <Text style={[textStyles.bodySmall, styles.legendText]}>Weight progression over time (tap dots for details)</Text>
        </View>

        {/* Statistical summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[textStyles.captionSmall, styles.statLabel]}>Entries</Text>
            <Text style={[textStyles.bodySmall, styles.statValue]}>{chartData.length}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[textStyles.captionSmall, styles.statLabel]}>Min Weight</Text>
            <Text style={[textStyles.bodySmall, styles.statValue]}>{minWeight} kg</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[textStyles.captionSmall, styles.statLabel]}>Max Weight</Text>
            <Text style={[textStyles.bodySmall, styles.statValue]}>{maxWeight} kg</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[textStyles.captionSmall, styles.statLabel]}>Trend</Text>
            <Text style={[textStyles.bodySmall, styles.statValue, { 
              color: weights[weights.length - 1] > weights[0] ? '#EF5350' : '#66BB6A' 
            }]}>
              {weights[weights.length - 1] > weights[0] ? '↗' : '↘'}
            </Text>
          </View>
        </View>

        {/* Latest entry summary */}
        <View style={styles.latestEntryInfo}>
          <Text style={[textStyles.bodyMedium, styles.latestEntryTitle]}>Latest Entry</Text>
          <Text style={[textStyles.bodySmall, styles.latestEntryText]}>
            Weight: {latestEntry.weight} kg | Height: {latestEntry.height} cm
          </Text>
          <Text style={[textStyles.bodySmall, styles.latestEntryText]}>
            BMI: {currentBMI} | Date: {new Date(latestEntry.timestamp).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  /**
   * Renders chart view or empty state message
   */
  const renderChart = () => {
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 40;
    const chartHeight = 300;
    
    if (entries.length < 2) {
      return (
        <View style={styles.perfectChartContainer}>
          <Text style={[textStyles.heading2, styles.chartTitle]}>Weight Progression</Text>
          <View style={styles.noDataContainer}>
            <Text style={[textStyles.bodyMedium, styles.noDataText]}>
              {entries.length === 0 
                ? "No data available for chart" 
                : "Add more entries to see chart progression"}
            </Text>
          </View>
        </View>
      );
    }

    const chartEntries = entries.slice(0, 8).reverse();
    const chartData = chartEntries.map((entry, index) => {
      const date = new Date(entry.timestamp);
      return {
        weight: entry.weight,
        label: `${date.getDate()}/${date.getMonth() + 1}`,
        entry: entry
      };
    });

    return <PerfectChart chartData={chartData} chartWidth={chartWidth} chartHeight={chartHeight} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.background} />
      
      {/* Header navigation with title */}
      <View style={styles.header}>
        <View style={styles.backButtonContainer}>
          <CustomButtonThree onPress={onBackPress} />
        </View>
        <Text style={[textStyles.welcomeText, styles.title, { color: Colors.dark.textPrimary }]}>
          Biometrics Log
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* BMI calculation display */}
        <View style={styles.bmiCard}>
          <Text style={[textStyles.heading3, styles.bmiLabel]}>BMI</Text>
          <Text style={[textStyles.heading1, styles.bmiValue]}>
            {currentBMI} kg/m²
          </Text>
        </View>

        {/* Current vs previous measurements comparison */}
        <View style={styles.comparisonContainer}>
          <View style={styles.comparisonCard}>
            <Text style={[textStyles.bodyMedium, styles.cardTitle]}>Weight (kg)</Text>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonCol}>
                <Text style={[textStyles.bodySmall, styles.comparisonLabel]}>Current</Text>
                <Text style={[textStyles.heading2, styles.comparisonValue]}>{latestEntry.weight}</Text>
              </View>
              <View style={styles.comparisonCol}>
                <Text style={[textStyles.bodySmall, styles.comparisonLabel]}>Previous</Text>
                <Text style={[textStyles.heading2, styles.comparisonValue]}>
                  {previousEntry ? previousEntry.weight : '--'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.comparisonCard}>
            <Text style={[textStyles.bodyMedium, styles.cardTitle]}>Height (cm)</Text>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonCol}>
                <Text style={[textStyles.bodySmall, styles.comparisonLabel]}>Current</Text>
                <Text style={[textStyles.heading2, styles.comparisonValue]}>{latestEntry.height}</Text>
              </View>
              <View style={styles.comparisonCol}>
                <Text style={[textStyles.bodySmall, styles.comparisonLabel]}>Previous</Text>
                <Text style={[textStyles.heading2, styles.comparisonValue]}>
                  {previousEntry ? previousEntry.height : '--'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* View toggle between chart and entries list */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              styles.toggleButtonLeft,
              activeView === 'chart' && styles.toggleButtonActive
            ]}
            onPress={() => setActiveView('chart')}
          >
            <Text style={[
              textStyles.bodyMedium,
              styles.toggleButtonText,
              activeView === 'chart' && styles.toggleButtonTextActive
            ]}>
              Chart
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              styles.toggleButtonRight,
              activeView === 'entries' && styles.toggleButtonActive
            ]}
            onPress={() => setActiveView('entries')}
          >
            <Text style={[
              textStyles.bodyMedium,
              styles.toggleButtonText,
              activeView === 'entries' && styles.toggleButtonTextActive
            ]}>
              Previous Entries
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic content area showing either entries or chart */}
        <View style={styles.contentArea}>
          {activeView === 'entries' ? (
            <View style={styles.entriesContainer}>
              {entries.map((entry) => (
                <BiometricDataCard
                  key={entry.id}
                  entry={entry}
                  age={25}
                  onDelete={onDeleteEntry}
                  showDeleteButton={true}
                  style={styles.entryCard}
                />
              ))}
            </View>
          ) : (
            renderChart()
          )}
        </View>
      </ScrollView>

      {/* Fixed position add entry button */}
      <View style={styles.floatingButtonContainer}>
        <CustomButton
          title="Add New Entry"
          onPress={onAddEntry}
          variant="primary"
          size="large"
          style={styles.floatingButton}
        />
      </View>

      <DataPointPopup />
      <BottomNav />
      <FloatingAIButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
    backgroundColor: Colors.dark.background,
  },
  backButtonContainer: {
    position: 'absolute',
    left: 20,
    top: 50,
  },
  title: {
    textAlign: 'center',
  },
  bmiCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  bmiLabel: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bmiValue: {
    color: '#FFFFFF',
  },
  comparisonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  comparisonCard: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    padding: 20,
  },
  cardTitle: {
    color: '#FFFFFF',
    marginBottom: 16,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  comparisonCol: {
    flex: 1,
  },
  comparisonLabel: {
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  comparisonValue: {
    color: '#FFFFFF',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonLeft: {
    marginRight: 2,
  },
  toggleButtonRight: {
    marginLeft: 2,
  },
  toggleButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  toggleButtonText: {
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  contentArea: {
    flex: 1,
    marginBottom: 20,
  },
  entriesContainer: {
    gap: 0,
  },
  entryCard: {
    marginHorizontal: 0,
  },
  perfectChartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  chartTitle: {
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  centeredChartArea: {
    position: 'relative',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  touchArea: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    marginRight: 8,
  },
  legendText: {
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    color: '#333',
  },
  latestEntryInfo: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  latestEntryTitle: {
    color: '#333',
    marginBottom: 6,
  },
  latestEntryText: {
    color: '#666',
    marginBottom: 2,
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  noDataText: {
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 115,
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
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    padding: 24,
    width: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  popupTitle: {
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  popupDate: {
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  popupData: {
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default BiometricsDashboard;