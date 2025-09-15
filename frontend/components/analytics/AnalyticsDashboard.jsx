// components/analytics/AnalyticsDashboard.jsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import CustomButtonThree from '../common/CustomButtonThree';
import FloatingAIButton from '../../app/ai/FloatingAIButton';
import BottomNav from '../navbar/BottomNav';

/**
 * AnalyticsDashboard - Main dashboard component for displaying analytics and charts
 * Shows aggregated data from all logging features with visual representations
 */
const AnalyticsDashboard = ({ data, onBackPress, onRefresh }) => {
  const theme = Colors["dark"];

  // Calculate stats from data
  const calculateStats = () => {
    return {
      totalWaterIntake: data.waterEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0),
      totalWorkouts: data.workoutEntries.length,
      totalMeals: data.nutritionEntries.length,
      activeDays: new Set([
        ...data.waterEntries.map(e => e.timestamp?.split('T')[0]),
        ...data.workoutEntries.map(e => e.timestamp?.split('T')[0]),
        ...data.nutritionEntries.map(e => e.timestamp?.split('T')[0])
      ].filter(Boolean)).size
    };
  };

  const stats = calculateStats();

  const statCards = [
    { 
      id: 1, 
      icon: 'water', 
      title: 'Water Intake', 
      value: `${stats.totalWaterIntake}mL`
    },
    { 
      id: 2, 
      icon: 'fitness', 
      title: 'Workouts', 
      value: stats.totalWorkouts
    },
    { 
      id: 3, 
      icon: 'restaurant', 
      title: 'Meals', 
      value: stats.totalMeals
    },
    { 
      id: 4, 
      icon: 'calendar', 
      title: 'Active Days', 
      value: stats.activeDays
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header with back navigation and title */}
        <View style={styles.header}>
          <View style={styles.backButtonContainer}>
            <CustomButtonThree onPress={onBackPress} />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Your Analytics
          </Text>
        </View>

        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Stats Overview */}
          <Text style={[styles.sectionTitle, { color: "#FFFFFF" }]}>
            OVERVIEW
          </Text>
          
          <View style={styles.statsRow}>
            {statCards.map((stat) => (
              <View key={stat.id} style={[styles.statCard, { backgroundColor: "#fff" }]}>
                <Ionicons name={stat.icon} size={28} color={theme.tint} />
                <Text style={[styles.statTitle, { color: "#000" }]}>
                  {stat.title}
                </Text>
                <Text style={[styles.statValue, { color: theme.tint }]}>
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Charts Section */}
          <Text style={[styles.sectionTitle, { color: "#FFFFFF" }]}>
            CHARTS
          </Text>

          <TouchableOpacity
            style={[styles.chartPlaceholder, { backgroundColor: "#fff" }]}
            onPress={() => console.log('Weekly Progress Chart pressed')}
          >
            <Text style={styles.chartText}>
              [Weekly Progress Chart Placeholder]
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chartPlaceholder, { backgroundColor: "#fff" }]}
            onPress={() => console.log('Activity Distribution pressed')}
          >
            <Text style={styles.chartText}>
              [Activity Distribution Placeholder]
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chartPlaceholder, { backgroundColor: "#fff" }]}
            onPress={() => console.log('Progress Trends pressed')}
          >
            <Text style={styles.chartText}>
              [Progress Trends Placeholder]
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 45,
    paddingBottom: 20,
    position: 'relative',
  },
  backButtonContainer: {
    position: 'absolute',
    left: 0,
    top: 45,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 1,
  },
  // Stats Row - matching your original design
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    alignItems: 'center',
  },
  statTitle: { 
    fontSize: 16, 
    marginTop: 8, 
    textAlign: 'center',
    fontWeight: '500'
  },
  statValue: { 
    fontSize: 18, 
    marginTop: 6, 
    fontWeight: 'bold',
    textAlign: 'center'
  },
  // Charts - matching your original design
  chartPlaceholder: {
    height: 180,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  chartText: { 
    fontSize: 14, 
    fontStyle: 'italic',
    color: '#666'
  },
});

export default AnalyticsDashboard;