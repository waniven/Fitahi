import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../constants/Colors';

const CustomInput = ({
  placeholder,
  value,
  onChangeText,
  label,
  validation,
  keyboardType = 'default',
  secureTextEntry = false,
  editable = true,
  style,
  inputStyle,
  errorMessage,
  required = false,
  isDatePicker = false,
  selectedDate,
  onDateChange,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(null);

  const handleTextChange = (text) => {
    if (onChangeText) {
      onChangeText(text);
    }
    
    if (validation) {
      const error = validation(text);
      setLocalError(error || '');
    }
    
    if (text && localError) {
      setLocalError('');
    }
  };

  const handleFocus = () => {
    if (isDatePicker) {
      setTempDate(selectedDate || new Date());
      setShowDatePicker(true);
      return;
    }
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    if (validation && !isDatePicker) {
      const error = validation(value);
      setLocalError(error || '');
    }
    
    if (required && !value?.trim() && !isDatePicker) {
      setLocalError('This field is required');
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const displayError = errorMessage || localError;
  const hasError = !!displayError;

  const getBorderColor = () => {
    if (hasError) return Colors.light.error;
    if (isFocused || (isDatePicker && showDatePicker)) return Colors.light.primary;
    return Colors.light.overlayLight;
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label.toUpperCase()}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
          hasError && styles.inputError,
          !editable && styles.inputDisabled
        ]}
        onPress={isDatePicker ? handleFocus : undefined}
        disabled={!isDatePicker}
        activeOpacity={isDatePicker ? 0.7 : 1}
      >
        {isDatePicker ? (
          <View style={styles.datePickerContainer}>
            <Text style={[
              styles.dateText,
              { color: selectedDate ? '#151924' : '#999999' }
            ]}>
              {selectedDate ? formatDate(selectedDate) : placeholder}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        ) : (
          <TextInput
            style={[styles.input, inputStyle]}
            placeholder={placeholder}
            placeholderTextColor="#999999"
            value={value}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            editable={editable}
            {...props}
          />
        )}
      </TouchableOpacity>
      
      {isDatePicker && showDatePicker && Platform.OS === 'ios' && (
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity 
                onPress={() => {
                  setShowDatePicker(false);
                  setTempDate(null);
                }}
                style={styles.datePickerButton}
              >
                <Text style={styles.datePickerButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  if (tempDate && onDateChange) {
                    onDateChange(tempDate);
                    setLocalError('');
                  }
                  setShowDatePicker(false);
                  setTempDate(null);
                }}
                style={styles.datePickerButton}
              >
                <Text style={[styles.datePickerButtonText, styles.doneButton]}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempDate || selectedDate || new Date()}
              mode="date"
              display="spinner"
              onChange={(event, date) => {
                if (date) {
                  setTempDate(date);
                }
              }}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              style={styles.datePicker}
              textColor="#000000"
              themeVariant="light"
            />
          </View>
        </View>
      )}
      
      {isDatePicker && showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (event.type === 'set' && date && onDateChange) {
              onDateChange(date);
              setLocalError('');
            }
          }}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}
      
      {hasError && (
        <Text style={styles.errorText}>
          {displayError}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Main container for the entire input component
  container: {
    marginBottom: 20,
  },
  
  // Label text styling with uppercase formatting
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF', // White text for dark backgrounds
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  
  // Required field indicator (red asterisk)
  required: {
    color: '#FF5252',
  },
  
  // Main input container with exact dimensions (370 x 58)
  inputContainer: {
    width: 370,
    height: 58,
    borderWidth: 1.5,
    borderRadius: 12,
    borderColor: 'rgba(255,255,255,0.1)', // Subtle border for dark theme
    backgroundColor: '#FFFFFF', // White background for input
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  
  // Text input field styling
  input: {
    fontSize: 16,
    color: '#151924', // Dark text on white background
    height: '100%',
    padding: 0, // Remove default padding to maintain exact dimensions
  },
  
  // Container for date picker display elements
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  
  // Date text display styling
  dateText: {
    fontSize: 16,
    flex: 1,
  },
  
  // Chevron indicator for date picker
  chevron: {
    fontSize: 20,
    color: '#999999',
    fontWeight: 'bold',
    transform: [{ rotate: '90deg' }], // Rotate to point down
  },
  
  // Error state styling for input container
  inputError: {
    borderColor: '#FF5252', // Red border for errors
    backgroundColor: 'rgba(255, 82, 82, 0.05)', // Light red background tint
  },
  
  // Disabled state styling
  inputDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    opacity: 0.6,
  },
  
  // Error message text styling
  errorText: {
    fontSize: 12,
    color: '#FF5252',
    marginTop: 4,
    marginLeft: 4,
  },
  
  // Full-screen overlay for iOS date picker modal
  datePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent backdrop
    justifyContent: 'flex-end',
    zIndex: 1000, // Ensure it appears above other elements
  },
  
  // Date picker modal container (iOS)
  datePickerModal: {
    backgroundColor: '#F8F9FA', // Light gray background
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 34, // Safe area for iPhone home indicator
  },
  
  // Header section with Cancel/Done buttons
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7', // Light border
    backgroundColor: '#F8F9FA',
  },
  
  // Individual button styling in header
  datePickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  
  // Button text styling
  datePickerButtonText: {
    fontSize: 16,
    color: '#007AFF', // iOS system blue
  },
  
  // Done button emphasis
  doneButton: {
    fontWeight: '600',
  },
  
  // Date picker component styling
  datePicker: {
    backgroundColor: '#F8F9FA',
    height: 216, // Standard iOS picker height
  },
});

export default CustomInput;