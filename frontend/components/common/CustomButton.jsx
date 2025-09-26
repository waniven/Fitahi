import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Font } from '@/constants/Font';

/**
 * Reusable button component with multiple variants, sizes, and styling options
 * Supports primary/secondary/success/warning/error variants with consistent theming
 */
const CustomButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  rounded = false,
  disabled = false,
  style,
  textStyle 
}) => {
  
  // Computes button container styles based on size, variant, and state
  const getButtonStyles = () => {
    const baseStyle = [styles.button];
    
    // Applies size-specific dimensions and padding
    if (size === 'small') {
      baseStyle.push(styles.buttonSmall);
    } else if (size === 'large') {
      baseStyle.push(styles.buttonLarge);
    } else {
      baseStyle.push(styles.buttonMedium);
    }
    
    // Enables pill-shaped rounded corners when requested
    if (rounded) {
      baseStyle.push(styles.buttonRounded);
    }
    
    // Applies color scheme based on semantic variant
    if (variant === 'secondary') {
      baseStyle.push(styles.buttonSecondary);
    } else if (variant === 'success') {
      baseStyle.push(styles.buttonSuccess);
    } else if (variant === 'warning') {
      baseStyle.push(styles.buttonWarning);
    } else if (variant === 'error') {
      baseStyle.push(styles.buttonError);
    } else {
      baseStyle.push(styles.buttonPrimary);
    }
    
    // Applies disabled state styling with reduced opacity
    if (disabled) {
      baseStyle.push(styles.buttonDisabled);
    }
    
    return baseStyle;
  };

  // Computes text styles matching button variant and size
  const getTextStyles = () => {
    const baseStyle = [styles.text,{fontFamily: Font.bold}];
    
    // Applies size-specific font sizing
    if (size === 'small') {
      baseStyle.push(styles.textSmall);
    } else if (size === 'large') {
      baseStyle.push(styles.textLarge);
    } else {
      baseStyle.push(styles.textMedium);
    }
    
    // Applies variant-specific text colors for accessibility
    if (variant === 'secondary') {
      baseStyle.push(styles.textSecondary);
    } else {
      baseStyle.push(styles.textPrimary);
    }
    
    // Applies disabled text styling with reduced contrast
    if (disabled) {
      baseStyle.push(styles.textDisabled);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyles(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[...getTextStyles(), textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base container with consistent shadows and alignment
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  buttonRounded: {
    borderRadius: 28,
  },
  
  // Size variants with progressive scaling
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
  
  // Semantic color variants following design system
  buttonPrimary: {
    backgroundColor: Colors.dark.tint,
  },
  buttonSecondary: {
    backgroundColor: Colors.light.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  buttonSuccess: {
    backgroundColor: Colors.light.success,
  },
  buttonWarning: {
    backgroundColor: Colors.light.warning,
  },
  buttonError: {
    backgroundColor: Colors.light.error,
  },
  buttonDisabled: {
    backgroundColor: Colors.light.overlayLight,
    opacity: 0.6,
  },
  
  // Base text styling with font weight
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Text size variants matching button sizes
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  
  // Text colors optimized for contrast on button backgrounds
  textPrimary: {
    color: Colors.light.textPrimary,
  },
  textSecondary: {
    color: Colors.light.primary,
  },
  textDisabled: {
    color: Colors.light.textSecondary,
  },
});

export default CustomButton;