// components/analytics/AnalyticsUniversalCard.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Font, Type, TextVariants } from '../../constants/Font';
import CustomToast from '../common/CustomToast';

// Universal card component for Water, Workout, and Biometric entries in analytics screens
const AnalyticsUniversalCard = ({ 
  entry, 
  type, // 'water', 'workout', or 'biometric'
  onDelete, 
  onPress, // New prop for handling card press
  showDeleteButton = false,
  style,
  ...props
}) => {
  
  // BMI calculation for biometrics
  const calculateBMI = (weightKg, heightCm) => {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
  };

  // BMI status with color
  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) {
      return { text: 'Underweight', color: '#4FC3F7' };
    } else if (bmi >= 18.5 && bmi < 25) {
      return { text: 'Normal', color: '#66BB6A' };
    } else if (bmi >= 25 && bmi < 30) {
      return { text: 'Overweight', color: '#FFB74D' };
    } else {
      return { text: 'Obese', color: '#EF5350' };
    }
  };

  // Format timestamp to display date and time like "08 Aug, 07:00am"
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${day} ${month}, ${hours.toString().padStart(2, '0')}:${minutes}${ampm}`;
  };

  // Convert seconds to readable text format
  const formatDurationText = (seconds) => {
    const minutes = Math.round(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  // Handle delete with appropriate toast
  const handleDelete = () => {
    if (type === 'water') {
      CustomToast.info('Water Entry Removed', `${entry.amount}mL entry deleted from your log`);
    } else if (type === 'workout') {
      const duration = formatDurationText(entry.totalTimeSpent);
      CustomToast.info('Workout Entry Removed', `${entry.workoutName} (${duration}) deleted from your log`);
    } else if (type === 'biometric') {
      CustomToast.info('Biometric Entry Removed', `${entry.weight}kg entry deleted from your log`);
    }
    onDelete && onDelete(entry.id);
  };

  // Handle card press
  const handlePress = () => {
    onPress && onPress(entry);
  };

  // Get the main value and unit based on type
  const getMainDisplay = () => {
    if (type === 'water') {
      return {
        value: entry.amount.toFixed(0),
        unit: 'mL',
        subtitle: 'water goal',
        color: Colors.light.primary
      };
    } else if (type === 'workout') {
      return {
        value: formatDurationText(entry.totalTimeSpent),
        unit: '',
        subtitle: `${entry.completedExercises?.length || 0} exercises finished`,
        color: '#FF6384'
      };
    } else if (type === 'biometric') {
      const bmi = calculateBMI(entry.weight, entry.height);
      const bmiStatus = getBMIStatus(bmi);
      return {
        value: entry.weight.toFixed(2),
        unit: 'kg',
        subtitle: bmiStatus.text,
        color: bmiStatus.color
      };
    }
  };

  // Get additional details
  const getDetails = () => {
    if (type === 'water') {
      return `Goal met at this point? • No`; // You can customize this logic
    } else if (type === 'workout') {
      const workoutName = entry.workoutName || 'Workout';
      const totalExercises = entry.completedExercises?.length || 0;
      return `Workout Name: ${workoutName} | Total exercises: ${totalExercises}`;
    } else if (type === 'biometric') {
      const bmi = calculateBMI(entry.weight, entry.height);
      return `Height: ${entry.height.toFixed(1)} cm | BMI: ${bmi} | Age: 25`;
    }
  };

  const mainDisplay = getMainDisplay();

  // Wrap in TouchableOpacity if onPress is provided
  const CardContent = (
    <>
      <View style={[styles.accentBar, { backgroundColor: mainDisplay.color }]} />
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View style={styles.spacer} />
          <Text style={styles.timestamp}>
            {formatTimestamp(entry.timestamp)}
          </Text>
          {showDeleteButton && onDelete && (
            <TouchableOpacity 
              onPress={handleDelete}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.mainSection}>
          <Text style={[styles.mainValue, { color: mainDisplay.color }]}>
            {mainDisplay.value}
          </Text>
          {mainDisplay.unit && (
            <Text style={styles.unit}>{mainDisplay.unit}</Text>
          )}
        </View>

        <View style={styles.subtitleSection}>
          <Text style={[styles.subtitle, { color: mainDisplay.color }]}>
            {mainDisplay.subtitle}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>
            {getDetails()}
          </Text>
        </View>
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        style={[styles.cardContainer, style]} 
        onPress={handlePress}
        activeOpacity={0.7}
        {...props}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.cardContainer, style]} {...props}>
      {CardContent}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 40,
    marginBottom: 16,
    width: 357,
    height: 118,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    alignSelf: 'center',
  },

  accentBar: {
    position: 'absolute',
    left: 20,
    top: (118 - 103) / 2,
    width: 8,
    height: 103,
    borderRadius: 4,
  },

  contentContainer: {
    flex: 1,
    padding: 16,
    paddingLeft: 44,
    paddingTop: 8,
    paddingRight: 16,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 4,
    minHeight: 20,
  },

  spacer: {
    flex: 1,
  },

  timestamp: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
    ...Type.regular,
  },

  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },

  mainSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
    marginTop: -17,
  },

  mainValue: {
    fontSize: 32,
    lineHeight: 36,
    ...Type.bold,
  },

  unit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
    ...Type.regular,
  },

  subtitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    flexWrap: 'wrap',
  },

  subtitle: {
    fontSize: 16,
    ...Type.bold,
  },

  detailsRow: {
    marginTop: 2,
    justifyContent: 'flex-end',
  },

  detailText: {
    fontSize: 16,
    color: '#333',
    ...Type.regular,
  },
});

export default AnalyticsUniversalCard;