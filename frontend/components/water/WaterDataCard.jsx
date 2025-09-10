// components/water/WaterDataCard.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

/**
 * WaterDataCard - Component for displaying water intake entries
 * Clean card with soft corners and instant delete (no confirmation)
 */
const WaterDataCard = ({ 
  entry, 
  onDelete, 
  showDeleteButton = true,
  style 
}) => {
  
  /**
   * Format time to 12-hour format with am/pm
   */
  const formatTime = (timeString) => {
    if (timeString && timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'pm' : 'am';
      return `${hour12}:${minutes}${ampm}`;
    }
    
    if (entry.timestamp) {
      const date = new Date(entry.timestamp);
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes}${ampm}`;
    }
    
    return timeString || 'Time not set';
  };

  /**
   * Handle instant delete - no confirmation
   */
  const handleDelete = () => {
    console.log('Instantly deleting entry:', entry.id);
    if (onDelete) {
      onDelete(entry.id);
    }
  };

  return (
    <View style={[styles.cardContainer, style]}>
      <View style={styles.contentContainer}>
        <View style={styles.textContent}>
          <Text style={styles.timeText}>
            {formatTime(entry.time)}
          </Text>
          <Text style={styles.amountText}>
            Amount: {entry.amount}mL
          </Text>
        </View>

        {showDeleteButton && onDelete && (
          <TouchableOpacity 
            onPress={handleDelete}
            style={styles.deleteButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            activeOpacity={0.6}
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
    width: '150%', // Use full available width instead of fixed 374px
    maxWidth: 350, // Maximum width to prevent it from being too wide
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
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 2,
  },

  amountText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
});

export default WaterDataCard;