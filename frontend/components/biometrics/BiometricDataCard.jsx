// components/common/BiometricDataCard.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Font, Type, TextVariants } from '../../constants/Font';
import CustomToast from '../common/CustomToast';

// Configuration constants
const BMI_RANGES = {
  underweight: { min: 0, max: 18.5, text: 'Underweight', color: '#4FC3F7' },
  normal: { min: 18.5, max: 25, text: 'Normal', color: '#66BB6A' },
  overweight: { min: 25, max: 30, text: 'Overweight', color: '#FFB74D' },
  obese: { min: 30, max: 100, text: 'Obese', color: '#EF5350' }
};

// Local text styles using Font constants
const textStyles = {
  bodyMedium: { fontSize: 16, ...Type.regular },
  bodySmall: { fontSize: 16, ...Type.regular },
  weightValue: { fontSize: 32, ...Type.bold },
  bmiStatus: { fontSize: 16, ...Type.bold },
};

// Reusable component for displaying biometric data with BMI calculation and weight display
const BiometricDataCard = ({ 
  entry, 
  age = 25, 
  onDelete, 
  showDeleteButton = true,
  style,
  bmiRanges = BMI_RANGES
}) => {
  
  // Calculate BMI from height and weight
  const calculateBMI = (weightKg, heightCm) => {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
  };

  // Determine BMI status category with color coding
  const getBMIStatus = (bmi) => {
    if (bmi < bmiRanges.underweight.max) {
      return { text: bmiRanges.underweight.text, color: bmiRanges.underweight.color };
    } else if (bmi >= bmiRanges.normal.min && bmi < bmiRanges.normal.max) {
      return { text: bmiRanges.normal.text, color: bmiRanges.normal.color };
    } else if (bmi >= bmiRanges.overweight.min && bmi < bmiRanges.overweight.max) {
      return { text: bmiRanges.overweight.text, color: bmiRanges.overweight.color };
    } else {
      return { text: bmiRanges.obese.text, color: bmiRanges.obese.color };
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

  // Handle delete with toast notification
  const handleDelete = () => {
    const weight = entry.weight.toFixed(1);
    CustomToast.info('Measurement Removed', `${weight}kg entry deleted from your log`);
    onDelete(entry.id);
  };

  const bmi = calculateBMI(entry.weight, entry.height);
  const bmiStatus = getBMIStatus(bmi);

  return (
    <View style={[styles.cardContainer, style]}>
      <View style={styles.accentBar} />
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View style={styles.spacer} />
          <Text style={[textStyles.bodySmall, styles.timestamp]}>
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

        <View style={styles.weightSection}>
          <Text style={[textStyles.weightValue, styles.weightValue]}>
            {entry.weight.toFixed(2)}
          </Text>
          <Text style={[textStyles.bodyMedium, styles.weightUnit]}>kg</Text>
        </View>

        <View style={styles.bmiSection}>
          <Text style={[textStyles.bmiStatus, styles.bmiStatus, { color: bmiStatus.color }]}>
            {bmiStatus.text}
          </Text>
          <Text style={[textStyles.bodyMedium, styles.bmiValue]}> (BMI {bmi})</Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={[textStyles.bodySmall, styles.detailText]}>
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
    backgroundColor: Colors.light.primary,
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
    color: '#666',
    textAlign: 'right',
  },

  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },

  weightSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
    marginTop: -17,
  },

  weightValue: {
    color: Colors.light.primary,
    lineHeight: 36,
  },

  weightUnit: {
    color: '#666',
    marginLeft: 4,
  },

  bmiSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    flexWrap: 'wrap',
  },

  bmiStatus: {
    // Color will be set dynamically based on BMI range
  },

  bmiValue: {
    color: '#666',
  },

  detailsRow: {
    marginTop: 2,
    justifyContent: 'flex-end',
  },

  detailText: {
    color: '#333',
  },
});

export default BiometricDataCard;