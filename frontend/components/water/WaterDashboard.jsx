// components/water/WaterDashboard.jsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Font, Type, TextVariants } from '../../constants/Font';
import CustomButton from '../common/CustomButton';
import CustomButtonThree from '../common/CustomButtonThree';
import WaterDataCard from '../water/WaterDataCard';
import FloatingAIButton from '../../app/ai/FloatingAIButton';
import BottomNav from '../navbar/BottomNav';

// Local text styles using Font constants
const textStyles = {
  heading1: { fontSize: 28, ...Type.bold },
  heading2: { fontSize: 24, ...Type.bold },
  heading3: { fontSize: 20, ...Type.medium },
  heading4: { fontSize: 18, ...Type.medium },
  bodyMedium: { fontSize: 16, ...Type.regular },
  welcomeText: { fontSize: 24, ...Type.bold },
};

/**
 * WaterDashboard - Main dashboard component for tracking daily water intake
 * Displays total consumption, progress visualization, and entry management
 */
const WaterDashboard = ({ entries, onDeleteEntry, onAddEntry, onBackPress, dailyGoal = 2000 }) => {
  /**
   * Calculates total water consumed for current day
   */
  const calculateTotalWater = () => {
    const today = new Date().toDateString();
    return entries
      .filter(entry => new Date(entry.timestamp).toDateString() === today)
      .reduce((total, entry) => total + entry.amount, 0);
  };

  /**
   * Filters entries for current day only
   */
  const getTodaysEntries = () => {
    const today = new Date().toDateString();
    return entries.filter(entry => new Date(entry.timestamp).toDateString() === today);
  };

  const totalWater = calculateTotalWater();
  const todaysEntries = getTodaysEntries();
  const progressPercentage = Math.min((totalWater / dailyGoal) * 100, 100);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.dark.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.background} />
      
      <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
        {/* Header with back navigation and title */}
        <View style={styles.header}>
          <View style={styles.backButtonContainer}>
            <CustomButtonThree onPress={onBackPress} />
          </View>
          <Text style={[textStyles.welcomeText, styles.title, { color: Colors.dark.textPrimary }]}>
            Water Log
          </Text>
        </View>

        {/* Section title for total water consumption */}
        <Text style={[textStyles.heading4, styles.totalWaterSectionTitle]}>TOTAL WATER DRUNK TODAY</Text>

        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Water consumption summary card */}
          <View style={styles.totalWaterCard}>
            <View style={styles.waterProgressContainer}>
              <View style={styles.waterAmountRow}>
                <Text style={[textStyles.bodyMedium, styles.waterLabel]}>Millilitres</Text>
                <Text style={[textStyles.heading2, styles.waterAmount]}>
                  {totalWater} mL <Text style={[textStyles.bodyMedium, styles.goalText]}>/ {dailyGoal}</Text>
                </Text>
              </View>
              
              {/* Visual progress indicator */}
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${progressPercentage}%` }
                  ]} 
                />
                <View style={styles.progressBarBackground} />
              </View>
            </View>
          </View>

          {/* Daily entries listing */}
          <View style={styles.entriesSection}>
            <Text style={[textStyles.heading4, styles.entriesSectionTitle]}>TODAY'S ENTRIES</Text>
            
            <View style={styles.entriesContainer}>
              {todaysEntries.length > 0 ? (
                todaysEntries.map((entry) => (
                  <WaterDataCard
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
                    No water entries for today
                  </Text>
                  <Text style={[textStyles.bodyMedium, styles.noEntriesSubtext]}>
                    Tap the button below to log your first entry!
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Fixed position add entry action button */}
        <View style={styles.floatingButtonContainer}>
          <CustomButton
            title="Log New Water Entry"
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
    paddingHorizontal: 0,
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
    left: 15,
    top: 40,
  },
  title: {
    textAlign: 'center',
  },
  totalWaterSectionTitle: {
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
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
  totalWaterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    width: '90%',
    maxWidth: 350,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  waterProgressContainer: {
    alignItems: 'stretch',
  },
  waterAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  waterLabel: {
    color: '#666',
  },
  waterAmount: {
    color: '#4F9AFF',
  },
  goalText: {
    color: '#666',
    fontWeight: 'normal',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E5E5E5',
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4F9AFF',
    borderRadius: 6,
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
  progressBarBackground: {
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
});

export default WaterDashboard;