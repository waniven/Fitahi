// components/biometrics/BiometricsDashboard.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import CustomButton from '../common/CustomButton';
import BiometricDataCard from '../biometrics/BiometricDataCard';
import FloatingAIButton from '../../app/ai/FloatingAIButton';
import globalStyles from '../../styles/globalStyles';

/**
 * BiometricsDashboard 
 */
const BiometricsDashboard = ({ entries, onDeleteEntry, onAddEntry }) => {
  const [activeView, setActiveView] = useState('entries'); // 'entries' or 'chart'
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);

  const router = useRouter();
  const theme = Colors["dark"];

  // Get latest and previous entries for comparison
  const latestEntry = entries[0];
  const previousEntry = entries[1];

  /**
   * Calculate BMI from height and weight
   */
  const calculateBMI = (weightKg, heightCm) => {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
  };

  // Calculate current BMI
  const currentBMI = calculateBMI(latestEntry.weight, latestEntry.height);

  /**
   * Format timestamp for popup display
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
   * Handle data point click
   */
  const handleDataPointClick = (entry, index) => {
    console.log('Data point clicked:', entry, 'at index:', index);
    setSelectedDataPoint({ entry });
    setShowPopup(true);
  };

  /**
   * Data Point Popup Component
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
            <Text style={styles.popupTitle}>DATE & TIME LOGGED</Text>
            <Text style={styles.popupDate}>
              {formatPopupTimestamp(entry.timestamp)}
            </Text>
            <Text style={styles.popupData}>Height = {entry.height} cm</Text>
            <Text style={styles.popupData}>Weight = {entry.weight} kg</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  /**
   * Perfect Chart Component with fixed centering and layout
   */
  const PerfectChart = ({ chartData, chartWidth, chartHeight }) => {
    const padding = { top: 25, right: 30, bottom: 50, left: 65 }; // Increased bottom for X-axis labels
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;

    // Calculate scales
    const weights = chartData.map(d => d.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const weightRange = maxWeight - minWeight;
    const yPadding = Math.max(weightRange * 0.15, 3);
    const yMin = Math.max(Math.floor(minWeight - yPadding), 0);
    const yMax = Math.ceil(maxWeight + yPadding);
    const yRange = yMax - yMin;

    // Scale functions
    const xScale = (index) => padding.left + (index / (chartData.length - 1)) * innerWidth;
    const yScale = (weight) => padding.top + ((yMax - weight) / yRange) * innerHeight;

    // Generate path data
    const pathData = chartData.map((point, index) => {
      const x = xScale(index);
      const y = yScale(point.weight);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');

    // Generate perfect Y-axis ticks
    const generatePerfectYTicks = () => {
      const range = yMax - yMin;
      let step;
      if (range <= 10) step = 2;
      else if (range <= 20) step = 5;
      else if (range <= 50) step = 10;
      else step = 20;

      // Calculate nice min and max that cover the full range
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

    // Calculate data point positions
    const dataPoints = chartData.map((point, index) => ({
      x: xScale(index),
      y: yScale(point.weight),
      entry: point.entry,
      index
    }));

    return (
      <View style={styles.perfectChartContainer}>
        <Text style={styles.chartTitle}>Weight Progression</Text>
        
        {/* Centered Chart Area */}
        <View style={styles.centeredChartArea}>
          <Svg width={chartWidth} height={chartHeight}>
            <Defs>
              <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={Colors.light.primary} stopOpacity="0.9" />
                <Stop offset="100%" stopColor={Colors.light.primary} stopOpacity="1" />
              </LinearGradient>
            </Defs>

            {/* Grid lines covering full range */}
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

            {/* Vertical grid lines */}
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

            {/* Y-axis extending to full range */}
            <Line
              x1={padding.left}
              y1={yScale(yTicks[yTicks.length - 1].value)} // Top of range
              x2={padding.left}
              y2={yScale(yTicks[0].value)} // Bottom of range
              stroke="#d0d0d0"
              strokeWidth="2"
            />

            {/* X-axis */}
            <Line
              x1={padding.left}
              y1={chartHeight - padding.bottom}
              x2={chartWidth - padding.right}
              y2={chartHeight - padding.bottom}
              stroke="#d0d0d0"
              strokeWidth="2"
            />

            {/* Main line */}
            <Path
              d={pathData}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
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

            {/* Y-axis labels */}
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

            {/* X-axis labels - properly positioned to avoid clipping */}
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

          {/* Touch overlay */}
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

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Weight progression over time (tap dots for details)</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Entries</Text>
            <Text style={styles.statValue}>{chartData.length}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Min Weight</Text>
            <Text style={styles.statValue}>{minWeight} kg</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Max Weight</Text>
            <Text style={styles.statValue}>{maxWeight} kg</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Trend</Text>
            <Text style={[styles.statValue, { 
              color: weights[weights.length - 1] > weights[0] ? '#EF5350' : '#66BB6A' 
            }]}>
              {weights[weights.length - 1] > weights[0] ? '↗' : '↘'}
            </Text>
          </View>
        </View>

        {/* Latest Entry Info */}
        <View style={styles.latestEntryInfo}>
          <Text style={styles.latestEntryTitle}>Latest Entry</Text>
          <Text style={styles.latestEntryText}>
            Weight: {latestEntry.weight} kg | Height: {latestEntry.height} cm
          </Text>
          <Text style={styles.latestEntryText}>
            BMI: {currentBMI} | Date: {new Date(latestEntry.timestamp).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  /**
   * Render Weight Chart
   */
  const renderChart = () => {
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 40;
    const chartHeight = 300; // Increased height for better proportions
    
    if (entries.length < 2) {
      return (
        <View style={styles.perfectChartContainer}>
          <Text style={styles.chartTitle}>Weight Progression</Text>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
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
    <>
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* BMI Card */}
          <View style={styles.bmiCard}>
            <Text style={styles.bmiLabel}>BMI</Text>
            <Text style={styles.bmiValue}>
              {currentBMI} kg/m²
            </Text>
          </View>

          {/* Weight and Height Comparison Cards */}
          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonCard}>
              <Text style={styles.cardTitle}>Weight (kg)</Text>
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonCol}>
                  <Text style={styles.comparisonLabel}>Current</Text>
                  <Text style={styles.comparisonValue}>{latestEntry.weight}</Text>
                </View>
                <View style={styles.comparisonCol}>
                  <Text style={styles.comparisonLabel}>Previous</Text>
                  <Text style={styles.comparisonValue}>
                    {previousEntry ? previousEntry.weight : '--'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.comparisonCard}>
              <Text style={styles.cardTitle}>Height (cm)</Text>
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonCol}>
                  <Text style={styles.comparisonLabel}>Current</Text>
                  <Text style={styles.comparisonValue}>{latestEntry.height}</Text>
                </View>
                <View style={styles.comparisonCol}>
                  <Text style={styles.comparisonLabel}>Previous</Text>
                  <Text style={styles.comparisonValue}>
                    {previousEntry ? previousEntry.height : '--'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Toggle Buttons */}
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
                styles.toggleButtonText,
                activeView === 'entries' && styles.toggleButtonTextActive
              ]}>
                Previous Entries
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content Area */}
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

        {/* Floating Add New Entry Button */}
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

      <FloatingAIButton />
    </>
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
    paddingTop: 20,
    paddingBottom: 140,
  },

  // BMI Card Styles
  bmiCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'flex-start',
  },

  bmiLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },

  bmiValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_700Bold',
  },

  // Comparison Cards Styles
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'Montserrat_700Bold',
  },

  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  comparisonCol: {
    flex: 1,
  },

  comparisonLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
    fontFamily: 'Montserrat_400Regular',
  },

  comparisonValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_700Bold',
  },

  // Toggle Buttons Styles
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
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Montserrat_600SemiBold',
  },

  toggleButtonTextActive: {
    color: '#FFFFFF',
  },

  // Content Area Styles
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

  // Perfect Chart Styles
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
  },

  centeredChartArea: {
    position: 'relative',
    marginBottom: 20,
    alignItems: 'center', // Center the chart horizontally
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
    // backgroundColor: 'rgba(255,0,0,0.1)', // Debug
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
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
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
    fontSize: 10,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 4,
  },

  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
  },

  latestEntryInfo: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },

  latestEntryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    fontFamily: 'Montserrat_700Bold',
  },

  latestEntryText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
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
    fontSize: 16,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // Floating Button Styles
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

  // Popup Styles
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
  },

  popupDate: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
  },

  popupData: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
});

export default BiometricsDashboard;