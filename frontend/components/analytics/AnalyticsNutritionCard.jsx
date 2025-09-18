// components/analytics/AnalyticsNutritionCard.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Font, Type, TextVariants } from '../../constants/Font';
import CustomToast from '../common/CustomToast';

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth - 40; // Responsive width with 20px margin on each side

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
      {/* Header section with full food name */}
      <View style={[styles.headerSection, { paddingRight: showDeleteButton ? 35 : 0 }]}>
        <Text style={styles.foodNameText} numberOfLines={2}>
          {foodName}
        </Text>
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

      {/* Timestamp and meal type section */}
      <View style={styles.metaSection}>
        <Text style={styles.timestampText}>
          {formatTimestamp(timestamp)}
        </Text>
        <View style={styles.mealTypeBadge}>
          <Text style={styles.mealTypeText}>{formatMealType(mealType)}</Text>
        </View>
      </View>

      {/* Nutrition badges section */}
      <View style={styles.nutritionSection}>
        <View style={styles.nutritionRow}>
          <View style={[styles.nutritionBadge, styles.caloriesBadge]}>
            <Text style={styles.badgeText}>Calories: {calories} kcal</Text>
          </View>
          <View style={[styles.nutritionBadge, styles.proteinBadge]}>
            <Text style={styles.badgeText}>Protein: {protein} g</Text>
          </View>
        </View>

        <View style={styles.nutritionRow}>
          <View style={[styles.nutritionBadge, styles.carbsBadge]}>
            <Text style={styles.badgeText}>Carbs: {carbs} g</Text>
          </View>
          <View style={[styles.nutritionBadge, styles.fatBadge]}>
            <Text style={styles.badgeText}>Fat: {fat} g</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16, // Increased padding
    marginVertical: 8, // Slightly increased vertical spacing
    marginHorizontal: 20, // Added horizontal margins
    alignSelf: 'center',
    width: cardWidth, // Responsive width
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    minHeight: 160, // Increased minimum height for better layout
  },

  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12, // Increased spacing
  },

  foodNameText: {
    fontSize: 18, // Slightly larger font
    color: '#4A90E2',
    flex: 1,
    lineHeight: 22, // Better line height for multi-line text
    ...Type.bold,
  },

  deleteButton: {
    position: 'absolute',
    top: -4,
    right: -4,
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

  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16, // Spacing before nutrition section
  },

  timestampText: {
    fontSize: 13,
    color: '#666',
    ...Type.regular,
  },

  mealTypeBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },

  mealTypeText: {
    fontSize: 12,
    color: '#4A90E2',
    ...Type.semibold,
  },

  nutritionSection: {
    flex: 1,
  },

  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8, // Spacing between rows
  },

  nutritionBadge: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 0.48, // Slightly less than 0.5 for better spacing
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50, // Increased height for better layout
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
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 2,
    ...Type.medium,
  },

  badgeValue: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    ...Type.bold,
  },
});

export default AnalyticsNutritionCard;