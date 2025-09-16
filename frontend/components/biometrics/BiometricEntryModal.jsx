// components/common/BiometricEntryModal.jsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert,
  TouchableOpacity,
  TextInput,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Font, Type, TextVariants } from '../../constants/Font';
import CustomButton from '../common/CustomButton';

// Configuration constants
const VALIDATION_CONFIG = {
  height: {
    min: 100,
    max: 250
  },
  weight: {
    min: 30,
    max: 300
  }
};

const ALERT_MESSAGES = {
  exitConfirmation: {
    title: 'Are you sure you want to exit?',
    message: 'Your entered data will be lost.',
    cancelText: 'Cancel',
    confirmText: 'Exit'
  }
};

// Local text styles using Font constants
const textStyles = {
  heading1: { fontSize: 28, ...Type.bold },
  bodyMedium: { fontSize: 16, ...Type.bold },
  bodySmall: { fontSize: 16, ...Type.regular },
  caption: { fontSize: 12, ...Type.regular },
};

/**
 * BiometricEntryModal - Modal for entering height and weight data
 * Fixed to not block navigation and UI interactions
 */
export default function BiometricEntryModal({ 
  visible, 
  onClose, 
  onSave,
  validationConfig = VALIDATION_CONFIG 
}) {
  const [heightValue, setHeightValue] = useState('');
  const [weightValue, setWeightValue] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Clears validation errors for height
   */
  const handleHeightChange = (value) => {
    setHeightValue(value);
    if (validationErrors.height) {
      setValidationErrors(prev => ({ ...prev, height: null }));
    }
  };

  /**
   * Clears validation errors for weight
   */
  const handleWeightChange = (value) => {
    setWeightValue(value);
    if (validationErrors.weight) {
      setValidationErrors(prev => ({ ...prev, weight: null }));
    }
  };

  /**
   * Validates height input with reasonable human height ranges
   */
  const validateHeightInput = (value) => {
    const heightNumber = parseFloat(value);
    if (!value) return 'Height is required';
    if (isNaN(heightNumber)) return 'Please enter a valid number';
    if (heightNumber < validationConfig.height.min || heightNumber > validationConfig.height.max) {
      return `Height should be between ${validationConfig.height.min}-${validationConfig.height.max} cm`;
    }
    return null;
  };

  /**
   * Validates weight input with reasonable human weight ranges
   */
  const validateWeightInput = (value) => {
    const weightNumber = parseFloat(value);
    if (!value) return 'Weight is required';
    if (isNaN(weightNumber)) return 'Please enter a valid number';
    if (weightNumber < validationConfig.weight.min || weightNumber > validationConfig.weight.max) {
      return `Weight should be between ${validationConfig.weight.min}-${validationConfig.weight.max} kg`;
    }
    return null;
  };

  /**
   * Checks if user has entered any data
   */
  const hasUserData = () => {
    return heightValue.trim() || weightValue.trim();
  };

  /**
   * Handles modal close with confirmation if user has entered data
   */
  const requestCloseConfirmation = () => {
    if (hasUserData()) {
      Alert.alert(
        ALERT_MESSAGES.exitConfirmation.title,
        ALERT_MESSAGES.exitConfirmation.message,
        [
          { text: ALERT_MESSAGES.exitConfirmation.cancelText, style: 'cancel' },
          { 
            text: ALERT_MESSAGES.exitConfirmation.confirmText, 
            style: 'destructive',
            onPress: () => closeModal()
          }
        ]
      );
    } else {
      closeModal();
    }
  };

  /**
   * Closes modal and resets form state
   */
  const closeModal = () => {
    setHeightValue('');
    setWeightValue('');
    setValidationErrors({});
    onClose();
  };

  /**
   * Validates all form fields
   */
  const validateForm = () => {
    const errors = {};
    
    const heightError = validateHeightInput(heightValue);
    if (heightError) errors.height = heightError;
    
    const weightError = validateWeightInput(weightValue);
    if (weightError) errors.weight = weightError;
    
    return errors;
  };

  /**
   * Validates and submits biometric entry data
   */
  const submitBiometricEntry = () => {
    const currentValidationErrors = validateForm();
    setValidationErrors(currentValidationErrors);
    
    if (Object.keys(currentValidationErrors).length === 0) {
      const newBiometricEntry = {
        id: Date.now().toString(),
        height: parseFloat(heightValue),
        weight: parseFloat(weightValue),
        timestamp: new Date().toISOString(),
      };
      
      if (onSave) {
        onSave(newBiometricEntry);
      }
      closeModal();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={requestCloseConfirmation}
    >
      {/* Background overlay */}
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.backgroundTouchable} 
          activeOpacity={1}
          onPress={requestCloseConfirmation}
        />
        
        {/* Modal content */}
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Modal header with title and close button */}
            <View style={styles.modalHeaderSection}>
              <Text style={[textStyles.heading1, styles.modalTitleText]}>Add Entry</Text>
              <TouchableOpacity onPress={requestCloseConfirmation} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={[textStyles.bodyMedium, styles.modalSubtitleText]}>
              How is your progress today?
            </Text>

            {/* Height input section */}
            <View style={styles.inputSection}>
              <Text style={[textStyles.bodyMedium, styles.inputLabel]}>HEIGHT (cm) *</Text>
              <View style={[styles.inputContainer, validationErrors.height && styles.inputError]}>
                <TextInput
                  style={[textStyles.bodySmall, styles.textInput]}
                  placeholder="Height"
                  placeholderTextColor="#999"
                  value={heightValue}
                  onChangeText={handleHeightChange}
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>
              {validationErrors.height && (
                <Text style={[textStyles.caption, styles.errorText]}>
                  {validationErrors.height}
                </Text>
              )}
            </View>

            {/* Weight input section */}
            <View style={styles.inputSection}>
              <Text style={[textStyles.bodyMedium, styles.inputLabel]}>WEIGHT (kg) *</Text>
              <View style={[styles.inputContainer, validationErrors.weight && styles.inputError]}>
                <TextInput
                  style={[textStyles.bodySmall, styles.textInput]}
                  placeholder="Weight"
                  placeholderTextColor="#999"
                  value={weightValue}
                  onChangeText={handleWeightChange}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
              {validationErrors.weight && (
                <Text style={[textStyles.caption, styles.errorText]}>
                  {validationErrors.weight}
                </Text>
              )}
            </View>

            {/* Submit button at bottom */}
            <View style={styles.submitButtonSection}>
              <CustomButton
                title="Add Entry"
                onPress={submitBiometricEntry}
                variant="primary"
                size="large"
                rounded={true}
                style={styles.addEntryButton}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  backgroundTouchable: {
    flex: 1,
  },

  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    height: '85%',
  },
  
  modalContent: {
    // Content styling
  },
  
  modalHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  modalTitleText: {
    color: '#000',
  },

  closeButton: {
    padding: 4,
  },
  
  modalSubtitleText: {
    color: '#666',
    marginBottom: 32,
  },

  inputSection: {
    marginBottom: 24,
  },

  inputLabel: {
    color: '#000',
    marginBottom: 8,
  },

  inputContainer: {
    backgroundColor: '#E4F8FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  textInput: {
    color: '#000',
    padding: 0,
    margin: 0,
  },

  inputError: {
    borderColor: '#FF5252',
    borderWidth: 2,
  },

  errorText: {
    color: '#FF5252',
    marginTop: 4,
  },

  submitButtonSection: {
    marginTop: 32,
    paddingBottom: 20,
  },

  addEntryButton: {
    width: '100%',
    minHeight: 50,
  },
});