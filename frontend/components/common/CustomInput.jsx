import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../constants/Colors';
import { Font } from '@/constants/Font';

/**
 * CustomInput - Reusable input component with validation and date picker support
 * Maintains white background even in error states for optimal text visibility
 */
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
  // Local state for focus, error handling, and date picker
  const [isFocused, setIsFocused] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(null);

  // Handle text input changes and validation
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

  // Handle input focus and date picker activation
  const handleFocus = () => {
    if (isDatePicker) {
      setTempDate(selectedDate || new Date());
      setShowDatePicker(true);
      return;
    }
    setIsFocused(true);
  };

  // Handle input blur and validation
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

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  // Determine error state and display
  const displayError = errorMessage || localError;
  const hasError = !!displayError;

  // Determine border color based on state
  const getBorderColor = () => {
    if (hasError) return Colors.light.error;
    if (isFocused || (isDatePicker && showDatePicker)) return Colors.light.primary;
    return Colors.light.overlayLight;
  };

  // Main render
  return (
    <View style={[styles.container, style]}>
      
      {/* Label with required indicator */}
      {label && (
        <Text style={[styles.label, {fontFamily: Font.semibold}]}>
          {label.toUpperCase()}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      {/* Input container */}
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
        {/* Date picker input */}
        {isDatePicker ? (
          <View style={styles.datePickerContainer}>
            <Text style={[
              styles.dateText,
              { color: selectedDate ? '#151924' : '#999999', fontFamily: Font.regular }
            ]}>
              {selectedDate ? formatDate(selectedDate) : placeholder}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        ) : (
          // Regular text input
          <TextInput
            style={[styles.input, inputStyle, {fontFamily: Font.regular}]}
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
      
      {/* iOS date picker modal */}
      {isDatePicker && showDatePicker && Platform.OS === 'ios' && (
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerModal}>
            
            {/* Date picker header with cancel/done buttons */}
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

            {/* Date picker spinner */}
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
      
      {/* Android date picker */}
      {isDatePicker && showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="spinner"
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
      
      {/* Error message display */}
      {hasError && (
        <Text style={[styles.errorText, {fontFamily: Font.regular}]}>
          {displayError}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  
  required: {
    color: '#FF5252',
  },
  
  inputContainer: {
    width: 370,
    height: 58,
    borderWidth: 1.5,
    borderRadius: 12,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  
  input: {
    fontSize: 14,
    color: '#151924',
    height: '100%',
    padding: 0,
  },
  
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  
  dateText: {
    fontSize: 14,
    flex: 1,
  },
  
  chevron: {
    fontSize: 20,
    color: '#999999',
    fontWeight: 'bold',
    transform: [{ rotate: '90deg' }],
  },
  
  inputError: {
    borderColor: '#FF5252',
  },
  
  inputDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    opacity: 0.6,
  },
  
  errorText: {
    fontSize: 12,
    color: '#FF5252',
    marginTop: 4,
    marginLeft: 4,
  },
  
  datePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  
  datePickerModal: {
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 34,
  },
  
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
    backgroundColor: '#F8F9FA',
  },
  
  datePickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  
  datePickerButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  
  doneButton: {
    fontWeight: '600',
  },
  
  datePicker: {
    backgroundColor: '#F8F9FA',
    height: 216,
  },
});

export default CustomInput;