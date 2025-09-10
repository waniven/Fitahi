// components/water/WaterDashboard.jsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import CustomButton from '../common/CustomButton';
import CustomButtonThree from '../common/CustomButtonThree';
import WaterDataCard from '../water/WaterDataCard';
import FloatingAIButton from '../../app/ai/FloatingAIButton';
import globalStyles from '../../styles/globalStyles';

/**
 * WaterDashboard - Main dashboard view for water intake data
 * Shows header with back button, total water consumed, progress bar, and today's entries
 */
const WaterDashboard = ({ entries, onDeleteEntry, onAddEntry, onBackPress, dailyGoal = 2000 }) => {
  const router = useRouter();
  const theme = Colors["dark"];

  /**
   * Calculate total water consumed today
   */
  const calculateTotalWater = () => {
    const today = new Date().toDateString();
    return entries
      .filter(entry => new Date(entry.timestamp).toDateString() === today)
      .reduce((total, entry) => total + entry.amount, 0);
  };

  /**
   * Get today's entries only
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
      
      <View style={[globalStyles.container, { backgroundColor: Colors.dark.background }]}>
        {/* Header Section */}
        <View style={styles.header}>
          {/* Back button positioned on the left */}
          <View style={styles.backButtonContainer}>
            <CustomButtonThree onPress={onBackPress} />
          </View>
          
          {/* Centered title */}
          <Text style={[styles.title, globalStyles.welcomeText, { color: Colors.dark.textPrimary }]}>
            Water Log
          </Text>
        </View>

        {/* Total Water Title Outside Container */}
        <Text style={styles.totalWaterSectionTitle}>TOTAL WATER DRUNK TODAY</Text>

        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Total Water Card (without title) */}
          <View style={styles.totalWaterCard}>
            <View style={styles.waterProgressContainer}>
              <View style={styles.waterAmountRow}>
                <Text style={styles.waterLabel}>Millilitres</Text>
                <Text style={styles.waterAmount}>
                  {totalWater} mL <Text style={styles.goalText}>/ {dailyGoal}</Text>
                </Text>
              </View>
              
              {/* Progress Bar */}
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

          {/* Today's Entries Section */}
          <View style={styles.entriesSection}>
            <Text style={styles.entriesSectionTitle}>TODAY'S ENTRIES</Text>
            
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
                  <Text style={styles.noEntriesText}>
                    No water entries for today
                  </Text>
                  <Text style={styles.noEntriesSubtext}>
                    Tap the button below to log your first entry!
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Floating Add New Entry Button */}
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

  totalWaterSectionTitle: {
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

  // Total Water Card Styles (without title)
  totalWaterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    width: '150%', // Use full available width instead of auto
    maxWidth: 350, // Set maximum width to prevent it from being too wide
    alignSelf: 'center', // Center the card
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
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },

  waterAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
    fontFamily: 'Montserrat_700Bold',
  },

  goalText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'normal',
    fontFamily: 'Montserrat_400Regular',
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
    backgroundColor: Colors.light.primary,
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