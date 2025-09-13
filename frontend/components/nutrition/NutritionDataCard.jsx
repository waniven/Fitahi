// components/nutrition/NutritionDataCard.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomToast from '../common/CustomToast';

// Displays nutrition entry with meal/time on left, nutrition badges on right in 2x2 grid
// Positioned to match calories bar alignment
const NutritionDataCard = ({ 
  entry,
  onDelete,
  showDeleteButton = false,
  style,
  ...props 
}) => {
  const { foodName, mealType, calories, protein, carbs, fat, timestamp } = entry;

  // Formats timestamp to display time in 24-hour format
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Capitalizes first letter of meal type
  const formatMealType = (mealType) => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  // Handles delete with toast notification
  const handleDelete = () => {
    CustomToast.nutritionDeleted(foodName);
    onDelete && onDelete(entry.id);
  };

  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.leftSection}>
        <Text style={styles.mealTypeText}>{formatMealType(mealType)}</Text>
        <Text style={styles.timeText}>{formatTime(timestamp)}</Text>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.nutritionRow}>
          <View style={[styles.nutritionBadge, styles.caloriesBadge]}>
            <Text style={styles.badgeText}>Calories: {calories} kcal</Text>
          </View>
          <View style={[styles.nutritionBadge, styles.proteinBadge]}>
            <Text style={styles.badgeText}>Protein: {protein} kcal</Text>
          </View>
        </View>

        <View style={styles.nutritionRow}>
          <View style={[styles.nutritionBadge, styles.fatBadge]}>
            <Text style={styles.badgeText}>Fat: {fat} kcal</Text>
          </View>
          <View style={[styles.nutritionBadge, styles.carbsBadge]}>
            <Text style={styles.badgeText}>Carbs: {carbs} kcal</Text>
          </View>
        </View>
      </View>

      {showDeleteButton && (
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={16} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '110%',
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 0,
    alignSelf: 'center',
    maxWidth: 350,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },

  leftSection: {
    justifyContent: 'center',
    marginRight: 12,
    minWidth: 70,
    maxWidth: 90,
  },

  mealTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 2,
  },

  timeText: {
    fontSize: 14,
    color: '#4A90E2',
    fontFamily: 'Montserrat_400Regular',
  },

  rightSection: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 24,
  },

  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  nutritionBadge: {
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flex: 0.49,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
  },

  caloriesBadge: {
    backgroundColor: '#FF5A5A',
  },

  proteinBadge: {
    backgroundColor: '#4ECDC4',
  },

  fatBadge: {
    backgroundColor: '#45B7D1',
  },

  carbsBadge: {
    backgroundColor: '#FFA726',
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },

  deleteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default NutritionDataCard;