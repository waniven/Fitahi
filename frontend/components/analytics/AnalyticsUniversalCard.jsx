// components/analytics/AnalyticsUniversalCard.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Font, Type, TextVariants } from '../../constants/Font';
import CustomToast from '../common/CustomToast';

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth - 40; // Responsive width with 20px margin on each side

// Universal card component for Water, Workout, and Biometric entries in analytics screens
const AnalyticsUniversalCard = ({ 
  entry, 
  type, // 'water', 'workout', or 'biometric'
  onDelete, 
  onPress, // New prop for handling card press
  showDeleteButton = false,
  style,
  cardSpacing = 16, // New prop to control spacing between cards
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

  // Dynamic styles with responsive width and spacing - matching AnalyticsNutritionCard
  const dynamicStyles = StyleSheet.create({
    cardContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      marginVertical: 6, // Match nutrition card vertical spacing
      marginHorizontal: 0, // Match nutrition card horizontal spacing
      width: cardWidth, // Responsive width
      minHeight: 140, // Increased minimum height to accommodate all text
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4, // Match nutrition card shadow radius
      elevation: 3, // Match nutrition card elevation
      position: 'relative',
      alignSelf: 'center',
    },
  });

  // Wrap in TouchableOpacity if onPress is provided
  const CardContent = (
    <>
      <View style={[styles.accentBar, { backgroundColor: '#4F9AFF', }]} />
      
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
          <Text style={[styles.mainValue, { color: '#4F9AFF' }]}>
            {mainDisplay.value}
          </Text>
          {mainDisplay.unit && (
            <Text style={styles.unit}>{mainDisplay.unit}</Text>
          )}
        </View>

        <View style={styles.subtitleSection}>
          <Text style={[styles.subtitle, { color: '#4F9AFF' }]}>
            {mainDisplay.subtitle}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.detailText} numberOfLines={2} ellipsizeMode="tail">
            {getDetails()}
          </Text>
        </View>
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        style={[dynamicStyles.cardContainer, style]} 
        onPress={handlePress}
        activeOpacity={0.7}
        {...props}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[dynamicStyles.cardContainer, style]} {...props}>
      {CardContent}
    </View>
  );
};

const styles = StyleSheet.create({
  accentBar: {
    position: 'absolute',
    left: 20,
    top: 15, // Adjusted top position
    width: 8,
    height: 110, // Increased height to match new card size
    borderRadius: 4,
  },

  contentContainer: {
    flex: 1,
    padding: 16,
    paddingLeft: 44,
    paddingTop: 10, // Slightly increased top padding
    paddingRight: 16,
    paddingBottom: 16, // Ensure bottom padding
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 6, // Increased margin for better spacing
    minHeight: 20,
  },

  spacer: {
    flex: 1,
  },

  timestamp: {
    fontSize: 15, // Slightly smaller to fit better
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
    marginBottom: 4, // Increased margin
    marginTop: -10, // Reduced negative margin
  },

  mainValue: {
    fontSize: 30, // Slightly smaller to fit better
    lineHeight: 34,
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
    marginBottom: 6, // Increased margin
    flexWrap: 'wrap',
  },

  subtitle: {
    fontSize: 15, // Slightly smaller
    ...Type.bold,
  },

  detailsRow: {
    marginTop: 4, // Increased margin
    justifyContent: 'flex-end',
    flex: 1, // Allow it to expand and push content
  },

  detailText: {
    fontSize: 14, // Reduced font size to fit better
    color: '#333',
    ...Type.regular,
    lineHeight: 18, // Better line height for readability
  },
});

export default AnalyticsUniversalCard;