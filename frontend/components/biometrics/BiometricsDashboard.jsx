// components/biometrics/BiometricsDashboard.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/Colors';
import CustomButton from '../common/CustomButton';
import BiometricDataCard from '../biometrics/BiometricDataCard';

/**
 * BiometricsDashboard - Main dashboard view for biometrics data
 * Shows BMI, current vs previous stats, and previous entries with Chart Kit
 */
const BiometricsDashboard = ({ entries, onDeleteEntry, onAddEntry }) => {
  const [activeView, setActiveView] = useState('entries'); // 'entries' or 'chart'

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
   * Prepare chart data for Chart Kit
   */
  const prepareChartData = () => {
    // Take last 8 entries and reverse for chronological order
    const chartEntries = entries.slice(0, 8).reverse();
    
    const weights = chartEntries.map(entry => entry.weight);
    const labels = chartEntries.map(entry => {
      const date = new Date(entry.timestamp);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    return {
      labels: labels,
      datasets: [{
        data: weights,
        color: (opacity = 1) => Colors.light.primary, // Line color
        strokeWidth: 3
      }]
    };
  };

  /**
   * Chart configuration
   */
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: Colors.light.primary,
      fill: "#ffffff"
    },
    propsForLabels: {
      fontSize: 10
    }
  };

  /**
   * Render Weight Chart using Chart Kit
   */
  const renderChart = () => {
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 40;
    
    // If no data or insufficient data, show message
    if (entries.length < 2) {
      return (
        <View style={styles.chartContainer}>
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

    const chartData = prepareChartData();

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weight Progression</Text>
        
        {/* Chart */}
        <View style={styles.chartWrapper}>
          <LineChart
            data={chartData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={true}
            withHorizontalLabels={true}
            withVerticalLabels={true}
            fromZero={false}
            segments={4}
          />
        </View>
        
        {/* Chart Legend */}
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>Weight progression over time</Text>
          </View>
        </View>
        
        {/* Chart Stats */}
        <View style={styles.chartStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Entries</Text>
            <Text style={styles.statValue}>{chartData.datasets[0].data.length}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Min Weight</Text>
            <Text style={styles.statValue}>{Math.min(...chartData.datasets[0].data)} kg</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Max Weight</Text>
            <Text style={styles.statValue}>{Math.max(...chartData.datasets[0].data)} kg</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Trend</Text>
            <Text style={[styles.statValue, { 
              color: chartData.datasets[0].data[chartData.datasets[0].data.length - 1] > chartData.datasets[0].data[0] 
                ? '#EF5350' : '#66BB6A' 
            }]}>
              {chartData.datasets[0].data[chartData.datasets[0].data.length - 1] > chartData.datasets[0].data[0] ? '↗' : '↘'}
            </Text>
          </View>
        </View>
        
        {/* Latest Data Info Box */}
        <View style={styles.dataInfoBox}>
          <Text style={styles.dataInfoTitle}>Latest Entry</Text>
          <Text style={styles.dataInfoText}>
            Weight: {latestEntry.weight} kg | Height: {latestEntry.height} cm
          </Text>
          <Text style={styles.dataInfoText}>
            BMI: {currentBMI} | Date: {new Date(latestEntry.timestamp).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
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
          {/* Weight Card */}
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

          {/* Height Card */}
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
            // Previous Entries View
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
            // Chart View
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

  // Chart Styles
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },

  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
  },

  chartWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },

  chart: {
    borderRadius: 16,
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

  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
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

  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },

  statItem: {
    alignItems: 'center',
  },

  statLabel: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 2,
  },

  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
  },

  dataInfoBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },

  dataInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Montserrat_700Bold',
  },

  dataInfoText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 2,
  },

  // Floating Button Styles
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 100,
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

export default BiometricsDashboard;