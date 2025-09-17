// components/common/CustomButtonThree.jsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
/**
 * CustomButtonThree - Reusable circular back button component with arrow icon
 * Features a circular background with left-pointing arrow
 * Fully customizable size, colors, and press handlers
 */
const CustomButtonThree = ({
  onPress,
  size = 32,
  backgroundColor = Colors.light.background, 
  iconColor = Colors.dark.background, 
  style,
  disabled = false,
  borderRadius,
  iconName = 'arrow-back', // Default to arrow-back icon
  iconSize = 18, // Default icon size
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
      accessibilityLabel="Go back button"
    >
      {/* Ionicons arrow icon */}
      <Ionicons 
        name={iconName} 
        size={iconSize} 
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
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2, // Android shadow
  },
});

export default CustomButtonThree;