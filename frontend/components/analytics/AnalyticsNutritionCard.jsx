// components/analytics/AnalyticsNutritionCard.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Font, Type, TextVariants } from '../../constants/Font';
import CustomToast from '../common/CustomToast';

// Displays nutrition entry with food name, meal/time, and nutrition badges for analytics screens
const AnalyticsNutritionCard = ({ 
  entry,
  onDelete,
  showDeleteButton = false,
  style,
  ...props 
}) => {
  const { foodName, mealType, calories, protein, carbs, fat, timestamp } = entry;

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
      {/* Top section with food name and timestamp */}
      <View style={styles.headerSection}>
        <Text style={styles.foodNameText} numberOfLines={1}>
          {foodName}
        </Text>
        <Text style={styles.timestampText}>
          {formatTimestamp(timestamp)}
        </Text>
      </View>

      {/* Main content section */}
      <View style={styles.mainContent}>
        <View style={styles.leftSection}>
          <Text style={styles.mealTypeText}>{formatMealType(mealType)}</Text>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.nutritionRow}>
            <View style={[styles.nutritionBadge, styles.caloriesBadge]}>
              <Text style={styles.badgeText}>Calories: {calories} kcal</Text>
            </View>
            <View style={[styles.nutritionBadge, styles.proteinBadge]}>
              <Text style={styles.badgeText}>Protein: {protein} g</Text>
            </View>
          </View>

          <View style={styles.nutritionRow}>
            <View style={[styles.nutritionBadge, styles.fatBadge]}>
              <Text style={styles.badgeText}>Fat: {fat} g</Text>
            </View>
            <View style={[styles.nutritionBadge, styles.carbsBadge]}>
              <Text style={styles.badgeText}>Carbs: {carbs} g</Text>
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
    width: '110%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 0,
    alignSelf: 'center',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    minHeight: 100,
  },

  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 30,
  },

  foodNameText: {
    fontSize: 16,
    color: '#4A90E2',
    flex: 1,
    marginRight: 8,
    ...Type.bold,
  },

  timestampText: {
    fontSize: 12,
    color: '#666',
    ...Type.regular,
  },

  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  leftSection: {
    justifyContent: 'center',
    marginRight: 12,
    minWidth: 70,
    maxWidth: 90,
  },

  mealTypeText: {
    fontSize: 14,
    color: '#4A90E2',
    ...Type.regular,
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
    textAlign: 'center',
    ...Type.semibold,
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

export default AnalyticsNutritionCard;