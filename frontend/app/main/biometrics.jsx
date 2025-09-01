import React from 'react';
import FloatingAIButton from "../ai/FloatingAIButton";
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';

export default function Biometrics() {
  const router = useRouter();
  // Theme colors for light/dark mode support
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundAltColor = useThemeColor({}, 'backgroundAlt');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const handleAddBMI = () => {
    console.log('Add BMI pressed');
    // TODO: Create BMI input form
  };

  const handleBackPress = () => {
    router.back();
  };

  const renderHeader = () => (
    <ThemedView style={styles.header}>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: backgroundAltColor }]}
        onPress={handleBackPress}
      >
        <ThemedText style={styles.backButtonText}>←</ThemedText>
      </TouchableOpacity>
      <ThemedText type="subtitle">Biometric</ThemedText>
      <TouchableOpacity style={[styles.profileButton, { backgroundColor: backgroundAltColor }]}>
        <ThemedText style={styles.profileButtonText}>P</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  const renderDateSelector = () => (
    <ThemedView style={styles.dateSelector}>
      {['5', '6', '7', '8', '9', '10', '11', '12'].map((day) => (
        <TouchableOpacity
          key={day}
          style={[
            styles.dateButton,
            { backgroundColor: backgroundAltColor },
            day === '8' && { backgroundColor: primaryColor } // Current day highlight
          ]}
        >
          <ThemedText
            style={[
              styles.dateText,
              { color: textSecondaryColor },
              day === '8' && { color: '#FFFFFF', fontWeight: 'bold' }
            ]}
          >
            {day}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ThemedView>
  );

  // Main BMI input section
  const renderAddBMISection = () => (
    <ThemedView style={styles.addBMIContainer}>
      <ThemedText type="title" style={styles.addBMITitle}>
        Add BMI
      </ThemedText>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: '#FFFFFF' }]}
        onPress={handleAddBMI}
      >
        <ThemedText style={[styles.addButtonText, { color: textSecondaryColor }]}>
          +
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>
        {renderHeader()}
        <ScrollView style={styles.content}>
          {renderDateSelector()}
          {renderAddBMISection()}
        </ScrollView>
        <FloatingAIButton />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  dateButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addBMIContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  addBMITitle: {
    marginBottom: 40,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  addButtonText: {
    fontSize: 32,
    fontWeight: '300',
  },
});