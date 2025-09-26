import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

/**
 * CustomButtonTwo - Reusable circular add button component with plus icon
 * Features a blue circular background with white plus symbol using Ionicons
 * Fully customizable size, colors, and press handlers
 */

const CustomButtonTwo = ({
  onPress,
  size = 78,
  backgroundColor = '#4F9AFF',
  iconColor = Colors.light.background,
  style,
  disabled = false,
  borderRadius,
  iconName = 'add', // Ionicon name for plus
}) => {
  const buttonStyles = [
    styles.container,
    {
      width: size,
      height: size,
      backgroundColor: disabled ? Colors.light.textSecondary : backgroundColor,
      borderRadius: borderRadius || size / 2,
    },
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Add item button"
    >
      <Ionicons 
        name={iconName} 
        size={size * 0.8} 
        color={iconColor} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Android shadow
  },
});

export default CustomButtonTwo;