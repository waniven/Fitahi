// components/nutrition/NutritionDataCard.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Font, Type, TextVariants } from '../../constants/Font';
import CustomToast from '../common/CustomToast';

const screenWidth = Dimensions.get('window').width;

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
      hour12: true  // Change to true for 12-hour format with AM/PM
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
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionRow}>
            <View style={[styles.nutritionBadge, styles.caloriesBadge]}>
              <Text style={styles.badgeLabel}>Calories</Text>
              <Text style={styles.badgeValue}>{calories} kcal</Text>
            </View>
            <View style={[styles.nutritionBadge, styles.proteinBadge]}>
              <Text style={styles.badgeLabel}>Protein</Text>
              <Text style={styles.badgeValue}>{protein} g</Text>
            </View>
          </View>

          <View style={styles.nutritionRow}>
            <View style={[styles.nutritionBadge, styles.fatBadge]}>
              <Text style={styles.badgeLabel}>Fat</Text>
              <Text style={styles.badgeValue}>{fat} g</Text>
            </View>
            <View style={[styles.nutritionBadge, styles.carbsBadge]}>
              <Text style={styles.badgeLabel}>Carbs</Text>
              <Text style={styles.badgeValue}>{carbs} g</Text>
            </View>
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
    width: Math.min(screenWidth * 0.98, 340), // Increased percentage from 0.95 to 0.98, max width 340
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 0,
    alignSelf: 'center',
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
    width: 80, // Fixed width instead of min/max to prevent shifting
  },

  mealTypeText: {
    fontSize: 14, // Reduced from 16 to fit "Breakfast" on one line
    color: '#4A90E2',
    marginBottom: 2,
    ...Type.bold,
  },

  timeText: {
    fontSize: 14,
    color: '#4A90E2',
    ...Type.regular,
  },

  rightSection: {
    position: 'absolute', // Fixed positioning
    right: 42, // Moved from 12 to 42 to make room for delete button
    top: 8, // Moved up from 12 to 8 to lift badges higher
    bottom: 16, // Increased from 12 to 16 to create more bottom spacing
    width: 200, // Fixed width for consistent badge positioning
    justifyContent: 'center',
  },

  nutritionGrid: {
    flex: 1,
    justifyContent: 'space-between',
  },

  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'center', // Changed from space-between to center
    marginBottom: 4,
    gap: 10, // Added gap for consistent spacing between centered badges
  },

  nutritionBadge: {
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 4,
    width: 90, // Fixed width for all badges
    height: 32, // Fixed height for all badges
    alignItems: 'center',
    justifyContent: 'center',
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

  badgeLabel: {
    color: '#FFFFFF',
    fontSize: 9,
    textAlign: 'center',
    ...Type.medium,
    lineHeight: 10,
    marginBottom: 1,
  },

  badgeValue: {
    color: '#FFFFFF',
    fontSize: 10,
    textAlign: 'center',
    ...Type.bold,
    lineHeight: 11,
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
    // Removed all shadow properties
  },
});

export default NutritionDataCard;