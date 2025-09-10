// components/common/BiometricDataCard.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

/**
 * BiometricDataCard - Reusable component for displaying biometric data
 * Features BMI calculation, weight/height display, and timestamp
 */
const BiometricDataCard = ({ 
  entry, 
  age = 25, 
  onDelete, 
  showDeleteButton = true,
  style 
}) => {
  
  /**
   * Calculate BMI from height and weight
   */
  const calculateBMI = (weightKg, heightCm) => {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
  };

  /**
   * Determine BMI status category with color coding
   */
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

  /**
   * Format timestamp to display date and time like "08 Aug, 07:00am"
   */
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    
    return `${day} ${month}, ${hours.toString().padStart(2, '0')}:${minutes}${ampm}`;
  };

  const bmi = calculateBMI(entry.weight, entry.height);
  const bmiStatus = getBMIStatus(bmi);

  return (
    <View style={[styles.cardContainer, style]}>
      {/* Blue accent bar positioned inside the card */}
      <View style={styles.accentBar} />
      
      {/* Main content area */}
      <View style={styles.contentContainer}>
        {/* Timestamp in top right */}
        <View style={styles.headerRow}>
          <View style={styles.spacer} />
          <Text style={styles.timestamp}>
            {formatTimestamp(entry.timestamp)}
          </Text>
          {showDeleteButton && onDelete && (
            <TouchableOpacity 
              onPress={() => onDelete(entry.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Weight display */}
        <View style={styles.weightSection}>
          <Text style={styles.weightValue}>{entry.weight.toFixed(2)}</Text>
          <Text style={styles.weightUnit}>kg</Text>
        </View>

        {/* BMI status */}
        <View style={styles.bmiSection}>
          <Text style={[styles.bmiStatus, { color: bmiStatus.color }]}>
            {bmiStatus.text}
          </Text>
          <Text style={styles.bmiValue}> (BMI {bmi})</Text>
        </View>

        {/* Height and Age row */}
        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>
            Height: {entry.height.toFixed(1)} cm | Age: {age}
          </Text>
        </View>
      </View>
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
    width: 357, // Restore original width
    height: 118, // Restore original height
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
    top: (118 - 103) / 2, // Perfectly center vertically: (card height - bar height) / 2
    width: 8,
    height: 103,
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },

  contentContainer: {
    flex: 1,
    padding: 16,
    paddingLeft: 44, // Space for accent bar (20px margin + 8px bar + 16px spacing)
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
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'right',
  },

  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },

  weightSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2, // Reduced to make room for height/age
    marginTop: -17,
  },

  weightValue: {
    fontSize: 32, // Back to original size
    fontWeight: 'bold',
    color: Colors.light.primary,
    fontFamily: 'Montserrat_700Bold',
    lineHeight: 36,
  },

  weightUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Montserrat_400Regular',
  },

  bmiSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2, // Reduced to make room for height/age
    flexWrap: 'wrap',
  },

  bmiStatus: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat_700Bold',
  },

  bmiValue: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },

  detailsRow: {
    marginTop: 2,
    justifyContent: 'flex-end', // Position at bottom
  },

  detailText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat_400Regular',
  },
});

export default BiometricDataCard;