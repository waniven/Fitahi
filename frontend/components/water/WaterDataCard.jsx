// components/water/WaterDataCard.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Font, Type, TextVariants } from '../../constants/Font';
import CustomToast from '../common/CustomToast';

// Local text styles using Font constants
const textStyles = {
  heading3: { fontSize: 20, ...Type.medium },
  bodyMedium: { fontSize: 16, ...Type.regular },
};

// Component for displaying water intake entries with instant delete functionality
const WaterDataCard = ({ 
  entry, 
  onDelete, 
  showDeleteButton = true,
  style 
}) => {
  
  // Format time to 12-hour format with am/pm
  const formatTime = (timeString) => {
    if (timeString && timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'pm' : 'am';
      return `${hour12}:${minutes} ${ampm}`;
    }
    
    if (entry.timestamp) {
      const date = new Date(entry.timestamp);
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    }
    
    return timeString || 'Time not set';
  };

  // Handle instant delete with toast notification
  const handleDelete = () => {
    CustomToast.waterDeleted(entry.amount);
    if (onDelete) {
      onDelete(entry.id);
    }
  };

  return (
    <View style={[styles.cardContainer, style]}>
      <View style={styles.contentContainer}>
        <View style={styles.textContent}>
          <Text style={[textStyles.heading3, styles.timeText]}>
            {formatTime(entry.time)}
          </Text>
          <Text style={[textStyles.bodyMedium, styles.amountText]}>
            Amount: {entry.amount}mL
          </Text>
        </View>

        {showDeleteButton && onDelete && (
          <TouchableOpacity 
            onPress={handleDelete}
            style={styles.deleteButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${entry.amount}mL water entry`}
            accessibilityHint="Double tap to remove this water intake record"
          >
            <Ionicons name="trash-outline" size={24} color="#FF4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 16,
    width: '90%',
    maxWidth: 350,
    height: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignSelf: 'center',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  timeText: {
    color: Colors.light.primary,
    marginBottom: 2,
  },
  amountText: {
    color: '#666',
  },
});

export default WaterDataCard;