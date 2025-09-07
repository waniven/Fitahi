import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

/**
 * CustomButton - A reusable button component with multiple variants and sizes
 * 
 * @param {string} title - The text displayed on the button
 * @param {function} onPress - Function called when button is pressed
 * @param {string} variant - Button style variant: 'primary', 'secondary', 'success', 'warning', 'error'
 * @param {string} size - Button size: 'small', 'medium', 'large'
 * @param {boolean} disabled - Whether the button is disabled
 * @param {object} style - Additional custom styles for the button container
 * @param {object} textStyle - Additional custom styles for the button text
 */
const CustomButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  style,
  textStyle 
}) => {
  
  /**
   * Determines the appropriate button styles based on size, variant, and disabled state
   * @returns {Array} Array of style objects to be applied to the button
   */
  const getButtonStyles = () => {
    const baseStyle = [styles.button];
    
    // Apply size-specific styles
    if (size === 'small') {
      baseStyle.push(styles.buttonSmall);
    } else if (size === 'large') {
      baseStyle.push(styles.buttonLarge);
    } else {
      baseStyle.push(styles.buttonMedium);
    }
    
    // Apply color variant styles
    if (variant === 'secondary') {
      baseStyle.push(styles.buttonSecondary);
    } else if (variant === 'success') {
      baseStyle.push(styles.buttonSuccess);
    } else if (variant === 'warning') {
      baseStyle.push(styles.buttonWarning);
    } else if (variant === 'error') {
      baseStyle.push(styles.buttonError);
    } else {
      baseStyle.push(styles.buttonPrimary); // Default to primary
    }
    
    // Apply disabled state styling if needed
    if (disabled) {
      baseStyle.push(styles.buttonDisabled);
    }
    
    return baseStyle;
  };

  /**
   * Determines the appropriate text styles based on size, variant, and disabled state
   * @returns {Array} Array of style objects to be applied to the button text
   */
  const getTextStyles = () => {
    const baseStyle = [styles.text];
    
    // Apply size-specific text styles
    if (size === 'small') {
      baseStyle.push(styles.textSmall);
    } else if (size === 'large') {
      baseStyle.push(styles.textLarge);
    } else {
      baseStyle.push(styles.textMedium);
    }
    
    // Apply color variant text styles
    if (variant === 'secondary') {
      baseStyle.push(styles.textSecondary); // Different text color for secondary buttons
    } else {
      baseStyle.push(styles.textPrimary); // Standard white text for most buttons
    }
    
    // Apply disabled text styling if needed
    if (disabled) {
      baseStyle.push(styles.textDisabled);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyles(), style]} // Merge computed styles with custom styles
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8} // Slight transparency on press for visual feedback
    >
      <Text style={[...getTextStyles(), textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base button styles - shared across all variants
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Shadow for Android
    elevation: 5,
  },
  
  // Button size variants
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  buttonMedium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  
  // Button color variants
  buttonPrimary: {
    backgroundColor: Colors.light.primary, // Electric blue - main CTA color
  },
  buttonSecondary: {
    backgroundColor: Colors.light.backgroundAlt, // Blue background with border
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  buttonSuccess: {
    backgroundColor: Colors.light.success, // Green for positive actions
  },
  buttonWarning: {
    backgroundColor: Colors.light.warning, // Yellow for caution actions
  },
  buttonError: {
    backgroundColor: Colors.light.error, // Red for destructive actions
  },
  buttonDisabled: {
    backgroundColor: Colors.light.overlayLight, // Faded appearance
    opacity: 0.6,
  },
  
  // Base text styles - shared across all variants
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Text size variants
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  
  // Text color variants
  textPrimary: {
    color: Colors.light.textPrimary, // White text for most buttons
  },
  textSecondary: {
    color: Colors.light.primary, // Blue text for secondary buttons
  },
  textDisabled: {
    color: Colors.light.textSecondary, // Faded text for disabled state
  },
});

export default CustomButton;